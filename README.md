# Fieldbench

Two small, paid, one-time tools. No accounts. No third product.

Rally lives in rally/. $9 one-time. Locked title: Paste the chat. Who said they would.
Doorlog lives in doorlog/. $4 one-time. Locked title: Walk the place. Print a photo PDF.

Buy links are live Stripe Checkout. Do not fake them.

Live Pages (gh-pages):
- Storefront: https://jacobcolburn.github.io/grok-bot/
- Rally: https://jacobcolburn.github.io/grok-bot/rally/
- Doorlog: https://jacobcolburn.github.io/grok-bot/doorlog/
- Post-pay Rally: https://jacobcolburn.github.io/grok-bot/success/rally/
- Post-pay Doorlog: https://jacobcolburn.github.io/grok-bot/success/doorlog/

Hunter: set each Stripe Payment Link `after_completion` redirect to the matching success URL above (Dashboard only — not in this repo). Apps have no paywall; success pages confirm purchase and deep-link into the live app.

Copy of record: docs/SKUS.md
Stripe IDs: docs/STRIPE.md
Layout: docs/REPO.md

## Rally - $9 one-time

**Paste the chat. Who said they would.**

Dump a group thread. Rally runs a heuristic parser in the browser and pulls people, times, places, decisions, open questions, and who said they would.

- Does not run the group.
- Does not ping anyone.
- Does not claim it caught everything.
- Zero signup. No API keys. Parse stays on the device.
- Output is labeled EXTRACTED from the paste. It is not the groups official plan.

Checkout: https://buy.stripe.com/8x200l2Vfdd5glg39pb7y01

From rally/: install dependencies, then use the scripts in package.json.

## Doorlog - $4 one-time

**Walk the place. Print a photo PDF.**

For a DIY landlord. Walk rooms, shoot photos, print a dated sheet. $4 once is the price, not a single-print lock.

- Not an inspection.
- Not a tenant app.
- Not a legal record. Not court-ready. Not insurance-ready.
- Photos stay in the browser.
- Print-to-PDF is the export. Every sheet and photo carries a visible date stamp.
- Demo mode works without a camera.

Checkout: https://buy.stripe.com/aFaaEZ9jDgph7OKh0fb7y00

From doorlog/: install dependencies, then use the scripts in package.json.

## Honest limits

No fake testimonials. No fake metrics. These are paste-and-print tools, not platforms.

If UI copy drifts from docs/SKUS.md, kill the page until it matches.
