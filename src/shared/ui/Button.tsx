import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-duo-green text-white shadow-sm hover:bg-duo-green-dark disabled:bg-zinc-200 disabled:text-zinc-400",
  secondary:
    "border-2 border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50",
  danger: "bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:opacity-50",
  ghost: "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50",
};

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    />
  );
}