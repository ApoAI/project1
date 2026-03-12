"use client";

import { SearchResult } from "@/types";

interface ResultCardProps {
    result: SearchResult;
    showNearby?: boolean;
}

export default function ResultCard({ result, showNearby = true }: ResultCardProps) {
    const { item, confidence, matchReason, locationCue, percentDown, nearbyItems } = result;

    const confidenceColor =
        confidence >= 90
            ? "var(--confidence-high)"
            : confidence >= 60
                ? "var(--confidence-medium)"
                : "var(--confidence-low)";

    const nearbyContext = nearbyItems.map((n) => n.assetNumber).join(", ");

    function copyToClipboard() {
        const text = [
            `Asset: ${item.assetNumber}`,
            `Page: ${item.pageNumber}`,
            `Item: ${item.description}, ${item.brand}`,
            `Price: $${item.price.toFixed(2)}`,
            `Row: ${item.rowIndexOnPage} / ${item.totalRowsOnPage}`,
            `Position: ${percentDown}% — ${locationCue}`,
        ].join("\n");
        navigator.clipboard.writeText(text);
    }

    return (
        <div className="result-card">
            <div className="result-header">
                <div className="result-asset">
                    <span className="result-label">Asset</span>
                    <span className="result-value-large">{item.assetNumber || "—"}</span>
                </div>
                <div className="result-page">
                    <span className="result-label">Page</span>
                    <span className="result-value-large">{item.pageNumber}</span>
                </div>
                <div
                    className="result-confidence"
                    style={{ borderColor: confidenceColor, color: confidenceColor }}
                >
                    {confidence}%
                </div>
            </div>

            <div className="result-body">
                <div className="result-item-info">
                    <div className="result-description">{item.description}</div>
                    <div className="result-brand">{item.brand}</div>
                    <div className="result-price">{item.price > 0 ? `$${item.price.toFixed(2)}` : "Price unknown"}</div>
                    <div className="result-meta-badges">
                        {item.quantity > 1 && <span className="result-category">Qty: {item.quantity}</span>}
                        {item.season && <span className="result-category">S{item.season}</span>}
                        {item.category && <span className="result-category">{item.category}</span>}
                    </div>
                </div>

                <div className="result-location">
                    <div className="result-row">
                        <span className="result-label">Row</span>
                        <span className="result-value">
                            {item.rowIndexOnPage} / {item.totalRowsOnPage}
                        </span>
                    </div>
                    <div className="result-position">
                        <span className="result-label">Position</span>
                        <span className="result-value">{percentDown}% down</span>
                    </div>
                    <div className="result-cue">
                        <span className="location-badge">{locationCue}</span>
                    </div>

                    {/* Visual position indicator */}
                    <div className="position-bar-container">
                        <div className="position-bar">
                            <div
                                className="position-marker"
                                style={{ top: `${percentDown}%` }}
                            />
                        </div>
                        <span className="position-bar-label">⬆ top — bottom ⬇</span>
                    </div>
                </div>
            </div>

            <div className="result-match-reason">{matchReason}</div>

            {item.notes && <div className="result-notes">📝 {item.notes}</div>}

            {showNearby && nearbyItems.length > 0 && (
                <div className="result-nearby">
                    <span className="result-label">Nearby on page:</span>
                    <span className="nearby-items">
                        {nearbyItems.map((n) => (
                            <span key={n.id} className="nearby-item">
                                {n.assetNumber}
                            </span>
                        ))}
                        <span className="nearby-current">{item.assetNumber}</span>
                    </span>
                    <span className="nearby-context-text">
                        Order: {[...nearbyItems.map(n => n.assetNumber), item.assetNumber]
                            .sort((a, b) => {
                                const itemA = [...nearbyItems, item].find(i => i.assetNumber === a);
                                const itemB = [...nearbyItems, item].find(i => i.assetNumber === b);
                                return (itemA?.rowIndexOnPage || 0) - (itemB?.rowIndexOnPage || 0);
                            })
                            .join(", ")}
                    </span>
                </div>
            )}

            <button className="copy-button" onClick={copyToClipboard} title="Copy result to clipboard">
                📋 Copy
            </button>
        </div>
    );
}
