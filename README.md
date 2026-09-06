Cost Manager – Frontend
Project Overview

Cost Manager is a client-side web application developed as the final project for the Front End Development course (HIT, Course 65364).

The application allows users to:

Add and manage cost items in USD, ILS, GBP, and EURO
View detailed cost reports for a specific month and year
Generate reports in a currency selected by the user
Visualize expenses using a pie chart by category
Visualize yearly expenses using a bar chart across twelve months
Configure a custom exchange-rates source through the application settings

The application is built with React and follows a component-based architecture with shared state management and a dedicated client-side database library.

Team
Role	Name
Development Team Manager	Shaked Shlomo
Team Member	Muhammad Egbaria
Architecture

The application follows a client-side React architecture with clear separation between data persistence, API communication, application state, UI components, and visualization.

React Application
       │
       ├── Components
       │     ├── Layout
       │     ├── Forms
       │     ├── Reports
       │     └── Charts
       │
       ├── Shared State
       │
       ├── Database Layer
       │     └── localStorage
       │
       └── Exchange Rate API
              │
              └── rates.json

Main Components
Database Layer: Provides a dedicated db.js library for storing and retrieving cost data from the browser's localStorage.
API Layer: Handles exchange-rate retrieval using the Fetch API.
State Layer: Maintains shared application state across React components.
UI Layer: Contains reusable components for layouts, forms, reports, and charts.
Settings: Allows users to configure the exchange-rates URL used by the application.
Features
Cost Management

Users can add cost items using the supported currencies:

USD
ILS
GBP
EURO

Cost information is persisted locally in the browser using localStorage.

Monthly Reports

The application generates a detailed report based on:

User-selected year
User-selected month
User-selected currency

The report displays the relevant cost information while supporting currency conversion when exchange-rate data is available.

Data Visualization

The application provides two types of charts:

Pie Chart: Displays costs grouped by category.
Bar Chart: Displays cost totals across the twelve months of a selected year.
Exchange Rates

Exchange rates are retrieved using the browser's Fetch API from a static JSON file deployed alongside the application.

The default rates source contains values in the following format:

{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}


The application also includes a Settings screen that allows the user to configure a different exchange-rates URL.

The configured endpoint must allow cross-origin requests using:

Access-Control-Allow-Origin: *

Data Persistence

Cost data is stored locally in the browser using the Web Storage API (localStorage).

The database functionality is implemented through a dedicated db.js library with two versions:

ES Module: Used directly by the React application.
Standalone Vanilla JavaScript: Exposes db through the global object and is used for automated testing.

This approach keeps the persistence logic separated from the application's UI and business logic.

Tech Stack
React
Material UI (MUI)
MUI X Charts (@mui/x-charts)
Vite
JavaScript
Fetch API
Browser localStorage
Deployment

The application and exchange-rate data are deployed as a single Render Static Site.

Resource	URL
Application	https://cost-manager-fed-a4vc.onrender.com
Exchange Rates	https://cost-manager-fed-a4vc.onrender.com/rates.json

A Render Static Site is served through a CDN and does not require a running server process. As a result, the application does not experience the cold-start behavior associated with a Render Web Service on the free plan.

Exchange Rate Dependency

Exchange-rate data is the application's main external dependency.

If the rates endpoint is unavailable:

The application can still load.
Existing costs can still be stored.
Reports can still be generated using the original cost currencies.
Currency conversion between different currencies will not be available.

Before testing the application, verify that the exchange-rate endpoint returns a valid JSON object similar to:

{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}

Project Structure
index.html              XHTML 1.0 Strict application shell

src/
├── db/                 Database / localStorage library
├── api/                Exchange-rate fetching and settings
├── state/              Shared application state
├── components/         Application UI components
│   ├── Layout
│   ├── Forms
│   ├── Report
│   └── Charts
└── theme/              Material UI theme

vanilla-test/           Standalone db.js and automated test page

Installation and Setup
Prerequisites

Make sure Node.js and npm are installed on your machine.

Install Dependencies
npm install

Start Development Server
npm run dev


The Vite development server will start the application locally.

Build for Production
npm run build


The production-ready files will be generated by Vite.

Testing

The project includes a standalone vanilla JavaScript version of the database library under:

vanilla-test/


This version exposes the database API through the global db object and is intended for automated testing of the database functionality independently from the React application.

Deployment

The production application is deployed on Render as a Static Site.

The deployed application is available at:

https://cost-manager-fed-a4vc.onrender.com

The exchange-rate configuration is available at:

https://cost-manager-fed-a4vc.onrender.com/rates.json

Course Information

Course: Front End Development
Course Number: 65364
Institution: HIT – Holon Institute of Technology

Authors

Shaked Shlomo – Development Team Manager
Muhammad Egbaria – Team Member

Cost Manager – Front End Development Final Project
