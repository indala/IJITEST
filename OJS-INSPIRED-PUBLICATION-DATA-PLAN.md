# IJITEST Publication Data Evolution Plan

## Purpose

Use OJS 3.5.0-5 as a scholarly-publishing reference to improve IJITEST's publication data model and metadata consistency. This is an incremental plan for IJITEST as a **single-journal application**. It is not a plan to fork OJS, reproduce its full data model, or add multi-journal support.

The implementation agent should first review the existing code paths, schema, Drizzle migrations, and publication/export behavior. Preserve existing behavior unless a change is explicitly required below. Do not edit the live database directly; make schema changes through reviewed application migrations.

## Current baseline

Read-only inspection of the connected IJITEST database and source schema found:

- 32 database tables; 23 submissions, 20 publication records, 6 issues, and 85 submission-author rows at the time of inspection.
- `publications.submission_id` is unique, so each submission has at most one publication record. A publication currently has one required `final_pdf_url`.
- `submission_versions` stores editorial-submission metadata and files are attached through `submission_files`. These are not the same thing as an immutable published edition/version.
- Every one of the 23 submissions inspected had one submission version. This is only a snapshot, not evidence that revision support is unnecessary.
- IJITEST already has sections, issues, DOI/Crossref and Zenodo fields, ORCID and CRediT author fields, OAI-PMH, and publication exports. Do not duplicate these capabilities.
- All 20 published submissions inspected had a publication record and a non-empty final PDF URL. There were no publication/issue mismatches in the checked records.
- 12 of 20 publications had no DOI; this is not necessarily a defect. Do not assign or require DOIs without a journal policy decision.
- 0 of 85 submission-author rows had an ORCID. This indicates that ORCID is not currently populated in these records, not that the database lacks an ORCID field.
- The article license appears to be emitted as a fixed CC BY 4.0 value in publishing surfaces rather than stored per publication/version. Confirm the journal's actual rights policy before any data backfill.

Relevant existing files include `src\db\schema.ts`, `src\lib\crossref-generator.ts`, `src\lib\jats-generator.ts`, `src\lib\oai-pmh.ts`, `src\lib\feed-generator.ts`, and the public article page under `src\features\archives\components\`.

## Goals and priorities

### P1 — Make publication rights metadata explicit and consistent

1. Trace every public page and metadata output that emits license, copyright, or rights information, including article pages, Crossref, JATS, OAI-PMH, RSS/Atom, and other existing exports.
2. Add publication-level rights fields using IJITEST's existing Drizzle/MySQL conventions. At minimum, support a license URL/identifier and copyright holder/year where applicable. Keep optional fields nullable when the information is unknown.
3. Have public pages and exports read from the same persisted publication metadata rather than hard-coded, independently maintained values.
4. Preserve current CC BY 4.0 behavior only if the journal's policy confirms it. Backfill existing records only from a verified policy; otherwise leave fields unset and handle that state explicitly in the UI/exports.
5. Add validation/tests proving that missing rights metadata does not produce false license claims and that configured metadata is consistent across output formats.

### P1 — Model published files as publication representations

1. Add a publication-scoped representation/galley model instead of treating the editorial `submission_files` table as the public publication asset catalog.
2. Support multiple published assets per publication, with fields appropriate to the current product: format or MIME type, public label, URL/storage key, language where known, display order, primary/downloadable flag, and optional file size.
3. Preserve `publications.final_pdf_url` as a compatibility field during migration. Backfill one PDF representation for each valid existing URL; do not delete or rename the legacy field until all readers/writers have been migrated and verified.
4. Update publication creation/editing and public article/download surfaces to use representations. Keep access behavior unchanged for the existing final PDF.
5. Do not add HTML production or new file formats as part of this database-only capability unless an existing publishing workflow can support them end to end.

### P2 — Separate published versions from editorial submission revisions

1. Keep `submission_versions` for peer-review/editorial history. Do not repurpose it or silently treat its current row as a published-version history.
2. If the existing application supports or is expected to support post-publication updates, add a publication-version entity tied to the stable publication record. Store an immutable publication metadata snapshot and publication date/version label; link each representation to the appropriate published version.
3. The initial release should create a first publication version from the approved metadata and current final PDF without changing the article's public URL or DOI.
4. Make one version explicitly current; enforce unique version numbering per publication and prevent accidental multiple-current-version states (application transaction/validation and database constraint where supported).
5. Do not include a general version-history UI unless the application can define who may create a new version, review/approve it, and how DOI/Crossref metadata is updated. If those workflow decisions are not established, implement this as a later phase rather than inventing policy.

### P2 — Link corrections/retractions to affected publications

1. Review existing `submissions.status`, retraction fields, publication creation, and public notice behavior before designing this change.
2. If IJITEST supports a separately published correction/retraction notice, add an explicit relation between the notice publication and the affected publication (for example, corrects/retracts/updates), with a reason/date and notice target as appropriate.
3. Render reciprocal links where appropriate and include the relation in the relevant metadata exports.
4. Preserve existing retraction/corrigendum records and URLs during migration. Do not equate an OJS tombstone with a retraction workflow.
5. Avoid a new relationship table if the current workflow has no separate notice publication to relate; in that case document the limitation and defer until workflow requirements are defined.

### P3 — Improve author identifier and affiliation quality

1. Retain existing `submission_authors.orcid_id` and CRediT roles; do not add a second ORCID field.
2. Review author entry, editing, and export paths so ORCID can be collected, normalized, validated, and consistently emitted. Do not require ORCID unless journal policy requires it.
3. Keep the current single affiliation string unless the product needs authors with multiple affiliations or affiliation-level identifiers. If that need is confirmed, normalize affiliations and link authors to them without losing existing institution text.
4. Do not add ORCID OAuth/deposit workflows as part of this data-model plan.

## Explicitly out of scope

- Multi-journal/context IDs, tenant architecture, or journal cloning.
- An OJS-style plugin registry, theme framework, or operator-installed extensions.
- Replacing the editorial workflow, reviewer assignment model, or issue/section model solely for OJS parity.
- Automatically assigning DOIs to records that currently lack one.
- Adding OAI-PMH resumption-token work, new export formats, COUNTER/SUSHI changes, or preservation integrations in this database-focused plan.
- Direct edits to the production database or destructive cleanup of existing publication/file data.

## Implementation sequence

1. **Discovery:** map publication create/update/read flows and all metadata output surfaces; confirm current license policy and whether multiple publication versions/correction notices are product requirements.
2. **Rights metadata:** add nullable schema fields and a Drizzle migration; update shared metadata mapping and targeted tests; verify all surfaces.
3. **Representations:** add the table/relations and additive migration; backfill existing final PDFs idempotently; update readers/writers while retaining the legacy field for compatibility.
4. **Published versions:** only after workflow semantics are approved, add the publication-version snapshot and associate representations; migrate the current publication as version 1.
5. **Notice relationships and author-quality improvements:** implement only when corresponding workflow requirements are confirmed.
6. **Cleanup:** remove legacy columns or compatibility paths only in a separate migration after repository-wide use checks and deployment verification.

## Migration and data-safety requirements

- Follow the existing Drizzle migration workflow (`drizzle\` and the scripts in `package.json`); do not use an unreviewed schema push against production.
- Make migrations additive first, preserve all current rows, and support safe application deployment order.
- Backfills must be idempotent and must not overwrite existing metadata, URLs, identifiers, or user-entered rights data.
- Before any production migration, take/verify a restorable backup and validate the migration against a database copy.
- Do not assume the inspected live database snapshot is unchanged when implementation begins; re-check row counts, nulls, constraints, and orphan records before writing the migration.
- Keep API/public page response shapes backward-compatible during rollout or update all consumers in the same coordinated change.

## Acceptance criteria

- IJITEST remains a single-journal application; no tenant or plugin abstraction is introduced.
- Existing published articles, issue assignments, DOIs, Zenodo identifiers, and PDF links continue to work.
- License/copyright metadata has one persisted source of truth and is consistent across every output that exposes it.
- Each current PDF is represented in the new publication-asset model after migration, without duplicate rows on reruns.
- Multiple assets can be ordered and rendered correctly if configured; existing articles continue to show their PDF.
- Published-version history is distinct from peer-review submission revisions and cannot silently change the current published record.
- Correction/retraction links are correct and do not break the existing notice workflow, if that phase is implemented.
- Schema changes are represented in Drizzle schema and committed migration files; relevant targeted tests, type-check, and lint pass.
- No live database migration is run as part of code review or local implementation without explicit deployment authorization.

## Coding-agent deliverables

Before coding, report any mismatch between this plan and current code/workflow, especially the journal's license policy and whether published-version/correction workflows are required. Then implement only the confirmed phases, provide migration/backfill details and tests, and list any deferred items. Do not broaden scope to OJS platform parity.
