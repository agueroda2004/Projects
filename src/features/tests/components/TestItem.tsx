import { ArrowRight, FileCheck2, GripVertical, Pencil, Trash2 } from "lucide-react";
import { TEST_STATUSES } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import { useSortableItem } from "@/shared/hooks/useSortableItem";
import Badge from "@/shared/ui/Badge";
import type { Test } from "@/shared/types";

type Props = {
  test: Test;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TestItem({ test, onEdit, onDelete }: Props) {
  const { advanceTest } = useStore();
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableItem(test.id);
  const status = TEST_STATUSES[test.status];
  const isPassed = test.status === "passed";

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
            <FileCheck2 className={`h-4 w-4 shrink-0 ${isPassed ? "text-duo-green" : "text-zinc-300"}`} />
            <span
              className={`truncate text-sm font-semibold ${
                isPassed ? "text-zinc-400 line-through" : "text-zinc-700"
              }`}
            >
              {test.name}
            </span>
          </div>
          {test.description && (
            <p className="mt-0.5 truncate pl-6 text-xs text-zinc-400">{test.description}</p>
          )}
        </div>

        <Badge color={status.color} icon={status.icon} label={status.label} />

        {!isPassed && (
          <button
            type="button"
            onClick={() => advanceTest(test.id)}
            title="Advance status"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-duo-green-light hover:text-duo-green"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onEdit}
          title="Edit test"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete test"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}