import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/session";
import { ShieldCheck, Clock, User, MessageCircle } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
  });

  if (!listing) {
    return {
      title: "Listing Not Found",
    };
  }

  return {
    title: listing.title,
    description: listing.description || `Buy ${listing.title} securely on MLBB Market.`,
    openGraph: {
      title: listing.title,
      description: listing.description || `Buy ${listing.title} securely on MLBB Market.`,
      images: listing.images.length > 0 ? listing.images : [],
    },
  };
}

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images[0] || "",
    offers: {
      '@type': 'Offer',
      price: listing.pricePhp,
      priceCurrency: 'PHP',
      availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://mlbb-market.vercel.app/listings/${listing.slug}`,
      seller: {
        '@type': 'Person',
        name: listing.seller.displayName,
      },
    },
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden min-h-[400px] relative group">
               {listing.images && listing.images.length > 0 ? (
                 <img src={listing.images[0]} alt={listing.title} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
               ) : (
                 <>
                   <div className={`absolute inset-0 bg-gradient-to-br ${listing.type === 'SKIN_GIFT' ? 'from-purple-900/20 to-blue-900/20' : 'from-orange-900/20 to-red-900/20'}`} />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <h1 className="text-4xl font-bold opacity-20">{listing.type}</h1>
                   </div>
                 </>
               )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                   {listing.type === "SKIN_GIFT" ? "SKIN GIFT" : "ACCOUNT SALE"}
                 </span>
                 <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                   ID: {listing.slug}
                 </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{listing.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-slate-400 border-b border-white/5 pb-6 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Escrow Protected</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-4 text-white">Description</h3>
                <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{listing.description}</p>
              </div>

              {listing.accountSpec && (
                <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/5">
                  <h3 className="text-xl font-semibold mb-4 text-white">Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 text-sm block">Rank</span>
                      <span className="text-lg font-medium">{listing.accountSpec.rank}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm block">Server</span>
                      <span className="text-lg font-medium">{listing.accountSpec.server}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm block">Heroes</span>
                      <span className="text-lg font-medium">{listing.accountSpec.heroesCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm block">Skins</span>
                      <span className="text-lg font-medium">{listing.accountSpec.skinsCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="p-6 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
                <div className="mb-6">
                  <span className="text-slate-400 text-sm">Total Price</span>
                  <div className="text-4xl font-bold text-white mt-1">
                    ₱{listing.pricePhp.toLocaleString()}
                  </div>
                </div>

                <form action={buyAction} className="space-y-3">
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 text-lg shadow-[0_0_20px_rgba(8,145,178,0.3)]">
                    Buy Now
                  </Button>
                  <Button variant="outline" type="button" className="w-full border-white/10 hover:bg-white/5 text-slate-300">
                    Make Offer
                  </Button>
                </form>

                <div className="mt-6 flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                   <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                   <p className="text-xs text-blue-200 leading-relaxed">
                     Your payment is held securely by MLBB Market until you confirm you've received the item.
                   </p>
                </div>
              </div>

              {/* Seller Card */}
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl">
                <h3 className="font-semibold mb-4 text-slate-200">Seller Information</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{listing.seller.displayName}</div>
                    <div className="text-xs text-slate-400">
                      Level {listing.seller.level} Seller
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="bg-black/30 p-2 rounded text-center">
                    <div className="font-bold text-white">{listing.seller.salesCount}</div>
                    <div className="text-xs text-slate-500">Sales</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center">
                    <div className="font-bold text-white">{(listing.seller.ratingCount > 0 ? listing.seller.ratingSum / listing.seller.ratingCount : 0).toFixed(1)}</div>
                    <div className="text-xs text-slate-500">Rating</div>
                  </div>
                </div>

                <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5 text-slate-300 gap-2">
                  <MessageCircle className="w-4 h-4" /> Chat with Seller
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
