import { useState } from "react";
import { MODULE_STATUS_LIST, PRIORITY_LIST } from "@/shared/constants/statuses";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ColorPicker from "@/shared/ui/ColorPicker";
import Dropdown from "@/shared/ui/Dropdown";
import IconPicker from "@/shared/ui/IconPicker";
import { Field, Input, Textarea } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { showToast } from "@/shared/ui/toast";
import type { Module } from "@/shared/types";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  module?: Module | null;
};

export default function ModuleFormModal({ open, onClose, projectId, module }: Props) {
  const { createModule, updateModule } = useStore();
  const [name, setName] = useState(module?.name ?? "");
  const [description, setDescription] = useState(module?.description ?? "");
  const [icon, setIcon] = useState(module?.icon ?? "Folder");
  const [color, setColor] = useState(module?.color ?? "#16a34a");
  const [priority, setPriority] = useState<string>(module?.priority ?? "medium");
  const [status, setStatus] = useState<string>(module?.status ?? "planning");

  const isEditing = Boolean(module);

  function handleSave() {
    if (!name.trim()) {
      showToast("error", "Name is required");
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      priority: priority as Module["priority"],
      status: status as Module["status"],
    };
    if (isEditing) {
      updateModule(module!.id, data);
      showToast("success", "Module updated");
    } else {
      createModule({ ...data, projectId });
      showToast("success", "Module created");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit module" : "Create module"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEditing ? "Save changes" : "Create module"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Billing Engine" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <Dropdown
                value={priority}
                onChange={setPriority}
                options={PRIORITY_LIST.map((p) => ({ value: p.value, label: p.label, color: p.color, icon: p.icon }))}
              />
            </Field>
            <Field label="Status">
              <Dropdown
                value={status}
                onChange={setStatus}
                options={MODULE_STATUS_LIST.map((s) => ({
                  value: s.value,
                  label: s.label,
                  color: s.color,
                  icon: s.icon,
                }))}
              />
            </Field>
          </div>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this module cover?"
            />
          </Field>
        </div>

        <Field label="Icon">
          <IconPicker value={icon} onChange={setIcon} />
        </Field>

        <Field label="Color">
          <ColorPicker value={color} onChange={setColor} />
        </Field>
      </div>
    </Modal>
  );
}