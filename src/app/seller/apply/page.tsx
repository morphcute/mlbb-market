import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SellerApplyPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER") return redirect("/login");

  const existingProfile = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  const existingApp = await prisma.sellerApplication.findUnique({ where: { userId: user.id } });
  if (existingProfile) return redirect("/seller/status");

  async function applyAction(formData: FormData) {
    "use server";
    const fullName = String(formData.get("fullName") || "");
    const fbLink = String(formData.get("fbLink") || "");
    const gcashNumber = String(formData.get("gcashNumber") || "");
    const proofUrl = String(formData.get("proofUrl") || "");
    const user = await getSessionUser();
    if (!user) return redirect("/login");
    await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        displayName: fullName,
        status: "APPLICANT",
        level: "BRONZE",
        active: false,
      },
    });
    await prisma.sellerApplication.create({
      data: { userId: user.id, fullName, fbLink, gcashNumber, proofUrl },
    });
    return redirect("/seller/status");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-lg w-full p-8">
        <h1 className="text-2xl font-semibold holo-text">Apply as Seller</h1>
        <p className="mt-2 text-sm text-slate-300">Provide details for verification</p>
        <form action={applyAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Full Name</label>
            <Input name="fullName" required />
          </div>
          <div>
            <label className="text-sm text-slate-300">Facebook Link</label>
            <Input name="fbLink" placeholder="https://facebook.com/yourprofile" />
          </div>
          <div>
            <label className="text-sm text-slate-300">GCash Number</label>
            <Input name="gcashNumber" placeholder="09xxxxxxxxx" />
          </div>
          <div>
            <label className="text-sm text-slate-300">Proof URL</label>
            <Input name="proofUrl" placeholder="Link to proof" />
          </div>
          <Button type="submit" className="w-full">Submit Application</Button>
        </form>
      </div>
    </div>
  );
}
