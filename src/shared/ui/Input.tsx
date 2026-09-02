import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border-2 border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 outline-none transition placeholder:font-normal placeholder:text-zinc-400 hover:border-zinc-300 focus:border-duo-green ${className}`}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 outline-none transition placeholder:font-normal placeholder:text-zinc-400 hover:border-zinc-300 focus:border-duo-green ${className}`}
    />
  );
}

export function Field({
  label,
  children,
  required = false,
  className = "",
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </div>
  );
}