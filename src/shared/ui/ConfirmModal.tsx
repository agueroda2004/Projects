import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export default function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-sm leading-relaxed text-zinc-600">{message}</p>
      </div>
    </Modal>
  );
}