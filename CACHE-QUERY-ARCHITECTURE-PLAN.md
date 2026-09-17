# Next.js Cache and TanStack Query Architecture Plan

## Purpose

Improve cache correctness, authorization safety, client-side freshness, and error visibility without removing the benefits of Next.js Cache Components or TanStack Query.

## Highest-priority risks

### P0: Authorization-sensitive submission cache

`src/actions/submissions.ts` currently caches a broad submission object by submission ID before authorization filtering. The object may contain author data, files, reviewer assignments, reviewer identities, reviews, payment data, and publication data.

Refactor this into role-specific readers:

- `getAuthorSubmissionView(id, userId)`
- `getReviewerSubmissionView(id, userId)`
- `getEditorSubmissionView(id, userId)`
- `getAdminSubmissionView(id, userId)`

Authenticate and authorize before selecting sensitive projections. Cache only data whose visibility is identical for every caller, or include a validated user/role scope in the cache key.

### P1: TanStack Query errors become empty data

Many query hooks use this pattern:

```ts
return res.success ? res.data ?? [] : [];
```

This makes authentication failures, authorization failures, database failures, and validation failures appear as successful empty results.

Add a shared typed error and response unwrapper:

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

    return response.data as T;
}
```

Use it in query functions and show explicit error states in dashboard tables and panels.

### P1: Server and browser caches are separate

Next.js invalidation does not automatically invalidate an already-populated TanStack Query cache.

Every mutation must update both layers:

```ts
// Server-side
updateTag(CACHE_TAGS.SUBMISSION(submissionId));
revalidatePath(`/admin/submissions/${submissionId}`);

// Client-side
queryClient.invalidateQueries({
    queryKey: queryKeys.private.submissions(userId, role),
});
```

Maintain an explicit invalidation policy for each mutation.

### P1: Cached functions hide database failures

Cached notification functions currently catch database failures and return `0` or `[]`. They should log and rethrow so the outer server action can return an error response.

An empty result should mean “there are no records,” not “the database request failed.”

### P1: Query keys are inconsistent

Most query keys are literal arrays such as:

- `['messages']`
- `['payments']`
- `['reviews']`
- `['notificationCounts']`
- `['settings']`

Create centralized key factories for every domain and use them for both queries and invalidations.

Example:

```ts
export const queryKeys = {
    public: {
        all: ["public"] as const,
        archives: () => ["public", "archives"] as const,
    },
    private: {
        all: (userId: string, role: string) =>
            ["private", userId, role] as const,
        messages: (
            userId: string,
            role: string,
            filters?: MessageFilters
        ) => ["private", userId, role, "messages", filters ?? {}] as const,
    },
};
```

### P2: Private query scope

Private query keys should include the current user ID and role. This protects against stale data during account switching, role changes, session changes in another tab, or incomplete logout flows.

`PanelShell` already clears the QueryClient during logout. Also clear or replace private cache scope when the session identity changes.

### P2: Role-specific notification counts

`getNotificationCounts()` should calculate counts according to the current role:

- admin/editor: pending messages and submitted submissions
- reviewer: reviewer assignments
- author: author actions
- unsupported roles: zero counts

Do not aggregate reviewer assignments into other roles.

### P2: Broad invalidation fallback

`safeInvalidateTag()` currently catches every error and silently falls back from `updateTag()` to `revalidateTag()`. This can hide programming errors and change invalidation semantics.

Replace it with explicit context-aware invalidation helpers. Log unexpected errors and do not silently suppress them.

## Cache taxonomy

Classify every server read as one of:

1. **Public cacheable**
   - archives
   - published papers
   - announcements
   - global settings
   - static pages
   - editorial board

2. **Authenticated user-scoped**
   - author submissions
   - notifications
   - author action counts

3. **Authenticated role-scoped**
   - reviewer assignments
   - editor submission queues
   - admin payment and message queues

4. **Request-time sensitive**
   - manuscript tracking by email
   - payment initialization
   - session-dependent operations
   - mutation-sensitive reads

Do not add `"use cache"` to a read merely because it is read-only.

## Implementation phases

### Phase 1: Security and correctness

1. Split submission reads into role-specific projections.
2. Remove sensitive data from globally keyed cached functions.
3. Fix role-specific notification counts.
4. Stop returning empty success-shaped results on cached database failures.
5. Invalidate the pending-message count when message status changes.

### Phase 2: Query reliability

1. Add `ActionError` and `unwrapAction()`.
2. Update every query hook to throw on unsuccessful responses.
3. Add visible error states to administrative screens.
4. Normalize mutation success and error handling.

### Phase 3: Query architecture

1. Create centralized query-key factories.
2. Add user/role scope to private query keys.
3. Replace literal query keys throughout hooks and components.
4. Create shared invalidation helpers per domain.

### Phase 4: Cache cleanup and validation

1. Document every server read by cache category.
2. Remove unnecessary caching from sensitive reads.
3. Replace broad invalidation fallbacks.
4. Add cache isolation and invalidation tests.

## Authentication boundary

The current panel layout approach is correct:

```ts
await connection();
const session = await getServerSession(authOptions);
```

`connection()` must remain immediately before request-dependent work in the server panel layout. It must not be moved into the client `PanelShell`.

The root `SettingsLayer` may remain above the panel because its settings are global and public-cacheable. It must never depend on the authenticated session.

## Required validation

Before deployment, verify that:

- authors cannot see reviewer identities or private review data;
- reviewers cannot see another reviewer’s assignments;
- private data disappears after logout and account switching;
- failed database calls render an error instead of an empty table;
- message updates immediately refresh the pending-message badge;
- payment updates immediately refresh payment and submission views;
- settings changes refresh both public and dashboard data;
- public cached pages work without authentication;
- the production build succeeds with `cacheComponents: true`.

