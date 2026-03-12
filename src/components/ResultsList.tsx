"use client";

import { SearchResult, GroupedResults } from "@/types";
import ResultCard from "./ResultCard";

interface ResultsListProps {
    results: SearchResult[];
    grouped?: boolean;
    groupedResults?: GroupedResults[];
    totalCount?: number;
}

export default function ResultsList({
    results,
    grouped = false,
    groupedResults,
    totalCount,
}: ResultsListProps) {
    if (grouped && groupedResults && groupedResults.length > 0) {
        return (
            <div className="results-list">
                <div className="results-count">
                    {totalCount ?? results.length} result{(totalCount ?? results.length) !== 1 ? "s" : ""} found
                </div>
                {groupedResults.map((group) => (
                    <div key={group.pageNumber} className="results-group">
                        <div className="results-group-header">
                            <span className="group-page">Page {group.pageNumber}</span>
                            <span className="group-count">{group.subtotal} item{group.subtotal !== 1 ? "s" : ""}</span>
                        </div>
                        {group.items.map((result) => (
                            <ResultCard key={result.item.id} result={result} />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (results.length === 0) return null;

    return (
        <div className="results-list">
            <div className="results-count">
                {totalCount ?? results.length} result{(totalCount ?? results.length) !== 1 ? "s" : ""} found
            </div>
            {results.map((result) => (
                <ResultCard key={result.item.id} result={result} />
            ))}
        </div>
    );
}
