# Invoicepad

$9 one-time. Fieldbench paste → invoice/quote PDF.

**Locked title:** Paste the lines. Print the invoice.

See ../docs/SKUS.md before changing copy.

## What it does

Paste or enter line items. Fill from/to, number, dates, currency, optional tax %. Print a branded invoice or quote with the browser print dialog (Save as PDF). Optional CSV export of lines. Draft stays in localStorage on this device.

$9 once is marketing. The app is not paywalled.

## What it does not do

- accounting software
- QuickBooks sync
- subscriptions
- tax filing
- send data off the device
- invent unpaid-invoice tracking beyond what you typed

## Layout

index.html, package.json, vite.config.js
src/App.jsx - UI: land, editor, print sheet
src/App.css, src/main.jsx

## Run

From this folder, install dependencies, then use the scripts in package.json (dev, build, preview).

Print with the browser print dialog (Save as PDF). There is no server-side PDF renderer.

## UI bar

Do not ship a build that is missing the locked H1, the locked sub, Print PDF, or $9 one-time in the chrome.

Kill the listing if copy calls this accounting software, if QuickBooks/subscriptions/tax filing appear, if the app is paywalled, or if the price is not $9 one-time.
