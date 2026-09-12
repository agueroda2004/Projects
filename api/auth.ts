import { withErrors } from "../lib/http";

export const config = { runtime: "edge" };

const AUTH_USERNAME = process.env.AUTH_USERNAME ?? "";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? "";

export default withErrors(async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = (await req.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";

  if (!AUTH_USERNAME || !AUTH_PASSWORD) {
    return Response.json(
      { error: "Auth is not configured on the server" },
      { status: 500 },
    );
  }

  const usernameOk = username.length > 0 && username === AUTH_USERNAME;
  const passwordOk = password.length > 0 && password === AUTH_PASSWORD;

  if (!usernameOk || !passwordOk) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  return Response.json({ ok: true });
});
