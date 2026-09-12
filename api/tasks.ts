import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { subtasks, tasks } from "../db/schema";

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const { method } = req;
  const body = await req.json().catch(() => ({}));

  // ---- Sub-operations on subtasks ----
  if (body.action === "addSubTask") {
    const row = await db
      .insert(subtasks)
      .values({ id: body.subtaskId, taskId: body.taskId, name: body.name, order: body.order })
      .returning();
    return Response.json(toSubTask(row[0]), { status: 201 });
  }

  if (body.action === "updateSubTask") {
    const { subtaskId, ...data } = body;
    const row = await db.update(subtasks).set(data).where(eq(subtasks.id, subtaskId)).returning();
    return Response.json(toSubTask(row[0]));
  }

  if (body.action === "deleteSubTask") {
    await db.delete(subtasks).where(eq(subtasks.id, body.subtaskId));
    return Response.json({ ok: true });
  }

  if (body.action === "reorderSubTasks") {
    await db.transaction(async (tx) => {
      for (const item of body.items ?? []) {
        await tx.update(subtasks).set({ order: item.order }).where(eq(subtasks.id, item.id));
      }
    });
    return Response.json({ ok: true });
  }

  // ---- Task CRUD ----
  if (method === "POST") {
    const taskData = { ...body };
    delete taskData.subtasks;
    const row = await db.insert(tasks).values(taskData).returning();
    return Response.json(toTask(row[0]), { status: 201 });
  }

  if (method === "PATCH") {
    const { id, ...data } = body;
    const row = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    if (!row[0]) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(toTask(row[0]));
  }

  if (method === "PUT") {
    await db.transaction(async (tx) => {
      for (const item of body.items ?? []) {
        await tx.update(tasks).set({ order: item.order }).where(eq(tasks.id, item.id));
      }
    });
    return Response.json({ ok: true });
  }

  if (method === "DELETE") {
    await db.delete(tasks).where(eq(tasks.id, body.id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}

function toTask(r: typeof tasks.$inferSelect) {
  return {
    id: r.id,
    moduleId: r.moduleId,
    name: r.name,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    order: r.order,
  };
}

function toSubTask(r: typeof subtasks.$inferSelect) {
  return {
    id: r.id,
    taskId: r.taskId,
    name: r.name,
    done: r.done,
    order: r.order,
  };
}