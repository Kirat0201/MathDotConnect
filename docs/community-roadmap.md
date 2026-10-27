# Community roadmap: discover and publish equations

Status: planned. This document is the handoff for the next development session; the features below are not implemented yet.

## Product direction

Make MathDotConnect a community for discovering equations and the people who explain them. Anyone can browse the public catalog and feed without signing in. An account lets someone publish an equation, maintain a public profile, and eventually sync saved equations across devices.

The feed should feel as easy to explore as a video feed: compelling cards, short explanations, clear creator attribution, and a deeper equation page. Keep the learning content substantive. Load results in small pages as the visitor scrolls; do not present the current eight curated equations as an infinite or personalized feed.

## First end-to-end milestone

1. A guest can browse approved equations and open a public detail URL without an account.
2. A visitor can sign in with Google or email/password through a managed authentication provider.
3. A signed-in person can create a contribution with the existing validated fields and a credible HTTP(S) source. It starts as `pending` and is not public.
4. An authorized moderator can approve or reject it. An approved equation appears in the public feed and on its creator's profile.
5. A second browser can read the published equation. Another user cannot edit it, approve it, or view private account fields.

This is the first useful full-stack release. Public profiles show a display name, optional avatar and bio, and approved contributions. Email addresses and authentication details remain private.

## Proposed implementation order

1. **Decide the product rules.** Choose the initial audience, content license, moderation policy, account deletion behavior, and whether existing local notebooks may be imported with explicit user consent.
2. **Set up the backend.** Recommended starting point: Vercel for the existing frontend plus Supabase Auth and Postgres for accounts and shared data. Treat this as a proposal until cost, ownership, and provider configuration are reviewed. Keep credentials out of the repository.
3. **Model the data.** Start with `profiles`, `equations`, `favorites`, and `moderation_events`. Equations need a stable ID, author ID, source URL, timestamps, and status (`pending`, `approved`, or `rejected`). Use database migrations and seed the existing curated catalog without losing attribution.
4. **Enforce permissions in the backend.** Public visitors may read approved equations and public profile fields. Authenticated users may submit their own pending work. Only the owner may change an editable submission; only moderators may approve or reject. Validate fields and URLs on the server, not only in the browser. Add basic submission rate limits and reporting before opening public submissions broadly.
5. **Build the visible loop.** Add sign-in, creator profiles, a submission state screen, moderation UI, public detail URLs, and a feed with cursor pagination. Keep search and topic filters useful alongside scrolling.
6. **Verify and operate.** Test guest reads, ownership failures, moderation, pagination, invalid content, and account deletion. Record a backup/restore drill and a production rollback. Check mobile, keyboard navigation, and loading/empty/error states.

## Later, after the first milestone

- Follow creators and sync favorites across devices.
- Recommend related equations by topic and saved interests once there is enough genuine content; start with recent or curated ordering.
- Add richer mathematical notation and interactive explanations only after reviewing accessibility and untrusted-content rendering.
- Explore notifications and contributor reputation after moderation and abuse controls are working.

## Existing behavior to preserve

- The current static site is live on Vercel at <https://dist-kappa-hazel-50.vercel.app/>. The Vercel project was automatically named `dist` because the packaged `dist/` folder was deployed directly. Deployment does not yet run automatically on Git pushes.
- The eight curated equations, search, filters, details, responsive UI, and local notebook are implemented.
- Contributions and favorites currently live only in browser local storage. A new account must not silently publish or upload those personal entries. Preserve export/restore until an explicit migration flow exists.
- The AWS private S3 plus CloudFront template is prepared, but CloudFront creation was blocked by an AWS account-level verification error. Do not describe that AWS deployment as live.

## Next-session starting point

Read this file, `docs/product.md`, `docs/architecture.md`, and `src/domain.js`. Confirm the product-rule decisions above with Kirat, then implement the first milestone in small, testable slices. Keep the public browsing flow available throughout the migration.
