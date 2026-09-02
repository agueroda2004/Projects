import type {
  BugStatus,
  ModuleStatus,
  Priority,
  StatusConfig,
  TaskStatus,
  TestStatus,
} from "@/shared/types";

export const PRIORITIES: Record<Priority, StatusConfig> = {
  low: { value: "low", label: "Low", color: "#71717a", icon: "Circle" },
  medium: { value: "medium", label: "Medium", color: "#3b82f6", icon: "Flag" },
  high: { value: "high", label: "High", color: "#f97316", icon: "AlertTriangle" },
  urgent: { value: "urgent", label: "Urgent", color: "#ef4444", icon: "Zap" },
};

export const PRIORITY_LIST = [PRIORITIES.low, PRIORITIES.medium, PRIORITIES.high, PRIORITIES.urgent];

export const MODULE_STATUSES: Record<ModuleStatus, StatusConfig> = {
  planning: { value: "planning", label: "Planning", color: "#71717a", icon: "Clock" },
  development: { value: "development", label: "Development", color: "#3b82f6", icon: "Package" },
  testing: { value: "testing", label: "Testing", color: "#f59e0b", icon: "Search" },
  production: { value: "production", label: "Production", color: "#22c55e", icon: "CheckCircle2" },
};

export const MODULE_STATUS_LIST = [
  MODULE_STATUSES.planning,
  MODULE_STATUSES.development,
  MODULE_STATUSES.testing,
  MODULE_STATUSES.production,
];

export const TASK_STATUSES: Record<TaskStatus, StatusConfig> = {
  pending: { value: "pending", label: "Pending", color: "#71717a", icon: "Circle" },
  working: { value: "working", label: "Working", color: "#3b82f6", icon: "Clock" },
  done: { value: "done", label: "Done", color: "#22c55e", icon: "CheckCircle2" },
};

export const TASK_STATUS_LIST = [TASK_STATUSES.pending, TASK_STATUSES.working, TASK_STATUSES.done];

export const TEST_STATUSES: Record<TestStatus, StatusConfig> = {
  pending: { value: "pending", label: "Pending", color: "#71717a", icon: "Circle" },
  failed: { value: "failed", label: "Failed", color: "#ef4444", icon: "AlertTriangle" },
  passed: { value: "passed", label: "Passed", color: "#22c55e", icon: "CheckCircle2" },
};

export const TEST_STATUS_LIST = [TEST_STATUSES.pending, TEST_STATUSES.failed, TEST_STATUSES.passed];

export const BUG_STATUSES: Record<BugStatus, StatusConfig> = {
  open: { value: "open", label: "Open", color: "#ef4444", icon: "AlertTriangle" },
  fixing: { value: "fixing", label: "Fixing", color: "#f97316", icon: "Wrench" },
  closed: { value: "closed", label: "Closed", color: "#22c55e", icon: "CheckCircle2" },
};

export const BUG_STATUS_LIST = [BUG_STATUSES.open, BUG_STATUSES.fixing, BUG_STATUSES.closed];

export const STATUS_LABELS: Record<string, string> = {
  ...Object.fromEntries(PRIORITY_LIST.map((s) => [s.value, s.label])),
  ...Object.fromEntries(MODULE_STATUS_LIST.map((s) => [s.value, s.label])),
  ...Object.fromEntries(TASK_STATUS_LIST.map((s) => [s.value, s.label])),
  ...Object.fromEntries(TEST_STATUS_LIST.map((s) => [s.value, s.label])),
  ...Object.fromEntries(BUG_STATUS_LIST.map((s) => [s.value, s.label])),
};