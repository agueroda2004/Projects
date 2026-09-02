import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DynamicIcon } from "@/shared/constants/icons";
import { useSortableItem } from "@/shared/hooks/useSortableItem";
import type { Project } from "@/shared/types";
import { formatDate } from "@/shared/utils";

type Props = {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableItem(project.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => navigate(`/projects/${project.id}`)}
      className={`group relative cursor-pointer rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-500 group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
        style={{ backgroundColor: project.color }}
      >
        <DynamicIcon name={project.icon} className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold text-zinc-800">{project.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{project.description}</p>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(project.startDate)} — {formatDate(project.endDate)}
      </div>

      <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 text-xs font-bold text-zinc-600 transition hover:border-duo-green hover:text-duo-green"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 text-xs font-bold text-zinc-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}