import { Bug, CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { BUG_STATUSES } from "@/shared/constants/statuses";
import { useSortableItem } from "@/shared/hooks/useSortableItem";
import Badge from "@/shared/ui/Badge";
import type { Bug as BugEntity } from "@/shared/types";
import { formatDate } from "@/shared/utils";

type Props = {
  bug: BugEntity;
  onEdit: () => void;
  onDelete: () => void;
};

export default function BugItem({ bug, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableItem(bug.id);
  const status = BUG_STATUSES[bug.status];
  const isClosed = bug.status === "closed";

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

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Bug className={`h-4 w-4 shrink-0 ${isClosed ? "text-duo-green" : "text-red-400"}`} />
            <span
              className={`truncate text-sm font-semibold ${
                isClosed ? "text-zinc-400 line-through" : "text-zinc-700"
              }`}
            >
              {bug.name}
            </span>
          </div>
          {bug.description && (
            <p className="mt-0.5 truncate pl-6 text-xs text-zinc-400">{bug.description}</p>
          )}
          <p className="mt-0.5 flex items-center gap-1 pl-6 text-[11px] font-medium text-zinc-400">
            <CalendarDays className="h-3 w-3" />
            Appeared {formatDate(bug.appearedAt)}
          </p>
        </div>

        <Badge color={status.color} icon={status.icon} label={status.label} />

        <button
          type="button"
          onClick={onEdit}
          title="Edit bug"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete bug"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}