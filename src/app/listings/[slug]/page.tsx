import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/session";
import { ShieldCheck, Clock, User, MessageCircle } from "lucide-react";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getSessionUser();
  
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      seller: true,
      skin: true,
      accountSpec: true,
    },
  });

  if (!listing) return notFound();

  async function buyAction() {
    "use server";
    const sessionUser = await getSessionUser();
    if (!sessionUser) return redirect(`/login?redirect=/listings/${slug}`);
    
    // Check if user is seller
    if (sessionUser.id === listing?.seller.userId) {
       // Can't buy own listing
       return;
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        buyerId: sessionUser.id,
        sellerId: listing!.seller.userId,
        listingId: listing!.id,
        orderCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        paymentMethod: "PAY_LATER", // Default placeholder
        status: "CREATED",
        timelineEvents: {
          create: {
             status: "CREATED",
             note: "Order started by buyer",
          }
        }
      }
    });

    return redirect(`/account/orders/${order.id}`);
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden min-h-[400px] relative">
               <div className={`absolute inset-0 bg-gradient-to-br ${listing.type === 'SKIN_GIFT' ? 'from-purple-900/20 to-blue-900/20' : 'from-orange-900/20 to-red-900/20'}`} />
               <div className="absolute inset-0 flex items-center justify-center">
                 <h1 className="text-4xl font-bold opacity-20">{listing.type}</h1>
               </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                   {listing.type === "SKIN_GIFT" ? "SKIN GIFT" : "ACCOUNT SALE"}
                 </span>
                 <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                   ID: {listing.id.slice(0, 8)}
                 </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{listing.title}</h1>
              <p className="text-slate-400 leading-relaxed text-lg">{listing.description}</p>
            </div>

            {listing.accountSpec && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4">Account Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-3 bg-black/40 rounded-lg">
                     <div className="text-xs text-slate-500">Rank</div>
                     <div className="font-bold">{listing.accountSpec.rank}</div>
                   </div>
                   <div className="p-3 bg-black/40 rounded-lg">
                     <div className="text-xs text-slate-500">Heroes</div>
                     <div className="font-bold">{listing.accountSpec.heroesCount}</div>
                   </div>
                   <div className="p-3 bg-black/40 rounded-lg">
                     <div className="text-xs text-slate-500">Server</div>
                     <div className="font-bold">{listing.accountSpec.server}</div>
                   </div>
                   <div className="p-3 bg-black/40 rounded-lg">
                     <div className="text-xs text-slate-500">Bind</div>
                     <div className="font-bold">{listing.accountSpec.bindStatus}</div>
                   </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
               <h3 className="text-lg font-bold mb-4">Terms & Instructions</h3>
               <div className="prose prose-invert prose-sm max-w-none">
                 <p>{listing.terms || "No specific terms provided by seller."}</p>
                 {listing.type === "SKIN_GIFT" && (
                   <p className="mt-4 text-yellow-500/80">
                     Note: Requires 8-day friendship period in-game before skin can be gifted. 
                     Seller will follow you after purchase.
                   </p>
                 )}
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sticky top-24">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Price</div>
                  <div className="text-4xl font-bold text-cyan-400">₱{listing.pricePhp.toLocaleString()}</div>
                </div>
              </div>

              <form action={buyAction}>
                <Button className="w-full h-12 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)] mb-4">
                   Buy Now
                </Button>
              </form>

              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Delivery: {listing.deliveryEtaDays ? `${listing.deliveryEtaDays} Days` : `${listing.deliveryEtaHours} Hours`}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                   Seller Information
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{listing.seller.displayName}</div>
                    <div className="text-xs text-slate-500">{listing.seller.level} Seller</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat Seller
                </Button>
                <p className="text-xs text-slate-500 mt-2 text-center">Chat available after purchase confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
