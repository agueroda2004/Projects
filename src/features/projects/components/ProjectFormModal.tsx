import { useState } from "react";
import { useStore } from "@/shared/context/store";
import Button from "@/shared/ui/Button";
import ColorPicker from "@/shared/ui/ColorPicker";
import DatePicker from "@/shared/ui/DatePicker";
import IconPicker from "@/shared/ui/IconPicker";
import { Field, Input, Textarea } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { showToast } from "@/shared/ui/toast";
import type { Project } from "@/shared/types";

type Props = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export default function ProjectFormModal({ open, onClose, project }: Props) {
  const { createProject, updateProject } = useStore();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [icon, setIcon] = useState(project?.icon ?? "Folder");
  const [color, setColor] = useState(project?.color ?? "#16a34a");
  const [startDate, setStartDate] = useState(project?.startDate ?? "");
  const [endDate, setEndDate] = useState(project?.endDate ?? "");

  const isEditing = Boolean(project);

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
      startDate,
      endDate,
    };
    if (isEditing) {
      updateProject(project!.id, data);
      showToast("success", "Project updated");
    } else {
      createProject(data);
      showToast("success", "Project created");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit project" : "Create project"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEditing ? "Save changes" : "Create project"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Orbit CRM" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
            />
          </Field>
        </div>

        <Field label="Icon">
          <IconPicker value={icon} onChange={setIcon} />
        </Field>

        <Field label="Color">
          <ColorPicker value={color} onChange={setColor} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate ? new Date(`${endDate}T00:00:00`) : undefined}
            />
          </Field>
          <Field label="End date">
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              minDate={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}