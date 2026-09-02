type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
};

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="group flex items-center gap-3 text-left">
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-duo-green" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-bold text-zinc-700">{label}</span>}
          {description && <span className="block text-xs text-zinc-400">{description}</span>}
        </span>
      )}
    </button>
  );
}