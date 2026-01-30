import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle, Wallet, Users, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const pendingOrders = await prisma.order.count({ where: { status: "PAYMENT_PENDING" } });
  const activeListings = await prisma.listing.count({ where: { status: "ACTIVE" } });
  const pendingSellers = await prisma.sellerProfile.count({ where: { status: "APPLICANT" } });
  const disputedOrders = await prisma.order.count({ where: { status: "DISPUTED" } });

  // Calculate Escrow (Paid but not released)
  // Statuses where money is held: PAYMENT_CONFIRMED through BUYER_CONFIRMED/DISPUTED
  const escrowOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [
          "PAYMENT_CONFIRMED",
          "SELLER_PENDING", 
          "SELLER_ACCEPTED",
          "FOLLOW_REQUIRED",
          "FOLLOWED",
          "ELIGIBLE_TO_GIFT",
          "DELIVERED",
          "BUYER_CONFIRMED",
          "DISPUTED"
        ]
      }
    },
    include: { listing: true }
  });

  const escrowTotal = escrowOrders.reduce((sum, order) => sum + order.listing.pricePhp, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/orders?status=PAYMENT_PENDING">
            <Card className="bg-zinc-900 border-white/10 text-white hover:border-cyan-500/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">Pending Payments</CardTitle>
                <ShoppingCart className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{pendingOrders}</div>
                <div className="text-xs text-slate-500 mt-2">Orders awaiting manual confirm</div>
            </CardContent>
            </Card>
        </Link>

        <Link href="/admin/orders?status=DISPUTED">
            <Card className={`bg-zinc-900 border-white/10 text-white hover:border-red-500/50 transition-colors cursor-pointer h-full ${disputedOrders > 0 ? 'border-red-500/30 bg-red-950/10' : ''}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className={`text-sm font-medium ${disputedOrders > 0 ? 'text-red-400' : 'text-slate-400'}`}>Active Disputes</CardTitle>
                <AlertCircle className={`h-4 w-4 ${disputedOrders > 0 ? 'text-red-400' : 'text-slate-500'}`} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{disputedOrders}</div>
                <div className="text-xs text-slate-500 mt-2">Requires immediate attention</div>
            </CardContent>
            </Card>
        </Link>

        <Link href="/admin/sellers">
            <Card className="bg-zinc-900 border-white/10 text-white hover:border-cyan-500/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">Seller Applications</CardTitle>
                <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{pendingSellers}</div>
                <div className="text-xs text-slate-500 mt-2">Pending verification</div>
            </CardContent>
            </Card>
        </Link>

        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">Escrow Held</CardTitle>
            <Wallet className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">₱{escrowTotal.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">Across {escrowOrders.length} active orders</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links / Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-white/10 text-white">
            <CardHeader>
                <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Active Listings</span>
                    <span className="font-bold">{activeListings}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Database Status</span>
                    <span className="text-green-400 font-bold">Connected</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Payment Gateway</span>
                    <span className="text-yellow-400 font-bold">Manual Mode</span>
                </div>
            </CardContent>
        </Card>

        {/* Recent Disputes List - Mini version */}
        {disputedOrders > 0 && (
             <Card className="bg-red-950/10 border-red-500/20 text-white">
                <CardHeader>
                    <CardTitle className="text-red-400">Priority Attention</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href="/admin/orders?status=DISPUTED">
                        <Button variant="destructive" className="w-full">
                            View {disputedOrders} Disputes
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
