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
import { Bug, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BUG_STATUS_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import Dropdown from "@/shared/ui/Dropdown";
import EmptyState from "@/shared/ui/EmptyState";
import { Input } from "@/shared/ui/Input";
import { showToast } from "@/shared/ui/toast";
import Toggle from "@/shared/ui/Toggle";
import type { Bug as BugEntity } from "@/shared/types";
import BugFormModal from "./BugFormModal";
import BugItem from "./BugItem";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...BUG_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon })),
];

export default function BugsSection({ moduleId }: { moduleId: string }) {
  const { bugs, reorderBugs, deleteBug } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [hideClosed, setHideClosed] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BugEntity | null>(null);
  const [deleting, setDeleting] = useState<BugEntity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const moduleBugs = useMemo(
    () => bugs.filter((b) => b.moduleId === moduleId).sort((a, b) => a.order - b.order),
    [bugs, moduleId],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return moduleBugs.filter((b) => {
      const matchName = b.name.toLowerCase().includes(query);
      const matchStatus = !status || b.status === status;
      const matchHide = !hideClosed || b.status !== "closed";
      return matchName && matchStatus && matchHide;
    });
  }, [moduleBugs, search, status, hideClosed]);

  const hasFilters = search.trim() !== "" || status !== "" || !hideClosed;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBugs(String(active.id), String(over.id));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-500">
            <Bug className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-zinc-700">Bugs</h4>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500">
            {moduleBugs.length}
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
          Report bug
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bugs..."
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
        <Toggle checked={hideClosed} onChange={setHideClosed} label="Hide closed" description="Closed bugs are hidden by default" />
        {hasFilters && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setHideClosed(true);
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
          icon={Bug}
          title={hasFilters ? "No bugs match your filters" : "No bugs yet"}
          description={hasFilters ? "Try adjusting the filters." : "Report the first bug for this module."}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((bug) => (
                <BugItem
                  key={bug.id}
                  bug={bug}
                  onEdit={() => {
                    setEditing(bug);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(bug)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <BugFormModal
        key={formOpen ? (editing?.id ?? "new") : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        moduleId={moduleId}
        bug={editing}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete bug"
        message={`Are you sure you want to delete "${deleting?.name}"?`}
        onConfirm={() => {
          if (deleting) {
            deleteBug(deleting.id);
            showToast("success", "Bug deleted");
          }
        }}
      />
    </div>
  );
}