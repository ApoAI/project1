"use client";

import { SearchMode } from "@/types";

interface SearchTabsProps {
    activeMode: SearchMode;
    onModeChange: (mode: SearchMode) => void;
}

const TABS: { mode: SearchMode; label: string; icon: string }[] = [
    { mode: "smart", label: "Smart", icon: "⚡" },
    { mode: "price", label: "Price", icon: "💰" },
    { mode: "asset", label: "Asset #", icon: "🏷️" },
    { mode: "brand", label: "Brand", icon: "👗" },
];

export default function SearchTabs({ activeMode, onModeChange }: SearchTabsProps) {
    return (
        <div className="search-tabs">
            {TABS.map((tab) => (
                <button
                    key={tab.mode}
                    className={`search-tab ${activeMode === tab.mode ? "active" : ""}`}
                    onClick={() => onModeChange(tab.mode)}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
