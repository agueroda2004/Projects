import { db } from "../lib/db";
import { bugs, modules, projects, subtasks, subtests, tasks, tests } from "../db/schema";

export const config = { runtime: "edge" };

export default async function GET() {
  const [projectRows, moduleRows, taskRows, subtaskRows, testRows, subtestRows, bugRows] =
    await Promise.all([
      db.select().from(projects),
      db.select().from(modules),
      db.select().from(tasks),
      db.select().from(subtasks),
      db.select().from(tests),
      db.select().from(subtests),
      db.select().from(bugs),
    ]);

  const state = {
    projects: projectRows.map(toProject),
    modules: moduleRows.map(toModule),
    tasks: taskRows.map((r) => ({
      ...toTask(r),
      subtasks: subtaskRows.filter((s) => s.taskId === r.id).map((s) => ({
        id: s.id,
        name: s.name,
        done: s.done,
        order: s.order,
      })),
    })),
    tests: testRows.map((r) => ({
      ...toTest(r),
      subtests: subtestRows.filter((s) => s.testId === r.id).map((s) => ({
        id: s.id,
        name: s.name,
        notes: s.notes,
        status: s.status,
        order: s.order,
      })),
    })),
    bugs: bugRows.map(toBug),
  };

  return Response.json(state);
}

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

function toBug(r: typeof bugs.$inferSelect) {
  return {
    id: r.id,
    moduleId: r.moduleId,
    name: r.name,
    description: r.description,
    status: r.status,
    appearedAt: r.appearedAt,
    createdAt: r.createdAt.toISOString(),
    order: r.order,
  };
}