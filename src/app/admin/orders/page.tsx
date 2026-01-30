import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { OrderStatus } from "@/generated/prisma";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ? (params.status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: {
      status: status,
    },
    orderBy: { createdAt: "desc" },
    include: {
      listing: true,
      buyer: true
    }
  });

  async function confirmPaymentAction(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId"));
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SELLER_PENDING",
        timelineEvents: {
          create: {
            status: "SELLER_PENDING",
            note: "Admin confirmed payment. Ready for seller.",
          }
        }
      }
    });

    revalidatePath("/admin/orders");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
      
      <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Proof</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-sm">{order.id.slice(0,8)}</td>
                <td className="p-4">{order.buyer.name || order.buyer.email}</td>
                <td className="p-4 font-bold text-cyan-400">₱{order.listing.pricePhp.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold bg-white/10`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  {order.paymentProofUrl ? (
                    <a href={order.paymentProofUrl} target="_blank" className="text-blue-400 underline text-xs">View Proof</a>
                  ) : "-"}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {order.status === "PAYMENT_PENDING" && (
                      <form action={confirmPaymentAction}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <Button size="sm" className="bg-green-600 hover:bg-green-500">Confirm Payment</Button>
                      </form>
                    )}
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
