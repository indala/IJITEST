# NestJS/Fastify Storage Service TypeScript Audit and Plan

## Service boundary

The repository contains two independent TypeScript applications:

1. `IJITEST` — Next.js application, database access, authentication, UI, and Server Actions.
2. `storage-service` — NestJS/Fastify file storage, document processing, and Socket.IO gateways.

The services should not share raw database models. The storage service does not use the Next.js Drizzle schema. Only explicit HTTP and WebSocket contracts should cross the boundary.

## Priority findings

### Critical: Processing configuration does not fail fast

Missing iLovePDF credentials only produce a warning while the processing API continues to start.

Validate production configuration during bootstrap with a typed environment schema. The service should fail startup when required production secrets are missing or invalid.

### Critical: One shared HTTP secret authorizes every operation

A single bearer secret currently protects storage, deletion, metrics, and PDF processing. Anyone with the secret can perform every operation.

Prefer:

- private network access from Next.js;
- short-lived signed service tokens;
- separate read/write/delete/process scopes;
- audience and expiry validation.

### Critical: Bingo has no authentication or authorization

Clients can create rooms, impersonate players, replace room state, delete rooms, and relay WebRTC events to arbitrary rooms.

Add authenticated socket handshakes, validate every event, derive player identity from socket state, and apply server-side room state transitions. Never accept complete authoritative room state from clients.

### High: Chat and HTTP authentication share one secret

The HTTP service credential is also used for WebSocket user authentication. Separate machine-to-machine credentials from end-user session authentication.

Use a dedicated JWT signing key or token verifier for users, including issuer, audience, expiry, and subject validation.

### High: Chat trusts client-controlled identity and metadata

Clients currently provide sender IDs, receiver IDs, message IDs, timestamps, read state, and arbitrary message content.

Derive sender identity and timestamps server-side. Validate receiver access, message length, identifiers, and read-state transitions.

### High: Storage path containment is unsafe

String prefix checks such as `startsWith(storageRoot)` are vulnerable to path-prefix collisions and symlink escapes.

Use a dedicated path-policy helper based on `path.relative()`, reject traversal, and resolve/check symlinks before access.

### High: Upload destination and overwrite behavior are client-controlled

Uploads accept arbitrary destination paths and can overwrite existing files without strong ownership, quota, type, or atomic-write controls.

Use server-issued object IDs and server-controlled namespaces. Validate file size/type, enforce quotas, write to a temporary file, and atomically rename.

### High: Filesystem failures become successful responses

Delete and statistics operations catch broad errors and may return success or partial results after permission/I/O failures.

Ignore only expected `ENOENT` cases. Surface other errors as explicit failures and log structured context without exposing local filesystem paths.

### High: Bootstrap can hide startup failures

Startup errors are logged without reliably terminating the process with failure status.

Use Nest `Logger` and rethrow or set a non-zero exit code so the process manager detects failed startup.

### High: Next.js and NestJS authentication headers do not match

The Next.js caller sends `x-api-key`, while the NestJS guard reads `Authorization`. Environment variable names are also inconsistent.

Define one header, one credential name, and one centralized Next.js storage client. Add an integration test for every storage endpoint.

## Request validation

Configure validation consistently:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- explicit `@Type()` conversions
- DTOs for all query, body, and route parameters
- runtime validation for Socket.IO event payloads

Do not rely on TypeScript annotations for runtime request validation.

Required inputs currently typed as `string` should be represented by validated DTOs. Validate non-empty values, path grammar, numeric ranges, and allowed enum values.

## Type organization inside `storage-service`

```text
storage-service/src/
  config/
    env.config.ts
    env.schema.ts

  common/
    auth/
      http-api-key.guard.ts
      websocket-auth.guard.ts
      auth.types.ts
    contracts/
      errors.ts
      responses.ts
      storage.contract.ts
      processing.contract.ts
      websocket.contract.ts
    validation/
      path-policy.ts
      validation-exception.factory.ts

  storage/
    storage.controller.ts
    storage.service.ts
    dto/
      upload-query.dto.ts
      file-path-query.dto.ts
      storage-stats.response.ts

  process/
    process.controller.ts
    process.service.ts
    dto/
      branding-metadata.dto.ts
      issue-book-metadata.dto.ts
      issue-article.dto.ts

  chat/
    chat.gateway.ts
    dto/
      send-message.dto.ts

  bingo/
    bingo.gateway.ts
    dto/
      create-room.dto.ts
      join-room.dto.ts
      update-room.dto.ts
    domain/
      room.types.ts
      room-state.service.ts
```

Keep these categories separate:

1. Transport DTOs — request validation classes or runtime schemas.
2. Domain types — trusted internal values after validation.
3. Response contracts — explicitly serializable response objects.
4. Infrastructure types — filesystem, streams, configuration, and token claims.
5. Client-facing types — generated from the API contract.

DTOs should not be exported from implementation services.

## HTTP contract between Next.js and NestJS

Create a versioned contract:

```text
contracts/
  openapi.yaml
  websocket-events.ts
```

Recommended response envelope:

```ts
type ApiSuccess<T> = {
    data: T;
    requestId: string;
};

type ApiError = {
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    requestId: string;
};
```

The contract must define:

- authentication header and credential name;
- API version;
- path grammar and maximum length;
- multipart field names;
- file size/type limits;
- overwrite and idempotency behavior;
- exact response fields and formats;
- binary download headers;
- validation/error status codes.

The Next.js client should validate every JSON response at runtime instead of using assertions such as:

```ts
response.json() as ConversionResponse
```

Centralize all calls in a single server-only storage client:

```text
IJITEST/src/lib/storage-client/
  client.ts
  schemas.ts
  errors.ts
```

That client should own authentication headers, timeout handling, response validation, and normalized errors.

## WebSocket contract

Define typed event maps and runtime validators:

```ts
interface ClientToServerEvents {
    sendMessage: (
        payload: SendMessageInput,
        acknowledge: (result: AckResult) => void
    ) => void;
}

interface ServerToClientEvents {
    receiveMessage: (payload: MessageView) => void;
}
```

Emit view models rather than mutable internal room/message objects. Derive identity, timestamps, authorization, and state transitions on the server.

## Configuration plan

Use a typed startup schema for:

- `STORAGE_DIR`
- `STORAGE_SERVICE_SECRET`
- user JWT configuration
- `FRONTEND_URL`
- `PORT`
- iLovePDF credentials
- upload limits
- allowed origins

Read configuration through `ConfigService` or a validated configuration object rather than scattered direct `process.env` access.

Centralize CORS configuration for HTTP and Socket.IO. Normalize and validate origins once.

## Recommended implementation order

1. Fix the Next.js/NestJS authentication header and environment-name mismatch.
2. Centralize the Next.js storage client.
3. Define versioned HTTP response contracts.
4. Add runtime validation for all HTTP DTOs and JSON responses.
5. Fix storage path containment and upload safety.
6. Separate HTTP service credentials from WebSocket user authentication.
7. Harden Chat and Bingo event authorization and payload validation.
8. Add typed configuration validation and fail-fast startup.
9. Add HTTP and WebSocket integration tests.
10. Generate or share API contract types, never raw database models.

## Required tests

Add tests for:

- missing production configuration;
- invalid and traversal storage paths;
- path-prefix collision cases;
- symlink escape attempts;
- upload size/type/overwrite behavior;
- unauthorized storage operations;
- mismatched API headers;
- malformed process metadata;
- invalid chat sender/receiver payloads;
- unauthorized Bingo room updates;
- Socket.IO acknowledgement errors;
- normalized HTTP error responses;
- generated Next.js client compatibility.

