import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Dashboard",
};

export default async function SellerDashboard() {
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/apply");
  if (seller.status !== "VERIFIED") redirect("/seller/status");

  const activeListings = await prisma.listing.count({ where: { sellerId: seller.id, status: "ACTIVE" } });
  const pendingOrders = await prisma.order.count({ 
    where: { 
      listing: { sellerId: seller.id },
      status: { in: ["SELLER_PENDING", "SELLER_ACCEPTED", "PAYMENT_CONFIRMED"] }
    } 
  });
  const completedOrders = await prisma.order.count({ 
    where: { 
      listing: { sellerId: seller.id },
      status: "COMPLETED" 
    } 
  });

  const recentOrders = await prisma.order.findMany({
    where: { listing: { sellerId: seller.id } },
    include: { listing: true, buyer: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold">Seller Dashboard</h1>
         <div className="text-sm text-slate-400">Level: <span className="text-purple-400 font-bold">{seller.level}</span></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Pending Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-400">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Active Listings</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-cyan-400">{activeListings}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Completed Sales</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">{completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="text-slate-500 p-8 border border-white/5 rounded-xl bg-white/5 text-center">
            No orders yet.
          </div>
        ) : (
          <div className="grid gap-4">
             {recentOrders.map(order => (
               <a key={order.id} href={`/seller/orders/${order.id}`} className="block bg-zinc-900/50 border border-white/10 p-4 rounded-lg hover:bg-zinc-900 transition-colors">
                 <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-200">{order.listing.title}</div>
                      <div className="text-xs text-slate-500">
                        {order.buyer.name} • {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="font-bold text-cyan-400">₱{order.listing.pricePhp.toLocaleString()}</div>
                       <div className="text-xs text-slate-400">{order.status}</div>
                    </div>
                 </div>
               </a>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
