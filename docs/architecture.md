# Architecture decisions

## ADR 001: browser-first modular application

Use HTML, CSS, and browser JavaScript modules for the initial catalog. The existing product is a small static site; a framework, authentication system, and database are not prerequisites to validate discovery. Domain functions live separately from DOM behavior so they are testable and reusable by an eventual API or MCP server.

Tradeoff: UI updates are explicit and the catalog ships with the page. Reconsider a build tool or framework when routing, collaboration, or bundle size warrants it.

## ADR 002: explicit local notebook

Store only favorites and personal contributions in a versioned local-storage record. Treat storage as untrusted: validate source URLs and field bounds, restrict IDs, reconstruct derived fields, discard invalid saved entries, and warn when recovery occurs. Export/restore uses JSON. Import rejects incompatible or invalid contributions and conflicting IDs instead of overwriting existing entries. Imports have a 1 MB size limit and notebooks allow 100 contributions.

Tradeoff: there is no cross-device sync, account recovery, public publishing, or remote backup. Personal contribution URLs cannot be shared between browsers. A future backend needs ownership, authorization, migrations, backup/restore, and conflict semantics.

## ADR 003: no user HTML or TeX execution

Build UI through DOM elements and `textContent`. Accept HTTP(S) resource links only. Keep external links isolated with `noopener noreferrer`. Use plain-text/Unicode equations until a reviewed mathematical renderer improves accessibility and notation without introducing unsafe HTML paths.

## ADR 004: allowlisted HTTP entrypoint

Use a small Node HTTP server for reproducible local and container operation. Serve only the application shell, modules, CSS, and legacy redirects. Reject other methods and arbitrary paths; do not serve `.git`, environment files, tests, or package metadata. Include a restrictive CSP, `nosniff`, referrer policy, and health endpoint. The default binds to loopback; containers explicitly bind to all interfaces.

Tradeoff: this is a single-instance static server without TLS termination, CDN, traffic management, or a production observability stack. Configure those at the deployment platform. Health means the process serves requests, not that an external system is healthy.

## ADR 005: test core behavior and real journeys

Node tests exercise search composition, safe URLs, contribution validation, storage corruption, quota failures, restoration, and HTTP boundaries. Playwright exercises user flows on desktop and mobile Chromium. Axe checks common accessibility violations. Actual deployments, cross-browser behavior, assistive technology, and container operation need separate evidence.

## Future shared publishing boundary

Keep catalog reads distinct from authenticated writes. Proposed entities: equation, resource, user, saved_equation, submission, and moderation_event. Public reads need stable IDs and pagination. Writes need validation and ownership checks on the server, not only in the UI. Establish a content policy, safe mathematical rendering, abuse controls, and a restore-tested database before public submissions.

## MCP boundary

A read-only equation search/detail service can reuse the curated catalog and pure search functions. Follow the current MCP SDK and protocol rather than hand-rolling JSON-RPC. Keep stdio output reserved for protocol messages, use stderr for diagnostics, validate tool arguments, and return explicit unknown-ID errors. Do not expose local notebook content to a remote client without a deliberate privacy model.
