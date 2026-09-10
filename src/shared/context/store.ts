import { createContext, useContext } from "react";
import type { AppState, Bug, Module, Project, SubTask, SubTest, Task, Test } from "@/shared/types";

export type ProjectInput = Omit<Project, "id" | "createdAt" | "order">;
export type ModuleInput = Omit<Module, "id" | "createdAt" | "order">;
export type TaskInput = Omit<Task, "id" | "createdAt" | "order" | "subtasks">;
export type TestInput = Omit<Test, "id" | "createdAt" | "order" | "subtests">;
export type BugInput = Omit<Bug, "id" | "createdAt" | "order">;

export type StoreContextValue = AppState & {
  resetData: () => void;

  createProject: (data: ProjectInput) => void;
  updateProject: (id: string, data: Partial<ProjectInput>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (activeId: string, overId: string) => void;

  createModule: (data: ModuleInput) => void;
  updateModule: (id: string, data: Partial<ModuleInput>) => void;
  deleteModule: (id: string) => void;
  advanceModule: (id: string) => void;
  reorderModules: (activeId: string, overId: string) => void;

  createTask: (data: TaskInput) => void;
  updateTask: (id: string, data: Partial<Pick<Task, "name" | "status">>) => void;
  deleteTask: (id: string) => void;
  advanceTask: (id: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;

  addSubTask: (taskId: string, name: string) => void;
  updateSubTask: (taskId: string, subtaskId: string, data: Partial<Omit<SubTask, "id" | "order">>) => void;
  deleteSubTask: (taskId: string, subtaskId: string) => void;

  createTest: (data: TestInput) => void;
  updateTest: (id: string, data: Partial<TestInput>) => void;
  deleteTest: (id: string) => void;
  advanceTest: (id: string) => void;
  reorderTests: (activeId: string, overId: string) => void;

  addSubTest: (testId: string, name: string) => void;
  updateSubTest: (testId: string, subtestId: string, data: Partial<Omit<SubTest, "id" | "order">>) => void;
  deleteSubTest: (testId: string, subtestId: string) => void;

  createBug: (data: BugInput) => void;
  updateBug: (id: string, data: Partial<BugInput>) => void;
  deleteBug: (id: string) => void;
  reorderBugs: (activeId: string, overId: string) => void;
};

export const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}