import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10",
    primary: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ring-1 ring-inset ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
