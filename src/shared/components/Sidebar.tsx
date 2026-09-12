import { Boxes, Folder, LogOut, RotateCcw } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/shared/auth";
import { useStore } from "@/shared/context/store";
import { showToast } from "@/shared/ui/toast";

export default function Sidebar() {
  const { resetData } = useStore();
  const navigate = useNavigate();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-duo-green text-white shadow-sm">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-zinc-800">Orbit</p>
          <p className="text-[11px] font-semibold text-zinc-400">Project Manager</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-4">
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              isActive
                ? "bg-duo-green-light text-duo-green"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            }`
          }
        >
          <Folder className="h-5 w-5" />
          Projects
        </NavLink>
      </nav>

      <div className="border-t border-zinc-100 p-4">
        <button
          type="button"
          onClick={() => {
            resetData();
            showToast("success", "Demo data restored");
            navigate("/projects");
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}