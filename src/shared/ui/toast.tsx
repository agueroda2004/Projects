import { AlertTriangle, CheckCircle2, X, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

export type ToastType = "success" | "error";

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertTriangle,
};

const ACCENTS: Record<ToastType, string> = {
  success: "text-duo-green",
  error: "text-red-500",
};

export function showToast(type: ToastType, message: string) {
  const Icon = ICONS[type];
  toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto flex w-80 items-center gap-3 rounded-2xl border-2 border-zinc-100 bg-white px-4 py-3 shadow-xl transition ${
          t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${ACCENTS[type]}`} />
        <span className="flex-1 text-sm font-semibold text-zinc-700">{message}</span>
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 3200 },
  );
}