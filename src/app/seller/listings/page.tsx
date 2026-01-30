import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SellerListingsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") redirect("/login");
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/apply");

  const listings = await prisma.listing.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/seller/listings/create">
          <Button className="bg-cyan-600 hover:bg-cyan-500">Create New Listing</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <div key={listing.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between mb-2">
               <div className="text-xs px-2 py-0.5 rounded bg-white/10">{listing.type}</div>
               <div className={`text-xs px-2 py-0.5 rounded font-bold ${listing.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 {listing.status}
               </div>
            </div>
            <h3 className="font-bold text-lg mb-1 truncate">{listing.title}</h3>
            <div className="text-cyan-400 font-bold mb-4">₱{listing.pricePhp.toLocaleString()}</div>
            <div className="flex gap-2">
               <Button size="sm" variant="outline" className="w-full border-white/10">Edit</Button>
               {/* Toggle Status Action */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
