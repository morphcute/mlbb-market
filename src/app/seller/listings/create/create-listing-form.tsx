"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createListing } from "@/actions/listing";
import { ListingType } from "@/generated/prisma";
import { Loader2, Upload, User, Shield } from "lucide-react";

export function CreateListingForm() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ListingType>("SKIN_GIFT");
  const [fileName, setFileName] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createListing(formData);
    } catch (error) {
      console.error(error);
      alert("Failed to create listing");
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8 bg-zinc-900 p-8 rounded-xl border border-white/10">
      
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-4 text-slate-300">Listing Type</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${type === "SKIN_GIFT" ? "bg-cyan-950/30 border-cyan-500 text-cyan-400" : "bg-black border-white/10 text-slate-400 hover:bg-zinc-800"}`}>
            <input type="radio" name="type" value="SKIN_GIFT" checked={type === "SKIN_GIFT"} onChange={() => setType("SKIN_GIFT")} className="hidden" />
            <Shield className="w-6 h-6" />
            <span className="font-bold">Skin Gift</span>
          </label>
          <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${type === "ACCOUNT_SALE" ? "bg-cyan-950/30 border-cyan-500 text-cyan-400" : "bg-black border-white/10 text-slate-400 hover:bg-zinc-800"}`}>
            <input type="radio" name="type" value="ACCOUNT_SALE" checked={type === "ACCOUNT_SALE"} onChange={() => setType("ACCOUNT_SALE")} className="hidden" />
            <User className="w-6 h-6" />
            <span className="font-bold">Account Sale</span>
          </label>
        </div>
      </div>

      {/* Common Fields */}
      <div className="space-y-4">
        <div>
           <label className="block text-sm font-medium mb-2 text-slate-300">Listing Title</label>
           <Input name="title" placeholder={type === "SKIN_GIFT" ? "e.g. Gusion Legend Skin" : "e.g. Mythic Glory 1000pts Account"} required className="bg-black/50" />
        </div>

        <div>
           <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
           <textarea name="description" className="w-full min-h-[100px] bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" required placeholder="Describe your item..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">Price (PHP)</label>
             <Input name="pricePhp" type="number" required className="bg-black/50" />
           </div>
           <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">Stock</label>
             <Input name="stock" type="number" defaultValue="1" required className="bg-black/50" />
           </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Listing Image</label>
          <div className="relative">
            <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300 text-sm truncate">{fileName || "Click to upload main image..."}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Specific Fields */}
      {type === "SKIN_GIFT" && (
        <div className="bg-black/30 p-6 rounded-lg border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Skin Details</h3>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Estimated Delivery (Days)</label>
            <Input name="deliveryEtaDays" type="number" defaultValue="8" min="7" className="bg-black/50" />
            <p className="text-xs text-slate-500 mt-1">Minimum 7 days friend requirement for gifting.</p>
          </div>
        </div>
      )}

      {type === "ACCOUNT_SALE" && (
        <div className="bg-black/30 p-6 rounded-lg border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Account Specs</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">MLBB ID & Server</label>
              <div className="flex gap-2">
                 <Input name="mlbbId" placeholder="Game ID" className="bg-black/50 flex-[2]" required />
                 <span className="text-slate-400 py-2">(</span>
                 <Input name="server" placeholder="Server ID" className="bg-black/50 flex-1" required />
                 <span className="text-slate-400 py-2">)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Rank</label>
              <select name="rank" className="w-full h-10 bg-black/50 border border-white/10 rounded px-3 text-white">
                <option>Warrior</option>
                <option>Elite</option>
                <option>Master</option>
                <option>Grandmaster</option>
                <option>Epic</option>
                <option>Legend</option>
                <option>Mythic</option>
                <option>Mythical Honor</option>
                <option>Mythical Glory</option>
                <option>Mythical Immortal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Total Heroes</label>
              <Input name="heroesCount" type="number" className="bg-black/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Total Skins</label>
              <Input name="skinsCount" type="number" className="bg-black/50" />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2 text-slate-300">Bind Status</label>
             <Input name="bindStatus" placeholder="e.g. Moonton Email Only (Clean Bind)" className="bg-black/50" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Delivery Time (Hours)</label>
            <Input name="deliveryEtaHours" type="number" defaultValue="0" className="bg-black/50" />
            <p className="text-xs text-slate-500 mt-1">Instant delivery = 0</p>
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 font-bold h-12 text-lg">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Listing"}
      </Button>
    </form>
  );
}
