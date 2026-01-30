import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("glass-card rounded-xl border holo-border bg-zinc-900/50", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6 flex flex-col space-y-1.5", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight holo-text", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-sm text-slate-400", className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>;
}
