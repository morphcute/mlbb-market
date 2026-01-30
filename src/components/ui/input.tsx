import React from "react";
import { clsx } from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className, ...props }: Props) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400",
        className
      )}
      {...props}
    />
  );
}
