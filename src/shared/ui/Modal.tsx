import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const SIZES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

export default function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" />
      <div className={`relative w-full ${SIZES[size]} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-zinc-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}