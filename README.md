# dinnerparty

A recipe storage and meal planning app. Built for people who actually cook and want a decent place to keep their recipes organized.

## Stack

- **Frontend**: React 19, Vite, Tailwind CSS, TypeScript
- **Backend**: Express 5, MongoDB/Mongoose, TypeScript
- **Auth**: JWT with HTTP-only cookies, bcrypt password hashing

The whole thing is a monorepo managed with npm workspaces — `client/` and `server/` are the two packages.

## Getting started
### Docker (Recommended)
1. Download Docker / Docker Desktop. Different operating systems will have different requirements. If unsure, look at the official [getting started guide](https://www.docker.com/get-started/).


2. Set up your environment variables. Copy the example and fill in your values:
    ```bash
    cp .env.example server/.env
    ```

    - Most of the defaults in `.env.example` should work, but you'll want to change `JWT_SECRET` to something real.
    - You'll also want to change Mongo_URI to:

    ```MONGO_URI=mongodb://mongodb:27017/dinnerparty```

3. Open a terminal and navigate to the repository.

4. Run:
```
docker-compose build
```
This may take a few minutes.

5. Once the image is built, run it:
```
docker-compose up
```
6. You can access the front-end at:
```
http://localhost:5173/
```

### Legacy Method

You'll need Node.js (v18+) and a running MongoDB instance.

### Running a local MongoDB Instance

#### Ubuntu

To **start** up mongodb
```bash
sudo systemctl start mongod
```

Verify that a local instance is running
```bash
sudo systemctl status mongod
```

To **stop** mongodb
```bash
sudo systemctl stop mongod
```

To **restart** mongodb
```bash
sudo systemctl restart mongod
```

### NodeJS and dinnerparty instance

1. Clone and install:
```bash
git clone <repo-url>
cd dinnerparty
npm install
```

2. Set up your environment variables. Copy the example and fill in your values:
```bash
cp .env.example server/.env
```

The defaults in `.env.example` should work for local development, but you'll want to change `JWT_SECRET` to something real.

3. Start the dev servers:
```bash
# API server (runs on :5000)
npm run dev -w server

# Client dev server (runs on :5173)
npm run dev -w client
```

The Vite dev server proxies `/api` requests to the backend, so everything just works on `localhost:5173` during development.

## Project structure

```
dinnerparty/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.tsx
│       └── ThemeContext.tsx
├── server/          # Express API
│   └── src/
│       ├── config/
│       ├── models/
│       ├── middleware/
│       ├── routes/
│       └── app.ts
├── .env.example
└── package.json     # Workspace root
```

## What's working

- **Auth**: Register, login, logout, session persistence. Passwords are hashed, tokens are stored in HTTP-only cookies.
- **Theme system**: 6 color schemes (default, midnight, warm, ocean, forest, rose) that persist to localStorage. Everything is wired through a React context.
- **Recipe form**: Full creation form with dynamic ingredient/step lists, photo uploads, difficulty, timing, etc. Not hooked up to the backend yet.
- **Data models**: Recipe, Folder, Tag, and MealSchedule schemas are all defined in Mongoose. Recipes support nested ingredients, instructions, nutrition info, and full-text search indexing. Folders use materialized paths for the hierarchy.
- **Sidebar layout**: Authenticated pages use a shared sidebar with nav and user info.

## TODO

- Recipe CRUD endpoints (models are ready, routes aren't wired up yet)
- Folder and tag management API
- Meal scheduling endpoints
- Import recipes from URL
- Photo upload/storage
- Connect the recipe creation form to the API
- Email verification and password reset
- Recipe sharing between users
