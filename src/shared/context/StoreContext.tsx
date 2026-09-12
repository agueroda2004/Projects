import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AppState,
  ModuleStatus,
  TaskStatus,
  TestStatus,
} from "@/shared/types";
import { arrayMove, uid } from "@/shared/utils";
import { api } from "@/shared/api/client";
import { StoreContext, type StoreContextValue } from "./store";

const MODULE_STATUS_ORDER: ModuleStatus[] = ["planning", "development", "testing", "production"];
const TASK_STATUS_ORDER: TaskStatus[] = ["pending", "working", "done"];
const TEST_STATUS_ORDER: TestStatus[] = ["pending", "failed", "passed"];

function nextInOrder<T extends string>(order: readonly T[], current: T): T {
  const idx = order.indexOf(current);
  if (idx === -1 || idx >= order.length - 1) return current;
  return order[idx + 1];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ projects: [], modules: [], tasks: [], tests: [], bugs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getState()
      .then((data) => {
        if (!cancelled) {
          setState({
            projects: data.projects ?? [],
            modules: data.modules ?? [],
            tasks: (data.tasks ?? []).map((t) => ({ ...t, subtasks: t.subtasks ?? [] })),
            tests: (data.tests ?? []).map((t) => ({ ...t, subtests: t.subtests ?? [] })),
            bugs: data.bugs ?? [],
          });
        }
      })
      .catch(() => {
        // Keep empty state on failure; UI will show empty states.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const reorderById = <T extends { id: string; order: number }>(list: T[], activeId: string, overId: string): T[] => {
      const from = list.findIndex((item) => item.id === activeId);
      const to = list.findIndex((item) => item.id === overId);
      if (from === -1 || to === -1 || from === to) return list;
      return arrayMove(list, from, to).map((item, index) => ({ ...item, order: index }));
    };

    const patchTask = (taskId: string, updater: (t: NonNullable<AppState["tasks"][number]>) => NonNullable<AppState["tasks"][number]>) =>
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? updater(t) : t)),
      }));

    const patchTest = (testId: string, updater: (t: NonNullable<AppState["tests"][number]>) => NonNullable<AppState["tests"][number]>) =>
      setState((prev) => ({
        ...prev,
        tests: prev.tests.map((t) => (t.id === testId ? updater(t) : t)),
      }));

    return {
      ...state,
      loading,

      resetData: () => {
        setLoading(true);
        api
          .getState()
          .then((data) => setState(data))
          .finally(() => setLoading(false));
      },

      createProject: (data) => {
        const id = uid();
        const createdAt = new Date().toISOString();
        const order = state.projects.length;
        setState((prev) => ({ ...prev, projects: [...prev.projects, { ...data, id, createdAt, order }] }));
        api.createProject({ ...data, id, createdAt, order }).catch(() => {});
      },

      updateProject: (id, data) => {
        setState((prev) => ({ ...prev, projects: prev.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
        api.updateProject(id, data).catch(() => {});
      },

      deleteProject: (id) => {
        const moduleIds = state.modules.filter((m) => m.projectId === id).map((m) => m.id);
        setState((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
          modules: prev.modules.filter((m) => m.projectId !== id),
          tasks: prev.tasks.filter((t) => !moduleIds.includes(t.moduleId)),
          tests: prev.tests.filter((t) => !moduleIds.includes(t.moduleId)),
          bugs: prev.bugs.filter((b) => !moduleIds.includes(b.moduleId)),
        }));
        api.deleteProject(id).catch(() => {});
      },

      reorderProjects: (activeId, overId) => {
        const next = reorderById(state.projects, activeId, overId);
        if (next === state.projects) return;
        setState((prev) => ({ ...prev, projects: next }));
        api.reorderProjects(next.map((p) => ({ id: p.id, order: p.order }))).catch(() => {});
      },

      createModule: (data) => {
        const id = uid();
        const createdAt = new Date().toISOString();
        const order = state.modules.filter((m) => m.projectId === data.projectId).length;
        setState((prev) => ({ ...prev, modules: [...prev.modules, { ...data, id, createdAt, order }] }));
        api.createModule({ ...data, id, createdAt, order }).catch(() => {});
      },

      updateModule: (id, data) => {
        setState((prev) => ({ ...prev, modules: prev.modules.map((m) => (m.id === id ? { ...m, ...data } : m)) }));
        api.updateModule(id, data).catch(() => {});
      },

      deleteModule: (id) => {
        setState((prev) => ({
          ...prev,
          modules: prev.modules.filter((m) => m.id !== id),
          tasks: prev.tasks.filter((t) => t.moduleId !== id),
          tests: prev.tests.filter((t) => t.moduleId !== id),
          bugs: prev.bugs.filter((b) => b.moduleId !== id),
        }));
        api.deleteModule(id).catch(() => {});
      },

      advanceModule: (id) => {
        setState((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === id ? { ...m, status: nextInOrder(MODULE_STATUS_ORDER, m.status) } : m,
          ),
        }));
        const module = state.modules.find((m) => m.id === id);
        if (module) api.updateModule(id, { status: nextInOrder(MODULE_STATUS_ORDER, module.status) }).catch(() => {});
      },

      reorderModules: (activeId, overId) => {
        const next = reorderById(state.modules, activeId, overId);
        if (next === state.modules) return;
        setState((prev) => ({ ...prev, modules: next }));
        api.reorderModules(next.map((m) => ({ id: m.id, order: m.order }))).catch(() => {});
      },

      createTask: (data) => {
        const id = uid();
        const createdAt = new Date().toISOString();
        const order = state.tasks.filter((t) => t.moduleId === data.moduleId).length;
        setState((prev) => ({ ...prev, tasks: [...prev.tasks, { ...data, id, subtasks: [], createdAt, order }] }));
        api.createTask({ ...data, id, subtasks: [], createdAt, order }).catch(() => {});
      },

      updateTask: (id, data) => {
        setState((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
        api.updateTask(id, data).catch(() => {});
      },

      deleteTask: (id) => {
        setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
        api.deleteTask(id).catch(() => {});
      },

      advanceTask: (id) => {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === id ? { ...t, status: nextInOrder(TASK_STATUS_ORDER, t.status) } : t,
          ),
        }));
        const task = state.tasks.find((t) => t.id === id);
        if (task) api.updateTask(id, { status: nextInOrder(TASK_STATUS_ORDER, task.status) }).catch(() => {});
      },

      reorderTasks: (activeId, overId) => {
        const next = reorderById(state.tasks, activeId, overId);
        if (next === state.tasks) return;
        setState((prev) => ({ ...prev, tasks: next }));
        api.reorderTasks(next.map((t) => ({ id: t.id, order: t.order }))).catch(() => {});
      },

      addSubTask: (taskId, name) => {
        const subtaskId = uid();
        const order = state.tasks.find((t) => t.id === taskId)?.subtasks.length ?? 0;
        patchTask(taskId, (t) => ({ ...t, subtasks: [...t.subtasks, { id: subtaskId, name, done: false, order }] }));
        api.addSubTask(taskId, subtaskId, name, order).catch(() => {});
      },

      updateSubTask: (taskId, subtaskId, data) => {
        patchTask(taskId, (t) => ({
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...data } : s)),
        }));
        api.updateSubTask(subtaskId, data).catch(() => {});
      },

      deleteSubTask: (taskId, subtaskId) => {
        patchTask(taskId, (t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }));
        api.deleteSubTask(subtaskId).catch(() => {});
      },

      createTest: (data) => {
        const id = uid();
        const createdAt = new Date().toISOString();
        const order = state.tests.filter((t) => t.moduleId === data.moduleId).length;
        setState((prev) => ({ ...prev, tests: [...prev.tests, { ...data, id, subtests: [], createdAt, order }] }));
        api.createTest({ ...data, id, subtests: [], createdAt, order }).catch(() => {});
      },

      updateTest: (id, data) => {
        setState((prev) => ({ ...prev, tests: prev.tests.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
        api.updateTest(id, data).catch(() => {});
      },

      deleteTest: (id) => {
        setState((prev) => ({ ...prev, tests: prev.tests.filter((t) => t.id !== id) }));
        api.deleteTest(id).catch(() => {});
      },

      advanceTest: (id) => {
        setState((prev) => ({
          ...prev,
          tests: prev.tests.map((t) =>
            t.id === id ? { ...t, status: nextInOrder(TEST_STATUS_ORDER, t.status) } : t,
          ),
        }));
        const test = state.tests.find((t) => t.id === id);
        if (test) api.updateTest(id, { status: nextInOrder(TEST_STATUS_ORDER, test.status) }).catch(() => {});
      },

      reorderTests: (activeId, overId) => {
        const next = reorderById(state.tests, activeId, overId);
        if (next === state.tests) return;
        setState((prev) => ({ ...prev, tests: next }));
        api.reorderTests(next.map((t) => ({ id: t.id, order: t.order }))).catch(() => {});
      },

      addSubTest: (testId, name) => {
        const subtestId = uid();
        const order = state.tests.find((t) => t.id === testId)?.subtests.length ?? 0;
        patchTest(testId, (t) => ({
          ...t,
          subtests: [...t.subtests, { id: subtestId, name, notes: "", status: "pending", order }],
        }));
        api.addSubTest(testId, subtestId, name, order).catch(() => {});
      },

      updateSubTest: (testId, subtestId, data) => {
        patchTest(testId, (t) => ({
          ...t,
          subtests: t.subtests.map((s) => (s.id === subtestId ? { ...s, ...data } : s)),
        }));
        api.updateSubTest(subtestId, data).catch(() => {});
      },

      deleteSubTest: (testId, subtestId) => {
        patchTest(testId, (t) => ({ ...t, subtests: t.subtests.filter((s) => s.id !== subtestId) }));
        api.deleteSubTest(subtestId).catch(() => {});
      },

      createBug: (data) => {
        const id = uid();
        const createdAt = new Date().toISOString();
        const order = state.bugs.filter((b) => b.moduleId === data.moduleId).length;
        setState((prev) => ({ ...prev, bugs: [...prev.bugs, { ...data, id, createdAt, order }] }));
        api.createBug({ ...data, id, createdAt, order }).catch(() => {});
      },

      updateBug: (id, data) => {
        setState((prev) => ({ ...prev, bugs: prev.bugs.map((b) => (b.id === id ? { ...b, ...data } : b)) }));
        api.updateBug(id, data).catch(() => {});
      },

      deleteBug: (id) => {
        setState((prev) => ({ ...prev, bugs: prev.bugs.filter((b) => b.id !== id) }));
        api.deleteBug(id).catch(() => {});
      },

      reorderBugs: (activeId, overId) => {
        const next = reorderById(state.bugs, activeId, overId);
        if (next === state.bugs) return;
        setState((prev) => ({ ...prev, bugs: next }));
        api.reorderBugs(next.map((b) => ({ id: b.id, order: b.order }))).catch(() => {});
      },
    };
  }, [state, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm font-semibold text-zinc-400">Loading…</p>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}