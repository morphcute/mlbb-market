import React from "react";
import { clsx } from "clsx";

type Tab = { key: string; label: string };

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={clsx(
            "rounded-md px-4 py-2 text-sm border",
            active === t.key
              ? "bg-slate-900 text-slate-100 border-cyan-400"
              : "bg-transparent text-slate-300 border-slate-700 hover:bg-slate-900/50"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
