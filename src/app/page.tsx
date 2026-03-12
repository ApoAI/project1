"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SearchMode, SearchResult } from "@/types";
import {
  searchByPrice,
  searchByBrand,
  searchByAsset,
  smartSearch,
  groupResultsByPage,
  getSuggestions,
  Suggestions,
} from "@/lib/search";
import SearchTabs from "@/components/SearchTabs";
import ResultsList from "@/components/ResultsList";
import NoResults from "@/components/NoResults";

const RECENT_SEARCHES_KEY = "cal-recent-searches";
const MAX_RECENT = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("smart");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    closePrices: [],
    closeBrands: [],
    closeAssets: [],
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [pageFilter, setPageFilter] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const doSearch = useCallback(
    (q: string, m: SearchMode) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setSuggestions({ closePrices: [], closeBrands: [], closeAssets: [] });
        setHasSearched(false);
        return;
      }

      let searchResults: SearchResult[];

      switch (m) {
        case "price":
          searchResults = searchByPrice(trimmed);
          break;
        case "brand":
          searchResults = searchByBrand(trimmed);
          break;
        case "asset":
          searchResults = searchByAsset(trimmed);
          break;
        case "smart":
        default:
          searchResults = smartSearch(trimmed);
          break;
      }

      setResults(searchResults);
      setHasSearched(true);

      if (searchResults.length === 0) {
        setSuggestions(getSuggestions(trimmed));
      } else {
        setSuggestions({ closePrices: [], closeBrands: [], closeAssets: [] });
      }

      // Save to recent searches
      setRecentSearches((prev) => {
        const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(
          0,
          MAX_RECENT
        );
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch { /* ignore */ }
        return updated;
      });
    },
    []
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query, mode);
  }

  function handleModeChange(newMode: SearchMode) {
    setMode(newMode);
    if (query.trim()) {
      doSearch(query, newMode);
    }
  }

  function handleRecentClick(recent: string) {
    setQuery(recent);
    doSearch(recent, mode);
  }

  function clearRecent() {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch { /* ignore */ }
  }

  // Filter results by page
  const filteredResults = pageFilter
    ? results.filter((r) => r.item.pageNumber === pageFilter)
    : results;

  const grouped = groupResultsByPage(filteredResults);
  const isGrouped = mode === "brand";

  // Get unique pages from results for filter
  const resultPages = [...new Set(results.map((r) => r.item.pageNumber))].sort();

  // CSV export
  function exportCSV() {
    const header = "Asset,Brand,Description,Price,Page,Row,Total Rows,Position %,Location Cue";
    const rows = filteredResults.map(
      (r) =>
        `${r.item.assetNumber},${r.item.brand},"${r.item.description}",${r.item.price.toFixed(2)},${r.item.pageNumber},${r.item.rowIndexOnPage},${r.item.totalRowsOnPage},${r.percentDown}%,${r.locationCue}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `costume-search-${query.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🎭 Costume Asset Locator</h1>
        <p className="app-subtitle">
          Rack sorting &amp; item locating — 5-page inventory
        </p>
      </header>

      <main className="app-main">
        <SearchTabs activeMode={mode} onModeChange={handleModeChange} />

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === "price"
                  ? 'Enter price (e.g. 882.75, $882.75)'
                  : mode === "asset"
                    ? 'Enter asset number (e.g. 014, 14)'
                    : mode === "brand"
                      ? 'Enter brand name (e.g. Marchesa, Isabel)'
                      : 'Search by price, asset #, brand, or description'
              }
              className="search-input"
              autoFocus
            />
            <kbd className="search-shortcut" title='Press "/" to focus'>
              /
            </kbd>
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {/* Page filter */}
        {results.length > 0 && resultPages.length > 1 && (
          <div className="page-filter">
            <button
              className={`page-filter-btn ${pageFilter === "" ? "active" : ""}`}
              onClick={() => setPageFilter("")}
            >
              All Pages
            </button>
            {resultPages.map((p) => (
              <button
                key={p}
                className={`page-filter-btn ${pageFilter === p ? "active" : ""}`}
                onClick={() => setPageFilter(p)}
              >
                Pg {p.replace(/^0+/, "")}
              </button>
            ))}
          </div>
        )}

        {/* Export button */}
        {filteredResults.length > 0 && (
          <div className="export-bar">
            <button className="export-button" onClick={exportCSV}>
              📥 Export CSV
            </button>
          </div>
        )}

        {/* Results */}
        {hasSearched && filteredResults.length > 0 && (
          <ResultsList
            results={filteredResults}
            grouped={isGrouped}
            groupedResults={isGrouped ? grouped : undefined}
            totalCount={filteredResults.length}
          />
        )}

        {hasSearched && filteredResults.length === 0 && (
          <NoResults query={query} suggestions={suggestions} />
        )}

        {/* Recent searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header">
              <span className="recent-title">Recent searches</span>
              <button className="recent-clear" onClick={clearRecent}>
                Clear
              </button>
            </div>
            <div className="recent-list">
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  className="recent-item"
                  onClick={() => handleRecentClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick tips */}
        {!hasSearched && (
          <div className="tips">
            <h3>Quick Tips</h3>
            <ul>
              <li>
                <strong>Price is king</strong> — price is the most reliable
                identifier. Search by price first.
              </li>
              <li>
                <strong>Smart Search</strong> auto-detects if your input is a
                price, asset #, or brand.
              </li>
              <li>
                Press <kbd>/</kbd> to focus the search bar from anywhere.
              </li>
              <li>
                Asset numbers may be wrong on tags — always verify via price.
              </li>
            </ul>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span>Costume Asset Locator — Internal Use Only</span>
      </footer>
    </div>
  );
}
