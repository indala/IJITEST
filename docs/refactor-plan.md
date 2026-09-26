# IJITEST Refactor Handoff Plan

This plan is intended for a follow-up engineering agent to continue the structural and quality work without rewriting the app blindly. It is based on the current repository state and the phased baseline we established.

## Objective

Improve maintainability, reliability, and consistency in a controlled, incremental way:
- restore dependable quality checks
- enforce domain boundaries
- reduce UI/design drift
- reduce route and data-flow coupling
- preserve behavior while refactoring

## Working principles

- Do not do broad rewrites. Use feature-by-feature refactors.
- Keep the app buildable and testable at every phase.
- Keep route/page files thin and composition-focused.
- Make shared logic reusable only when it has a real reuse or testing benefit.
- Prefer the existing feature-folder structure over introducing new abstractions.

## Current project baseline

- TypeScript check passes (`pnpm typecheck`).
- Production build passes (`pnpm build`).
- ESLint is now running under a compatible version, but the codebase still contains many warning-level issues that should be treated as migration debt.
- There are no tracked automated tests for feature behavior beyond the DOI utility test added for validation.
- No GitHub Actions CI workflow existed until this refactor handoff; it is now added for lint, test, and typecheck.
- The repo has many active UI and DOI-related changes already in progress; do not revert unrelated work.

## Phase 1 — Stabilize the quality gate

### Task 1.1: confirm tooling and CI
- Validate the Node version, pnpm version, and install flow.
- Confirm the CI workflow runs successfully on pull requests/pushes.
- Confirm `pnpm install --frozen-lockfile` is reliable in a clean environment.

Acceptance:
- CI passes for install, test, lint, and typecheck.

### Task 1.2: formalize lint baseline
- Keep lint as a migration tool, not a blocker for every pre-existing warning.
- Treat React hook warnings as debt to reduce over time.
- Add a per-file or per-rule improvement plan if needed.

Acceptance:
- Lint has no errors.
- Warning count is tracked and reviewed intentionally.

## Phase 2 — Define architecture conventions

### Task 2.1: standardize feature boundaries
Review the existing patterns and lock the repo convention:
- `src/app/**` = route composition and page metadata only.
- `src/actions/**` = authenticated server actions.
- `src/features/<domain>/server` = repository/query-access layer.
- `src/features/<domain>/queries` = query keys/options/mutations.
- `src/features/<domain>/hooks` = reusable client hooks.
- `src/features/<domain>/components` = feature UI.
- `src/components/ui` = generic UI primitives only.

Acceptance:
- All new work follows the same boundaries.
- No client components import server repositories directly.

### Task 2.2: feature barrel policy
- Keep `index.ts` files only for deliberate public exports.
- Do not re-export server-only code from client-facing barrels.
- Make imports explicit when a module is server-only.

Acceptance:
- Feature barrels are intentional and safe.

## Phase 3 — Pilot refactor on one bounded feature

### Recommended pilot: `applications`
This is the most promising first refactor because it already has a dedicated detail page and feature-level repository pattern and a manageable data flow.

### Task 3.1: map the feature data flow
- Trace `applications` page -> action layer -> repository -> query layer -> UI components.
- Identify shared logic and coupling hotspots.
- Document what belongs in the feature boundary and what should be extracted.

### Task 3.2: refactor the feature
- Remove duplication and flatten unnecessary prop drilling.
- Combine shared filter logic and server/data-access patterns.
- Keep route pages thin and delegate actual rendering to feature components.

Acceptance:
- No behavior change from the user perspective.
- Data flow is easier to reason about.
- Typecheck and build still pass.

## Phase 4 — UI consistency and semantic accessibility

### Task 4.1: standardize global design tokens
- Keep `globals.css` as the semantic source of truth.
- Preserve utility classes and custom typography tokens.
- Consolidate the visual rules for:
  - badges
  - labels
  - form fields
  - table/list states
  - dark/light contrast handling

### Task 4.2: eliminate ad hoc overrides
- Remove one-off `!important` fixes and component-specific color workarounds.
- Replace with shared semantic classes and token-based color pairings.

### Task 4.3: accessibility pass for selected screens
- Improve semantic elements and keyboard accessibility.
- Fix non-button interactive containers.
- Confirm focus states and contrast on the highest-traffic views.

Acceptance:
- UI consistency across admin/editor/reviewer flows.
- Better responsiveness and more robust semantics without hacks.

## Phase 5 — Route and cache review

### Task 5.1: audit dynamic/server access patterns
- Review protected data access in metadata and route handlers.
- Avoid `force-dynamic` in unsupported routes.
- Ensure page data access is either intentionally cached or wrapped correctly.

### Task 5.2: validate caching strategy
- Review where `cacheComponents` and data caching are beneficial.
- Verify route segmentation and revalidation rules remain correct.

Acceptance:
- No unsupported route segment config.
- Sensitive data access remains server-only and properly scoped.

## Phase 6 — Testing and release hardening

### Task 6.1: add feature tests
At minimum, add tests for:
- DOI normalization and validation
- application approval/rejection logic
- authorization checks for protected actions
- email template rendering or formatting helpers

### Task 6.2: release readiness
- Run the full quality gate locally before merging.
- Check for broken secrets/env assumptions.
- Verify production build after each completed feature refactor.

Acceptance:
- Changes are reviewable, reproducible, and safe for merging.

## Recommended execution order

1. Phase 1 — tooling and CI check
2. Phase 2 — architecture boundary conventions
3. Phase 3 — pilot refactor on applications
4. Phase 4 — UI/accessibility consistency pass
5. Phase 5 — route and cache review
6. Phase 6 — rollout + tests + release hardening

## Notes for the next agent

- Preserve existing work already in progress; do not revert unrelated modifications from prior tasks.
- Prefer focused, reviewable edits over broad cleanup.
- Use this file as the task definition for the next handoff.
- If a refactor is not clearly reducing coupling, reuse, or testability, defer it.

## High-value areas to tackle next

- `src/features/applications/**`
- `src/features/messages/**`
- `src/features/submissions/**`
- `src/app/(panel)/**` route composition and metadata
- `src/app/globals.css` and shared `ui` tokens

## Completion checklist

- [ ] CI install/test/lint/typecheck pass
- [ ] architecture conventions documented and followed
- [ ] pilot feature refactor is complete and validated
- [ ] UI semantic and contrast issues are reduced
- [ ] route and cache access errors are resolved
- [ ] tests cover critical workflow logic
- [ ] release build passes with known env requirements documented
