import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
};

export function Button({ variant = "primary", size = "default", className, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-slate-950";
  
  const variants = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-400",
    outline: "border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 focus:ring-cyan-400",
    ghost: "bg-transparent text-slate-200 hover:bg-slate-800/40 focus:ring-cyan-400",
    destructive: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-400",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return <button className={cn(base, variants[variant as keyof typeof variants] || variants.primary, sizes[size], className)} {...props} />;
}
