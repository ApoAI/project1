/**
 * ============================================================
 * Costume Asset Locator — Inventory Validation Helper
 * ============================================================
 *
 * Run this with:   npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/validate-inventory.ts
 * Or:              npx tsx src/lib/validate-inventory.ts
 *
 * Checks:
 *   1. Unique IDs across all items
 *   2. rowIndexOnPage matches sequential order on each page
 *   3. totalRowsOnPage matches actual count on each page
 *   4. No missing required fields
 */

import { INVENTORY, PAGE_META } from "../data/inventory";

let errors = 0;

// 1. Check unique IDs
const ids = new Set<number>();
for (const item of INVENTORY) {
    if (ids.has(item.id)) {
        console.error(`❌ Duplicate ID: ${item.id}`);
        errors++;
    }
    ids.add(item.id);
}

// 2. Group by page and validate row ordering + totals
const byPage = new Map<string, typeof INVENTORY>();
for (const item of INVENTORY) {
    if (!byPage.has(item.pageNumber)) byPage.set(item.pageNumber, []);
    byPage.get(item.pageNumber)!.push(item);
}

for (const [pageNumber, items] of byPage) {
    // Sort by row index
    const sorted = [...items].sort((a, b) => a.rowIndexOnPage - b.rowIndexOnPage);

    // Check sequential row indices
    for (let i = 0; i < sorted.length; i++) {
        const expected = i + 1;
        if (sorted[i].rowIndexOnPage !== expected) {
            console.error(
                `❌ Page ${pageNumber}: item ID ${sorted[i].id} has rowIndexOnPage=${sorted[i].rowIndexOnPage}, expected ${expected}`
            );
            errors++;
        }
    }

    // Check totalRowsOnPage
    for (const item of items) {
        if (item.totalRowsOnPage !== items.length) {
            console.error(
                `❌ Page ${pageNumber}: item ID ${item.id} has totalRowsOnPage=${item.totalRowsOnPage}, but page has ${items.length} items`
            );
            errors++;
        }
    }

    // Check PAGE_META
    const meta = PAGE_META.find((m) => m.pageNumber === pageNumber);
    if (!meta) {
        console.error(`❌ No PAGE_META entry for page ${pageNumber}`);
        errors++;
    } else if (meta.totalRows !== items.length) {
        console.error(
            `❌ PAGE_META for page ${pageNumber} says totalRows=${meta.totalRows}, but actual count is ${items.length}`
        );
        errors++;
    }
}

// 3. Check required fields
for (const item of INVENTORY) {
    if (!item.assetNumber) {
        console.error(`❌ Item ID ${item.id}: missing assetNumber`);
        errors++;
    }
    if (item.price == null || item.price < 0) {
        console.error(`❌ Item ID ${item.id}: invalid price`);
        errors++;
    }
    if (!item.description) {
        console.error(`❌ Item ID ${item.id}: missing description`);
        errors++;
    }
    if (!item.brand) {
        console.error(`❌ Item ID ${item.id}: missing brand`);
        errors++;
    }
    if (!item.pageNumber) {
        console.error(`❌ Item ID ${item.id}: missing pageNumber`);
        errors++;
    }
}

// Summary
console.log("");
console.log(`📦 Total items: ${INVENTORY.length}`);
console.log(`📄 Total pages: ${byPage.size}`);
for (const [page, items] of [...byPage].sort()) {
    console.log(`   Page ${page}: ${items.length} rows`);
}
console.log("");

if (errors === 0) {
    console.log("✅ All inventory data is valid!");
} else {
    console.error(`❌ Found ${errors} error(s). Please fix the inventory data.`);
    process.exit(1);
}
