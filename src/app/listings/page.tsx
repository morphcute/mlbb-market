import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Clock } from "lucide-react";
import { ListingType } from "@/generated/prisma";
import { getSessionUser } from "@/lib/session";
import { UserNav } from "@/components/UserNav";

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
             <form className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  name="q"
                  defaultValue={q}
                  placeholder="Search..." 
                  className="pl-10 bg-white/5 border-white/10"
                />
                {type && <input type="hidden" name="type" value={type} />}
             </form>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              No listings found.
            </div>
          )}
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.slug}`} className="group">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(8,145,178,0.15)] h-full flex flex-col">
                <div className="h-48 bg-zinc-800/50 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${listing.type === 'SKIN_GIFT' ? 'from-purple-900/20 to-blue-900/20' : 'from-orange-900/20 to-red-900/20'}`} />
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-xs">
                    {listing.type}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur text-xs font-bold border border-white/10">
                    {listing.type === "SKIN_GIFT" ? "SKIN" : "ACCOUNT"}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg truncate pr-2 group-hover:text-cyan-400 transition-colors">{listing.title}</h3>
                  </div>
                  
                  <div className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                    {listing.description}
                  </div>

                  {listing.accountSpec && (
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-300">
                      <div className="bg-white/5 rounded px-2 py-1">Rank: {listing.accountSpec.rank}</div>
                      <div className="bg-white/5 rounded px-2 py-1">Heroes: {listing.accountSpec.heroesCount}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${listing.seller.level === 'PLATINUM' ? 'bg-cyan-400' : 'bg-slate-400'}`} />
                      <span className="text-xs text-slate-400">{listing.seller.displayName}</span>
                    </div>
                    <div className="text-cyan-400 font-bold">
                      ₱{listing.pricePhp.toLocaleString()}
                    </div>
                  </div>
                  
                   <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {listing.deliveryEtaDays ? `${listing.deliveryEtaDays} days` : `${listing.deliveryEtaHours} hrs`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {(() => {
                            const reviews = listing.seller.user.reviewsReceived;
                            if (reviews.length === 0) return "New";
                            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                            return avg.toFixed(1);
                        })()}
                        <span className="text-slate-600">({listing.seller.user.reviewsReceived.length})</span>
                      </span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
