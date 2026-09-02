import { useState } from "react";
import { useStore } from "@/shared/context/store";
import { TASK_STATUS_LIST } from "@/shared/constants/statuses";
import Button from "@/shared/ui/Button";
import Dropdown from "@/shared/ui/Dropdown";
import { Field, Input } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { showToast } from "@/shared/ui/toast";
import type { Task } from "@/shared/types";

type Props = {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  task?: Task | null;
};

export default function TaskFormModal({ open, onClose, moduleId, task }: Props) {
  const { createTask, updateTask } = useStore();
  const [name, setName] = useState(task?.name ?? "");
  const [status, setStatus] = useState<string>(task?.status ?? "pending");

  const isEditing = Boolean(task);

  function handleSave() {
    if (!name.trim()) {
      showToast("error", "Name is required");
      return;
    }
    const data = { name: name.trim(), status: status as Task["status"] };
    if (isEditing) {
      updateTask(task!.id, data);
      showToast("success", "Task updated");
    } else {
      createTask({ ...data, moduleId });
      showToast("success", "Task created");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit task" : "Create task"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEditing ? "Save changes" : "Create task"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Implement auth API" />
        </Field>
        <Field label="Status">
          <Dropdown
            value={status}
            onChange={setStatus}
            options={TASK_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon }))}
          />
        </Field>
      </div>
    </Modal>
  );
}