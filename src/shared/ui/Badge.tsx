import { DynamicIcon } from "@/shared/constants/icons";

type BadgeProps = {
  color: string;
  icon: string;
  label: string;
  className?: string;
};

export default function Badge({ color, icon, label, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <DynamicIcon name={icon} className="h-3.5 w-3.5 shrink-0" style={{ color }} />
      {label}
    </span>
  );
}