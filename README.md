# Cost Manager - Frontend

## Project Overview

Cost Manager is a client-side web application developed as the final project for the
**Front End Development** course (HIT, course 65364).

The application allows users to:

- Add and manage cost items in USD, ILS, GBP, and EURO
- View detailed cost reports for a specific month and year
- Generate reports in a currency selected by the user
- Visualize expenses using a pie chart by category
- Visualize yearly expenses using a bar chart across twelve months
- Configure a custom exchange-rates source through the application settings

The application is built with React and follows a component-based architecture with shared
state management and a dedicated client-side database library.

## Team

| Role | Name |
|---|---|
| Development Team Manager | Shaked Shlomo |
| Team Member | Muhammad Egbaria |

## Architecture

The application follows a client-side React architecture with clear separation between data
persistence, API communication, application state, UI components, and visualization.

```
React Application
       |
       +-- Screens
       |     +-- Report, Add Cost, Charts, Settings
       |
       +-- Components
       |     +-- layout, common, report, charts
       |
       +-- Shared State
       |
       +-- Database Layer
       |     +-- localStorage
       |
       +-- Services
             +-- Exchange rates (Fetch API, rates.json)
             +-- Settings
```

### Main Components

- **Database Layer:** Provides a dedicated `db.js` library for storing and retrieving cost data
  from the browser's `localStorage`.
- **Services Layer:** Handles exchange-rate retrieval using the Fetch API and persists the
  user's settings.
- **State Layer:** Maintains shared application state across React components.
- **UI Layer:** One screen per tab, built from reusable components for layout, reports,
  and charts.
- **Settings:** Allows users to configure the exchange-rates URL used by the application.

## Features

### Cost Management

Users can add cost items using the supported currencies:

- USD
- ILS
- GBP
- EURO

Cost information is persisted locally in the browser using `localStorage`.

### Monthly Reports

The application generates a detailed report based on:

- User-selected year
- User-selected month
- User-selected currency

The report displays the relevant cost information while supporting currency conversion when
exchange-rate data is available.

### Data Visualization

The application provides two types of charts:

- **Pie Chart:** Displays costs grouped by category.
- **Bar Chart:** Displays cost totals across the twelve months of a selected year.

### Exchange Rates

Exchange rates are retrieved using the browser's Fetch API from a static JSON file deployed
alongside the application.

The default rates source contains values in the following format:

```json
{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}
```

The application also includes a Settings screen that allows the user to configure a different
exchange-rates URL.

The configured endpoint must allow cross-origin requests using:

```
Access-Control-Allow-Origin: *
```

### Data Persistence

Cost data is stored locally in the browser using the Web Storage API (`localStorage`).

The database functionality is implemented through a dedicated `db.js` library with two versions:

- **ES Module:** Used directly by the React application.
- **Standalone Vanilla JavaScript:** Exposes `db` through the global object and is used for
  automated testing.

This approach keeps the persistence logic separated from the application's UI and business logic.

## Tech Stack

- React
- Material UI (MUI)
- MUI X Charts (`@mui/x-charts`)
- Vite
- JavaScript
- Fetch API
- Browser `localStorage`

## Deployment

The application and exchange-rate data are deployed as a single Render **Static Site**.

| Resource | URL |
|---|---|
| Application | https://cost-manager-fed-a4vc.onrender.com |
| Exchange Rates | https://cost-manager-fed-a4vc.onrender.com/rates.json |

A Render Static Site is served through a CDN and does not require a running server process.
As a result, the application does not experience the cold-start behavior associated with a
Render *Web Service* on the free plan.

### Exchange Rate Dependency

Exchange-rate data is the application's main external dependency.

If the rates endpoint is unavailable:

- The application can still load.
- Existing costs can still be stored.
- Reports can still be generated using the original cost currencies.
- Currency conversion between different currencies will not be available.

Before testing the application, verify that the exchange-rate endpoint returns a valid JSON
object similar to:

```json
{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}
```

## Project Structure

```
index.html              XHTML 1.0 Strict application shell
public/rates.json       Default exchange-rates file, deployed next to the app

src/
+-- main.jsx            Entry point that mounts the React application
+-- App.jsx             Root component: maps the four tabs to the four screens
+-- screens/            One file per tab: Report, AddCost, Charts, Settings
+-- components/         Reusable building blocks the screens are made of
|   +-- layout          Application frame and the rates status indicator
|   +-- common          Shared pieces: period selector, error message, error boundary
|   +-- report          Report table
|   +-- charts          Pie and bar charts
+-- db/                 Database / localStorage library (ES module version)
+-- services/           Exchange-rate polling service and settings persistence
+-- state/              Shared application state provider
+-- theme/              Material UI theme

vanilla/                Standalone db.js (the submitted version) and its test pages
tools/                  Test runners and the submission PDF builder
```

Two more folders exist only on the developers' machines and are not part of the
repository: `docs/` (design spec, implementation plan and submission checklist) and
`requirements/` (course brief, rubric and reference material).

## Installation and Setup

### Prerequisites

Make sure Node.js and npm are installed on your machine.

### Install Dependencies

```
npm install
```

### Start Development Server

```
npm run dev
```

The Vite development server will start the application locally.

### Build for Production

```
npm run build
```

The production-ready files will be generated by Vite.

## Testing

The project includes a standalone vanilla JavaScript version of the database library under:

```
vanilla/
```

`vanilla/test.html` is the grading test page from the project document and
`vanilla/self-test.html` runs the full assertion suite in a browser.

This version exposes the database API through the global `db` object and is intended for
automated testing of the database functionality independently from the React application.

The same checks can be run from the command line:

```
npm test
```

This runs the `db.js` self-test (`npm run test:db`) and verifies that the module and vanilla
versions of the library stay in sync (`npm run test:parity`).

## How to Clear the Site Data

All costs live in the browser's `localStorage`, so resetting the application means clearing
that storage. With DevTools already open (F12 or Ctrl+Shift+I), the fastest way is:

### Option 1 - One line in the Console (easiest)

1. Click in the **Console** tab (where the output is shown).
2. Type:

   ```
   localStorage.clear()
   ```

3. Press **Enter** and reload the page.

### Option 2 - The Application tab

1. Open the **Application** tab in DevTools.
2. Under **Storage**, click **Clear site data**.
3. Reload the page.

Both options remove every stored cost and any custom exchange-rates URL saved from the
Settings screen. The application falls back to its defaults on the next load.

## Deployment

The production application is deployed on Render as a Static Site.

The deployed application is available at:

https://cost-manager-fed-a4vc.onrender.com

The exchange-rate configuration is available at:

https://cost-manager-fed-a4vc.onrender.com/rates.json

## Course Information

- **Course:** Front End Development
- **Course Number:** 65364
- **Institution:** HIT - Holon Institute of Technology

## Authors

- Shaked Shlomo - Development Team Manager
- Muhammad Egbaria - Team Member

---

Cost Manager - Front End Development Final Project
