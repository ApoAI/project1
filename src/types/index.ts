// ============================================================
// Costume Asset Locator — Core Types
// ============================================================

/** A single inventory item (one row on one page of the printed packet). */
export interface InventoryItem {
  /** Internal unique id (auto-incrementing or manual). */
  id: number;

  /** Asset number as printed on the garment tag (string to preserve leading zeros). */
  assetNumber: string;

  /** Original listed price (number form). */
  price: number;

  /** Description of the garment / item. */
  description: string;

  /** Brand name. */
  brand: string;

  /**
   * Which page of the 5-page printed packet this item appears on.
   * Stored as string to match the "0000001"-style page identifiers.
   */
  pageNumber: string;

  /** 1-based row index on the page. */
  rowIndexOnPage: number;

  /** Total rows on the page this item belongs to. */
  totalRowsOnPage: number;

  /** Quantity. */
  quantity: number;

  /** Season number (1 or 2), or null if unknown. */
  season: number | null;

  /** Optional category (e.g. "Dresses", "Outerwear"). */
  category?: string;

  /** Freeform notes (e.g. "tag handwritten", "price unclear"). */
  notes?: string;
}

/** Page-level metadata. */
export interface PageMeta {
  pageNumber: string;
  totalRows: number;
  label?: string; // optional human-readable label like "Page 1 — Dresses"
}

// ============================================================
// Search-related types
// ============================================================

export type SearchMode = "asset" | "price" | "brand" | "smart";

export interface SearchResult {
  /** The matched inventory item. */
  item: InventoryItem;

  /** Confidence score 0–100 for ranking. */
  confidence: number;

  /** Human-readable explanation of why this matched. */
  matchReason: string;

  /** Location cue label. */
  locationCue: string;

  /** Percentage down the page (0–100). */
  percentDown: number;

  /** Items on the same page that are nearby (±2 rows). */
  nearbyItems: InventoryItem[];
}

/** Grouped results for brand searches. */
export interface GroupedResults {
  pageNumber: string;
  items: SearchResult[];
  subtotal: number;
}
