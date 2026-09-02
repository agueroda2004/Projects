import { ArrowRight, CheckCircle2, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { TASK_STATUSES } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import { useSortableItem } from "@/shared/hooks/useSortableItem";
import Badge from "@/shared/ui/Badge";
import type { Task } from "@/shared/types";

type Props = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TaskItem({ task, onEdit, onDelete }: Props) {
  const { advanceTask, addSubTask, updateSubTask, deleteSubTask } = useStore();
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableItem(task.id);
  const [newSub, setNewSub] = useState("");
  const status = TASK_STATUSES[task.status];
  const isDone = task.status === "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border-2 border-zinc-200 bg-white transition ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-zinc-300 transition hover:text-zinc-500 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span
          className={`flex-1 truncate text-sm font-semibold ${
            isDone ? "text-zinc-400 line-through" : "text-zinc-700"
          }`}
        >
          {task.name}
        </span>

        <Badge color={status.color} icon={status.icon} label={status.label} />

        {!isDone && (
          <button
            type="button"
            onClick={() => advanceTask(task.id)}
            title="Advance status"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-duo-green-light hover:text-duo-green"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onEdit}
          title="Edit task"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete task"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {task.subtasks.length > 0 && (
        <div className="space-y-1 border-t border-zinc-100 px-5 py-2">
          {task.subtasks.map((sub) => (
            <div key={sub.id} className="group flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => updateSubTask(task.id, sub.id, { done: !sub.done })}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  sub.done ? "border-duo-green bg-duo-green text-white" : "border-zinc-300 text-transparent hover:border-duo-green"
                }`}
                aria-label={sub.done ? "Mark as pending" : "Mark as done"}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
              <span
                className={`flex-1 text-xs font-medium transition ${
                  sub.done ? "text-zinc-400 line-through" : "text-zinc-600"
                }`}
              >
                {sub.name}
              </span>
              <button
                type="button"
                onClick={() => deleteSubTask(task.id, sub.id)}
                className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-300 transition hover:bg-zinc-100 hover:text-red-500 group-hover:flex"
                aria-label="Delete subtask"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-zinc-100 px-5 py-2">
        <Plus className="h-4 w-4 shrink-0 text-zinc-300" />
        <input
          value={newSub}
          onChange={(e) => setNewSub(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newSub.trim()) {
              addSubTask(task.id, newSub.trim());
              setNewSub("");
            }
          }}
          placeholder="Add a subtask..."
          className="flex-1 bg-transparent text-xs font-medium text-zinc-600 outline-none placeholder:text-zinc-400"
        />
      </div>
    </div>
  );
}