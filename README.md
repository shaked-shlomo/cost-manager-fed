# Cost Manager - Frontend

Client-side cost manager built as the final project for **Front End Development**
(HIT, course 65364). Costs are entered in one of four currencies, stored in the
browser, and reported or charted in whichever currency the user picks.

| | |
|---|---|
| Application | https://cost-manager-fed-a4vc.onrender.com |
| Exchange rates | https://cost-manager-fed-a4vc.onrender.com/rates.json |

## Team

| Role | Name |
|---|---|
| Development Team Manager | Shaked Shlomo |
| Team Member | Muhammad Egbaria |

## Features

- **Add costs** with a sum, currency, category and description. The date is stamped
  by the library at the moment the cost is added.
- **Monthly report** for a chosen month, year and currency. Rows keep the currency
  they were entered in; only the total is converted.
- **Pie chart** of totals per category, and a **bar chart** of totals across the
  twelve months of a year. Both follow the selected currency.
- **Settings** screen for pointing the application at a different exchange-rates URL.

Supported currencies are USD, ILS, GBP and EURO.

## Tech Stack

React, Material UI, MUI X Charts, Vite, plain JavaScript, the Fetch API and
`localStorage`. The `index.html` shell is hand-written and validates as
XHTML 1.0 Strict.

## How It Works

Costs live in `localStorage` behind a dedicated `db.js` library, which ships in two
versions built from the same logic: an ES module the React application imports, and
a standalone vanilla file that exposes `db` on the global object for testing. A
parity check fails the test run if the two ever drift apart.

Exchange rates are fetched from a static JSON file and refreshed every five minutes
into an in-memory cache. The cache is what lets `getReport()` stay synchronous, which
the project document requires. Rates are never fetched during a report.

## Project Structure

```
index.html              XHTML 1.0 Strict application shell
public/rates.json       Default exchange-rates file, deployed next to the app

src/
+-- main.jsx            Entry point that mounts the React application
+-- App.jsx             Root component: maps the four tabs to the four screens
+-- screens/            One file per tab: Report, AddCost, Charts, Settings
+-- components/         Layout, shared pieces, report table, charts
+-- db/                 localStorage library (ES module version)
+-- services/           Exchange-rate polling and settings persistence
+-- state/              Shared application state provider
+-- theme/              Material UI theme

vanilla/                Standalone db.js (the submitted version) and its test pages
```

The repository also carries `tools/`, which holds development scripts rather than
application code and so sits outside the structure above. Its two test runners,
the command-line suite and the parity checker, are listed in the submission PDF.
`docs/` and `requirements/` exist only on the developers' machines.

## Getting Started

```
npm install
npm run dev
```

`npm run build` produces the production files.

## Testing

| Page | What it does |
|---|---|
| `vanilla/test.html` | The test page from the project document, unchanged. Logs to the console. |
| `vanilla/self_test.html` | The full assertion suite, printed onto the page itself. |

Serve them over HTTP rather than opening the files directly. `npm run dev` already
does, at `http://localhost:5173/vanilla/self_test.html` and `/vanilla/test.html`.
Clear the site data first: costs persist, so a second run adds to the totals of the
first.

`npm test` runs the same assertions from the command line and adds the parity check.
It reads its runners from `tools/`, so it is available in the repository rather than
from the submitted archive.

## Notes

**Clearing site data.** Costs and any custom rates URL live in `localStorage`. Open
the console (**Cmd + Option + J** on macOS, **Ctrl + Shift + J** elsewhere), run
`localStorage.clear()` and reload.

**If the rates endpoint is down.** The application still loads, costs can still be
added, and reports still work in their original currencies. Only conversion between
different currencies becomes unavailable.

## Course Information

- **Course:** Front End Development, 65364
- **Institution:** HIT - Holon Institute of Technology
