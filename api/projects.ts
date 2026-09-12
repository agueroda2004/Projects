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
    description: r.description,
    icon: r.icon,
    color: r.color,
    startDate: r.startDate,
    endDate: r.endDate,
    createdAt: r.createdAt.toISOString(),
    order: r.order,
  };
}