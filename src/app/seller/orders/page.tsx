import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SellerOrdersPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") redirect("/login");
  
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/apply");

  const orders = await prisma.order.findMany({
    where: { listing: { sellerId: seller.id } },
    include: { listing: true, buyer: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Manage Orders</h1>
      
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-center p-12 border border-white/10 rounded-xl bg-white/5 text-slate-500">
            No orders yet.
          </div>
        )}
        
        {orders.map(order => (
          <Link key={order.id} href={`/seller/orders/${order.id}`} className="block group">
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 transition-all hover:border-purple-500/50 hover:bg-zinc-900">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-bold text-lg text-slate-200 group-hover:text-purple-400 transition-colors">{order.listing.title}</div>
                  <div className="text-sm text-slate-400">Order #{order.id.slice(0,8)} • Buyer: {order.buyer.name || order.buyer.email}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-400">₱{order.listing.pricePhp.toLocaleString()}</div>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-1 font-bold
                    ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                      order.status === 'SELLER_PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-purple-500/20 text-purple-400'}
                  `}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                 <Button size="sm" variant="outline" className="border-white/10 group-hover:bg-white/10">
                   View Details
                 </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
