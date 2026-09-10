import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getIcon } from "@/shared/constants/icons";

export type DropdownOption = {
  value: string;
  label: string;
  color?: string;
  icon?: string;
};

type DropdownProps = {
  value?: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
};

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  size = "md",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const isSmall = size === "sm";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border-2 border-zinc-200 bg-white outline-none transition hover:border-zinc-300 focus:border-duo-green ${
          isSmall ? "h-8 px-3 text-xs" : "h-11 px-4 text-sm"
        }`}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2 font-semibold text-zinc-800">
            {selected.icon && (() => {
              const Icon = getIcon(selected.icon!);
              return <Icon className={`shrink-0 ${isSmall ? "h-3.5 w-3.5" : "h-4 w-4"}`} style={{ color: selected.color }} />;
            })()}
            <span className="truncate">{selected.label}</span>
          </span>
        ) : (
          <span className="text-zinc-400">{placeholder}</span>
        )}
        <ChevronDown className={`shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""} ${isSmall ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
          {options.length === 0 && <div className="px-3 py-2 text-sm text-zinc-400">No options</div>}
          {options.map((opt) => {
            const Icon = opt.icon ? getIcon(opt.icon) : null;
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-zinc-100 ${
                  isSelected ? "font-bold text-zinc-900" : "font-semibold text-zinc-600"
                }`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: opt.color }} />}
                <span className="flex-1 text-left">{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-duo-green" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}