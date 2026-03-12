"use client";

import { Suggestions } from "@/lib/search";
import ResultCard from "./ResultCard";

interface NoResultsProps {
    query: string;
    suggestions: Suggestions;
}

export default function NoResults({ query, suggestions }: NoResultsProps) {
    const hasSuggestions =
        suggestions.closePrices.length > 0 ||
        suggestions.closeBrands.length > 0 ||
        suggestions.closeAssets.length > 0;

    return (
        <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h2 className="no-results-title">No exact match found</h2>
            <p className="no-results-query">
                Nothing matched &ldquo;<strong>{query}</strong>&rdquo;
            </p>

            {!hasSuggestions && (
                <div className="no-results-tips">
                    <p>Try:</p>
                    <ul>
                        <li>Searching by price (most reliable identifier)</li>
                        <li>Checking for typos in the brand name</li>
                        <li>Using a different asset number format (e.g. &ldquo;14&rdquo; instead of &ldquo;014&rdquo;)</li>
                        <li>Using Smart Search for auto-detection</li>
                    </ul>
                </div>
            )}

            {suggestions.closePrices.length > 0 && (
                <div className="suggestions-section">
                    <h3>Similar prices:</h3>
                    {suggestions.closePrices.map((r) => (
                        <ResultCard key={r.item.id} result={r} showNearby={false} />
                    ))}
                </div>
            )}

            {suggestions.closeBrands.length > 0 && (
                <div className="suggestions-section">
                    <h3>Similar brands:</h3>
                    {suggestions.closeBrands.map((r) => (
                        <ResultCard key={r.item.id} result={r} showNearby={false} />
                    ))}
                </div>
            )}
        </div>
    );
}
