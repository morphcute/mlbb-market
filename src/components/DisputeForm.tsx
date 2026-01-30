"use client";

import { useActionState } from "react";
import { createTicketAction } from "@/actions/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DisputeForm({ orderId }: { orderId: string }) {
  const [state, action, isPending] = useActionState(createTicketAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <Input name="subject" placeholder="Issue Subject" required className="bg-black/50 border-red-500/20" />
      <textarea name="description" placeholder="Describe your issue..." className="w-full min-h-[100px] bg-black/50 border border-red-500/20 rounded-md p-3 text-white" required />
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
        {isPending ? "Opening Ticket..." : "Open Dispute Ticket"}
      </Button>
    </form>
  );
}
