# DinnerParty — Sequence Diagrams

UML sequence diagrams showing use case realization across the system.
Solid arrows are calls; dashed arrows are returns. Steps are autonumbered.
`alt` blocks show branching paths (error vs. happy path).

---

## Use Case 1: User Registration

Spans 6 objects. Covers input validation, duplicate-user check, two sequential DB
writes (User then root Folder), a bcrypt password hash via Mongoose pre-save hook,
JWT generation, and HTTP-only cookie response.

```mermaid
%%{init: {"themeVariables": {"fontSize": "16px"}, "sequence": {"actorMargin": 80, "messageMargin": 35}}}%%
sequenceDiagram
    autonumber
    actor  C  as Client
    participant AC as AuthController
    participant AS as AuthService
    participant UR as UserRepository
    participant U  as User (Mongo)
    participant F  as Folder (Mongo)

    C  ->>+ AC: POST /api/auth/register
    Note over C: body: email, username, password

    AC ->>+ AS: register(email, username, password)

    alt missing fields OR password shorter than 6 chars
        AS -->> AC: throw ValidationError
        AC -->> C : 400 Bad Request
    end

    AS ->>+ UR: findByEmailOrUsername(email, username)
    UR ->>+ U : User.findOne — email OR username match
    U  -->>- UR: null or existingUser
    UR -->>- AS: null or existingUser

    alt existing user found
        AS -->> AC: throw ConflictError
        AC -->> C : 409 Conflict
    end

    AS ->>  UR: create(email, username, passwordHash)
    UR ->>  U : new User(data)
    U  -->> UR: newUser (unsaved)
    UR -->> AS: newUser

    AS ->>+ UR: save(newUser)
    UR ->>+ U : newUser.save()
    Note over U: pre-save hook fires<br/>bcrypt.genSalt(12)<br/>bcrypt.hash(passwordHash, salt)
    U  -->>- UR: savedUser
    UR -->>- AS: savedUser

    AS ->>+ UR: createRootFolder(savedUser._id)
    UR ->>  F : new Folder(userId, name, path)
    F  -->> UR: rootFolder (unsaved)
    UR -->>- AS: rootFolder

    AS ->>+ F : rootFolder.save()
    F  -->>- AS: savedFolder

    AS ->>  AS: savedUser.rootFolderId = savedFolder._id
    AS ->>+ UR: save(savedUser)
    UR ->>+ U : savedUser.save()
    U  -->>- UR: updatedUser
    UR -->>- AS: updatedUser

    AS ->>  AS: generateToken(userId, uuid)
    Note over AS: jwt.sign — expiresIn 7 days
    AS -->>- AC: user, token

    AC ->>  AC: setAuthCookie(res, token)
    Note over AC: httpOnly · secure · sameSite:lax<br/>maxAge: 7 days
    AC -->>- C : 201 Created — user object
```

---

## Use Case 2: User Login

Spans 4 objects. Covers field validation, user lookup by email, bcrypt password
comparison via a Mongoose instance method, and JWT cookie response.
Shows the authentication failure path.

```mermaid
%%{init: {"themeVariables": {"fontSize": "16px"}, "sequence": {"actorMargin": 80, "messageMargin": 35}}}%%
sequenceDiagram
    autonumber
    actor  C  as Client
    participant AC as AuthController
    participant AS as AuthService
    participant UR as UserRepository
    participant U  as User (Mongo)

    C  ->>+ AC: POST /api/auth/login
    Note over C: body: email, password

    AC ->>+ AS: login(email, password)

    alt missing email or password
        AS -->> AC: throw ValidationError
        AC -->> C : 400 Bad Request
    end

    AS ->>+ UR: findByEmail(email)
    UR ->>+ U : User.findOne — email lowercase match
    U  -->>- UR: null or user
    UR -->>- AS: null or user

    alt user not found
        AS -->> AC: throw AuthError — Invalid email or password
        AC -->> C : 401 Unauthorized
    end

    AS ->>+ U : user.comparePassword(candidate)
    Note over U: bcrypt.compare(candidate, passwordHash)
    U  -->>- AS: true or false

    alt password does not match
        AS -->> AC: throw AuthError — Invalid email or password
        AC -->> C : 401 Unauthorized
    end

    AS ->>  AS: generateToken(userId, uuid)
    AS -->>- AC: user, token

    AC ->>  AC: setAuthCookie(res, token)
    AC -->>- C : 200 OK — user object
```

---

## Use Case 3: List Recipes with Full-Text Search

Spans 6 objects. Covers JWT auth via middleware, query parameter extraction,
dynamic filter construction, MongoDB text-score sorting when a search term is
present, and response shaping.

```mermaid
%%{init: {"themeVariables": {"fontSize": "16px"}, "sequence": {"actorMargin": 80, "messageMargin": 35}}}%%
sequenceDiagram
    autonumber
    actor  C  as Client
    participant MW as requireAuth
    participant RC as RecipeController
    participant RS as RecipeService
    participant RR as RecipeRepository
    participant R  as Recipe (Mongo)

    C  ->>+ MW: GET /api/recipes
    Note over C: query: q, folderId, tagId, isFavorite<br/>cookie: token

    MW ->>  MW: jwt.verify(token, secret)

    alt token missing or invalid
        MW -->> C : 401 Not Authenticated
    end

    MW ->>  MW: attach userId to req.user
    MW ->>+ RC: next — list(req, res, next)

    RC ->>  RC: extract q, folderId, tagId, isFavorite from query
    RC ->>+ RS: list(userId, q, folderId, tagId, isFavorite)

    RS ->>+ RR: findByFilters(filters)

    RR ->>  RR: build filter object from params
    Note over RR: Adds text search if q present<br/>Adds folderId, tagId, isFavorite if set

    RR ->>+ R : Recipe.find(filter).sort(textScore or updatedAt).limit(200)
    Note over R: Text index spans:<br/>title · description · ingredients<br/>cuisine · course · notes
    R  -->>- RR: Recipe array

    RR -->>- RS: Recipe array
    RS -->>- RC: Recipe array
    RC -->>- MW: response sent
    MW -->>- C : 200 OK — recipes array
```

---

## Use Case 4: Create Recipe (Manual Entry)

Spans 5 objects. Covers JWT auth, body sanitization (stripping any client-injected
userId to prevent spoofing), recipe construction, Mongoose validation, and persistence.

```mermaid
%%{init: {"themeVariables": {"fontSize": "16px"}, "sequence": {"actorMargin": 80, "messageMargin": 35}}}%%
sequenceDiagram
    autonumber
    actor  C  as Client
    participant MW as requireAuth
    participant RC as RecipeController
    participant RS as RecipeService
    participant RR as RecipeRepository
    participant R  as Recipe (Mongo)

    C  ->>+ MW: POST /api/recipes
    Note over C: body: title, ingredients, instructions, etc.<br/>cookie: token

    MW ->>  MW: jwt.verify(token, secret)

    alt token missing or invalid
        MW -->> C : 401 Not Authenticated
    end

    MW ->>  MW: attach userId to req.user
    MW ->>+ RC: next — create(req, res, next)

    RC ->>  RC: strip userId from req.body
    Note over RC: Prevents client from spoofing ownership
    RC ->>+ RS: create(sanitizedBody, userId)

    RS ->>+ RR: create(data, userId)
    RR ->>+ R : new Recipe(data, userId).save()

    alt Mongoose validation fails — e.g. missing title
        R  -->> RR: ValidationError
        RR -->> RS: throw
        RS -->> RC: throw
        RC ->>  RC: next(err)
        RC -->> C : 400 Bad Request
    end

    R  -->>- RR: savedRecipe
    RR -->>- RS: savedRecipe
    RS -->>- RC: savedRecipe
    RC -->>- MW: response sent
    MW -->>- C : 201 Created — recipe object
```

---

## Use Case 5: AI Recipe Import from URL

The most complex flow in the system — spans 7 objects including an external website
and the Gemini AI API. Covers JWT auth, URL validation, external page fetch, HTML
stripping, AI content extraction, JSON parsing with error recovery, and DB persistence.

```mermaid
%%{init: {"themeVariables": {"fontSize": "16px"}, "sequence": {"actorMargin": 60, "messageMargin": 35}}}%%
sequenceDiagram
    autonumber
    actor  C   as Client
    participant MW  as requireAuth
    participant RC  as RecipeController
    participant RS  as RecipeService
    participant WEB as Ext. Website
    participant AI  as Gemini AI
    participant RR  as RecipeRepository
    participant R   as Recipe (Mongo)

    C  ->>+ MW: POST /api/recipes/import
    Note over C: body: url, cookie: token

    MW ->>  MW: jwt.verify(token, secret)

    alt token missing or invalid
        MW -->> C : 401 Not Authenticated
    end

    MW ->>  MW: attach userId to req.user
    MW ->>+ RC: next — importFromUrl(req, res, next)

    RC ->>+ RS: importFromUrl(url, userId)

    alt url missing or not valid http/https
        RS -->> RC: throw ValidationError
        RC ->>  RC: next(err)
        RC -->> C : 400 Bad Request
    end

    RS ->>+ WEB: fetch(url, timeout 10s)
    Note over WEB: User-Agent: DinnerParty/1.0

    alt fetch fails or non-200 response
        WEB -->> RS: error
        RS  -->> RC: throw ValidationError
        RC  ->>  RC: next(err)
        RC  -->> C : 400 Bad Request
    end

    WEB -->>- RS: 200 HTML body

    RS ->>  RS: stripHtml(html)
    Note over RS: Remove script, style, comment tags<br/>Decode HTML entities<br/>Collapse whitespace, truncate to 20000 chars

    RS ->>+ AI: getGenerativeModel(gemini-2.5-flash-lite)
    RS ->>  AI: generateContent(extractionPrompt + plainText)
    Note over AI: Prompt requests JSON only — no markdown<br/>Shape: title, ingredients, instructions,<br/>timing, servings, difficulty, etc.
    AI -->>- RS: rawText

    RS ->>  RS: stripMarkdownFences(rawText)
    Note over RS: Removes any triple-backtick wrapper<br/>that Gemini may add around JSON

    RS ->>  RS: JSON.parse(cleanedText)

    alt JSON.parse throws
        RS -->> RC: throw Error — unparseable AI response
        RC ->>  RC: next(err)
        RC -->> C : 400 Bad Request
    end

    alt parsed title is missing or empty
        RS -->> RC: throw ValidationError — no recipe found
        RC ->>  RC: next(err)
        RC -->> C : 400 Bad Request
    end

    RS ->>+ RR: create(parsedData + sourceUrl + sourceType, userId)
    RR ->>+ R : new Recipe(data, userId).save()
    R  -->>- RR: savedRecipe
    RR -->>- RS: savedRecipe

    RS -->>- RC: savedRecipe
    RC -->>- MW: response sent
    MW -->>- C : 201 Created — recipe object
```
