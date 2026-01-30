import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { ListingType } from "@/generated/prisma";

export default async function CreateListingPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") redirect("/login");
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/apply");

  async function createListingAction(formData: FormData) {
    "use server";
    const title = String(formData.get("title"));
    const description = String(formData.get("description"));
    const pricePhp = Number(formData.get("pricePhp"));
    const type = String(formData.get("type")) as ListingType;
    const deliveryEtaDays = Number(formData.get("deliveryEtaDays") || 0);
    const deliveryEtaHours = Number(formData.get("deliveryEtaHours") || 0);
    const stock = Number(formData.get("stock") || 1);

    // Simplified creation
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);

    await prisma.listing.create({
      data: {
        seller: {
          connect: { id: seller!.id }
        },
        title,
        slug,
        description,
        pricePhp,
        type,
        stock,
        deliveryEtaDays,
        deliveryEtaHours,
        status: "ACTIVE",
        terms: "Standard terms apply.",
        // For simplicity not creating Skin/AccountSpec relations in this quick form
        // In real app, conditional fields would populate those.
        accountSpec: type === "ACCOUNT_SALE" ? {
             create: {
                 rank: String(formData.get("rank") || "Legend"),
                 region: "SEA",
                 server: "1234",
                 heroesCount: 50,
                 skinsCount: 50,
                 bindStatus: "Moonton Only"
             }
        } : undefined
      }
    });

    redirect("/seller/listings");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
      <form action={createListingAction} className="space-y-6 bg-zinc-900 p-8 rounded-xl border border-white/10">
        <div>
           <label className="block text-sm font-medium mb-2 text-slate-300">Listing Type</label>
           <select name="type" className="w-full h-10 bg-black border border-white/10 rounded px-3 text-white">
             <option value="SKIN_GIFT">Skin Gift</option>
             <option value="ACCOUNT_SALE">Account Sale</option>
           </select>
        </div>

        <div>
           <label className="block text-sm font-medium mb-2 text-slate-300">Title</label>
           <Input name="title" placeholder="e.g. Alucard Legend Skin" required />
        </div>

        <div>
           <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
           <textarea name="description" className="w-full min-h-[100px] bg-black border border-white/10 rounded px-3 py-2 text-white" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">Price (PHP)</label>
             <Input name="pricePhp" type="number" required />
           </div>
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">Stock</label>
             <Input name="stock" type="number" defaultValue="1" required />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">ETA Days (Skins)</label>
             <Input name="deliveryEtaDays" type="number" defaultValue="8" />
           </div>
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">ETA Hours (Accounts)</label>
             <Input name="deliveryEtaHours" type="number" defaultValue="0" />
           </div>
        </div>
        
        {/* Simplified Account Fields Placeholder */}
        <div className="pt-4 border-t border-white/10">
           <p className="text-xs text-slate-500 mb-2">If Account Sale:</p>
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">Rank</label>
             <Input name="rank" placeholder="e.g. Mythical Glory" />
           </div>
        </div>

        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500">Create Listing</Button>
      </form>
    </div>
  );
}
