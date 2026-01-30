"use client";

import { useActionState } from "react";
import { createReviewAction } from "@/actions/review";
import { Button } from "@/components/ui/button";

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, action, isPending] = useActionState(createReviewAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Rating</label>
        <select name="rating" className="w-full bg-black/50 border border-purple-500/20 rounded-md p-2 text-white" required>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Fair</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Comment</label>
        <textarea name="comment" placeholder="How was your experience?" className="w-full min-h-[80px] bg-black/50 border border-purple-500/20 rounded-md p-3 text-white" required />
      </div>
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
