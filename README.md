# Agency Command Center

A full-stack local web app to manage clients, follow-ups, expenses, and generate AI advisor reports.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the Dashboard.

## Modules

| Module | Route | Description |
|---|---|---|
| Client Dashboard | `/dashboard` | Follow-ups, leads, payments, client table |
| Expense Tracker | `/expenses` | Log expenses and income, finance chart |
| Wishlist | `/wishlist` | Items to buy, mark as purchased |
| AI Advisor | `/advisor` | Generate situation report to paste into AI |

## Data

All data lives in `/data/*.json` — no database, no auth. Files are auto-created if missing.

| File | Contents |
|---|---|
| `clients.json` | Clients with follow-up history |
| `expenses.json` | Business expenses |
| `income.json` | Income entries |
| `wishlist.json` | Items to purchase |

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS v4**
- **Recharts** for charts
- **Lucide React** for icons
- **Local JSON** files as database
