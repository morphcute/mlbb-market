"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
          {state.error}
        </div>
      )}
      <div>
        <label className="text-sm text-slate-300">Name</label>
        <Input name="name" type="text" placeholder="Your name" required />
      </div>
      <div>
        <label className="text-sm text-slate-300">Email</label>
        <Input name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="text-sm text-slate-300">Password</label>
        <Input name="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Register"}
      </Button>
    </form>
  );
}
