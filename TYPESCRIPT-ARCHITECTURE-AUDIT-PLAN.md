# TypeScript Architecture Audit and Migration Plan

## Overall assessment

The project has a strong TypeScript foundation:

- `tsconfig.json` enables strict checking and several useful safety flags.
- Drizzle is used as the persistence type source.
- Frontend and backend production builds pass.

The main weaknesses are not compiler failures. They are runtime validation gaps, unsafe casts, inconsistent action contracts, duplicated schemas, and an overloaded `src/db/types.ts` file.

## Priority findings

### High: Action response helpers weaken the type system

`src/lib/action-response.ts` uses casts such as:

```ts
as unknown as ActionResponse<T>
```

and casts `undefined` into generic success data. This allows invalid success and error shapes to cross boundaries.

Use explicit discriminated types:

```ts
type ActionSuccess<T> = {
    success: true;
    data: T;
};

type ActionFailure = {
    success: false;
    error: string;
    code?: string;
};

type ActionResponse<T> = ActionSuccess<T> | ActionFailure;
```

Use `ActionResponse<void>` for operations that return no data.

### High: FormData values are asserted before validation

Several server actions cast `FormData.get()` directly to strings, files, numeric IDs, or enum values.

For example, this is unsafe:

```ts
const title = formData.get("title") as string;
```

FormData values can be `string`, `File`, or `null`.

Add shared boundary helpers:

- `getRequiredString()`
- `getOptionalString()`
- `getRequiredFile()`
- `getEnumValue()`
- `getPositiveInt()`

Validate MIME type, file size, required fields, enum membership, and numeric ranges at the server boundary.

### High: TanStack Query failures become empty data

Many hooks use:

```ts
return res.success ? res.data ?? [] : [];
```

This makes authorization, database, validation, and network failures look like successful empty results.

Add a typed `ActionError` and `unwrapAction()` helper:

```ts
export class ActionError extends Error {
    constructor(
        message: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = "ActionError";
    }
}

export function unwrapAction<T>(response: ActionResponse<T>): T {
    if (!response.success) {
        throw new ActionError(response.error);
    }

    return response.data;
}
```

Use it in query functions so React Query can expose its normal `isError` state.

### High: Unsafe casts in publication mapping

`src/actions/archives.ts` uses `as any`, a broad `[key: string]: unknown` index signature, and casts around publication mapping.

This hides query-shape drift and can fabricate defaults such as a published status when the database value is absent.

Define the exact Drizzle projection and return an explicit mapper result instead of coercing arbitrary objects.

### High: Duplicate submission schemas

`src/features/submissions/schemas/submission.schema.ts` and `src/actions/submit-paper.ts` define separate submission validation structures with different constraints and transport formats.

Create one canonical domain schema. The server should have a narrow FormData decoder that converts serialized fields and files into that canonical structure.

### Medium: `src/db/types.ts` is overloaded

The file currently contains:

- Drizzle row and insert types;
- safe user types;
- submission aggregates;
- UI projections;
- route parameter types;
- chat types;
- SUSHI/COUNTER DTOs;
- API-style response models.

This makes inappropriate type reuse easy and encourages client code to depend directly on database rows.

### Medium: API request bodies are trusted

`src/app/api/oai/route.ts` assigns `request.json()` directly to a typed object. JSON is runtime `unknown` and must be validated with Zod.

### Medium: Dynamic route values are too permissive

Examples include feed types typed as arbitrary strings and sitemap fields handled with non-null assertions.

Validate dynamic route values and reject unsupported values. Guard required sitemap fields rather than using non-null assertions.

### Medium: Raw database models cross client boundaries

Several server actions return raw or near-raw Drizzle rows to client components. This increases serialization coupling and accidental data exposure.

Introduce explicit client-safe DTOs and map server results before crossing the server/client boundary.

### Low/Medium: Protocol DTOs are broad

SUSHI/COUNTER response types use broad strings for protocol fields that should have literal unions or Zod response schemas.

## Target type organization

```text
src/
  db/
    schema.ts                 # Drizzle tables, relations, DB constants
    models.ts                 # InferSelectModel / InferInsertModel only
    queries/                  # Typed query functions and projections

  domain/
    submissions/
      types.ts
      schemas.ts              # Shared business validation
    users/
      types.ts
      schemas.ts
    publications/
      types.ts

  contracts/
    action-response.ts
    actions/
      submissions.ts
      users.ts
      reviews.ts
    api/
      oai.ts
      feeds.ts
      sushi.ts
    forms/
      submission.ts
      users.ts
      reviews.ts

  features/
    submissions/
      types.ts                # UI/view-specific types
      mappers.ts
      schemas/
    messages/
      types.ts
    publications/
      types.ts

  lib/
    form-data.ts              # Safe FormData extraction
    errors.ts                 # Typed error conversion
```

## Organization rules

- `db/models.ts` contains only database-derived row and insert types.
- `domain/*` contains business concepts and validated application input.
- `contracts/*` contains serialized action and API request/response shapes.
- `features/*/types.ts` contains component and view models.
- Query functions return exact projection types or mapped DTOs.
- UI code should not depend on large raw Drizzle models by default.
- Protocol types should live near their protocol implementation.
- Component props should remain local unless genuinely shared.

## Compatibility-preserving organization step

The first organization step is now available:

- `src/db/models.ts` is the narrow import boundary for schema-derived models
  and enum unions.
- `src/db/contracts.ts` is the boundary for application projections, action
  responses, and route contracts.
- `src/db/protocols.ts` is the boundary for chat, WebSocket, journal settings,
  CRediT, and SUSHI/COUNTER integration types.
- `src/db/types.ts` remains a compatibility barrel during gradual migration,
  so existing imports do not need to change in one risky batch.

New code should prefer the narrowest category module. Existing files can be
migrated incrementally when they are already being edited.

## Recommended migration order

### Phase 1: Harden boundaries

1. Redesign `ActionResponse`.
2. Add `ActionError` and `unwrapAction()`.
3. Add safe FormData extraction helpers.
4. Parse request JSON as `unknown` and validate it with Zod.

### Phase 2: Unify validation

1. Make the submission domain schema canonical.
2. Convert FormData into the canonical schema through a transport decoder.
3. Remove duplicated and inconsistent server/client submission constraints.

### Phase 3: Remove unsafe query casts

Start with:

- `src/actions/archives.ts`
- `src/actions/messages.ts`
- `src/actions/applications.ts`
- `src/actions/publications.ts`

Replace `as any`, broad index signatures, and full-row assertions with exact Drizzle projection types and explicit mapper functions.

### Phase 4: Fix React Query error semantics

Replace:

```ts
return res.success ? res.data ?? [] : [];
```

with:

```ts
return unwrapAction(await getMessages(filters));
```

Add visible error states to administrative tables and dashboards.

### Phase 5: Split `db/types.ts`

Extract types incrementally:

1. Base Drizzle models.
2. Safe user models.
3. Submission view models.
4. API and action contracts.
5. SUSHI and protocol DTOs.
6. Feature-local UI types.

Keep temporary re-exports from `src/db/types.ts` during migration to avoid a large breaking change.

### Phase 6: Add enforcement

Add a dedicated typecheck script:

```json
{
    "scripts": {
        "typecheck": "tsc --noEmit"
    }
}
```

Add tests for:

- malformed FormData;
- invalid enum and numeric values;
- invalid JSON API bodies;
- action success/error shapes;
- client-safe DTO mapping;
- query error propagation.

Consider a lint or review rule preventing:

- `as any`;
- double casts such as `as unknown as`;
- empty catches around parsing;
- silent action-error fallbacks to `[]`, `{}`, `null`, or `0`.

## Compiler configuration

The existing strictness is already strong:

- `strict`
- `exactOptionalPropertyTypes`
- `noUncheckedIndexedAccess`
- `noImplicitReturns`
- `noUnusedLocals`
- `noUnusedParameters`

The next major improvement should be runtime validation and boundary organization rather than enabling many additional compiler flags.
