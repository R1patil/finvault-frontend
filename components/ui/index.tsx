"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Badge ────────────────────────────────────────────────────
const badgeVariants: Record<string, string> = {
  income:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  expense:  "bg-red-500/10 text-red-400 border border-red-500/20",
  admin:    "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  analyst:  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  viewer:   "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  active:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
  CREATE:   "bg-emerald-500/10 text-emerald-400",
  UPDATE:   "bg-blue-500/10 text-blue-400",
  DELETE:   "bg-red-500/10 text-red-400",
  LOGIN:    "bg-amber-500/10 text-amber-400",
  REGISTER: "bg-amber-500/10 text-amber-400",
  ROLE_CHANGE:   "bg-violet-500/10 text-violet-400",
  STATUS_CHANGE: "bg-slate-500/10 text-slate-400",
};

export function Badge({ variant, children, className }: {
  variant: string; children: React.ReactNode; className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono",
      badgeVariants[variant] || "bg-slate-500/10 text-slate-400",
      className
    )}>
      {children}
    </span>
  );
}

// ── Button ───────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
}

export function Button({ variant = "ghost", size = "md", className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-500 text-slate-900 hover:bg-emerald-400 active:scale-[0.98]",
    ghost:   "bg-transparent border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400",
    danger:  "bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10",
    outline: "bg-transparent border border-slate-600 text-slate-400 hover:bg-slate-800",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>}
      <input
        className={cn(
          "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100",
          "placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>}
      <select
        className={cn(
          "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100",
          "focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>}
      <textarea
        className={cn(
          "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100",
          "placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none",
          className
        )}
        rows={3}
        {...props}
      />
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-5 h-5 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin", className)} />
  );
}

// ── Toast ────────────────────────────────────────────────────
export function ToastContainer({ toasts }: { toasts: { id: number; message: string; type: string }[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={cn(
          "px-4 py-3 rounded-lg text-sm font-medium border animate-in slide-in-from-bottom-2 fade-in duration-200",
          t.type === "success" && "bg-emerald-950 border-emerald-500/30 text-emerald-400",
          t.type === "error"   && "bg-red-950 border-red-500/30 text-red-400",
          t.type === "info"    && "bg-blue-950 border-blue-500/30 text-blue-400",
        )}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl", className)}>
      {children}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────
export function MetricCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string;
  accent?: "green" | "red" | "blue" | "amber";
}) {
  const colors = {
    green: "from-emerald-500/10 to-transparent text-emerald-400 border-t-emerald-500",
    red:   "from-red-500/10 to-transparent text-red-400 border-t-red-500",
    blue:  "from-blue-500/10 to-transparent text-blue-400 border-t-blue-500",
    amber: "from-amber-500/10 to-transparent text-amber-400 border-t-amber-500",
  };
  const c = colors[accent || "green"];
  return (
    <div className={`bg-gradient-to-b ${c} bg-slate-900 border border-slate-800 border-t-2 rounded-xl p-5`}>
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono tracking-tight ${c.split(" ")[2]}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}
