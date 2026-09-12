import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { withErrors } from "../lib/http";
import { modules } from "../db/schema";

export const config = { runtime: "edge" };

export default withErrors(async function handler(req: Request) {
  const { method } = req;

  if (method === "POST") {
    const body = await req.json();
    const row = await db.insert(modules).values(body).returning();
    return Response.json(toModule(row[0]), { status: 201 });
  }

  if (method === "PATCH") {
    const { id, ...data } = await req.json();
    const row = await db.update(modules).set(data).where(eq(modules.id, id)).returning();
    if (!row[0]) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(toModule(row[0]));
  }

  if (method === "PUT") {
    const body = await req.json();
    for (const item of body.items ?? []) {
      await db.update(modules).set({ order: item.order }).where(eq(modules.id, item.id));
    }
    return Response.json({ ok: true });
  }

  if (method === "DELETE") {
    const { id } = await req.json();
    await db.delete(modules).where(eq(modules.id, id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
});

function toModule(r: typeof modules.$inferSelect) {
  return {
    id: r.id,
    projectId: r.projectId,
    name: r.name,
    description: r.description,
    icon: r.icon,
    color: r.color,
    priority: r.priority,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    order: r.order,
  };
}