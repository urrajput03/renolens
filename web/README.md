# RenoLens

RenoLens is an English-first renovation planning tool for Netherlands projects. Its first source-backed path estimates Polish flooring material costs alongside Netherlands installation labour. Other renovation categories remain visible but are not priced until comparable sources and quantities are documented.

## Run locally

Requires Node.js 24 LTS and npm.

```sh
npm install
npm run dev
```

## Checks

```sh
npm test
npm run lint
npm run build
```

The estimator tests use Node's built-in test runner and TypeScript type stripping.

## Estimate data and limitations

The flooring calculation uses a dated Castorama Poland product listing, an ECB PLN/EUR reference rate, and a Click-PVC Netherlands installation-cost guide. The source snapshot, calculation, product specification, and exclusions are documented in `../docs/poland-to-netherlands-pricing.md`.

Prices are static snapshots in `src/domain/estimator.ts`, not live catalogue or contractor feeds. The displayed subtotal is not a quote. Cross-border delivery, price availability, VAT basis, required underlay, preparation, and a vetted installer quote have not been confirmed. Do not treat the Poland product as a validated best-value recommendation without checking the exact product, compatibility, warranty, and delivered price.

Bathroom, toilet-room, kitchen, and interior-painting prices are deliberately not shown: the current data is insufficient to produce a sourced, itemized materials basket and comparable Netherlands labour cost for those scopes.

Drafts are stored only in this browser's local storage. No account or server is used. Do not store sensitive personal information in a draft.
