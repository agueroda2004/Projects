import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppState, ModuleStatus, TaskStatus, TestStatus } from "@/shared/types";
import { arrayMove, uid } from "@/shared/utils";
import { buildSeed } from "./seed";
import { StoreContext, type StoreContextValue } from "./store";

const STORAGE_KEY = "pm-app-state-v1";

const MODULE_STATUS_ORDER: ModuleStatus[] = ["planning", "development", "testing", "production"];
const TASK_STATUS_ORDER: TaskStatus[] = ["pending", "working", "done"];
const TEST_STATUS_ORDER: TestStatus[] = ["pending", "failed", "passed"];

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.projects)) return parsed;
    }
  } catch {
    // ignore corrupted storage
  }
  return buildSeed();
}

function nextInOrder<T extends string>(order: readonly T[], current: T): T {
  const idx = order.indexOf(current);
  if (idx === -1 || idx >= order.length - 1) return current;
  return order[idx + 1];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable
    }
  }, [state]);

  const value = useMemo<StoreContextValue>(() => {
    const reorderById = <T extends { id: string; order: number }>(list: T[], activeId: string, overId: string): T[] => {
      const from = list.findIndex((item) => item.id === activeId);
      const to = list.findIndex((item) => item.id === overId);
      if (from === -1 || to === -1 || from === to) return list;
      return arrayMove(list, from, to).map((item, index) => ({ ...item, order: index }));
    };

    return {
      ...state,

      resetData: () => setState(buildSeed()),

      createProject: (data) =>
        setState((prev) => ({
          ...prev,
          projects: [...prev.projects, { ...data, id: uid(), createdAt: new Date().toISOString(), order: prev.projects.length }],
        })),

      updateProject: (id, data) =>
        setState((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      deleteProject: (id) =>
        setState((prev) => {
          const moduleIds = prev.modules.filter((m) => m.projectId === id).map((m) => m.id);
          return {
            ...prev,
            projects: prev.projects.filter((p) => p.id !== id),
            modules: prev.modules.filter((m) => m.projectId !== id),
            tasks: prev.tasks.filter((t) => !moduleIds.includes(t.moduleId)),
            tests: prev.tests.filter((t) => !moduleIds.includes(t.moduleId)),
            bugs: prev.bugs.filter((b) => !moduleIds.includes(b.moduleId)),
          };
        }),

      reorderProjects: (activeId, overId) =>
        setState((prev) => ({
          ...prev,
          projects: reorderById(prev.projects, activeId, overId),
        })),

      createModule: (data) =>
        setState((prev) => {
          const siblings = prev.modules.filter((m) => m.projectId === data.projectId);
          return {
            ...prev,
            modules: [...prev.modules, { ...data, id: uid(), createdAt: new Date().toISOString(), order: siblings.length }],
          };
        }),

      updateModule: (id, data) =>
        setState((prev) => ({
          ...prev,
          modules: prev.modules.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteModule: (id) =>
        setState((prev) => ({
          ...prev,
          modules: prev.modules.filter((m) => m.id !== id),
          tasks: prev.tasks.filter((t) => t.moduleId !== id),
          tests: prev.tests.filter((t) => t.moduleId !== id),
          bugs: prev.bugs.filter((b) => b.moduleId !== id),
        })),

      advanceModule: (id) =>
        setState((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === id ? { ...m, status: nextInOrder(MODULE_STATUS_ORDER, m.status) } : m,
          ),
        })),

      reorderModules: (activeId, overId) =>
        setState((prev) => ({
          ...prev,
          modules: reorderById(prev.modules, activeId, overId),
        })),

      createTask: (data) =>
        setState((prev) => {
          const siblings = prev.tasks.filter((t) => t.moduleId === data.moduleId);
          return {
            ...prev,
            tasks: [...prev.tasks, { ...data, id: uid(), subtasks: [], createdAt: new Date().toISOString(), order: siblings.length }],
          };
        }),

      updateTask: (id, data) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTask: (id) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== id),
        })),

      advanceTask: (id) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === id ? { ...t, status: nextInOrder(TASK_STATUS_ORDER, t.status) } : t,
          ),
        })),

      reorderTasks: (activeId, overId) =>
        setState((prev) => ({
          ...prev,
          tasks: reorderById(prev.tasks, activeId, overId),
        })),

      addSubTask: (taskId, name) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, { id: uid(), name, done: false, order: t.subtasks.length }] }
              : t,
          ),
        })),

      updateSubTask: (taskId, subtaskId, data) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...data } : s)) }
              : t,
          ),
        })),

      deleteSubTask: (taskId, subtaskId) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t,
          ),
        })),

      createTest: (data) =>
        setState((prev) => {
          const siblings = prev.tests.filter((t) => t.moduleId === data.moduleId);
          return {
            ...prev,
            tests: [...prev.tests, { ...data, id: uid(), createdAt: new Date().toISOString(), order: siblings.length }],
          };
        }),

      updateTest: (id, data) =>
        setState((prev) => ({
          ...prev,
          tests: prev.tests.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTest: (id) =>
        setState((prev) => ({
          ...prev,
          tests: prev.tests.filter((t) => t.id !== id),
        })),

      advanceTest: (id) =>
        setState((prev) => ({
          ...prev,
          tests: prev.tests.map((t) =>
            t.id === id ? { ...t, status: nextInOrder(TEST_STATUS_ORDER, t.status) } : t,
          ),
        })),

      reorderTests: (activeId, overId) =>
        setState((prev) => ({
          ...prev,
          tests: reorderById(prev.tests, activeId, overId),
        })),

      createBug: (data) =>
        setState((prev) => {
          const siblings = prev.bugs.filter((b) => b.moduleId === data.moduleId);
          return {
            ...prev,
            bugs: [...prev.bugs, { ...data, id: uid(), createdAt: new Date().toISOString(), order: siblings.length }],
          };
        }),

      updateBug: (id, data) =>
        setState((prev) => ({
          ...prev,
          bugs: prev.bugs.map((b) => (b.id === id ? { ...b, ...data } : b)),
        })),

      deleteBug: (id) =>
        setState((prev) => ({
          ...prev,
          bugs: prev.bugs.filter((b) => b.id !== id),
        })),

      reorderBugs: (activeId, overId) =>
        setState((prev) => ({
          ...prev,
          bugs: reorderById(prev.bugs, activeId, overId),
        })),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}