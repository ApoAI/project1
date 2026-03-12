# Costume Asset Locator

Private internal web app for rapid costume rack sorting and item locating during wrap. Built with Next.js and TypeScript.

> **This is an internal tool, not a public product.** It helps someone physically find an item quickly on a printed 5-page inventory packet.

---

## Quick Start (Local)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd project1
npm install

# 2. Create .env.local
echo "SITE_PASSWORD=redferrari" > .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the password.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SITE_PASSWORD` | Yes | Shared password for app access |

Set this in `.env.local` for development, and in Vercel Environment Variables for production.

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. In **Settings → Environment Variables**, add:
   - `SITE_PASSWORD` = `redferrari`
4. Deploy — done!

Vercel auto-detects Next.js. No special build config needed.

---

## Project Structure

```
src/
├── app/
│   ├── api/login/route.ts    ← login API endpoint
│   ├── login/page.tsx        ← password login page
│   ├── page.tsx              ← main search page
│   ├── layout.tsx            ← root layout
│   └── globals.css           ← all styles
├── components/
│   ├── ResultCard.tsx        ← individual result display
│   ├── ResultsList.tsx       ← flat + grouped results
│   ├── NoResults.tsx         ← no-match + suggestions
│   └── SearchTabs.tsx        ← search mode selector
├── data/
│   └── inventory.ts          ← ★ YOUR INVENTORY DATA ★
├── lib/
│   ├── search.ts             ← search engine + matching
│   ├── price.ts              ← price normalization
│   ├── asset.ts              ← asset number utils
│   ├── location.ts           ← page position cues
│   └── validate-inventory.ts ← data validation script
├── types/
│   └── index.ts              ← TypeScript types
└── middleware.ts              ← password gate
```

---

## How to Update the 5-Page Inventory Manually

The inventory lives in **`src/data/inventory.ts`**.

### Adding an item

Find the page array (e.g. `page3`) and add a new object:

```typescript
{ id: 83, assetNumber: "710", price: 450.00, description: "Velvet Cape", brand: "Marchesa", pageNumber: "0000003", rowIndexOnPage: 19, totalRowsOnPage: 19, category: "Outerwear" },
```

### After adding or removing items:

1. **Update `rowIndexOnPage`** — items must be numbered 1, 2, 3… sequentially on each page
2. **Update `totalRowsOnPage`** — every item on the modified page must have the new total
3. **Update `PAGE_META`** at the bottom of the file — set the correct `totalRows`
4. **Make sure `id` is unique** across the entire dataset

### Validate your changes:

```bash
npx tsx src/lib/validate-inventory.ts
```

This checks for: duplicate IDs, correct row numbering, totalRowsOnPage accuracy, and missing fields.

---

## How the Matching Logic Works

**Key principle: PRICE is the most reliable identifier.** Asset numbers on garment tags may be wrong.

### Priority order (highest → lowest confidence):

| Priority | Match Type | Confidence |
|---|---|---|
| 1 | Exact normalized price | 95% |
| 2 | Price + description alignment | 90% |
| 3 | Price + brand alignment | 85% |
| 4 | Price + garment type alignment | 80% |
| 5 | Exact description match | 75% |
| 6 | Brand + garment type alignment | 70% |
| 7 | Exact asset number | 60% |
| 8 | Partial asset number | 40% |

### Rules:
- If asset number conflicts with price/description, the system **never** trusts the asset number over the price
- If multiple items match, **all are shown** and ranked by confidence
- If no confident match exists, the system says so and offers suggestions
- Duplicate prices are **never collapsed** — all matches are displayed
- Search results only come from the preloaded dataset — no guessing

### Price normalization:
The price parser handles: `$882.75`, `882.750`, `882.7`, `584..21` (cleaned to 584.21), commas, and leading/trailing whitespace.

### Asset number normalization:
`014`, `14`, and `0014` all match the same item. Leading zeros are stripped for comparison but preserved for display.

### Brand search:
Case-insensitive, partial matching. "Judith" matches "Judith & Charles". Results grouped by page.

---

## Search Modes

| Mode | What it searches | Best for |
|---|---|---|
| ⚡ Smart | Auto-detects price/asset/brand/desc | General use |
| 💰 Price | Exact price match | Most reliable |
| 🏷️ Asset # | Asset number (normalized) | When tag is readable |
| 👗 Brand | Brand name (partial, case-insensitive) | Finding all items by brand |

---

## Features

- 🔒 Password-protected (middleware)
- 🔍 Smart search with auto-detection
- 📍 Location cues (top, upper third, middle, etc.)
- 📊 Row position with ratio and percentage
- 🗺️ Nearby items context (±2 rows)
- 📋 Copy result to clipboard
- 📥 Export search results to CSV
- 🕐 Recent searches (local storage)
- 🔘 Page filter for multi-page results
- ⌨️ Press `/` to focus search bar
- 📱 Responsive — works on phone, tablet, desktop
- 🌙 Dark mode by default

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Vanilla CSS** (no Tailwind)
- **Vercel** (deployment target)
