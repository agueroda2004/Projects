import { CalendarDays } from "lucide-react";
import { useParams } from "react-router-dom";
import { useStore } from "@/shared/context/store";

export default function TopNav() {
  const { projectId } = useParams();
  const { projects } = useStore();
  const project = projectId ? projects.find((p) => p.id === projectId) : undefined;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 lg:px-10">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-zinc-400">Projects</span>
        {project && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="font-bold text-zinc-800">{project.name}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
        <CalendarDays className="h-4 w-4" />
        {today}
      </div>
    </header>
  );
}