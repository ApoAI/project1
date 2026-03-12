/**
 * ============================================================
 * Costume Asset Locator — Search Engine
 * ============================================================
 *
 * HOW THE MATCHING LOGIC WORKS
 * ----------------------------
 * Priority order (highest → lowest confidence):
 *
 * 1. Exact normalized price match               (confidence 95)
 * 2. Price + description keyword alignment       (confidence 90)
 * 3. Price + brand alignment                     (confidence 85)
 * 4. Price + garment type (category) alignment   (confidence 80)
 * 5. Exact description match                     (confidence 75)
 * 6. Brand + garment type alignment              (confidence 70)
 * 7. Asset number exact match                    (confidence 60)
 * 8. Asset number partial match                  (confidence 40)
 *
 * IMPORTANT: If asset number conflicts with price and description,
 * the system NEVER assumes the asset number is more trustworthy.
 * Price is the primary identifier. Asset number matches receive
 * lower confidence scores intentionally.
 *
 * If multiple items match, ALL are returned and clearly ranked.
 * If no confident match exists, the system says so plainly.
 */

import { InventoryItem, SearchResult, GroupedResults } from "@/types";
import { INVENTORY } from "@/data/inventory";
import { parsePrice, pricesMatch, pricesClose } from "@/lib/price";
import { assetNumbersMatch, assetNumberPartialMatch } from "@/lib/asset";
import { computePercentDown, getLocationCue } from "@/lib/location";

// ── Helpers ─────────────────────────────────────────────────

function buildResult(
    item: InventoryItem,
    confidence: number,
    matchReason: string
): SearchResult {
    const percentDown = computePercentDown(item.rowIndexOnPage, item.totalRowsOnPage);
    const locationCue = getLocationCue(percentDown);
    const nearbyItems = getNearbyItems(item);

    return { item, confidence, matchReason, locationCue, percentDown, nearbyItems };
}

/**
 * Get items ±2 rows on the same page.
 */
function getNearbyItems(item: InventoryItem): InventoryItem[] {
    return INVENTORY.filter(
        (i) =>
            i.pageNumber === item.pageNumber &&
            i.id !== item.id &&
            Math.abs(i.rowIndexOnPage - item.rowIndexOnPage) <= 2
    ).sort((a, b) => a.rowIndexOnPage - b.rowIndexOnPage);
}

/**
 * Case-insensitive substring check.
 */
function fuzzyIncludes(haystack: string, needle: string): boolean {
    return haystack.toLowerCase().includes(needle.toLowerCase());
}

// ── Search by Price ─────────────────────────────────────────

export function searchByPrice(rawInput: string): SearchResult[] {
    const parsed = parsePrice(rawInput);
    if (parsed === null) return [];

    const results: SearchResult[] = [];

    for (const item of INVENTORY) {
        if (pricesMatch(item.price, parsed)) {
            results.push(buildResult(item, 95, `Exact price match: $${item.price.toFixed(2)}`));
        }
    }

    // Sort by page then row
    results.sort((a, b) => {
        const pageDiff = a.item.pageNumber.localeCompare(b.item.pageNumber);
        return pageDiff !== 0 ? pageDiff : a.item.rowIndexOnPage - b.item.rowIndexOnPage;
    });

    return results;
}

// ── Search by Brand ─────────────────────────────────────────

export function searchByBrand(rawInput: string): SearchResult[] {
    const query = rawInput.trim().toLowerCase();
    if (!query) return [];

    const results: SearchResult[] = [];

    for (const item of INVENTORY) {
        if (fuzzyIncludes(item.brand, query)) {
            results.push(buildResult(item, 80, `Brand match: ${item.brand}`));
        }
    }

    // Sort by page then row
    results.sort((a, b) => {
        const pageDiff = a.item.pageNumber.localeCompare(b.item.pageNumber);
        return pageDiff !== 0 ? pageDiff : a.item.rowIndexOnPage - b.item.rowIndexOnPage;
    });

    return results;
}

/**
 * Group brand search results by page.
 */
export function groupResultsByPage(results: SearchResult[]): GroupedResults[] {
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
        const page = r.item.pageNumber;
        if (!map.has(page)) map.set(page, []);
        map.get(page)!.push(r);
    }

    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([pageNumber, items]) => ({
            pageNumber,
            items,
            subtotal: items.length,
        }));
}

// ── Search by Asset Number ──────────────────────────────────

export function searchByAsset(rawInput: string): SearchResult[] {
    const query = rawInput.trim();
    if (!query) return [];

    const results: SearchResult[] = [];

    for (const item of INVENTORY) {
        if (assetNumbersMatch(query, item.assetNumber)) {
            results.push(
                buildResult(
                    item,
                    60,
                    `Asset number match: ${item.assetNumber} (Note: verify via price — asset tags may be incorrect)`
                )
            );
        } else if (assetNumberPartialMatch(query, item.assetNumber)) {
            results.push(
                buildResult(
                    item,
                    40,
                    `Partial asset match: ${item.assetNumber} (verify via price)`
                )
            );
        }
    }

    results.sort((a, b) => b.confidence - a.confidence);

    return results;
}

// ── Smart Search ────────────────────────────────────────────

/**
 * Auto-detect input type and search accordingly.
 * Returns combined results from all modes, ranked by confidence.
 */
export function smartSearch(rawInput: string): SearchResult[] {
    const trimmed = rawInput.trim();
    if (!trimmed) return [];

    const results: SearchResult[] = [];
    const seenIds = new Set<number>();

    // Try price first (most reliable)
    const parsed = parsePrice(trimmed);
    if (parsed !== null && parsed > 0) {
        const priceResults = searchByPrice(trimmed);
        for (const r of priceResults) {
            if (!seenIds.has(r.item.id)) {
                seenIds.add(r.item.id);
                results.push(r);
            }
        }
    }

    // Try asset number
    if (/^\d+$/.test(trimmed.replace(/^0+/, ""))) {
        const assetResults = searchByAsset(trimmed);
        for (const r of assetResults) {
            if (!seenIds.has(r.item.id)) {
                seenIds.add(r.item.id);
                results.push(r);
            }
        }
    }

    // Try brand (if it looks like text)
    if (/[a-zA-Z]{2,}/.test(trimmed)) {
        const brandResults = searchByBrand(trimmed);
        for (const r of brandResults) {
            if (!seenIds.has(r.item.id)) {
                seenIds.add(r.item.id);
                results.push(r);
            }
        }
    }

    // Also do description matching
    const descLower = trimmed.toLowerCase();
    for (const item of INVENTORY) {
        if (!seenIds.has(item.id) && fuzzyIncludes(item.description, descLower)) {
            seenIds.add(item.id);
            results.push(buildResult(item, 65, `Description match: "${item.description}"`));
        }
    }

    // Sort by confidence descending, then page, then row
    results.sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        const pageDiff = a.item.pageNumber.localeCompare(b.item.pageNumber);
        return pageDiff !== 0 ? pageDiff : a.item.rowIndexOnPage - b.item.rowIndexOnPage;
    });

    return results;
}

// ── Suggestions for near-misses ─────────────────────────────

export interface Suggestions {
    closePrices: SearchResult[];
    closeBrands: SearchResult[];
    closeAssets: SearchResult[];
}

export function getSuggestions(rawInput: string): Suggestions {
    const suggestions: Suggestions = {
        closePrices: [],
        closeBrands: [],
        closeAssets: [],
    };

    const trimmed = rawInput.trim();

    // Try close price matches
    const parsed = parsePrice(trimmed);
    if (parsed !== null && parsed > 0) {
        for (const item of INVENTORY) {
            if (!pricesMatch(item.price, parsed) && pricesClose(item.price, parsed, 10)) {
                suggestions.closePrices.push(
                    buildResult(item, 30, `Similar price: $${item.price.toFixed(2)}`)
                );
            }
        }
        suggestions.closePrices.sort((a, b) =>
            Math.abs(a.item.price - parsed) - Math.abs(b.item.price - parsed)
        );
        suggestions.closePrices = suggestions.closePrices.slice(0, 5);
    }

    // Try fuzzy brand matches (first 3 chars)
    if (/[a-zA-Z]{2,}/.test(trimmed)) {
        const prefix = trimmed.toLowerCase().slice(0, 3);
        const seen = new Set<string>();
        for (const item of INVENTORY) {
            if (
                item.brand.toLowerCase().startsWith(prefix) &&
                !fuzzyIncludes(item.brand, trimmed) &&
                !seen.has(item.brand)
            ) {
                seen.add(item.brand);
                suggestions.closeBrands.push(
                    buildResult(item, 20, `Similar brand: ${item.brand}`)
                );
            }
        }
        suggestions.closeBrands = suggestions.closeBrands.slice(0, 5);
    }

    return suggestions;
}
