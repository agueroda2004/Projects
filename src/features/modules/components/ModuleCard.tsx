import { ArrowRight, ChevronDown, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { MODULE_STATUSES, PRIORITIES } from "@/shared/constants/statuses";
import { DynamicIcon } from "@/shared/constants/icons";
import { useStore } from "@/shared/context/store";
import { useSortableItem } from "@/shared/hooks/useSortableItem";
import Badge from "@/shared/ui/Badge";
import type { Module } from "@/shared/types";
import BugsSection from "@/features/bugs/components/BugsSection";
import TasksSection from "@/features/tasks/components/TasksSection";
import TestsSection from "@/features/tests/components/TestsSection";

type Props = {
  module: Module;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ModuleCard({ module, onEdit, onDelete }: Props) {
  const { advanceModule } = useStore();
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableItem(module.id);
  const [expanded, setExpanded] = useState(false);

  const priority = PRIORITIES[module.priority];
  const status = MODULE_STATUSES[module.status];
  const isProduction = module.status === "production";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border-2 border-zinc-200 bg-white shadow-sm transition ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div
        className="flex items-center gap-2 p-4"
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((e) => !e);
          }
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-zinc-300 transition hover:text-zinc-500 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((x) => !x);
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-label={expanded ? "Collapse module" : "Expand module"}
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: module.color }}
        >
          <DynamicIcon name={module.icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-zinc-800">{module.name}</h3>
          <p className="truncate text-xs text-zinc-400">{module.description || "No description"}</p>
        </div>

        <div className="hidden shrink-0 flex-wrap items-center gap-1.5 sm:flex">
          <Badge color={priority.color} icon={priority.icon} label={priority.label} />
          <Badge color={status.color} icon={status.icon} label={status.label} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!isProduction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                advanceModule(module.id);
              }}
              title="Advance status"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-duo-green-light hover:text-duo-green"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit module"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete module"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-6 border-t border-zinc-100 bg-zinc-50/50 px-4 py-4">
          <TasksSection moduleId={module.id} />
          <TestsSection moduleId={module.id} />
          <BugsSection moduleId={module.id} />
        </div>
      )}
    </div>
  );
}