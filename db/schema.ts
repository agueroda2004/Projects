import {
  boolean,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const pm = pgSchema("pm");

export const projects = pm.table(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull().default("Folder"),
    color: text("color").notNull().default("#16a34a"),
    startDate: text("start_date").notNull().default(""),
    endDate: text("end_date").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    order: integer("order").notNull().default(0),
  },
  (t) => [unique("projects_name_unique").on(t.name)],
);

export const modules = pm.table(
  "modules",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull().default("Package"),
    color: text("color").notNull().default("#3b82f6"),
    priority: text("priority").notNull().default("medium"),
    status: text("status").notNull().default("planning"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("modules_project_idx").on(t.projectId)],
);

export const tasks = pm.table(
  "tasks",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("tasks_module_idx").on(t.moduleId)],
);

export const subtasks = pm.table(
  "subtasks",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    done: boolean("done").notNull().default(false),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("subtasks_task_idx").on(t.taskId)],
);

export const tests = pm.table(
  "tests",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("tests_module_idx").on(t.moduleId)],
);

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

export const bugs = pm.table(
  "bugs",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("open"),
    appearedAt: text("appeared_at").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("bugs_module_idx").on(t.moduleId)],
);