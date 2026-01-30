import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function AdminSellersPage() {
  const applicants = await prisma.sellerProfile.findMany({
    where: { status: "APPLICANT" },
    include: {
      user: {
        include: { sellerApplication: true }
      }
    },
    orderBy: { createdAt: "asc" },
  });

  const verifiedSellers = await prisma.sellerProfile.findMany({
    where: { status: "VERIFIED" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  async function verifySellerAction(formData: FormData) {
    "use server";
    const sellerId = String(formData.get("sellerId"));
    const action = String(formData.get("action")); // "approve" | "reject"

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
    if (!sellerProfile) return;

    if (action === "approve") {
      await prisma.$transaction([
        prisma.sellerProfile.update({
            where: { id: sellerId },
            data: { status: "VERIFIED", active: true }
        }),
        prisma.sellerApplication.update({
            where: { userId: sellerProfile.userId },
            data: { reviewedAt: new Date(), decisionNote: "Approved by admin" }
        })
      ]);
    } else {
      await prisma.$transaction([
        prisma.sellerProfile.update({
            where: { id: sellerId },
            data: { status: "REJECTED", active: false }
        }),
        prisma.sellerApplication.update({
            where: { userId: sellerProfile.userId },
            data: { reviewedAt: new Date(), decisionNote: "Rejected by admin" }
        })
      ]);
    }
    revalidatePath("/admin/sellers");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Sellers</h1>

      {/* Applicants Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">Pending Applications</h2>
        {applicants.length === 0 ? (
           <div className="text-slate-500 p-4 border border-white/5 rounded-xl">No pending applications.</div>
        ) : (
          <div className="space-y-4">
            {applicants.map(app => (
              <div key={app.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{app.displayName}</h3>
                    <div className="text-sm text-slate-400">User: {app.user.email}</div>
                    <div className="text-sm text-slate-400 mt-2">
                        <p>Real Name: {app.user.sellerApplication?.fullName}</p>
                        <p>FB: {app.user.sellerApplication?.fbLink}</p>
                        <p>GCash: {app.user.sellerApplication?.gcashNumber}</p>
                        <p>Proof: <a href={app.user.sellerApplication?.proofUrl || "#"} target="_blank" className="text-blue-400 underline">View</a></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={verifySellerAction}>
                      <input type="hidden" name="sellerId" value={app.id} />
                      <input type="hidden" name="action" value="reject" />
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-950">Reject</Button>
                    </form>
                    <form action={verifySellerAction}>
                      <input type="hidden" name="sellerId" value={app.id} />
                      <input type="hidden" name="action" value="approve" />
                      <Button className="bg-green-600 hover:bg-green-500">Approve</Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified List Preview */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-300">Verified Sellers (Recent)</h2>
        <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
           <table className="w-full text-left">
             <thead className="bg-white/5 border-b border-white/10">
               <tr>
                 <th className="p-4">Name</th>
                 <th className="p-4">Level</th>
                 <th className="p-4">Active</th>
                 <th className="p-4">Joined</th>
               </tr>
             </thead>
             <tbody>
               {verifiedSellers.map(seller => (
                 <tr key={seller.id} className="border-b border-white/5 hover:bg-white/5">
                   <td className="p-4">{seller.displayName}</td>
                   <td className="p-4 text-purple-400">{seller.level}</td>
                   <td className="p-4">{seller.active ? "Yes" : "No"}</td>
                   <td className="p-4 text-slate-500">{new Date(seller.createdAt).toLocaleDateString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </section>
    </div>
  );
}
