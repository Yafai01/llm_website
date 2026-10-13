import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {children && <div className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{children}</div>}
    </header>
  );
}

/** Marks a demo as illustrative so readers do not mistake it for real model output. */
export function SimulationNotice({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      aria-label="About this demo"
      className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"
    >
      <FlaskConical size={16} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
      <div>
        <span className="font-semibold">Illustrative demo. </span>
        {children}
      </div>
    </aside>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-800">
      {icon}
      {children}
    </h3>
  );
}

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export const labelText = "block text-xs font-medium text-slate-600";
