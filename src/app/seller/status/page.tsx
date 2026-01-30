import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SellerStatusPage() {
  const user = await getSessionUser();
  if (!user) return redirect("/login");
  const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return redirect("/seller/apply");
  return (
    <div className="p-8">
      <div className="glass-card max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold holo-text">Seller Verification</h1>
        <p className="mt-3 text-slate-300">Status: {profile.status}</p>
        <p className="mt-2 text-slate-400">
          You will be notified when an admin verifies your account. Verified sellers can create
          listings and receive orders.
        </p>
      </div>
    </div>
  );
}
