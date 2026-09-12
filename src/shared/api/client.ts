import type {
  AppState,
  Bug,
  Module,
  Project,
  SubTask,
  SubTest,
  Task,
  Test,
} from "@/shared/types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `API error ${res.status}: ${res.statusText}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = `${message} - ${data.error}`;
    } catch {
      // ignore parse errors, keep status fallback
    }
    console.error(`[api] ${init?.method ?? "GET"} ${path}`, message);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getState: () => request<AppState>("/state"),

  createProject: (data: Project) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>("/projects", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteProject: (id: string) =>
    request<{ ok: true }>("/projects", { method: "DELETE", body: JSON.stringify({ id }) }),
  reorderProjects: (items: { id: string; order: number }[]) =>
    request<{ ok: true }>("/projects", { method: "PUT", body: JSON.stringify({ items }) }),

  createModule: (data: Module) =>
    request<Module>("/modules", { method: "POST", body: JSON.stringify(data) }),
  updateModule: (id: string, data: Partial<Module>) =>
    request<Module>("/modules", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteModule: (id: string) =>
    request<{ ok: true }>("/modules", { method: "DELETE", body: JSON.stringify({ id }) }),
  reorderModules: (items: { id: string; order: number }[]) =>
    request<{ ok: true }>("/modules", { method: "PUT", body: JSON.stringify({ items }) }),

  createTask: (data: Task) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) =>
    request<Task>("/tasks", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteTask: (id: string) =>
    request<{ ok: true }>("/tasks", { method: "DELETE", body: JSON.stringify({ id }) }),
  reorderTasks: (items: { id: string; order: number }[]) =>
    request<{ ok: true }>("/tasks", { method: "PUT", body: JSON.stringify({ items }) }),

  addSubTask: (taskId: string, subtaskId: string, name: string, order: number) =>
    request<SubTask>("/tasks", {
      method: "POST",
      body: JSON.stringify({ action: "addSubTask", taskId, subtaskId, name, order }),
    }),
  updateSubTask: (subtaskId: string, data: Partial<SubTask>) =>
    request<SubTask>("/tasks", {
      method: "POST",
      body: JSON.stringify({ action: "updateSubTask", subtaskId, ...data }),
    }),
  deleteSubTask: (subtaskId: string) =>
    request<{ ok: true }>("/tasks", {
      method: "POST",
      body: JSON.stringify({ action: "deleteSubTask", subtaskId }),
    }),

  createTest: (data: Test) =>
    request<Test>("/tests", { method: "POST", body: JSON.stringify(data) }),
  updateTest: (id: string, data: Partial<Test>) =>
    request<Test>("/tests", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteTest: (id: string) =>
    request<{ ok: true }>("/tests", { method: "DELETE", body: JSON.stringify({ id }) }),
  reorderTests: (items: { id: string; order: number }[]) =>
    request<{ ok: true }>("/tests", { method: "PUT", body: JSON.stringify({ items }) }),

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

  createBug: (data: Bug) =>
    request<Bug>("/bugs", { method: "POST", body: JSON.stringify(data) }),
  updateBug: (id: string, data: Partial<Bug>) =>
    request<Bug>("/bugs", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteBug: (id: string) =>
    request<{ ok: true }>("/bugs", { method: "DELETE", body: JSON.stringify({ id }) }),
  reorderBugs: (items: { id: string; order: number }[]) =>
    request<{ ok: true }>("/bugs", { method: "PUT", body: JSON.stringify({ items }) }),
};