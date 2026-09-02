import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Folder, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import EmptyState from "@/shared/ui/EmptyState";
import { Input } from "@/shared/ui/Input";
import { showToast } from "@/shared/ui/toast";
import type { Project } from "@/shared/types";
import ProjectCard from "../components/ProjectCard";
import ProjectFormModal from "../components/ProjectFormModal";

export default function ProjectsPage() {
  const { projects, reorderProjects, deleteProject } = useStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const query = search.trim().toLowerCase();
  const filtered = sorted.filter((p) => p.name.toLowerCase().includes(query));
  const hasFilters = search.trim() !== "";

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderProjects(String(active.id), String(over.id));
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Projects</h1>
          <p className="mt-1 text-sm font-medium text-zinc-400">
            {filtered.length} of {sorted.length} projects
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create project
        </Button>
      </div>

      <div className="mb-6 flex w-full max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="pl-10"
          />
        </div>
        {hasFilters && (
          <Button variant="secondary" onClick={() => setSearch("")} className="h-11 px-4">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Folder}
          title={hasFilters ? "No projects match your search" : "No projects yet"}
          description={
            hasFilters ? "Try a different name or clear the filters." : "Create your first project to get started."
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => {
                    setEditing(project);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(project)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectFormModal
        key={formOpen ? (editing?.id ?? "new") : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={editing}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete project"
        message={`Are you sure you want to delete "${deleting?.name}"? This will permanently remove all of its modules, tasks, tests and bugs.`}
        onConfirm={() => {
          if (deleting) {
            deleteProject(deleting.id);
            showToast("success", "Project deleted");
          }
        }}
      />
    </div>
  );
}