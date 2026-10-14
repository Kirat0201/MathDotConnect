# Product brief

## Idea

MathDotConnect connects curious people through the equations they love. A visitor should discover an interesting equation, understand why it matters without needing a mathematics degree, follow a credible resource, and keep it for later.

## Prototype audit

The previous home page expressed the core idea but did not implement the advertised journeys. It referenced three absent screenshots, loaded a large autoplay video, linked a contribution call to a CSS file, and contained a local filesystem link. The shared script attached a submit handler to an element absent on most pages, causing an initialization error. The contribution form interpolated untrusted strings into HTML and lacked a durable publishing path. Favorites and search were placeholders. README, setup instructions, tests, CI, error handling, and an architecture were absent.

## First release acceptance

1. Visitors can browse a curated catalog and understand equation assumptions, notation, applications, and resources.
2. Search, filters, and saved-only browsing compose predictably. Zero results and zero saved items explain the next action.
3. Saving and removing favorites works across reloads when storage is available.
4. Contributions require a name, formula, short story, explanation, and a valid HTTP(S) source. No field becomes executable markup.
5. Personal contributions remain explicitly local; users can remove them and export/restore a notebook.
6. Desktop and narrow mobile layouts fit their viewport. Controls have accessible names and keyboard focus. Dialogs dismiss with Escape.
7. Storage and malformed data failures do not prevent discovery.
8. Setup, meaningful automated checks, CI, and future delivery decisions are documented.

## Assumptions

- English content and a small curated catalog are sufficient to validate the idea.
- Plain text and Unicode formulas provide a dependency-free first release. TeX rendering and screen-reader math notation need a separate evaluation.
- A shared backend should follow observed demand for contributions rather than being required to try the product.
- No usage metrics, user testimonials, contributor identities, or community activity are invented.

## Next product decisions

- Who is the first audience: school students, university learners, or curious general readers?
- Should published submissions be moderated before visibility?
- Which sign-in and hosting provider fits the maintenance and cost budget?
- What content license should original explanations and contributor submissions use?
- Which learning outcomes justify interactive visualizations beyond the unit circle?

## Evidence for a useful next sprint

Ask a few learners to discover an unfamiliar equation, explain it in their own words, save it, and contribute a source. Record confusing steps and improve those before expanding the feature surface. Do not describe this validation as completed until it actually happens.
