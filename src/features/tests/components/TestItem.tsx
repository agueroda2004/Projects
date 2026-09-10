import { ArrowRight, ChevronDown, FileCheck2, GripVertical, Pencil, Plus, StickyNote, Trash2, X } from "lucide-react";
import { useState } from "react";
import { TEST_STATUSES, TEST_STATUS_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import { useSortableItem } from "@/shared/hooks/useSortableItem";
import Badge from "@/shared/ui/Badge";
import Dropdown from "@/shared/ui/Dropdown";
import { Textarea } from "@/shared/ui/Input";
import type { Test } from "@/shared/types";

type Props = {
  test: Test;
  onEdit: () => void;
  onDelete: () => void;
};

const STATUS_OPTIONS = TEST_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon }));

export default function TestItem({ test, onEdit, onDelete }: Props) {
  const { advanceTest, addSubTest, updateSubTest, deleteSubTest } = useStore();
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableItem(test.id);
  const [newSub, setNewSub] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subtestsOpen, setSubtestsOpen] = useState(false);
  const status = TEST_STATUSES[test.status];
  const isPassed = test.status === "passed";
  const subtests = test.subtests ?? [];

  function handleAddSub() {
    if (!newSub.trim()) return;
    addSubTest(test.id, newSub.trim());
    setNewSub("");
  }

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

        {subtests.length > 0 && (
          <button
            type="button"
            onClick={() => setSubtestsOpen((o) => !o)}
            title={subtestsOpen ? "Collapse subtests" : "Expand subtests"}
            aria-label={subtestsOpen ? "Collapse subtests" : "Expand subtests"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
              subtestsOpen ? "bg-duo-green-light text-duo-green" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            }`}
          >
            <ChevronDown className={`h-4 w-4 transition ${subtestsOpen ? "" : "-rotate-90"}`} />
          </button>
        )}

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
            {subtests.length > 0 && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                {subtests.filter((s) => s.status === "passed").length}/{subtests.length}
              </span>
            )}
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

      {subtestsOpen && (
        <>
          {subtests.length > 0 && (
            <div className="space-y-1.5 border-t border-zinc-100 px-3 py-2">
              {subtests.map((sub) => {
                const isExpanded = expanded === sub.id;
                const subStatus = TEST_STATUSES[sub.status];
                return (
                  <div key={sub.id} className="rounded-xl border border-zinc-100 bg-zinc-50/60">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-200/60 hover:text-zinc-600"
                        aria-label={isExpanded ? "Collapse subtest" : "Expand subtest"}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition ${isExpanded ? "" : "-rotate-90"}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <span
                          className={`truncate text-xs font-semibold ${
                            sub.status === "passed" ? "text-zinc-400 line-through" : "text-zinc-700"
                          }`}
                        >
                          {sub.name}
                        </span>
                        {sub.notes.trim() && <StickyNote className="h-3 w-3 shrink-0 text-zinc-300" />}
                      </button>

                      <Dropdown
                        value={sub.status}
                        onChange={(value) => updateSubTest(test.id, sub.id, { status: value as Test["status"] })}
                        options={STATUS_OPTIONS}
                        size="sm"
                        className="w-28 shrink-0"
                      />

                      <button
                        type="button"
                        onClick={() => deleteSubTest(test.id, sub.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-300 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete subtest"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-zinc-100 px-3 py-2">
                        <Textarea
                          rows={3}
                          value={sub.notes}
                          onChange={(e) => updateSubTest(test.id, sub.id, { notes: e.target.value })}
                          placeholder="Add notes for this subtest..."
                          className="text-xs"
                        />
                        <p className="mt-1 text-[10px] font-medium text-zinc-400">
                          {subStatus.label} · Notes are saved automatically
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-zinc-100 px-5 py-2">
            <Plus className="h-4 w-4 shrink-0 text-zinc-300" />
            <input
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSub();
              }}
              placeholder="Add a subtest..."
              className="flex-1 bg-transparent text-xs font-medium text-zinc-600 outline-none placeholder:text-zinc-400"
            />
          </div>
        </>
      )}
    </div>
  );
}
