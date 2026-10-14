# Delivery sprints

A sprint here is an independently reviewable outcome, not a promised calendar duration.

## Sprint 1: working discovery and personal notebook

Status: implemented; final verification in progress.

Deliverables: modular catalog, search/filter/sort, responsive UI, details and deep links, Euler unit-circle explorer, favorites, local contributions, export/restore, storage recovery, security boundaries, tests, CI, and setup documentation.

Exit: automated checks pass; desktop/mobile views are inspected; known limitations are recorded; a draft PR contains the reviewable changes. No merge or deployment is implied.

## Sprint 2: shared publishing

Status: planned.

1. Decide audience, hosting, content license, and moderation rules.
2. Define API contracts and database schema with migrations.
3. Add authentication and server-side ownership checks.
4. Add durable submissions, source review, moderation, and public detail URLs.
5. Add integration tests covering unauthorized writes, invalid resources, duplicate submissions, pagination, and deletion.
6. Perform and document a real backup/restore drill.

Exit: two separate browsers can see an approved publication; unauthorized users cannot edit it; a failed migration can be recovered. Depends on product choices and a chosen database/environment.

## Sprint 3: operate and validate

Status: planned.

1. Deploy staging with TLS and least-privilege configuration.
2. Run CI before promotion; document rollback to the previous release.
3. Add appropriate logs, health monitoring, and budget alerts.
4. Test a failure and recovery, including a restored backup.
5. Observe real learners and address the highest-impact usability findings.
6. Produce a short demo and accurate résumé entry grounded in implemented behavior.

Exit: deployment, diagnosis, rollback, and restore are demonstrated with recorded evidence. Paid services and public launch require an approved environment.

## Parallel learning backlog: build an MCP server

- Read the current protocol and official SDK quickstart.
- Reuse catalog data and search domain functions.
- Implement read-only `search_equations` and `get_equation` with bounded, validated input.
- Test an unknown ID, invalid arguments, an empty result, and normal responses with a real client.
- Document local configuration; keep credentials out of source control.
- Evaluate remote transport and authentication only after local operation is understood.

This backlog is a requested learning objective, not a claim that an MCP server has already been implemented.
