import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-bold text-zinc-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-zinc-400">{description}</p>}
    </div>
  );
}