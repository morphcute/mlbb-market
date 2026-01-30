import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chat from "@/components/Chat";
import { revalidatePath } from "next/cache";
import { deleteReviewAction } from "@/actions/review";
import { Star, Trash2 } from "lucide-react";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        include: { seller: true }
      },
      buyer: true,
      seller: true,
      timelineEvents: {
        orderBy: { createdAt: "desc" }
      },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: true
        }
      },
      tickets: {
        include: {
            messages: { include: { sender: true } }
        }
      },
      review: true
    }
  });

  if (!order) return notFound();

  async function forceCompleteAction() {
    "use server";
    
    await prisma.$transaction(async (tx) => {
        await tx.order.update({
            where: { id: order!.id },
            data: {
                status: "COMPLETED",
                timelineEvents: { create: { status: "COMPLETED", note: "Admin forced completion" } }
            }
        });
        
        await tx.sellerProfile.update({
            where: { userId: order!.sellerId },
            data: { salesCount: { increment: 1 } }
        });
    });

    revalidatePath(`/admin/orders/${id}`);
  }

  async function forceCancelAction() {
    "use server";
    await prisma.order.update({
        where: { id: order!.id },
        data: {
            status: "CANCELLED",
            timelineEvents: { create: { status: "CANCELLED", note: "Admin forced cancellation" } }
        }
    });
    revalidatePath(`/admin/orders/${id}`);
  }

  async function resolveDisputeAction() {
      "use server";
      // Simply close the ticket and mark order as Resolved or keep status.
      // For now, let's just update ticket status if exists
      const ticket = order!.tickets[0]; // Assuming one ticket for now
      if (ticket) {
          await prisma.ticket.update({
              where: { id: ticket.id },
              data: { status: "RESOLVED" }
          });
      }
      revalidatePath(`/admin/orders/${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold mb-2 text-white">Admin Order Control</h1>
           <div className="text-slate-400 font-mono text-sm">ORDER ID: {order.id}</div>
        </div>
        <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-bold">
          {order.status.replace(/_/g, " ")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Order Info */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Details</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <span className="text-slate-400 block text-sm">Buyer</span>
                       <span className="font-bold">{order.buyer.name} ({order.buyer.email})</span>
                   </div>
                   <div>
                       <span className="text-slate-400 block text-sm">Seller</span>
                       <span className="font-bold">{order.seller.name} ({order.seller.email})</span>
                   </div>
                   <div>
                       <span className="text-slate-400 block text-sm">Item</span>
                       <span className="font-bold">{order.listing.title}</span>
                   </div>
                   <div>
                       <span className="text-slate-400 block text-sm">Price</span>
                       <span className="font-bold text-cyan-400">₱{order.listing.pricePhp.toLocaleString()}</span>
                   </div>
               </div>
             </CardContent>
           </Card>

            {/* Tickets / Disputes */}
            {order.tickets.length > 0 && (
                <Card className="bg-red-900/10 border-red-500/20 text-white">
                    <CardHeader className="border-b border-red-500/10">
                        <CardTitle className="text-lg text-red-400">Dispute Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {order.tickets.map(ticket => (
                            <div key={ticket.id} className="p-4 bg-black/40 rounded border border-white/10">
                                <div className="font-bold text-lg">{ticket.subject}</div>
                                <div className="text-slate-400 mb-2">{ticket.messages[0]?.content}</div>
                                <div className="text-xs text-slate-500">Status: {ticket.status}</div>
                                {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                                    <form action={resolveDisputeAction} className="mt-4">
                                        <Button size="sm" variant="outline">Mark Resolved</Button>
                                    </form>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

           {/* Review Section */}
           {order.review && (
             <Card className="bg-purple-900/10 border-purple-500/20 text-white">
               <CardHeader className="border-b border-purple-500/10 flex flex-row items-center justify-between">
                 <CardTitle className="text-lg text-purple-400">Buyer Review</CardTitle>
                 <form action={async () => {
                    "use server";
                    await deleteReviewAction(order.id);
                 }}>
                    <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                       <Trash2 className="w-4 h-4 mr-2" /> Delete Review
                    </Button>
                 </form>
               </CardHeader>
               <CardContent className="pt-6">
                 <div className="space-y-2">
                   <div className="flex items-center gap-1 text-yellow-400">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <Star key={star} className={`w-5 h-5 ${star <= order.review!.rating ? "fill-current" : "opacity-30"}`} />
                     ))}
                   </div>
                   <p className="text-slate-300 italic">"{order.review.comment}"</p>
                   <div className="text-xs text-slate-500 mt-2">Submitted on {new Date(order.review.createdAt).toLocaleDateString()}</div>
                 </div>
               </CardContent>
             </Card>
           )}

           {/* Chat Section - Admin View */}
           <div className="border border-white/10 rounded-xl overflow-hidden">
               <div className="bg-white/5 p-4 border-b border-white/10 font-bold">Chat History</div>
               <Chat 
                  orderId={order.id} 
                  messages={order.chatMessages.map(m => ({
                    ...m,
                    createdAt: m.createdAt.toISOString()
                  }))} 
                  currentUserId={user.id} 
                />
           </div>
        </div>

        <div className="space-y-8">
           {/* Admin Actions */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Admin Actions</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <form action={forceCompleteAction}>
                    <Button className="w-full bg-green-600 hover:bg-green-500 mb-2">Force Complete Order</Button>
                </form>
                <form action={forceCancelAction}>
                    <Button className="w-full bg-red-600 hover:bg-red-500">Force Cancel Order</Button>
                </form>
             </CardContent>
           </Card>

           {/* Timeline */}
           <Card className="bg-zinc-900/80 border-white/10 text-white backdrop-blur-md">
             <CardHeader className="border-b border-white/5">
               <CardTitle className="text-xl">Timeline</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
                <div className="space-y-6 border-l-2 border-white/10 ml-3 pl-6">
                  {order.timelineEvents.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-black" />
                      <div className="font-bold text-sm text-cyan-400">{event.status.replace(/_/g, " ")}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(event.createdAt).toLocaleString()}</div>
                      {event.note && <div className="text-sm text-slate-300 mt-2 bg-white/5 p-2 rounded">{event.note}</div>}
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
