import { useState } from "react";
import { TEST_STATUS_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import Dropdown from "@/shared/ui/Dropdown";
import { Field, Input, Textarea } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { showToast } from "@/shared/ui/toast";
import type { Test } from "@/shared/types";

type Props = {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  test?: Test | null;
};

export default function TestFormModal({ open, onClose, moduleId, test }: Props) {
  const { createTest, updateTest } = useStore();
  const [name, setName] = useState(test?.name ?? "");
  const [description, setDescription] = useState(test?.description ?? "");
  const [status, setStatus] = useState<string>(test?.status ?? "pending");

  const isEditing = Boolean(test);

  function handleSave() {
    if (!name.trim()) {
      showToast("error", "Name is required");
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim(),
      status: status as Test["status"],
    };
    if (isEditing) {
      updateTest(test!.id, data);
      showToast("success", "Test updated");
    } else {
      createTest({ ...data, moduleId });
      showToast("success", "Test created");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit test" : "Create test"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEditing ? "Save changes" : "Create test"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Auth flow test" />
        </Field>
        <Field label="Description">
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this test validate?"
          />
        </Field>
        <Field label="Status">
          <Dropdown
            value={status}
            onChange={setStatus}
            options={TEST_STATUS_LIST.map((s) => ({ value: s.value, label: s.label, color: s.color, icon: s.icon }))}
          />
        </Field>
      </div>
    </Modal>
  );
}