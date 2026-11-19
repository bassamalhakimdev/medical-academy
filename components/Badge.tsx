import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary" | "cyber";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "neutral", children, className = "", dot = false }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    warning: "bg-amber-950/60 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    danger: "bg-rose-950/60 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    info: "bg-cyan-950/60 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
    primary: "bg-sky-950/60 text-sky-300 border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]",
    cyber: "bg-teal-950/70 text-[#00f5a0] border-[#00f5a0]/30 shadow-[0_0_15px_rgba(0,245,160,0.2)]",
    neutral: "bg-slate-800/80 text-slate-300 border-slate-700/60",
  };

  const dotColors = {
    success: "bg-emerald-400 animate-pulse",
    warning: "bg-amber-400 animate-pulse",
    danger: "bg-rose-400 animate-pulse",
    info: "bg-cyan-400 animate-pulse",
    primary: "bg-sky-400 animate-pulse",
    cyber: "bg-[#00f5a0] animate-pulse",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full border backdrop-blur-md transition-all ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
