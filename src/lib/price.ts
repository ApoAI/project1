/**
 * ============================================================
 * Costume Asset Locator — Price Normalization & Parsing
 * ============================================================
 *
 * Handles messy user input such as:
 *   "$882.75"  →  882.75
 *   "882.750"  →  882.75
 *   "882.7"    →  882.7
 *   "584..21"  →  584.21  (strips duplicate dots)
 *   "  $12.50" →  12.5
 */

/**
 * Try to parse a raw string into a numeric price.
 * Returns `null` if the input cannot be reasonably interpreted as a price.
 */
export function parsePrice(raw: string): number | null {
    if (!raw || typeof raw !== "string") return null;

    // Strip whitespace, dollar signs, commas
    let cleaned = raw.trim().replace(/[$,\s]/g, "");

    // Handle repeated dots: "584..21" → "584.21"
    cleaned = cleaned.replace(/\.{2,}/g, ".");

    // Remove trailing dots: "100." → "100"
    cleaned = cleaned.replace(/\.$/, "");

    // Remove leading dots: ".50" stays as-is (0.5)
    // but "..50" → ".50"
    cleaned = cleaned.replace(/^\.{2,}/, ".");

    // Only keep digits and a single decimal point
    // If there are multiple decimal points after cleaning, keep only the first
    const parts = cleaned.split(".");
    if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    const num = parseFloat(cleaned);
    if (isNaN(num) || !isFinite(num)) return null;

    return num;
}

/**
 * Normalize a numeric price to a canonical form for comparison.
 * Rounds to 2 decimal places.
 */
export function normalizePrice(price: number): number {
    return Math.round(price * 100) / 100;
}

/**
 * Check if two prices are effectively equal after normalization.
 */
export function pricesMatch(a: number, b: number): boolean {
    return normalizePrice(a) === normalizePrice(b);
}

/**
 * Check if a price is "close" to another (within a tolerance).
 * Useful for suggesting near-matches.
 */
export function pricesClose(a: number, b: number, tolerance = 5): boolean {
    return Math.abs(normalizePrice(a) - normalizePrice(b)) <= tolerance;
}
