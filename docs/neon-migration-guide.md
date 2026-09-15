# Neon + Vercel Migration Guide

How to migrate a Vite/React app from **localStorage** to **Neon (Postgres)** with **Vercel serverless functions**, using a **schema-per-app** layout so multiple future apps can share a single Neon database.

This guide is written from a real, working implementation (the "Projects" app). Use it as a checklist for migrating other projects.

---

## 1. Architecture Overview

```
┌─────────────┐      fetch /api/*      ┌──────────────────────┐       ┌─────────────────┐
│  Vite SPA   │ ────────────────────▶ │  Vercel serverless    │ ────▶ │  Neon (Postgres) │
│  (React)    │ ◀────────────────────  │  functions (api/*)    │ ◀──── │  schema "pm"    │
└─────────────┘        JSON            └──────────────────────┘       └─────────────────┘
        │
        └── StoreProvider (React Context) — single seam for all data
```

- **Frontend**: unchanged Vite SPA. `StoreContext` is the only place that touches data.
- **Backend**: `api/*.ts` serverless functions (edge runtime) handle CRUD + reorder.
- **Database**: one Neon project, one database, **one Postgres schema per app** (e.g. `pm`). Future apps get their own schema, not their own database.
- **ORM**: Drizzle (with `@neondatabase/serverless` driver).

Why schema-per-app: Neon's free tier gives ~10 logical databases on one project. Sharing one DB and isolating per-app via schemas avoids fragmenting storage and keeps a single set of serverless functions.

---

## 2. Prerequisites

- Accounts: **Neon**, **Vercel**, **GitHub**.
- Local: Node 20+, **pnpm**, **Vercel CLI** (used later for local dev).
- An existing Vite/React app backed by localStorage (like the `StoreContext` + `localStorage` pattern).

---

## 3. Neon Setup

1. Create a project on [neon.tech](https://neon.tech) → note the **connection string** (dashboard → Connect).
2. Copy the connection string into `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@host/db"
   ```
   `.env.local` is gitignored — never commit real credentials.
3. Generate the schema SQL and run it in the **Neon SQL Editor** (no migration runner needed):
   ```bash
   pnpm db:generate
   ```
   The generated file is in `db/migrations/*.sql`. Open it, copy the statements, paste into the Neon SQL Editor, run. (Comments like `--> statement-breakpoint` can be left in or removed.)

---

## 4. Backend Scaffolding

### 4.1 Dependencies

```bash
pnpm add @neondatabase/serverless drizzle-orm
pnpm add -D drizzle-kit pg @types/pg dotenv tsx
```

Add scripts to `package.json`:

```json
"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:seed": "tsx --env-file=.env.local db/seed.ts"
}
```

### 4.2 Schema (`db/schema.ts`)

Define the app schema and tables. **Critical gotcha**: use `mode: "string"` on all `timestamp` columns.

```ts
import { boolean, index, integer, pgSchema, text, timestamp, unique } from "drizzle-orm/pg-core";

export const pm = pgSchema("pm");

export const projects = pm.table("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // ...
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  order: integer("order").notNull().default(0),
});
```

> **Why `mode: "string"`?** The default `mode: "date"` maps writes through `value.toISOString()`. Your client sends `createdAt` as an **ISO string** (`new Date().toISOString()`), so the write throws `e.toISOString is not a function`. String mode passes the value through unchanged and returns a string on read — matching your frontend types. This applies to **every** `timestamp` column.

### 4.3 Drizzle config (`drizzle.config.ts`)

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
```

### 4.4 DB client (`lib/db.ts`)

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add your Neon connection string as an environment variable (Vercel → Project Settings → Environment Variables).",
  );
}

export const db = drizzle(neon(connectionString), { schema });
```

### 4.5 Error wrapper (`lib/http.ts`)

The Neon driver throws **at module load** if `DATABASE_URL` is missing, and DB calls can fail for many reasons. Wrap handlers so the real error is returned as JSON instead of a blank `500`.

```ts
export function withErrors(
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async function (req: Request): Promise<Response> {
    try {
      return await handler(req);
    } catch (err) {
      console.error("API handler error:", err);
      return Response.json(
        { error: err instanceof Error ? err.message : "Unexpected server error" },
        { status: 500 },
      );
    }
  };
}
```

---

## 5. Serverless API Routes (`api/*`)

One file per resource. Key rules:

- `export const config = { runtime: "edge" };`
- Default export = `withErrors(async function handler(req: Request) { ... })` using the Web `Request`/`Response` API.
- **No `db.transaction()`** — the `neon-http` driver does not support it. Use sequential updates for reorders.
- Map DB rows to your frontend shapes (don't return `created_at` column names, keep camelCase).

Example `api/projects.ts`:

```ts
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { withErrors } from "../lib/http";
import { projects } from "../db/schema";

export const config = { runtime: "edge" };

export default withErrors(async function handler(req: Request) {
  const { method } = req;

  if (method === "POST") {
    const body = await req.json();
    const row = await db.insert(projects).values(body).returning();
    return Response.json(toProject(row[0]), { status: 201 });
  }

  if (method === "PATCH") {
    const { id, ...data } = await req.json();
    const row = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    if (!row[0]) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(toProject(row[0]));
  }

  if (method === "PUT") {
    const body = await req.json();
    for (const item of body.items ?? []) {
      await db.update(projects).set({ order: item.order }).where(eq(projects.id, item.id));
    }
    return Response.json({ ok: true });
  }

  if (method === "DELETE") {
    const { id } = await req.json();
    await db.delete(projects).where(eq(projects.id, id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
});

function toProject(r: typeof projects.$inferSelect) {
  return {
    id: r.id,
    name: r.name,
    // ...
    createdAt: r.createdAt, // string (mode: "string")
    order: r.order,
  };
}
```

### 5.1 Nested records: subtasks & subtests

Child records (`subtasks`, `subtests`) live in their own tables with a FK to the parent, but your frontend keeps them nested inside the parent object (`task.subtasks`, `test.subtests`). This section shows the **full stack** for `subtests` — the same pattern applies to `subtasks`.

**Type** (`src/shared/types/index.ts`):

```ts
export interface SubTest {
  id: string;
  name: string;
  notes: string;
  status: TestStatus; // "pending" | "failed" | "passed"
  order: number;
}

export interface Test {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  status: TestStatus;
  subtests: SubTest[];
  createdAt: string;
  order: number;
}
```

**Table** (`db/schema.ts`) — belongs to the same `pm` schema, FK with cascade:

```ts
export const subtests = pm.table(
  "subtests",
  {
    id: text("id").primaryKey(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("pending"),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("subtests_test_idx").on(t.testId)],
);
```

**Hydration** (`api/state.ts`) — fetch all subtests, then nest them under each test:

```ts
tests: testRows.map((test) => ({
  ...toTest(test),
  subtests: subtestRows
    .filter((s) => s.testId === test.id)
    .map(({ id, name, notes, status, order }) => ({ id, name, notes, status, order })),
})),
```

**API actions** (`api/tests.ts`) — sub-operations are handled by the parent route via an `action` field:

```ts
// CREATE a subtest
if (body.action === "addSubTest") {
  const row = await db
    .insert(subtests)
    .values({ id: body.subtestId, testId: body.testId, name: body.name, order: body.order })
    .returning();
  return Response.json(row[0], { status: 201 });
}

// UPDATE notes/status of a subtest
if (body.action === "updateSubTest") {
  const { subtestId, ...data } = body;
  const row = await db.update(subtests).set(data).where(eq(subtests.id, subtestId)).returning();
  return Response.json(row[0]);
}

// DELETE a subtest
if (body.action === "deleteSubTest") {
  await db.delete(subtests).where(eq(subtests.id, body.subtestId));
  return Response.json({ ok: true });
}
```

Request bodies the client sends:

```json
{ "action": "addSubTest", "testId": "te1", "subtestId": "st1", "name": "Validate login", "order": 0 }
{ "action": "updateSubTest", "subtestId": "st1", "status": "passed", "notes": "Works fine" }
{ "action": "deleteSubTest", "subtestId": "st1" }
```

**API client** (`src/shared/api/client.ts`):

```ts
addSubTest: (testId: string, subtestId: string, name: string, order: number) =>
  request<SubTest>("/tests", {
    method: "POST",
    body: JSON.stringify({ action: "addSubTest", testId, subtestId, name, order }),
  }),
updateSubTest: (subtestId: string, data: Partial<SubTest>) =>
  request<SubTest>("/tests", {
    method: "POST",
    body: JSON.stringify({ action: "updateSubTest", subtestId, ...data }),
  }),
deleteSubTest: (subtestId: string) =>
  request<{ ok: true }>("/tests", {
    method: "POST",
    body: JSON.stringify({ action: "deleteSubTest", subtestId }),
  }),
```

**Store** (`StoreContext.tsx`) — optimistic updates to the nested array, then persist:

```ts
addSubTest: (testId, name) => {
  const subtestId = uid();
  const order = state.tests.find((t) => t.id === testId)?.subtests.length ?? 0;
  patchTest(testId, (t) => ({
    ...t,
    subtests: [...t.subtests, { id: subtestId, name, notes: "", status: "pending", order }],
  }));
  api.addSubTest(testId, subtestId, name, order).catch(() => {});
},

updateSubTest: (testId, subtestId, data) => {
  patchTest(testId, (t) => ({
    ...t,
    subtests: t.subtests.map((s) => (s.id === subtestId ? { ...s, ...data } : s)),
  }));
  api.updateSubTest(subtestId, data).catch(() => {});
},

deleteSubTest: (testId, subtestId) => {
  patchTest(testId, (t) => ({ ...t, subtests: t.subtests.filter((s) => s.id !== subtestId) }));
  api.deleteSubTest(subtestId).catch(() => {});
},
```

**UI — where to click to add subtests** (`src/features/tests/components/TestItem.tsx`):

> ⚠️ **Gotcha**: if the toggle button only renders when `subtests.length > 0`, you can't add the *first* subtest. Always render the toggle button next to the test name (show a `Plus` icon when there are no subtests yet).

1. Find the test card in the Tests section.
2. Click the icon button **to the left of the test name** (a `+` when the test has no subtests yet, or a chevron `v` when it already has some).
3. In the expanded area, type a name in the **"Add a subtest..."** field and press **Enter**.
4. Each subtest row has: an expand toggle (chevron), a **status dropdown** (`pending`/`failed`/`passed`), a delete (`×`) button, and — when expanded — a **notes** textarea that saves automatically.

Call sites from the UI:

```ts
addSubTest(test.id, "Validate login");                       // on Enter in the input
updateSubTest(test.id, sub.id, { status: "passed" });        // on dropdown change
updateSubTest(test.id, sub.id, { notes: e.target.value });   // on notes typing (auto-save)
deleteSubTest(test.id, sub.id);                              // on X button
```

---

## 6. Frontend Rework

### 6.1 API client (`src/shared/api/client.ts`)

Typed fetch helpers. Important: surface the server's `{ error }` message in the thrown error so failures are debuggable.

```ts
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `API error ${res.status}: ${res.statusText}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = `${message} - ${data.error}`;
    } catch { /* keep status fallback */ }
    console.error(`[api] ${init?.method ?? "GET"} ${path}`, message);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
```

### 6.2 Store (`StoreContext.tsx`)

Replace the localStorage read/write with:

- **Hydrate on mount**: `GET /api/state` → `setState(...)`. Add a `loading` flag and render a loader until done.
- **Optimistic updates**: every action updates local state immediately, then fires the matching API call with `.catch(() => {})`.
- Generate `id`/`createdAt`/`order` client-side and send the full object so the API route needs no extra logic.

Example:

```tsx
const [state, setState] = useState<AppState>({ projects: [], modules: [], tasks: [], tests: [], bugs: [] });
const [loading, setLoading] = useState(true);

useEffect(() => {
  let cancelled = false;
  api.getState()
    .then((data) => { if (!cancelled) setState(data); })
    .catch(() => {})
    .finally(() => { if (!cancelled) setLoading(false); });
  return () => { cancelled = true; };
}, []);

const value = useMemo<StoreContextValue>(() => ({
  ...state,
  loading,
  createProject: (data) => {
    const id = uid();
    const createdAt = new Date().toISOString();
    const order = state.projects.length;
    setState((prev) => ({ ...prev, projects: [...prev.projects, { ...data, id, createdAt, order }] }));
    api.createProject({ ...data, id, createdAt, order }).catch(() => {});
  },
  // ...one action per CRUD + reorder + nested op
}), [state, loading]);
```

Add `loading: boolean` to the `StoreContextValue` type in `store.ts`:

```ts
export type StoreContextValue = AppState & {
  loading: boolean;
  resetData: () => void;
  // ...
};
```

**Keep the `useStore()` API surface identical** so no component needs changes.

---

## 7. Auth Gate (Option A — client-side)

> ⚠️ **Security caveat**: `VITE_*` variables are inlined into the JS bundle at build time. This gate stops casual use but is **not** real security — a determined user can read the credentials from DevTools. For a personal/private app this is acceptable; use server-side auth if the app goes public.

### Files
- `src/shared/auth.ts` — session flag + credential check:

```ts
const SESSION_KEY = "pm-session";

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_KEY) === "1";
}

export function authenticate(username: string, password: string): boolean {
  const expectedUsername = import.meta.env.VITE_APP_USERNAME;
  const expectedPassword = import.meta.env.VITE_APP_PASSWORD;

  const usernameOk = !expectedUsername || username.trim() === String(expectedUsername);
  const passwordOk = password === expectedPassword;

  if (usernameOk && passwordOk) {
    localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
```

- `src/features/auth/page/LoginPage.tsx` — username + password form calling `authenticate`, navigates to `/projects`.
- `src/features/auth/components/AuthGuard.tsx` — redirects to `/login` if not authenticated:

```tsx
export default function AuthGuard({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

- `src/App.tsx` — `/login` outside the guard; guarded routes wrap `StoreProvider` + `Layout`.
- `src/shared/components/Sidebar.tsx` — "Log out" button calls `logout()` and navigates to `/login`.

### Env variables

```env
VITE_APP_USERNAME="your-username"
VITE_APP_PASSWORD="your-password"
```

Add them to `.env.local` (dev) **and** Vercel env vars (build). Note `VITE_APP_*` must be present at build time or the deployed app will never accept login.

---

## 8. Local Development

Plain `pnpm dev` (Vite only) has no `/api` routes → requests return **404**. Use the Vercel CLI which serves both the Vite app **and** the functions on one origin, auto-loading `.env.local`.

```bash
pnpm add -D vercel
pnpm exec vercel login      # one time
pnpm exec vercel link       # one time — link to the existing Vercel project
pnpm exec vercel dev        # run full stack → http://localhost:3000
```

Add a script for convenience: `"dev:server": "vercel dev"`.

---

## 9. Vercel Deployment

1. Push to GitHub → Vercel auto-deploys the Vite app and the `api/` functions.
2. Set environment variables in **Vercel → Project → Settings → Environment Variables** (add to Production, Preview, Development):
   - `DATABASE_URL` = Neon connection string
   - `VITE_APP_USERNAME`
   - `VITE_APP_PASSWORD`
3. Make sure the `pm` schema + tables exist in **the same database** the connection string points to.
4. Redeploy after any push.

---

## 10. Troubleshooting (the exact issues we hit)

| Symptom | Cause | Fix |
|---|---|---|
| `FUNCTION_INVOCATION_FAILED` / `error 500` on every API call | `DATABASE_URL` missing in Vercel env. The Neon driver throws at module load. | Add `DATABASE_URL` in Vercel env vars and redeploy. Check **Vercel → Functions → Logs**. |
| `404` on `http://localhost:5173/api/...` | Vite dev server has no `/api` routes. | Use `vercel dev` instead of `pnpm dev`. |
| `e.toISOString is not a function` on create | `timestamp` column in default `mode: "date"` calls `.toISOString()` on the string you sent. | Set `mode: "string"` on every `timestamp` column in the schema. No DB migration needed. |
| Drizzle insert fails with unknown column | Sending nested arrays (`subtasks`, `subtests`) in the create body. | Strip them before insert: `delete taskData.subtasks;` |
| Reorder returns an error | `db.transaction()` is unsupported by the `neon-http` driver. | Use sequential `db.update(...)` in a `for` loop. |
| Can't add the first subtest/subtask in the UI | The expand toggle only renders when `subtests.length > 0`. | Always render the toggle button next to the parent name (show a `+` icon when empty). |
| Generic 500 with no detail | No error handling in the function. | Wrap handlers with `withErrors`. |

---

## 11. Seeding / Migrating Existing localStorage Data

`db/seed.ts` deletes all rows (child-first order to respect FKs) and inserts your seed/demo data:

```bash
pnpm db:seed
```

> The seed inserts `createdAt` as ISO **strings** — another reason the `mode: "string"` fix matters.

To migrate real localStorage data instead of a hardcoded seed, export your `localStorage["pm-app-state-v1"]` JSON (or whatever key your app used) and insert each array into its matching table.

---

## 12. Migration Checklist (for a new project)

1. **Neon**: create project → copy `DATABASE_URL` → create schema + tables via SQL editor (`pnpm db:generate` → run SQL).
2. **Deps**: `@neondatabase/serverless`, `drizzle-orm`, dev: `drizzle-kit`, `pg`, `@types/pg`, `dotenv`, `tsx`, `vercel`.
3. **Schema**: `db/schema.ts` — use a dedicated `pgSchema`, `mode: "string"` timestamps, cascade FKs, `order` columns.
4. **Config**: `drizzle.config.ts`, `lib/db.ts`, `lib/http.ts` (`withErrors`), `.env.local` + `.env.example`.
5. **API**: `api/*.ts` — edge runtime, `withErrors`, no `db.transaction()`, camelCase mappers, nested `action` ops, `api/state.ts` for hydration.
6. **Frontend**: `src/shared/api/client.ts`; rework `StoreContext` to hydrate + optimistic writes; add `loading` to the store type; keep `useStore()` surface unchanged.
7. **Auth** (optional): `LoginPage`, `AuthGuard`, `shared/auth.ts`, wire into `App.tsx` + sidebar logout, set `VITE_APP_USERNAME`/`VITE_APP_PASSWORD`.
8. **Local dev**: `vercel login` + `vercel link`, then `vercel dev`.
9. **Deploy**: set env vars on Vercel, ensure schema exists in the right DB, push.
10. **Verify**: create/update/delete/reorder each resource; reload on a second device to confirm sync.