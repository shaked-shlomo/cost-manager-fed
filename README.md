# Cost Manager - Front End

Final project for **Front End Development** (HIT, course 65364).

A client-side cost manager: add cost items in USD, ILS, GBP or EURO, get a detailed report for any
month and year in a currency of your choice, and view the same data as a pie chart by category or a
bar chart across the twelve months of a year.

## Team

| Role | Name |
|---|---|
| Development team manager | Shaked Shlomo |
| Team member | Muhammad Egbaria |

## Stack

React | MUI | `@mui/x-charts` | Vite | plain JavaScript

Data is stored in the browser's `localStorage` through a dedicated `db.js` library, which exists in
two versions: an ES module used by the application, and a standalone vanilla script that adds `db`
to the global object for automated testing.

Exchange rates are fetched with the Fetch API from a static JSON file deployed alongside the app.
A settings screen lets the user point the application at any other rates URL.

## Deployment

| | URL |
|---|---|
| Application | https://cost-manager-fed-a4vc.onrender.com |
| Exchange rates JSON | https://cost-manager-fed-a4vc.onrender.com/rates.json |

Both are served by a single Render **Static Site**. A static site is delivered from a CDN and does
not spin down, so there is no cold start and nothing needs waking before use - unlike a Render
*Web Service*, which sleeps after inactivity on the free plan.

### Before testing

Open the rates JSON URL above and confirm it returns something of the form

```json
{ "USD": 1, "GBP": 0.6, "EURO": 0.7, "ILS": 3.4 }
```

This is the one dependency that can fail quietly: with the rates unreachable the application still
loads, still saves costs, and still produces a report in the currency the costs were entered in.
Only conversion between currencies breaks. The Settings screen can point the application at any
other rates URL that replies with `Access-Control-Allow-Origin: *`.

## Layout

```
index.html        XHTML 1.0 Strict shell
src/db/           the db.js library (module version)
src/api/          exchange-rate fetching and settings
src/state/        shared application state
src/components/   Layout, Forms, Report, Charts
src/theme/        MUI theme
vanilla-test/     standalone db.js and its test page
```

## Development

```
npm install
npm run dev
npm run build
```
