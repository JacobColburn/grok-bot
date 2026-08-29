# Doorlog

$4 one-time. Fieldbench DIY-landlord photo PDF.

**Locked title:** Walk the place. Print a photo PDF.

See ../docs/SKUS.md before changing copy.

## What it does

You own the building. Walk rooms, shoot photos (or use demo mode), print a dated photo sheet. Print-to-PDF is the export. Reprints are allowed. $4 once is the price, not a single-print lock.

Every sheet and photo carries a visible date stamp taken at export / shoot time.

## What it does not do

- inspect the property
- serve a tenant
- store a two-party walk
- produce a legal record, court-ready PDF, or insurance-ready claim
- send photos off the device

## Layout

index.html, package.json, vite.config.js
src/App.jsx - UI: land, walk, print sheet
src/App.css, src/main.jsx

Stripe buy link lives in src/App.jsx. Product IDs: ../docs/STRIPE.md

## Run

From this folder, install dependencies, then use the scripts in package.json (dev, build, preview).

Print the sheet with the browser print dialog (Save as PDF). There is no server-side PDF renderer.

## UI bar

Do not ship a build that is missing an export-time date stamp on the print sheet and on photos, or $4 one-time in the header.

Kill the listing if either is gone, if copy calls this an inspection / tenant app / legal record, or if $4 once is sold as a one-print lock.
