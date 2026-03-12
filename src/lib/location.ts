/**
 * ============================================================
 * Costume Asset Locator — Location Cue Utilities
 * ============================================================
 */

/**
 * Compute the percentage down the page for a given row.
 */
export function computePercentDown(
    rowIndex: number,
    totalRows: number
): number {
    if (totalRows <= 0) return 0;
    return Math.round((rowIndex / totalRows) * 100);
}

/**
 * Determine the location cue based on percentage.
 *
 *   Top:           1–10%
 *   Upper third:   11–30%
 *   Upper-middle:  31–45%
 *   Middle:        46–55%
 *   Lower-middle:  56–75%
 *   Bottom third:  76–90%
 *   Near bottom:   91–100%
 */
export function getLocationCue(percentDown: number): string {
    if (percentDown <= 10) return "top";
    if (percentDown <= 30) return "upper third";
    if (percentDown <= 45) return "upper-middle";
    if (percentDown <= 55) return "middle";
    if (percentDown <= 75) return "lower-middle";
    if (percentDown <= 90) return "bottom third";
    return "near bottom";
}
