# DinnerParty — Design Approach

This document describes the architectural decisions, SOLID principle adherence, and design patterns used in the DinnerParty codebase following its OOP refactor.

---

## 1. Architectural Overview

DinnerParty uses a **three-layer backend architecture** running inside a Node.js/Express monorepo:

```
Client (React)
    └── RecipeApiClient  →  HttpClient  →  /api/*
              ↕
Express Server
    └── Middleware (requireAuth)
          └── Controller Layer     ← HTTP concerns only
                └── Service Layer  ← Business logic
                      └── Repository Layer  ← Database access
                            └── Mongoose Models  ← Schema & persistence
```

Each layer has a clearly defined responsibility and communicates only with the layer directly below it. This means:
- Controllers never talk to Repositories.
- Services never construct HTTP responses.
- Repositories never contain business logic.

A centralized `errorHandler` middleware sits at the end of the Express chain and is the single exit point for all error responses.

---

## 2. SOLID Principles

### S — Single Responsibility Principle

Every class in the system has exactly one reason to change:

| Class | Its single responsibility |
|---|---|
| `AuthController` | Translate HTTP auth requests/responses |
| `AuthService` | Enforce authentication business rules |
| `UserRepository` | Abstract all Mongoose calls for users |
| `AppError` (and subclasses) | Represent a typed HTTP error |
| `errorHandler` | Convert errors into JSON HTTP responses |
| `requireAuth` | Gate HTTP routes behind JWT verification |
| `HttpClient` | Perform authenticated JSON fetch requests |
| `RecipeApiClient` | Provide a typed recipe API surface to the UI |

If the JWT library changes, only `AuthService.generateToken` and `requireAuth` need to change. If the database ORM changes, only the Repository classes change. If the HTTP error format changes, only `errorHandler` changes.

### O — Open/Closed Principle

The error handling system is the clearest example. `errorHandler` is written once and never needs to be modified to support new error types:

```typescript
// Adding a new RateLimitError requires only this — errorHandler needs no change:
export class RateLimitError extends AppError {
  constructor(message: string) { super(429, message); }
}
```

`errorHandler` checks `err instanceof AppError` and reads `statusCode` — both behaviors work for any present or future subclass without modification to the middleware itself.

### L — Liskov Substitution Principle

Any `AppError` subclass can be substituted anywhere `AppError` is expected. The `errorHandler` depends only on `AppError`'s interface (`statusCode`, `message`), and every subclass satisfies that contract faithfully. No subclass weakens preconditions or strengthens postconditions of the base class.

This also applies to the `RecipeApiClient` / `HttpClient` relationship. If `HttpClient` were replaced with a mock or alternative implementation (e.g., for testing), as long as the `json<T>()` method signature is preserved, `RecipeApiClient` will work without modification.

### I — Interface Segregation Principle

Classes only expose what their consumers need:

- `RecipeFilters` (defined in `RecipeRepository.ts`) exposes only the four query fields that `RecipeService` needs. Services are not forced to depend on the full Mongoose document interface.
- `UserRepository.findById` returns a user with `passwordHash` excluded (`.select('-passwordHash')`), so consumers never receive credential data they don't need.
- `RecipeListItem` and `RecipeDetail` are separate TypeScript interfaces on the client. List views receive only the minimal shape; detail views receive the full shape. Components are never forced to handle fields they don't use.

### D — Dependency Inversion Principle

High-level modules do not depend on low-level modules — both depend on abstractions:

- `AuthController` depends on `AuthService` (business logic abstraction), not on `UserRepository` or `User` directly.
- `AuthService` depends on `UserRepository` (a DB access abstraction), not on Mongoose or MongoDB directly.
- `RecipeApiClient` depends on `HttpClient` injected via constructor, not on the browser `fetch` API directly.

All dependencies are injected at the **composition root** (the route files), which is the only place where `new Controller(new Service(new Repository()))` wiring occurs. Every layer can be replaced or mocked independently.

---

## 3. Design Patterns

### Repository Pattern

**Classes:** `UserRepository`, `RecipeRepository`

All database access is encapsulated in dedicated repository classes. Service classes never call `User.findOne(...)` or `Recipe.save()` directly. This means:
- The Mongoose dependency is confined to the repository layer.
- Services are testable without a real database (repositories can be mocked at the injection site).
- Switching ORMs or data sources only requires replacing the repository implementations.

```typescript
// Service never sees Mongoose — only the repository's typed interface
const user = await this.userRepository.findByEmail(email);
```

### Service Layer Pattern

**Classes:** `AuthService`, `RecipeService`

Business rules and orchestration logic are collected in service classes, separate from HTTP handling (controllers) and data access (repositories). This ensures:
- The same service can be called from a REST controller, a CLI script, or a test without duplication.
- Business rules are testable in isolation.
- Controllers stay thin — they only translate between HTTP and the service API.

### Chain of Responsibility Pattern

**Components:** `requireAuth → Controller → errorHandler`

Express middleware forms a chain where each handler either processes the request and calls `next()`, or passes an error down with `next(err)`. This creates a clean separation:
- `requireAuth` handles authentication concerns.
- Controllers handle request routing and response shaping.
- `errorHandler` handles all error formatting.

No handler knows about the others.

### Dependency Injection (Manual)

**Where:** Route files (`auth.routes.ts`, `recipes.routes.ts`)

Dependencies are wired at the composition root using constructor injection:

```typescript
const authController = new AuthController(
  new AuthService(new UserRepository())
);
```

This is manual DI (no IoC container), which keeps the codebase simple while still achieving testability and separation of concerns. Each class declares its dependencies via constructor parameters, making the full dependency graph explicit and readable.

### Singleton Pattern

**Where:** `client/src/api/http.ts`, `client/src/api/recipes.ts`

A single `httpClient` and `recipeApiClient` instance are created at module load time and shared across all callers:

```typescript
export const httpClient = new HttpClient();
export const recipeApiClient = new RecipeApiClient(httpClient);
```

This ensures shared configuration (credentials, base URL) without creating new instances per call.

### Template Method Pattern

**Classes:** `AppError`, `ValidationError`, `AuthError`, `NotFoundError`, etc.

`AppError` defines the constructor template: call `super(message)`, set `this.name`, fix the prototype chain with `Object.setPrototypeOf`. Each subclass fills in only the one variable part — `statusCode` — by passing it to `super()`. This avoids duplicating five near-identical constructors.

### Facade Pattern

**Class:** `RecipeApiClient`

`RecipeApiClient` provides a simplified, domain-specific interface over the general-purpose `HttpClient`. React pages call `recipeApiClient.list(params)` without knowing about URL construction, query string encoding, or fetch configuration. The underlying HTTP mechanics are hidden behind the facade.

---

## 4. Additional Architectural Details

### Centralized Error Handling

Before the refactor, every route handler had its own try/catch with inline `res.status(N).json({error: ...})`. After the refactor, errors are thrown as typed `AppError` subclasses from the service layer and propagated via `next(err)` through the controller to `errorHandler`. This means:
- Error formatting is defined in exactly one place.
- Adding a new error type requires no changes to any controller.
- Error logging is centralized in `errorHandler`.

### HTTP-Only Cookies for JWT

Authentication tokens are stored in HTTP-only, `SameSite=lax` cookies rather than `localStorage`. This prevents XSS attacks from stealing the token. `requireAuth` reads from `req.cookies.token`, and `AuthController.setAuthCookie` is the single location where the cookie is written and configured.

### Mongoose Pre-Save Hook as Domain Logic

The `User` model's `pre('save')` hook hashes the password before it reaches the database. This is domain logic embedded in the persistence model — a valid trade-off for Mongoose, where the model is both the schema definition and the domain entity. It ensures passwords can never be saved in plaintext regardless of which code path creates the user.

### Materialized Path for Folder Hierarchy

The `Folder` model stores a `path` string (e.g., `/rootId/parentId/thisId`) alongside `parentId`. This materialized path pattern enables efficient subtree queries (`path` starts with prefix X) without recursive joins, which MongoDB does not support natively.

### Frontend API Stability via Named Exports

`RecipeApiClient` is a class but its consumers (React pages) use named function exports (`listRecipes`, `updateRecipe`, etc.). This design preserves the original import interface — no page component had to change when the API client was refactored into a class. The named exports delegate to the singleton, acting as an adapter between the class-based design and the functional import style expected by React components.
