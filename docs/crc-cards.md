# DinnerParty — CRC Cards

A CRC (Class–Responsibility–Collaborator) card for every class in the system. Each card includes:
- **Responsibilities** — what the class knows and does
- **Collaborators** — classes it works with
- **Cohesion** — how well-focused the class's responsibilities are
- **Coupling** — the nature and tightness of each collaborator relationship

---

## Cohesion Scale (used below)

| Rating | Type | Meaning |
|---|---|---|
| **High – Functional** | Best | Every method serves a single, clearly defined purpose |
| **High – Communicational** | Good | All methods operate on the same internal data |
| **Medium – Sequential** | Acceptable | Output of one method feeds the next |
| **Low – Logical** | Poor | Methods loosely grouped by category, not purpose |

## Coupling Scale (used below)

| Rating | Meaning |
|---|---|
| **Loose (message)** | Communicates only through method calls with simple data |
| **Loose (data)** | Passes structured objects but depends only on their public shape |
| **Medium (stamp)** | Depends on a specific class type; changes to that class may propagate |
| **Tight (content)** | Accesses internal state of another class directly |

---

---

## `AppError`

| **Responsibilities** | **Collaborators** |
|---|---|
| Serve as the base class for all typed HTTP errors | `errorHandler` |
| Carry an HTTP status code alongside the error message | — |
| Set `name` to the concrete subclass name for logging | — |
| Ensure `instanceof` checks work correctly via `Object.setPrototypeOf` | — |

**Cohesion:** High – Functional. The class has a single, clearly scoped job: represent a typed, HTTP-aware error.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `errorHandler` | Afferent (used by) | Loose (message) | `errorHandler` only reads `statusCode` and `message` — depends on nothing internal |

---

## `ValidationError`

| **Responsibilities** | **Collaborators** |
|---|---|
| Represent a 400 Bad Request error | `AppError` |
| Hard-code `statusCode: 400` | `AuthService`, `RecipeService` |

**Cohesion:** High – Functional. Single purpose: carry a 400 status.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AppError` | Efferent (extends) | Medium (stamp) | Inherits constructor and prototype; changes to `AppError` propagate here |
| `AuthService` / `RecipeService` | Afferent (thrown by) | Loose (message) | Services construct and throw; no further dependency |

---

## `AuthError`

| **Responsibilities** | **Collaborators** |
|---|---|
| Represent a 401 Unauthorized error | `AppError` |
| Hard-code `statusCode: 401` | `AuthService` |

**Cohesion:** High – Functional.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AppError` | Efferent (extends) | Medium (stamp) | Same pattern as `ValidationError` |
| `AuthService` | Afferent (thrown by) | Loose (message) | — |

---

## `ForbiddenError`

| **Responsibilities** | **Collaborators** |
|---|---|
| Represent a 403 Forbidden error | `AppError` |
| Hard-code `statusCode: 403` | (reserved for future use) |

**Cohesion:** High – Functional.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AppError` | Efferent (extends) | Medium (stamp) | — |

---

## `NotFoundError`

| **Responsibilities** | **Collaborators** |
|---|---|
| Represent a 404 Not Found error | `AppError` |
| Hard-code `statusCode: 404` | `AuthService`, `RecipeService` |

**Cohesion:** High – Functional.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AppError` | Efferent (extends) | Medium (stamp) | — |
| `AuthService` / `RecipeService` | Afferent (thrown by) | Loose (message) | — |

---

## `ConflictError`

| **Responsibilities** | **Collaborators** |
|---|---|
| Represent a 409 Conflict error | `AppError` |
| Hard-code `statusCode: 409` | `AuthService` |

**Cohesion:** High – Functional.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AppError` | Efferent (extends) | Medium (stamp) | — |
| `AuthService` | Afferent (thrown by) | Loose (message) | — |

---

## `errorHandler` *(Express Middleware)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Intercept all errors forwarded via `next(err)` | `AppError` |
| Return JSON error responses with the correct HTTP status code | — |
| Handle Mongoose duplicate-key errors (code 11000) as 409 | — |
| Log unexpected errors to the server console | — |
| Act as the single exit point for all error responses | — |

**Cohesion:** High – Functional. One job: translate errors into HTTP responses.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AppError` | Efferent (inspects) | Loose (data) | Reads `statusCode` and `message` only; no knowledge of subclass internals |

---

## `requireAuth` *(Express Middleware)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Extract JWT from the `token` HTTP-only cookie | `env` (config) |
| Verify JWT signature and expiration | — |
| Attach `{ userId, uuid }` to `req.user` for downstream handlers | — |
| Reject unauthenticated requests with 401 before they reach controllers | — |

**Cohesion:** High – Functional. Single responsibility: gate authentication.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `env` | Efferent | Loose (data) | Reads `JWT_SECRET`; pure data dependency |
| Express `Request` | Efferent | Loose (data) | Augments `req.user`; uses standard Express interface |

---

## `AuthController`

| **Responsibilities** | **Collaborators** |
|---|---|
| Parse HTTP request bodies for `register` and `login` | `AuthService` |
| Call the appropriate `AuthService` method | `env` (for cookie config) |
| Set the JWT as an HTTP-only cookie via `setAuthCookie` | — |
| Shape the JSON response (only expose `uuid`, `email`, `username`) | — |
| Forward all errors to Express's `next(err)` | — |

**Cohesion:** High – Communicational. All methods deal with HTTP auth flows using the same injected service.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `AuthService` | Efferent | Loose (message) | Calls public methods only; no knowledge of service internals |
| `env` | Efferent | Loose (data) | Reads `NODE_ENV` for cookie `secure` flag only |

---

## `RecipeController`

| **Responsibilities** | **Collaborators** |
|---|---|
| Parse HTTP request params, query strings, and bodies for recipe operations | `RecipeService` |
| Extract `userId` from `req.user` (set by `requireAuth`) | — |
| Strip injected `userId` from request body to prevent spoofing | — |
| Map service results to HTTP responses with correct status codes | — |
| Forward all errors to Express's `next(err)` | — |

**Cohesion:** High – Communicational. All methods are recipe HTTP handlers using the same injected service.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `RecipeService` | Efferent | Loose (message) | Calls public methods only; no knowledge of service internals |

---

## `AuthService`

| **Responsibilities** | **Collaborators** |
|---|---|
| Validate registration inputs (presence, password length) | `UserRepository` |
| Check for duplicate email or username before creating a user | `Folder` model (via repository) |
| Orchestrate user creation and root folder setup | `env` |
| Verify credentials during login (delegates password check to `User` model) | `AppError` subclasses |
| Retrieve the authenticated user for session checks | — |
| Generate and return signed JWT tokens | — |

**Cohesion:** High – Functional. All methods serve the single domain of user authentication.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `UserRepository` | Efferent | Loose (message) | Calls repository methods; never touches Mongoose directly |
| `env` | Efferent | Loose (data) | Reads `JWT_SECRET` only |
| `ValidationError` / `AuthError` / `ConflictError` / `NotFoundError` | Efferent | Loose (message) | Constructs and throws; no state shared |

---

## `RecipeService`

| **Responsibilities** | **Collaborators** |
|---|---|
| Validate and delegate CRUD operations for recipes | `RecipeRepository` |
| Validate that an import URL is a valid `http/https` address | `GoogleGenerativeAI` |
| Fetch external web pages and strip HTML to plain text | `env` |
| Construct and send the Gemini extraction prompt | `AppError` subclasses |
| Parse and validate the AI's JSON response | — |
| Persist imported recipes with correct `sourceType` | — |

**Cohesion:** High – Communicational. All methods operate on the same recipe domain. The AI import logic is recipe-specific, not a cross-cutting concern.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `RecipeRepository` | Efferent | Loose (message) | All DB access goes through the repository interface |
| `GoogleGenerativeAI` | Efferent | Medium (stamp) | Depends on the SDK's `getGenerativeModel` shape; external library changes could propagate |
| `env` | Efferent | Loose (data) | Reads `GEMINI_API_KEY` only |
| `ValidationError` / `NotFoundError` | Efferent | Loose (message) | Constructs and throws; no state shared |

---

## `UserRepository`

| **Responsibilities** | **Collaborators** |
|---|---|
| Encapsulate all Mongoose queries against the `User` collection | `User` Mongoose model |
| Provide factory methods for creating unsaved `User` documents | `Folder` Mongoose model |
| Create the root `Folder` document for new users | — |
| Expose `save()` to persist documents without leaking Mongoose to callers | — |

**Cohesion:** High – Communicational. All methods operate on user-related persistence. `createRootFolder` is included here because it is part of user initialization, not folder management.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `User` (Mongoose model) | Efferent | Medium (stamp) | Calls `User.findOne`, `new User()`, `.save()` — tightly scoped to this model |
| `Folder` (Mongoose model) | Efferent | Loose (data) | Only `new Folder(...)` and `.save()` — minimal surface |

---

## `RecipeRepository`

| **Responsibilities** | **Collaborators** |
|---|---|
| Encapsulate all Mongoose queries against the `Recipe` collection | `Recipe` Mongoose model |
| Build complex query filter objects from `RecipeFilters` input | — |
| Apply text-score sorting when a search query is present | — |
| Expose typed CRUD methods so `RecipeService` is decoupled from Mongoose | — |

**Cohesion:** High – Functional. Everything in this class is about `Recipe` database access.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `Recipe` (Mongoose model) | Efferent | Medium (stamp) | Calls model static methods and `.save()` — scoped to this model only |

---

## `User` *(Mongoose Model)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Define and enforce the schema for user documents in MongoDB | `Folder` (via `rootFolderId` ref) |
| Hash the `passwordHash` field before saving (via pre-save hook) | `bcryptjs` |
| Expose `comparePassword(candidate)` to verify a password at login | — |
| Enforce uniqueness constraints on `email` and `username` | — |

**Cohesion:** High – Communicational. All logic operates on user document data.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `Folder` | Efferent | Loose (data) | Holds `rootFolderId` as an ObjectId reference; no import of Folder class |
| `bcryptjs` | Efferent | Medium (stamp) | Tight to the bcrypt API for hashing and comparison |

---

## `Recipe` *(Mongoose Model)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Define and enforce the schema for recipe documents, including nested schemas for ingredients, steps, and macros | `User` (via `userId` ref) |
| Define compound indexes for efficient user-scoped queries | `Folder` (via `folderId` ref) |
| Define a full-text search index across recipe content fields | `Tag` (via `tags[]` ref) |
| Enforce maximum lengths and enum constraints on classification fields | — |

**Cohesion:** High – Communicational. All fields and indexes serve the recipe domain.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `User` | Efferent | Loose (data) | References `userId` as an ObjectId; no runtime import |
| `Folder` | Efferent | Loose (data) | Optional `folderId` reference; no runtime import |
| `Tag` | Efferent | Loose (data) | Array of `ObjectId` references; no runtime import |

---

## `Folder` *(Mongoose Model)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Define the schema for hierarchical folder documents | `User` (via `userId` ref) |
| Store materialized path (`path`) for efficient subtree queries | `Folder` (self-ref via `parentId`) |
| Enforce compound indexes on `userId + parentId` and `userId + path` | — |

**Cohesion:** High – Functional. The class is entirely about representing a folder node in a hierarchy.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `User` | Efferent | Loose (data) | `userId` ObjectId reference only |
| `Folder` (self) | Self | Loose (data) | `parentId` self-reference for tree structure; no circular import |

---

## `Tag` *(Mongoose Model)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Define the schema for user-scoped recipe tags | `User` (via `userId` ref) |
| Enforce lowercase normalization on the `name` field | — |
| Enforce uniqueness of `name` per user via compound index | — |

**Cohesion:** High – Functional. Minimal, focused schema.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `User` | Efferent | Loose (data) | `userId` ObjectId reference only |

---

## `MealSchedule` *(Mongoose Model)*

| **Responsibilities** | **Collaborators** |
|---|---|
| Define the schema for a user's meal plan for a given day | `User` (via `userId` ref) |
| Embed an array of `ScheduledMeal` sub-documents | `Recipe` (via `recipeId` in ScheduledMeal) |
| Enforce one schedule document per user per date via unique compound index | — |

**Cohesion:** High – Functional. Represents a single well-defined aggregate: a daily meal plan.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `User` | Efferent | Loose (data) | `userId` reference only |
| `Recipe` | Efferent | Loose (data) | `recipeId` reference inside sub-document |

---

## `HttpClient`

| **Responsibilities** | **Collaborators** |
|---|---|
| Perform `fetch` requests with `credentials: include` and JSON `Content-Type` | `fetch` (browser API) |
| Parse the response body as JSON | — |
| Throw a descriptive `Error` if the response is not OK or not valid JSON | — |
| Accept generic type parameter `T` to provide typed response data | — |

**Cohesion:** High – Functional. One job: make authenticated JSON HTTP requests.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| Browser `fetch` API | Efferent | Loose (message) | Standard web API; no custom dependencies |

---

## `RecipeApiClient`

| **Responsibilities** | **Collaborators** |
|---|---|
| Provide a typed interface for all recipe API operations | `HttpClient` |
| Construct query strings for list filtering | `RecipeListItem` (interface) |
| Accept `HttpClient` via constructor injection to stay testable | `RecipeDetail` (interface) |
| Expose methods matching the backend's recipe resource contract | — |

**Cohesion:** High – Communicational. All methods are recipe-domain API calls using the same transport instance.

**Coupling:**

| Collaborator | Direction | Rating | Notes |
|---|---|---|---|
| `HttpClient` | Efferent | Loose (message) | Depends only on the `json<T>()` method signature; easily substitutable |
| `RecipeListItem` | Efferent | Loose (data) | TypeScript interface — erased at runtime, zero runtime coupling |
| `RecipeDetail` | Efferent | Loose (data) | TypeScript interface — erased at runtime, zero runtime coupling |
