# IJITEST Database Read-Only Audit

## Scope

This audit inspected the live MySQL database through the `mysql-ijitest` MCP server and compared the core schema with `src/db/schema.ts`.

No inserts, updates, deletes, alters, migrations, optimizations, or other write operations were performed.

## Database inventory

- Database: `u116573049_ijitest_db`
- Engine: InnoDB
- Collation: `utf8mb4_unicode_ci`
- Tables/views reported: 32 tables, including migration and mapping tables
- Core workflow tables:
  - `users`
  - `user_profiles`
  - `submissions`
  - `submission_versions`
  - `submission_files`
  - `submission_authors`
  - `review_assignments`
  - `reviews`
  - `payments`
  - `publications`
  - `notifications`
  - `volumes_issues`

Approximate live row counts:

- users: 53
- submissions: 20
- submission_versions: 20
- submission_files: 29
- submission_authors: 74
- review_assignments: 10
- reviews: 7
- publications: 20
- notifications: 52
- volumes_issues: 6
- rate_limits: 306
- usage_stats: 86

The database is currently small. No table fragmentation was reported.

## Schema comparison result

The live DDL for the inspected core tables substantially matches `src/db/schema.ts`, including:

- UUID-style user IDs;
- submission status and publication lifecycle fields;
- submission version uniqueness;
- cascading child relationships;
- review assignment uniqueness;
- one payment per submission;
- one publication per submission;
- notification user/read index;
- JSON validation checks on JSON columns;
- core foreign keys and indexes.

Inspected tables:

- `users`
- `submissions`
- `submission_versions`
- `submission_files`
- `review_assignments`
- `reviews`
- `payments`
- `publications`
- `notifications`

No immediate core DDL mismatch was confirmed from this sample.

## Referential integrity checks

All checked orphan counts were zero:

- orphan submission versions;
- orphan submission files;
- orphan submission authors;
- review assignments without submissions;
- review assignments without versions;
- reviews without assignments;
- publications without submissions;
- payments without submissions;
- notifications without users.

## Workflow integrity checks

All checked workflow issue counts were zero:

- submissions without versions;
- published submissions without publications;
- publications attached to non-accepted/non-published submissions;
- payment-pending submissions without payments;
- accepted submissions without paid, verified, or waived payment;
- review assignments whose version belongs to another submission;
- submissions without an author profile;
- submissions without a corresponding-author row;
- submissions with multiple corresponding-author rows;
- publications without final PDF URLs;
- publications without issues;
- publications linked to unpublished issues;
- blank paper IDs;
- blank user emails.

## Duplicate checks

No duplicates were found for:

- case-insensitive user email;
- case-insensitive paper ID;
- volume/issue/year coordinates.

## Current data state

The current production data reports:

- all 20 submissions have status `published`;
- all 20 publications have corresponding submissions;
- all checked publication and issue relationships are valid;
- 49 users are not email-verified;
- 0 users are deleted;
- 0 users are inactive;
- 20 invitation rows are expired.

The expired invitations are not necessarily harmful, because invitation lookup checks expiration. They should be cleaned up periodically to prevent unbounded growth.

Recommended cleanup policy:

- delete or archive invitations with `expires_at` older than a retention period;
- retain recent expired invitations if audit/history is required;
- perform cleanup through a controlled cron/server action, not manually in production.

## Migration tracking concern

The live `__drizzle_migrations` table reports zero rows, while the repository contains nine Drizzle migration files:

```text
drizzle/0000_*.sql
...
drizzle/0008_*.sql
```

This suggests one of the following:

1. the database was created with `drizzle-kit push`;
2. migrations were applied manually;
3. the migration table was reset or not populated;
4. the connected database is not the database used by the deployment migration process.

This must be verified before future production migrations. Do not assume that the migration journal represents production history.

## Migration tooling concern

`package.json` declares:

```json
"db:migrate": "tsx scripts/safe-migrate.ts"
```

The repository now contains `scripts/safe-migrate.ts`. The runner:

- loads the database connection from the standard `DB_*` environment variables;
- takes a MySQL advisory lock to prevent concurrent deployments;
- blocks production execution unless `DB_MIGRATION_APPROVED=true` is explicitly set;
- applies migrations through Drizzle's migration runner;
- refuses to apply the complete migration history when the migration ledger is empty but application tables already exist.

The last condition is intentional. Because the audited live database had application tables but an empty `__drizzle_migrations` table, the runner will stop rather than guess which historical migrations are already represented by the live schema. Establish and review a baseline before enabling migrations against that database.

The current database deployment process should be documented explicitly:

```text
schema.ts change
→ pnpm db:generate
→ inspect generated SQL
→ test against staging/backup
→ apply migration
→ verify live schema
```

Avoid unreviewed `drizzle-kit push` against production.

## Index review

Core indexes are present for the currently observed workflow:

- users: email unique, role;
- submissions: paper ID unique, slug unique, status, author, issue, section, decision maker;
- submission versions: submission/version unique;
- submission files: version;
- review assignments: unique assignment, reviewer, version, assigner;
- reviews: assignment unique;
- payments: submission unique, transaction unique;
- publications: submission unique, issue, DOI unique;
- notifications: user/read and creator.

No index should be added solely from row counts. Revisit composite indexes after query plans are captured for large dashboard queries.

Potential future indexes to evaluate when data grows:

- `submissions(status, updated_at)`;
- `submissions(corresponding_author_id, status)`;
- `review_assignments(reviewer_id, status, deadline)`;
- `notifications(user_id, is_read, created_at)`;
- `submission_event_log(submission_id, created_at)`.

These are recommendations only. They require query-plan validation before migration.

## Recommended next actions

### Immediate, non-destructive

1. Verify which database deployment process created the current schema.
2. Confirm why `__drizzle_migrations` is empty.
3. Fix or document the missing `scripts/safe-migrate.ts` runner.
4. Add controlled expired-invitation cleanup.
5. Capture representative `EXPLAIN` plans for dashboard and archive queries.

### Before any schema migration

1. Take a database backup.
2. Confirm the target database and environment.
3. Generate the migration from `src/db/schema.ts`.
4. Review the SQL manually.
5. Test against a staging copy.
6. Apply in a maintenance-safe window.
7. Re-run this integrity audit.

## Conclusion

The live database is currently structurally healthy based on the checks performed. No destructive data issue or confirmed core schema mismatch was found.

The highest-risk database-operational issue is migration provenance: the application repository has migrations, but the live migration journal is empty and the configured migration runner file is missing. Resolve that process before making future schema changes.
