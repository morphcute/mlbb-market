import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Filter, Star, Clock } from "lucide-react";
import { ListingType } from "@/generated/prisma";
import { getSessionUser } from "@/lib/session";
import { UserNav } from "@/components/UserNav";
import { Metadata } from "next";
import { Suspense } from "react";
import { SearchListings } from "@/components/search-listings";

export const metadata: Metadata = {
  title: "Browse Listings",
  description: "Find the best MLBB skins and accounts for sale.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  const type = params.type ? (params.type as ListingType) : undefined;
  const q = params.q || "";

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      type: type ? type : undefined,
      title: { contains: q, mode: "insensitive" },
    },
    include: {
      seller: {
        include: {
          user: {
            include: {
              reviewsReceived: true
            }
          }
        }
      },
      skin: true,
      accountSpec: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-black text-white pb-20">
       {/* Header - reused for now, ideally component */}
       <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold holo-text tracking-tight">
            MLBB<span className="text-cyan-400">Market</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
               <UserNav user={user} />
            ) : (
               <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300">Login</Button>
               </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">
            {type === "SKIN_GIFT" ? "Skin Giftings" : type === "ACCOUNT_SALE" ? "Accounts for Sale" : "All Listings"}
          </h1>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Suspense fallback={<div className="w-80 h-10 bg-white/5 rounded animate-pulse" />}>
               <SearchListings />
             </Suspense>
             <Button variant="outline" className="border-white/10 text-slate-300 gap-2">
               <Filter className="w-4 h-4" /> Filter
             </Button>
          </div>
        </div>

        {/* Filters/Tabs */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <Link href="/listings">
            <Button variant={!type ? "primary" : "outline"} className={!type ? "bg-cyan-600 hover:bg-cyan-500" : "border-white/10 text-slate-300"}>
              All
            </Button>
          </Link>
          <Link href="/listings?type=SKIN_GIFT">
            <Button variant={type === "SKIN_GIFT" ? "primary" : "outline"} className={type === "SKIN_GIFT" ? "bg-cyan-600 hover:bg-cyan-500" : "border-white/10 text-slate-300"}>
              Skins
            </Button>
          </Link>
          <Link href="/listings?type=ACCOUNT_SALE">
            <Button variant={type === "ACCOUNT_SALE" ? "primary" : "outline"} className={type === "ACCOUNT_SALE" ? "bg-cyan-600 hover:bg-cyan-500" : "border-white/10 text-slate-300"}>
              Accounts
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Link href={`/listings/${listing.id}`} key={listing.id} className="group">
              <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(8,145,178,0.2)]">
                <div className="aspect-[16/9] bg-slate-900 relative">
                  {/* Placeholder image logic */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                     {listing.type === "SKIN_GIFT" ? "Skin Image" : "Account Image"}
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/30">
                    {listing.type === "SKIN_GIFT" ? "SKIN" : "ACCOUNT"}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      <span>{(listing.seller.ratingCount > 0 ? listing.seller.ratingSum / listing.seller.ratingCount : 0).toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-white">${listing.pricePhp.toFixed(2)}</span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>Instant</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {listings.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
              No listings found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
