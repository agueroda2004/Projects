import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { withErrors } from "../lib/http";
import { bugs } from "../db/schema";

export const config = { runtime: "edge" };

export default withErrors(async function handler(req: Request) {
  const { method } = req;
  const body = await req.json().catch(() => ({}));

  if (method === "POST") {
    const row = await db.insert(bugs).values(body).returning();
    return Response.json(toBug(row[0]), { status: 201 });
  }

  if (method === "PATCH") {
    const { id, ...data } = body;
    const row = await db.update(bugs).set(data).where(eq(bugs.id, id)).returning();
    if (!row[0]) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(toBug(row[0]));
  }

  if (method === "PUT") {
    for (const item of body.items ?? []) {
      await db.update(bugs).set({ order: item.order }).where(eq(bugs.id, item.id));
    }
    return Response.json({ ok: true });
  }

  if (method === "DELETE") {
    await db.delete(bugs).where(eq(bugs.id, body.id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
});

function toBug(r: typeof bugs.$inferSelect) {
  return {
    id: r.id,
    moduleId: r.moduleId,
    name: r.name,
    description: r.description,
    status: r.status,
    appearedAt: r.appearedAt,
    createdAt: r.createdAt,
    order: r.order,
  };
}