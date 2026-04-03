# DinnerParty — UML Class Diagrams

Static class diagrams showing class structure and structural associations across all layers of the system.

> **Association types used:**
> - `--|>` Inheritance (is-a)
> - `..|>` Realization (implements interface)
> - `*--` Composition (owns lifecycle)
> - `o--` Aggregation (references, does not own lifecycle)
> - `-->` Association (persistent reference)
> - `..>` Dependency (transient / throws / uses inline)

---

## 1. Backend Architecture

Three-layer backend showing how **Controllers**, **Services**, and **Repositories** structurally relate to each other. Controllers hold persistent associations to Services; Services hold persistent associations to Repositories. `RecipeService` composes `GoogleGenerativeAI` (it instantiates and owns it).

```mermaid
classDiagram
    direction TB

    class AuthController {
        -authService : AuthService
        +register(req, res, next) void
        +login(req, res, next) void
        +me(req, res, next) void
        +logout(req, res) void
        -setAuthCookie(res, token) void
    }

    class RecipeController {
        -recipeService : RecipeService
        +list(req, res, next) void
        +get(req, res, next) void
        +create(req, res, next) void
        +importFromUrl(req, res, next) void
        +update(req, res, next) void
        +delete(req, res, next) void
    }

    class AuthService {
        -userRepository : UserRepository
        +register(email, username, password) Promise~object~
        +login(email, password) Promise~object~
        +getMe(userId) Promise~IUser~
        +generateToken(userId, uuid) string
    }

    class RecipeService {
        -recipeRepository : RecipeRepository
        -genAI : GoogleGenerativeAI
        +list(filters) Promise~IRecipe[]~
        +get(id, userId) Promise~IRecipe~
        +create(data, userId) Promise~IRecipe~
        +update(id, userId, updates) Promise~IRecipe~
        +delete(id, userId) Promise~IRecipe~
        +importFromUrl(url, userId) Promise~IRecipe~
    }

    class UserRepository {
        +findByEmailOrUsername(email, username) Promise~IUser~
        +findByEmail(email) Promise~IUser~
        +findById(id) Promise~IUser~
        +create(data) IUser
        +save(user) Promise~IUser~
        +createRootFolder(userId) IFolder
    }

    class RecipeRepository {
        +findByFilters(filters) Promise~IRecipe[]~
        +findOne(id, userId) Promise~IRecipe~
        +create(data, userId) Promise~IRecipe~
        +update(id, userId, updates) Promise~IRecipe~
        +delete(id, userId) Promise~IRecipe~
    }

    class GoogleGenerativeAI {
        <<external>>
        +getGenerativeModel(config) GenerativeModel
    }

    AuthController "1" --> "1" AuthService : association
    RecipeController "1" --> "1" RecipeService : association
    AuthService "1" --> "1" UserRepository : association
    RecipeService "1" --> "1" RecipeRepository : association
    RecipeService "1" *-- "1" GoogleGenerativeAI : composition
```

---

## 2. Error Hierarchy

`AppError` is the abstract base for all typed HTTP errors. Each subclass hard-codes its HTTP status code. `errorHandler` depends on `AppError` transiently via `instanceof` inspection.

```mermaid
classDiagram
    direction TB

    class AppError {
        <<abstract>>
        +statusCode : number
        +name : string
        +message : string
        +constructor(statusCode, message)
    }

    class ValidationError {
        +statusCode : 400
        +constructor(message)
    }

    class AuthError {
        +statusCode : 401
        +constructor(message)
    }

    class ForbiddenError {
        +statusCode : 403
        +constructor(message)
    }

    class NotFoundError {
        +statusCode : 404
        +constructor(message)
    }

    class ConflictError {
        +statusCode : 409
        +constructor(message)
    }

    class errorHandler {
        <<middleware>>
        +errorHandler(err, req, res, next) void
    }

    class requireAuth {
        <<middleware>>
        +requireAuth(req, res, next) void
    }

    ValidationError --|> AppError : extends
    AuthError --|> AppError : extends
    ForbiddenError --|> AppError : extends
    NotFoundError --|> AppError : extends
    ConflictError --|> AppError : extends
    errorHandler ..> AppError : inspects via instanceof
    requireAuth ..> AuthError : throws implicitly
```

---

## 3. Data Models

Mongoose document classes and their associations. `User` is the root aggregate — all other entities are scoped to a user. `Recipe` has optional associations to `Folder` and `Tag`. `MealSchedule` uses composition for embedded `ScheduledMeal` sub-documents. `Folder` is self-referential for its hierarchy.

```mermaid
classDiagram
    direction TB

    class User {
        +uuid : string
        +email : string
        +username : string
        +passwordHash : string
        +displayName : string
        +avatarUrl : string
        +isVerified : boolean
        +theme : ThemePreferences
        +defaultServings : number
        +measurementSystem : string
        +rootFolderId : ObjectId
        +createdAt : Date
        +updatedAt : Date
        +comparePassword(candidate) Promise~boolean~
    }

    class Recipe {
        +userId : ObjectId
        +title : string
        +description : string
        +imageUrl : string
        +ingredients : Ingredient[]
        +instructions : InstructionStep[]
        +prepTimeMinutes : number
        +cookTimeMinutes : number
        +totalTimeMinutes : number
        +servings : number
        +macros : Macros
        +cuisine : string
        +course : string
        +difficulty : string
        +tags : ObjectId[]
        +folderId : ObjectId
        +sourceUrl : string
        +sourceType : string
        +isFavorite : boolean
        +pairsWith : ObjectId[]
        +createdAt : Date
        +updatedAt : Date
    }

    class Folder {
        +userId : ObjectId
        +name : string
        +parentId : ObjectId
        +path : string
        +depth : number
        +sortOrder : number
        +color : string
        +icon : string
        +createdAt : Date
        +updatedAt : Date
    }

    class Tag {
        +userId : ObjectId
        +name : string
        +color : string
        +createdAt : Date
        +updatedAt : Date
    }

    class MealSchedule {
        +userId : ObjectId
        +date : Date
        +meals : ScheduledMeal[]
        +createdAt : Date
        +updatedAt : Date
    }

    class ScheduledMeal {
        +recipeId : ObjectId
        +mealType : string
        +servings : number
        +notes : string
        +equipment : string[]
    }

    User "1" --> "0..*" Recipe : owns
    User "1" --> "0..*" Folder : owns
    User "1" --> "0..*" Tag : owns
    User "1" --> "0..*" MealSchedule : owns
    User "1" --> "1" Folder : rootFolder
    Recipe "0..*" --> "0..1" Folder : placed in
    Recipe "0..*" o-- "0..*" Tag : tagged with
    Recipe "0..*" o-- "0..*" Recipe : pairsWith
    MealSchedule "1" *-- "0..*" ScheduledMeal : embeds
    ScheduledMeal "0..*" --> "1" Recipe : references
    Folder "0..*" --> "0..1" Folder : parentId self-ref
```

---

## 4. Client Architecture

`HttpClient` is the base transport. `RecipeApiClient` is composed with an `HttpClient` instance via constructor injection. `RecipeDetail` extends `RecipeListItem`. Named function exports (e.g. `listRecipes`) delegate to the `recipeApiClient` singleton.

```mermaid
classDiagram
    direction LR

    class HttpClient {
        +json~T~(input, init) Promise~T~
    }

    class RecipeApiClient {
        -http : HttpClient
        +constructor(http : HttpClient)
        +list(params) Promise~RecipeListItem[]~
        +get(id) Promise~RecipeDetail~
        +create(payload) Promise~RecipeDetail~
        +import(payload) Promise~RecipeDetail~
        +update(id, data) Promise~RecipeDetail~
        +delete(id) Promise~object~
    }

    class RecipeListItem {
        <<interface>>
        +_id : string
        +title : string
        +description : string
        +imageUrl : string
        +updatedAt : string
        +createdAt : string
        +isFavorite : boolean
    }

    class RecipeDetail {
        <<interface>>
        +ingredients : Ingredient[]
        +instructions : InstructionStep[]
        +servings : number
        +prepTimeMinutes : number
        +cookTimeMinutes : number
        +totalTimeMinutes : number
        +difficulty : string
        +cuisine : string
        +course : string
        +notes : string
    }

    RecipeApiClient "1" --> "1" HttpClient : association
    RecipeDetail ..|> RecipeListItem : extends interface
    RecipeApiClient ..> RecipeListItem : returns
    RecipeApiClient ..> RecipeDetail : returns
```
