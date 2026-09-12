import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { withErrors } from "../lib/http";
import { subtests, tests } from "../db/schema";

export const config = { runtime: "edge" };

export default withErrors(async function handler(req: Request) {
  const { method } = req;
  const body = await req.json().catch(() => ({}));

  // ---- Sub-operations on subtests ----
  if (body.action === "addSubTest") {
    const row = await db
      .insert(subtests)
      .values({ id: body.subtestId, testId: body.testId, name: body.name, order: body.order })
      .returning();
    return Response.json(toSubTest(row[0]), { status: 201 });
  }

  if (body.action === "updateSubTest") {
    const { subtestId, ...data } = body;
    const row = await db.update(subtests).set(data).where(eq(subtests.id, subtestId)).returning();
    return Response.json(toSubTest(row[0]));
  }

  if (body.action === "deleteSubTest") {
    await db.delete(subtests).where(eq(subtests.id, body.subtestId));
    return Response.json({ ok: true });
  }

  if (body.action === "reorderSubTests") {
    for (const item of body.items ?? []) {
      await db.update(subtests).set({ order: item.order }).where(eq(subtests.id, item.id));
    }
    return Response.json({ ok: true });
  }

  // ---- Test CRUD ----
  if (method === "POST") {
    const testData = { ...body };
    delete testData.subtests;
    const row = await db.insert(tests).values(testData).returning();
    return Response.json(toTest(row[0]), { status: 201 });
  }

  if (method === "PATCH") {
    const { id, ...data } = body;
    const row = await db.update(tests).set(data).where(eq(tests.id, id)).returning();
    if (!row[0]) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(toTest(row[0]));
  }

  if (method === "PUT") {
    for (const item of body.items ?? []) {
      await db.update(tests).set({ order: item.order }).where(eq(tests.id, item.id));
    }
    return Response.json({ ok: true });
  }

  if (method === "DELETE") {
    await db.delete(tests).where(eq(tests.id, body.id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
});

function toTest(r: typeof tests.$inferSelect) {
  return {
    id: r.id,
    moduleId: r.moduleId,
    name: r.name,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    order: r.order,
  };
}

function toSubTest(r: typeof subtests.$inferSelect) {
  return {
    id: r.id,
    testId: r.testId,
    name: r.name,
    notes: r.notes,
    status: r.status,
    order: r.order,
  };
}