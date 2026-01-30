import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chat from "@/components/Chat";
import { revalidatePath } from "next/cache";
import { DisputeForm } from "@/components/DisputeForm";

export default async function SellerOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        include: { seller: true }
      },
      buyer: true, // Buyer
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

  if (!order || order.sellerId !== user.id) return notFound();

  async function acceptOrderAction() {
    "use server";
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder || currentOrder.status !== "SELLER_PENDING") return;

    await prisma.order.update({
      where: { id },
      data: {
        status: "SELLER_ACCEPTED",
        timelineEvents: { create: { status: "SELLER_ACCEPTED", note: "Seller accepted order" } }
      }
    });
    revalidatePath(`/seller/orders/${id}`);
  }

  async function markDeliveredAction() {
    "use server";
    const currentOrder = await prisma.order.findUnique({ 
        where: { id },
        include: { listing: true }
    });
    if (!currentOrder) return;

    // For Skins: FOLLOW_REQUIRED -> FOLLOWED -> ELIGIBLE -> DELIVERED
    // For Accounts: SELLER_ACCEPTED -> DELIVERED
    const isSkin = currentOrder.listing.type === "SKIN_GIFT";
    
    let nextStatus: any = "DELIVERED";
    let note = "Item delivered";
    let updateData: any = {};

    if (isSkin) {
        if (currentOrder.status === "SELLER_ACCEPTED") {
             // Assuming seller follows buyer now
             nextStatus = "FOLLOWED";
             note = "Seller followed buyer. 7-day countdown started.";
             updateData.dateFollowed = new Date();
             updateData.eligibleAt = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000); // 8 days rule
        } else if (currentOrder.status === "ELIGIBLE_TO_GIFT") {
             nextStatus = "DELIVERED";
             note = "Skin gifted to buyer";
        } else if (currentOrder.status === "FOLLOWED") {
            // Check if actually eligible now, just in case
            const now = new Date();
            if (currentOrder.eligibleAt && now >= currentOrder.eligibleAt) {
                 nextStatus = "DELIVERED";
                 note = "Skin gifted to buyer";
            } else {
                // Not eligible yet
                return;
            }
        }
    }

    await prisma.order.update({
        where: { id },
        data: {
            status: nextStatus,
            ...updateData,
            timelineEvents: { create: { status: nextStatus, note } }
        }
    });
    revalidatePath(`/seller/orders/${id}`);
  }

  // Calculate if eligible to gift (for skins)
  const isSkin = order.listing.type === "SKIN_GIFT";
  const now = new Date();
  const isEligible = isSkin && order.eligibleAt && now >= order.eligibleAt;
  const daysLeft = isSkin && order.eligibleAt && now < order.eligibleAt 
      ? Math.ceil((order.eligibleAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
      : 0;

  const isChatEnabled = ["PAYMENT_PENDING", "PAYMENT_CONFIRMED", "SELLER_PENDING", "SELLER_ACCEPTED", "FOLLOW_REQUIRED", "FOLLOWED", "ELIGIBLE_TO_GIFT", "DELIVERED", "BUYER_CONFIRMED", "COMPLETED", "DISPUTED"].includes(order.status);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Order Management</h1>
           <div className="text-slate-400 font-mono text-sm">ORDER ID: {order.id}</div>
        </div>
        <div className="px-4 py-2 bg-purple-950/50 border border-purple-500/30 text-purple-400 rounded-lg font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          {order.status.replace(/_/g, " ")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Order Info */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Order Information</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between">
                 <span className="text-slate-400">Buyer</span>
                 <span className="font-bold">{order.buyer.name} ({order.buyer.email})</span>
               </div>
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
             </CardContent>
           </Card>

           {/* Actions */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Actions</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
               {order.status === "SELLER_PENDING" && (
                 <form action={acceptOrderAction}>
                   <Button className="w-full bg-blue-600 hover:bg-blue-500 font-bold">Accept Order</Button>
                 </form>
               )}

               {order.status === "SELLER_ACCEPTED" && (
                 <form action={markDeliveredAction}>
                   {isSkin ? (
                       <div className="space-y-4">
                           <p className="text-sm text-slate-400">
                               For skin gifts, you must follow the buyer first. After following, an 8-day countdown will begin.
                           </p>
                           <Button className="w-full bg-purple-600 hover:bg-purple-500 font-bold">
                               I have followed the buyer (Start 8-day timer)
                           </Button>
                       </div>
                   ) : (
                       <div className="space-y-4">
                           <p className="text-sm text-slate-400">
                               For account sales, provide credentials in chat. Once done, mark as delivered.
                           </p>
                           <Button className="w-full bg-purple-600 hover:bg-purple-500 font-bold">
                               Mark as Delivered / Handed Over
                           </Button>
                       </div>
                   )}
                 </form>
               )}

               {isSkin && order.status === "FOLLOWED" && (
                   <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
                       {daysLeft > 0 ? (
                           <>
                               <div className="text-yellow-400 font-bold text-xl mb-1">{daysLeft} Days Left</div>
                               <div className="text-sm text-slate-400">You can gift the skin after the countdown.</div>
                           </>
                       ) : (
                           <form action={markDeliveredAction}>
                               <div className="text-green-400 font-bold mb-2">You can now gift the skin!</div>
                               <Button className="w-full bg-green-600 hover:bg-green-500 font-bold">
                                   Mark as Gifted / Delivered
                               </Button>
                           </form>
                       )}
                   </div>
               )}
             </CardContent>
           </Card>

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
             <div className="p-4 bg-red-950/50 border border-red-500 text-red-400 rounded-lg text-center font-bold mt-8">
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
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-black" />
                        <div className="font-bold text-sm text-slate-200">{hist.status.replace(/_/g, " ")}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{new Date(hist.createdAt).toLocaleString()}</div>
                        {hist.note && <div className="text-sm mt-2 text-slate-400 bg-white/5 p-2 rounded">{hist.note}</div>}
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
