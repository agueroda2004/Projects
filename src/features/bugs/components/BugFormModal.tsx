import { useState } from "react";
import { BUG_STATUS_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import DatePicker from "@/shared/ui/DatePicker";
import Dropdown from "@/shared/ui/Dropdown";
import { Field, Input, Textarea } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { showToast } from "@/shared/ui/toast";
import type { Bug } from "@/shared/types";

type Props = {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  bug?: Bug | null;
};

export default function BugFormModal({ open, onClose, moduleId, bug }: Props) {
  const { createBug, updateBug } = useStore();
  const [name, setName] = useState(bug?.name ?? "");
  const [description, setDescription] = useState(bug?.description ?? "");
  const [status, setStatus] = useState<string>(bug?.status ?? "open");
  const [appearedAt, setAppearedAt] = useState(bug?.appearedAt ?? "");

  const isEditing = Boolean(bug);

  function handleSave() {
    if (!name.trim()) {
      showToast("error", "Name is required");
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim(),
      status: status as Bug["status"],
      appearedAt,
    };
    if (isEditing) {
      updateBug(bug!.id, data);
      showToast("success", "Bug updated");
    } else {
      createBug({ ...data, moduleId });
      showToast("success", "Bug created");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit bug" : "Report bug"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEditing ? "Save changes" : "Report bug"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Login redirect loop" />
        </Field>
        <Field label="Description">
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the bug and how to reproduce it"
          />
        </Field>
        <Field label="Status">
          <Dropdown
            value={status}
            onChange={setStatus}
            options={BUG_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon }))}
          />
        </Field>
        <Field label="Appeared on">
          <DatePicker
            value={appearedAt}
            onChange={setAppearedAt}
            maxDate={new Date()}
            placeholder="Select appearance date"
          />
        </Field>
      </div>
    </Modal>
  );
}