# Coding Standards

This document describes the coding standards for the Dinnerparty project. Most rules are automatically enforced — see [Enforcement](#enforcement) for details.

---

## Formatting

Formatting is handled by **Prettier** and applied automatically on every commit. The full config lives in `.prettierrc`. Key settings:

| Setting | Value |
|---|---|
| Quotes | Double quotes (`"`) |
| Semicolons | Required |
| Indentation | 2 spaces (no tabs) |
| Line length | 100 characters |
| Trailing commas | ES5 (objects, arrays — not function parameters) |
| Line endings | LF |

## Naming Conventions

### Client (`client/`)

| Identifier | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `recipeList`, `isLoading` |
| Constants | `UPPER_CASE` | `MAX_RETRIES` |
| Functions / utilities | `camelCase` | `formatDate()`, `fetchRecipes()` |
| React components | `PascalCase` | `RecipeCard`, `SidebarLayout` |
| Types, interfaces, classes, enums | `PascalCase` | `RecipeFormData`, `UserRole` |
| Object properties | `camelCase` or `snake_case` | `createdAt`, `miami_vice` |
| Unused parameters | Prefix with `_` | `_unusedParam` |

### Server (`server/`)

| Identifier | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `userId`, `tokenExpiry` |
| Constants | `UPPER_CASE` | `SALT_ROUNDS` |
| Functions | `camelCase` | `verifyToken()`, `hashPassword()` |
| Mongoose models / classes | `PascalCase` | `Recipe`, `User` |
| Types, interfaces, enums | `PascalCase` | `AuthPayload`, `UserRole` |
| Object properties | `camelCase` or `UPPER_CASE` | `createdAt`, `JWT_SECRET` |
| Unused parameters | Prefix with `_` | `_req` |

**Note:** Property keys that are not valid JS identifiers (e.g. `"Content-Type"`, `"/api"`) are exempt from naming rules.

## TypeScript

- Strict mode is enabled on both client and server — do not disable it.
- Avoid `any`. Use `unknown` and narrow the type, or define a proper interface.
- Prefer `interface` for object shapes that may be extended; use `type` for unions, intersections, and aliases.

## React (client only)

- One component per file.
- Component files use `.tsx`; non-component TypeScript files use `.ts`.
- Follow the Rules of Hooks — ESLint will catch violations automatically.
- Avoid calling `setState` synchronously inside `useEffect` body. Initialize state before the effect or derive it inside the callback.

---

## Enforcement

### Getting set up

After cloning the repo, run the following from the project root:

```bash
npm install
```

That's it. The pre-commit hook installs itself as part of `npm install` — no additional steps needed. You can verify it's active by checking that a `.husky/pre-commit` file exists in the root.

> **Note:** If you installed dependencies before this standard was introduced, run `npm install` again to pick up the hook.

### On commit (automatic)

A pre-commit hook runs automatically via **husky** + **lint-staged** whenever you commit — regardless of whether you use the CLI, GitHub Desktop, or another GUI.

For each staged file it will:

1. Run `prettier --write` to auto-fix formatting.
2. Run `eslint --fix` to auto-fix what it can.
3. **Block the commit** if ESLint finds errors it cannot fix automatically.

The hook installs itself when you run `npm install`. No manual setup required.

### Manually

Run these from the repo root:

```bash
# Check formatting without writing
npm run format:check

# Auto-fix all formatting
npm run format

# Lint both client and server
npm run lint

# Lint and auto-fix both
npm run lint:fix
```

### Bypassing hooks

Hooks can be bypassed with `git commit --no-verify` or the "Bypass hooks" checkbox in GitHub Desktop. Don't use this unless you have a very good reason — it exists for emergencies, not convenience.
