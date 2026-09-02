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
import { FlaskConical, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TEST_STATUS_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import Dropdown from "@/shared/ui/Dropdown";
import EmptyState from "@/shared/ui/EmptyState";
import { Input } from "@/shared/ui/Input";
import { showToast } from "@/shared/ui/toast";
import Toggle from "@/shared/ui/Toggle";
import type { Test } from "@/shared/types";
import TestFormModal from "./TestFormModal";
import TestItem from "./TestItem";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...TEST_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon })),
];

export default function TestsSection({ moduleId }: { moduleId: string }) {
  const { tests, reorderTests, deleteTest } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [hidePassed, setHidePassed] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);
  const [deleting, setDeleting] = useState<Test | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const moduleTests = useMemo(
    () => tests.filter((t) => t.moduleId === moduleId).sort((a, b) => a.order - b.order),
    [tests, moduleId],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return moduleTests.filter((t) => {
      const matchName = t.name.toLowerCase().includes(query);
      const matchStatus = !status || t.status === status;
      const matchHide = !hidePassed || t.status !== "passed";
      return matchName && matchStatus && matchHide;
    });
  }, [moduleTests, search, status, hidePassed]);

  const hasFilters = search.trim() !== "" || status !== "" || !hidePassed;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTests(String(active.id), String(over.id));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <FlaskConical className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-zinc-700">Tests</h4>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500">
            {moduleTests.length}
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
          New test
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests..."
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
        <Toggle checked={hidePassed} onChange={setHidePassed} label="Hide passed" description="Passed tests are hidden by default" />
        {hasFilters && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setHidePassed(true);
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
          icon={FlaskConical}
          title={hasFilters ? "No tests match your filters" : "No tests yet"}
          description={hasFilters ? "Try adjusting the filters." : "Create your first test for this module."}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((test) => (
                <TestItem
                  key={test.id}
                  test={test}
                  onEdit={() => {
                    setEditing(test);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(test)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TestFormModal
        key={formOpen ? (editing?.id ?? "new") : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        moduleId={moduleId}
        test={editing}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete test"
        message={`Are you sure you want to delete "${deleting?.name}"?`}
        onConfirm={() => {
          if (deleting) {
            deleteTest(deleting.id);
            showToast("success", "Test deleted");
          }
        }}
      />
    </div>
  );
}