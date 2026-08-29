# Rally

$9 one-time. Fieldbench paste tool.

**Locked title:** Paste the chat. Who said they would.

See ../docs/SKUS.md before changing copy.

## What it does

Paste a messy group chat (WhatsApp export, iMessage copy, or Name: lines). A heuristic parser in the browser extracts who is in the thread, when / times mentioned, where, who said they would, open questions, money mentioned, sounds-like-a-yes, and bring / pack.

The result is stamped EXTRACTED. It is not the groups official plan.

## What it does not do

- run the group
- ping anyone
- claim it caught everything
- turn screenshots into calendar events
- call the output next steps as a product promise

## Layout

index.html, package.json, vite.config.js
src/App.jsx - UI: land, paste, extracted result
src/App.css, src/main.jsx
src/parser.js - heuristic extract (no API)
src/sampleChat.js - weekend-trip sample paste

Stripe buy link lives in src/App.jsx. Product IDs: ../docs/STRIPE.md

## Run

From this folder, install dependencies, then use the scripts in package.json (dev, build, preview).

## UI bar

Do not ship a build that is missing a visible EXTRACTED banner on the result, or $9 one-time in the header.

Kill the listing if either is gone, or if the heading is not Paste the chat. Who said they would.
