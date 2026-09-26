# Application architecture

This project uses the Next.js App Router with domain-oriented feature folders. Keep new code within those boundaries and migrate existing code only when a concrete change makes the separation safer or easier to test.

## Responsibilities

- `src/app/**/page.tsx` composes a route, its metadata, and route-level loading or error boundaries. Keep database queries and large page-specific UI out of route files.
- `src/actions/<domain>.ts` exposes authenticated server actions and coordinates a user-facing operation.
- `src/features/<domain>/server` owns server-only repositories and data access. Do not import these modules into client components.
- `src/features/<domain>/queries` owns query keys, query options, and mutations; `hooks` exposes reusable client hooks; `types` owns feature types; `components` owns feature UI.
- `src/components/ui` contains reusable design-system primitives. Keep domain-specific behavior in its feature.

## Module boundaries

- Use feature-relative imports for implementation details. Use a feature's `index.ts` only for intentional, client-safe public exports such as hooks, query options, and types.
- Never re-export repositories, database clients, or server actions through a client-facing feature barrel. Server code should use explicit server-module imports.
- Keep route components focused on composition and authorization boundaries; keep reusable behavior in a hook, action, repository, or feature component according to its runtime.
- Extract a component or helper when it has a distinct responsibility, is reused, or can be tested independently—not only to reduce a file's line count.

## Tests and checks

- Add unit tests beside pure utilities as `*.test.ts`; test user-visible feature behavior at the feature boundary when practical.
- Run `pnpm test`, `pnpm typecheck`, and `pnpm lint` for code changes. Run `pnpm build` before release; this build currently requires the application's database environment.
- ESLint's legacy `react-hooks/error-boundaries` and `react-hooks/set-state-in-effect` findings are warnings during incremental migration. Keep the warning count at or below the configured baseline and reduce it as affected features are refactored.
