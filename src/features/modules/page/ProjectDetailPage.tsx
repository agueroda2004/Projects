import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { verticalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ArrowLeft, CalendarDays, Package, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DynamicIcon } from "@/shared/constants/icons";
import { MODULE_STATUS_LIST, PRIORITY_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import Dropdown from "@/shared/ui/Dropdown";
import EmptyState from "@/shared/ui/EmptyState";
import { Input } from "@/shared/ui/Input";
import { showToast } from "@/shared/ui/toast";
import type { Module } from "@/shared/types";
import { formatDate } from "@/shared/utils";
import ModuleCard from "../components/ModuleCard";
import ModuleFormModal from "../components/ModuleFormModal";

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  ...PRIORITY_LIST.map((p) => ({ value: p.value, label: p.label, color: p.color, icon: p.icon })),
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...MODULE_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon })),
];

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, modules, reorderModules, deleteModule } = useStore();

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [deleting, setDeleting] = useState<Module | null>(null);

  const project = projects.find((p) => p.id === projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const projectModules = useMemo(
    () => modules.filter((m) => m.projectId === projectId).sort((a, b) => a.order - b.order),
    [modules, projectId],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projectModules.filter((m) => {
      const matchName = m.name.toLowerCase().includes(query);
      const matchPriority = !priority || m.priority === priority;
      const matchStatus = !status || m.status === status;
      return matchName && matchPriority && matchStatus;
    });
  }, [projectModules, search, priority, status]);

  const hasFilters = search.trim() !== "" || priority !== "" || status !== "";

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState
          icon={Package}
          title="Project not found"
          description="This project may have been deleted."
        />
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Button>
        </div>
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderModules(String(active.id), String(over.id));
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-zinc-500 transition hover:text-duo-green"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="mb-8 flex flex-wrap items-start gap-4 rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: project.color }}
        >
          <DynamicIcon name={project.icon} className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-zinc-800">{project.name}</h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{project.description || "No description"}</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(project.startDate)} — {formatDate(project.endDate)}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-800">Modules</h2>
          <p className="mt-0.5 text-sm font-medium text-zinc-400">
            {filtered.length} of {projectModules.length} modules
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create module
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="pl-10"
          />
        </div>
        <Dropdown value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} placeholder="Priority" className="w-44" />
        <Dropdown value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Status" className="w-44" />
        {hasFilters && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setPriority("");
              setStatus("");
            }}
            className="h-11 px-4"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasFilters ? "No modules match your filters" : "No modules yet"}
          description={
            hasFilters
              ? "Try adjusting the filters."
              : "Create your first module to start organizing this project."
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {filtered.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onEdit={() => {
                    setEditing(module);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(module)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ModuleFormModal
        key={formOpen ? (editing?.id ?? "new") : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={project.id}
        module={editing}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete module"
        message={`Are you sure you want to delete "${deleting?.name}"? This will permanently remove all of its tasks, subtasks, tests and bugs.`}
        onConfirm={() => {
          if (deleting) {
            deleteModule(deleting.id);
            showToast("success", "Module deleted");
          }
        }}
      />
    </div>
  );
}