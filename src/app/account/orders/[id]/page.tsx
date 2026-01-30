import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chat from "@/components/Chat";
import { Badge, Star } from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";
import { DisputeForm } from "@/components/DisputeForm";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        include: { seller: true }
      },
      review: true,
      timelineEvents: {
        orderBy: { createdAt: "desc" }
      },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: true
        }
      }
    }
  });

  if (!order || order.buyerId !== user.id) return notFound();

  const isChatEnabled = ["PAYMENT_PENDING", "PAYMENT_CONFIRMED", "SELLER_PENDING", "SELLER_ACCEPTED", "FOLLOW_REQUIRED", "FOLLOWED", "ELIGIBLE_TO_GIFT", "DELIVERED", "BUYER_CONFIRMED", "COMPLETED", "DISPUTED"].includes(order.status);

  async function submitPaymentAction(formData: FormData) {
    "use server";
    const paymentMethod = String(formData.get("paymentMethod"));
    const paymentProofUrl = String(formData.get("paymentProofUrl"));
    
    // Validate proof URL unless it's "Pay Later"
    if (paymentMethod !== "PAY_LATER" && !paymentProofUrl) {
        throw new Error("Payment proof is required for this method");
    }

    // Check for Trusted Seller (Auto-approval)
    const sellerId = order!.sellerId;
    const soldCount = await prisma.order.count({
        where: { sellerId, status: "COMPLETED" }
    });
    const ratingAgg = await prisma.review.aggregate({
        where: { sellerId },
        _avg: { rating: true }
    });
    const avgRating = ratingAgg._avg.rating || 0;
    
    // Trusted Seller Criteria: 10+ sold, 3+ star rating
    const isTrusted = soldCount >= 10 && avgRating >= 3;
    
    const nextStatus = isTrusted ? "SELLER_PENDING" : "PAYMENT_PENDING";
    const note = isTrusted 
        ? `Payment submitted via ${paymentMethod} (Auto-approved: Trusted Seller)` 
        : `Payment submitted via ${paymentMethod}`;

    await prisma.order.update({
      where: { id: order!.id },
      data: {
        status: nextStatus,
        paymentMethod: paymentMethod as any,
        paymentProofUrl: paymentProofUrl || null,
        timelineEvents: {
          create: {
            status: nextStatus,
            note: note,
          }
        }
      }
    });
    redirect(`/account/orders/${id}`);
  }

  async function completeOrderAction() {
      "use server";
      
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order!.id },
          data: {
              status: "COMPLETED",
              timelineEvents: {
                  create: {
                      status: "COMPLETED",
                      note: "Buyer confirmed receipt"
                  }
              }
          }
        });
        
        await tx.sellerProfile.update({
            where: { userId: order!.sellerId },
            data: { salesCount: { increment: 1 } }
        });
      });

      redirect(`/account/orders/${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Order Details</h1>
           <div className="text-slate-400 font-mono text-sm">ORDER ID: {order.id}</div>
        </div>
        <div className="px-4 py-2 bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 rounded-lg font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          {order.status.replace(/_/g, " ")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Order Info */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Listing Information</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between">
                 <span className="text-slate-400">Item</span>
                 <span className="font-bold">{order.listing.title}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Type</span>
                 <span className="px-2 py-0.5 rounded bg-white/10 text-xs">{order.listing.type}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Price</span>
                 <span className="font-bold text-cyan-400 text-lg">₱{order.listing.pricePhp.toLocaleString()}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Seller</span>
                 <span className="font-bold text-purple-400">{order.listing.seller.displayName}</span>
               </div>
             </CardContent>
           </Card>

           {/* Payment Section */}
           {order.status === "CREATED" && (
             <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
               <CardHeader className="border-b border-white/5">
                 <CardTitle className="text-xl">Submit Payment</CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                 <form action={submitPaymentAction} className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">Payment Method</label>
                     <select name="paymentMethod" className="w-full bg-black/50 border border-white/10 rounded-md p-2 text-white" required>
                       <option value="GCASH_MANUAL">GCash Manual</option>
                       <option value="FB_MANUAL">Facebook Manual</option>
                       <option value="BANK_MANUAL">Bank Transfer</option>
                       <option value="PAY_LATER">Pay Later</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Payment Proof URL (Screenshot)</label>
                    <Input name="paymentProofUrl" placeholder="https://..." className="bg-black/50 border-white/10" />
                    <p className="text-xs text-slate-500">Required for most methods. Optional for "Pay Later".</p>
                  </div>
                   <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                     Submit Payment for Verification
                   </Button>
                 </form>
               </CardContent>
             </Card>
           )}

           {order.status === "PAYMENT_PENDING" && (
             <Card className="bg-yellow-900/20 border-yellow-500/30 text-white">
               <CardContent className="pt-6 text-center">
                 <div className="text-yellow-400 font-bold mb-2">Payment Under Review</div>
                 <p className="text-slate-300 text-sm">The admin is currently verifying your payment. This usually takes 15-30 minutes.</p>
               </CardContent>
             </Card>
           )}

           {/* Action: Confirm Receipt (Both Types) */}
           {order.status === "DELIVERED" && (
              <Card className="bg-green-900/20 border-green-500/30 text-white">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-green-400">Seller has delivered!</h3>
                    <p className="text-slate-300">
                        {order.listing.type === "SKIN_GIFT" 
                            ? "Seller has gifted the skin. Please check your inbox and confirm receipt."
                            : "Please verify the account credentials provided in the chat. If everything is correct, confirm receipt below."
                        }
                    </p>
                    <form action={completeOrderAction}>
                      <Button className="w-full bg-green-600 hover:bg-green-500 font-bold">
                        Confirm Receipt & Complete Order
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
           )}

           {/* Review Section */}
           {order.status === "COMPLETED" && (
             <Card className="bg-purple-900/10 border-purple-500/20 text-white mb-8">
               <CardHeader className="border-b border-purple-500/10">
                 <CardTitle className="text-lg text-purple-400">Leave a Review</CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                 {order.review ? (
                   <div className="space-y-2">
                     <div className="flex items-center gap-1 text-yellow-400">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <Star key={star} className={`w-5 h-5 ${star <= order.review!.rating ? "fill-current" : "opacity-30"}`} />
                       ))}
                     </div>
                     <p className="text-slate-300 italic">"{order.review.comment}"</p>
                     <div className="text-xs text-slate-500 mt-2">Submitted on {new Date(order.review.createdAt).toLocaleDateString()}</div>
                   </div>
                 ) : (
                    <ReviewForm orderId={order.id} />
                  )}
               </CardContent>
             </Card>
           )}

           {/* Chat Section */}
           {isChatEnabled ? (
             <Chat 
                orderId={order.id} 
                messages={order.chatMessages.map(m => ({
                  ...m,
                  createdAt: m.createdAt.toISOString()
                }))} 
                currentUserId={user.id} 
              />
           ) : (
             <div className="p-8 border border-white/10 rounded-xl bg-white/5 text-center text-slate-500">
               Chat will be available after payment is confirmed.
             </div>
           )}

           {/* Dispute Section */}
           {order.status === "DISPUTED" && (
             <div className="p-4 bg-red-950/50 border border-red-500 text-red-400 rounded-lg text-center font-bold">
               This order is currently disputed. Admin investigation is in progress.
             </div>
           )}

           {isChatEnabled && order.status !== "DISPUTED" && order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
             <Card className="bg-red-900/10 border-red-500/20 text-white mt-8">
               <CardHeader className="border-b border-red-500/10">
                 <CardTitle className="text-lg text-red-400">Report an Issue</CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                 <p className="text-sm text-slate-400 mb-4">
                   If you have any issues with this order, you can open a dispute ticket. The admin will intervene.
                 </p>
                 <DisputeForm orderId={order.id} />
               </CardContent>
             </Card>
           )}
        </div>

        <div className="space-y-8">
           {/* Timeline */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Timeline</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
                <div className="space-y-6 relative pl-2 border-l border-white/10 ml-2">
                   {order.timelineEvents.map((hist) => (
                     <div key={hist.id} className="relative pl-6">
                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-black 
                          ${hist.status === 'COMPLETED' ? 'bg-green-500' : 'bg-cyan-500'}
                        `} />
                        <div className="font-bold text-sm text-slate-200">{hist.status.replace(/_/g, " ")}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{new Date(hist.createdAt).toLocaleString()}</div>
                        {hist.note && <div className="text-sm mt-2 text-slate-400 bg-white/5 p-2 rounded">{hist.note}</div>}
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>

           {/* Help / Dispute */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader>
               <CardTitle className="text-lg">Need Help?</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-slate-400 mb-4">If you have issues with this order, you can open a dispute ticket.</p>
               <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-slate-300">
                 Open Dispute
               </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
