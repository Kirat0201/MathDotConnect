# MathDotConnect

Discover the equations that connect our world, understand the stories behind them, and build a personal notebook.

## Run locally

Requires Node.js 22 or newer. There are no production package dependencies.

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. `PORT` and `HOST` configure the server. Keep the default loopback address for local development. Open the application through HTTP rather than `file://` because it uses JavaScript modules.

## What works

- Eight curated equations with explanations, notation, applications, assumptions, and linked resources.
- Search across names, formulas, topics, descriptions, and tags; topic filters and sorting.
- Equation detail links and an interactive unit-circle explanation of Euler’s identity.
- Favorites that persist across reloads, a saved collection, and useful empty states.
- Validated personal contributions, including their learning resource, with removal.
- JSON notebook export and restoration that merges entries without silently overwriting conflicts.
- Responsive layouts, semantic controls, keyboard navigation, dialog focus management, and reduced-motion support.
- Legacy page URLs redirect to their replacement views.

Favorites and contributions live in this browser’s local storage. They are not published, synced, or backed up remotely. Clearing site data removes them. Export a backup first. Restricted browsing or a full storage quota leaves changes in memory for the current visit and displays a warning. Contribution detail links only work in the browser holding that contribution.

## Verify

```sh
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

Unit and server tests use Node’s built-in test runner. Browser tests use Playwright on desktop and mobile Chromium, with axe accessibility scans. CI runs all checks. Automated accessibility checks do not replace manual keyboard and screen-reader testing.

## Structure

```text
index.html                 Semantic application shell and dialogs
style.css                  Responsive visual system
app.js                     UI rendering, routes, event handlers
src/catalog.js             Curated equation content
src/domain.js              Search, validation, notebook persistence and restore
scripts/server.mjs         Allowlisted HTTP server and health endpoint
tests/                     Domain, HTTP integration, and browser tests
docs/                      Product scope, architecture, sprint plan, and cloud labs
```

The UI renders user-provided strings using DOM text nodes rather than interpreting HTML. Source URLs accept HTTP(S) and reject credentials and executable schemes. Restored entries are reconstructed from validated fields. The server serves an explicit asset allowlist and includes a content security policy; it does not expose the repository or configuration files.

## Container

```sh
docker build -t mathdotconnect .
docker run --rm --name mathdotconnect -p 127.0.0.1:4173:4173 mathdotconnect
```

The container runs as a non-root user. Its health check calls `/healthz`. Container instructions must be tested on a running Docker engine before deployment. See [cloud labs](docs/cloud-labs.md).

## Static AWS deployment

`npm run build:static` packages only the eight public browser files into `dist/`.
The [AWS CLI lab](docs/aws-static-deploy.md) deploys that directory through a
private S3 bucket and CloudFront. The Node server and its `/healthz` endpoint
are not part of the static deployment.

## Development plan

See [product scope](docs/product.md), [architecture decisions](docs/architecture.md), [sprints](docs/sprints.md), and the [community roadmap](docs/community-roadmap.md). The next milestone adds guest browsing, managed sign-in, profiles, moderated publishing, and a paginated discovery feed. Those community features are planned; local contributions are not public today.

The original images and video remain in git for provenance. The application no longer loads them, keeping the initial page independent of an 18 MB background video and missing screenshots. No license has been assumed for the original media; review ownership before reusing it.
