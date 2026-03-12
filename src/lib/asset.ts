/**
 * ============================================================
 * Costume Asset Locator — Asset Number Utilities
 * ============================================================
 *
 * Asset numbers are stored as strings to preserve leading zeros.
 * Users might type "14", "014", "0014" — all should match "014".
 */

/**
 * Normalize an asset number for comparison.
 * Strips leading zeros and compares the core numeric value,
 * but also keeps the original for display.
 */
export function normalizeAssetNumber(raw: string): string {
    const trimmed = raw.trim();

    // Strip all leading zeros, but keep at least one char
    const stripped = trimmed.replace(/^0+/, "") || "0";

    return stripped;
}

/**
 * Check if two asset numbers match after normalization.
 */
export function assetNumbersMatch(input: string, stored: string): boolean {
    return normalizeAssetNumber(input) === normalizeAssetNumber(stored);
}

/**
 * Check if an asset number partially matches (starts with / contains).
 */
export function assetNumberPartialMatch(
    input: string,
    stored: string
): boolean {
    const normInput = normalizeAssetNumber(input);
    const normStored = normalizeAssetNumber(stored);

    return normStored.includes(normInput) || normInput.includes(normStored);
}
