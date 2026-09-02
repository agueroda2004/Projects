import { ENTITY_ICON_KEYS, getIcon } from "@/shared/constants/icons";

type IconPickerProps = {
  value: string;
  onChange: (key: string) => void;
};

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {ENTITY_ICON_KEYS.map((key) => {
        const Icon = getIcon(key);
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex h-11 w-full items-center justify-center rounded-xl border-2 transition ${
              selected
                ? "border-duo-green bg-duo-green-light text-duo-green"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}