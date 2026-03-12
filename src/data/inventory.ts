/**
 * ============================================================
 * Costume Asset Locator — Preloaded Inventory Data
 * ============================================================
 *
 * HOW TO UPDATE THE 5-PAGE INVENTORY MANUALLY
 * --------------------------------------------
 * Each page is in its own file: page1.ts through page5.ts
 *
 * 1. Open the page file you want to edit (e.g. src/data/page3.ts)
 * 2. Add/remove/edit items in that page's array
 * 3. After changes, update:
 *    - rowIndexOnPage: sequential 1, 2, 3... for every item on that page
 *    - totalRowsOnPage: must match actual item count on that page
 *    - id: must be unique across ALL pages
 * 4. Update PAGE_META below if row counts changed
 * 5. Run validation: npx tsx src/lib/validate-inventory.ts
 *
 * ============================================================
 */

import { PageMeta } from "@/types";
import { page1 } from "./page1";
import { page2 } from "./page2";
import { page3 } from "./page3";
import { page4 } from "./page4";
import { page5 } from "./page5";

// ── Combined dataset ────────────────────────────────────────

export const INVENTORY = [
    ...page1,
    ...page2,
    ...page3,
    ...page4,
    ...page5,
];

// ── Page metadata ───────────────────────────────────────────

export const PAGE_META: PageMeta[] = [
    { pageNumber: "0000001", totalRows: 38, label: "Page 1" },
    { pageNumber: "0000002", totalRows: 45, label: "Page 2" },
    { pageNumber: "0000003", totalRows: 45, label: "Page 3" },
    { pageNumber: "0000004", totalRows: 45, label: "Page 4" },
    { pageNumber: "0000005", totalRows: 37, label: "Page 5" },
];
