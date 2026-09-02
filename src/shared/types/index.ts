export type Priority = "low" | "medium" | "high" | "urgent";

export type ModuleStatus = "planning" | "development" | "testing" | "production";

export type TaskStatus = "pending" | "working" | "done";

export type TestStatus = "pending" | "failed" | "passed";

export type BugStatus = "open" | "fixing" | "closed";

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  order: number;
}

export interface SubTask {
  id: string;
  name: string;
  done: boolean;
  order: number;
}

export interface Module {
  id: string;
  projectId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  priority: Priority;
  status: ModuleStatus;
  createdAt: string;
  order: number;
}

export interface Task {
  id: string;
  moduleId: string;
  name: string;
  status: TaskStatus;
  subtasks: SubTask[];
  createdAt: string;
  order: number;
}

export interface Test {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  status: TestStatus;
  createdAt: string;
  order: number;
}

export interface Bug {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  status: BugStatus;
  appearedAt: string;
  createdAt: string;
  order: number;
}

export interface AppState {
  projects: Project[];
  modules: Module[];
  tasks: Task[];
  tests: Test[];
  bugs: Bug[];
}

export type StatusConfig = {
  value: string;
  label: string;
  color: string;
  icon: string;
};
