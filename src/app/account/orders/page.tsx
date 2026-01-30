import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BuyerOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: {
      listing: {
        include: { seller: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-slate-500 p-8 border border-white/5 rounded-xl bg-white/5 text-center">
            You haven't placed any orders yet.
          </div>
        )}
        {orders.map(order => (
          <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
            <div className="bg-white/5 border border-white/5 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-lg">{order.listing.title}</h3>
                   <div className="text-sm text-slate-400">Order #{order.id.slice(0,8)} • Seller: {order.listing.seller.displayName}</div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-cyan-400">₱{order.listing.pricePhp.toLocaleString()}</div>
                   <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <span className={`px-2 py-1 rounded text-xs font-bold
                    ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 
                      order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }
                 `}>
                   {order.status.replace(/_/g, " ")}
                 </span>
                 <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">
                   {order.listing.type}
                 </span>
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
