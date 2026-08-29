# Repo layout

rally/ and doorlog/ are separate Vite apps. Do not merge them. Do not share a src tree. Each has its own package.json, index.html, and src/.

Root README.md is the company overview.
docs/SKUS.md is locked listing copy.
docs/STRIPE.md is live product, price, and payment-link IDs.
shots/ is landing screenshots for reference.

node_modules and dist are gitignored. Build locally or in CI. Do not commit compiled bundles.

Landing shots in shots/ are reference only. If UI copy changes, reshoot them.

This GitHub repo is JacobColburn/grok-bot. Fieldbench source lives here. Do not mix Claude or SlashKeys work into it.
