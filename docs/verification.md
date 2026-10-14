# Verification record

- Local runtime: Node.js 26.0.0 on macOS ARM64. CI targets Node.js 22 on Ubuntu.
- Syntax checks: passed.
- Domain and HTTP integration tests: 16 passed.
- Desktop/mobile Chromium tests: 20 passed, including axe checks for the catalog and dialogs.
- Formatting and whitespace checks: passed.
- Desktop, mobile, and equation-detail screenshots: inspected; no horizontal page overflow at tested viewports.
- Package audit during installation: no vulnerabilities reported.

## Limits

Docker is installed but its engine is not running, so the Dockerfile has not been built or smoke-tested. No deployment has been performed. Cross-browser Safari/Firefox and manual screen-reader testing remain to be done. Automated accessibility checks cover common violations, not full accessibility conformance.

The current release stores personal notebook data in the browser; shared publishing and accounts are planned. CI results must be read from the actual workflow run, not inferred from local results.
