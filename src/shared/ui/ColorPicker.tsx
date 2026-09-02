import { Check } from "lucide-react";
import { COLOR_PALETTE } from "@/shared/constants/icons";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => {
        const selected = value === color;
        const isLight = color === "#ffffff" || color === "#eab308";
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
              selected ? "scale-110 border-zinc-800" : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
          >
            {selected && <Check className="h-4 w-4" style={{ color: isLight ? "#0f172a" : "#ffffff" }} />}
          </button>
        );
      })}
    </div>
  );
}