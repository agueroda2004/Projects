import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ListTodo, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TASK_STATUS_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import Dropdown from "@/shared/ui/Dropdown";
import EmptyState from "@/shared/ui/EmptyState";
import { Input } from "@/shared/ui/Input";
import { showToast } from "@/shared/ui/toast";
import Toggle from "@/shared/ui/Toggle";
import type { Task } from "@/shared/types";
import TaskFormModal from "./TaskFormModal";
import TaskItem from "./TaskItem";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...TASK_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon })),
];

export default function TasksSection({ moduleId }: { moduleId: string }) {
  const { tasks, reorderTasks, deleteTask } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [hideDone, setHideDone] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const moduleTasks = useMemo(
    () => tasks.filter((t) => t.moduleId === moduleId).sort((a, b) => a.order - b.order),
    [tasks, moduleId],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return moduleTasks.filter((t) => {
      const matchName = t.name.toLowerCase().includes(query);
      const matchStatus = !status || t.status === status;
      const matchHide = !hideDone || t.status !== "done";
      return matchName && matchStatus && matchHide;
    });
  }, [moduleTasks, search, status, hideDone]);

  const hasFilters = search.trim() !== "" || status !== "" || !hideDone;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-duo-green-light text-duo-green">
            <ListTodo className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-zinc-700">Tasks</h4>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500">
            {moduleTasks.length}
          </span>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="h-9 px-4 text-xs"
        >
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="h-9 pl-9 text-xs"
          />
        </div>
        <Dropdown
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          placeholder="Status"
          className="w-40"
        />
        <Toggle checked={hideDone} onChange={setHideDone} label="Hide done" description="Completed tasks are hidden by default" />
        {hasFilters && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setHideDone(true);
            }}
            className="h-9 px-3 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={hasFilters ? "No tasks match your filters" : "No tasks yet"}
          description={hasFilters ? "Try adjusting the filters." : "Create your first task for this module."}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => {
                    setEditing(task);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(task)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TaskFormModal
        key={formOpen ? (editing?.id ?? "new") : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        moduleId={moduleId}
        task={editing}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete task"
        message={`Are you sure you want to delete "${deleting?.name}"? This will also remove all of its subtasks.`}
        onConfirm={() => {
          if (deleting) {
            deleteTask(deleting.id);
            showToast("success", "Task deleted");
          }
        }}
      />
    </div>
  );
}