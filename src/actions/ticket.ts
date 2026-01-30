"use server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { TicketStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function createTicketAction(prevState: any, formData: FormData) {const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const orderId = String(formData.get("orderId"));
  const subject = String(formData.get("subject"));
  const description = String(formData.get("description"));

  if (!orderId || !subject || !description) {
    return { error: "Missing fields" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return { error: "Order not found" };

  // Verify user is part of order
  if (order.buyerId !== user.id && order.sellerId !== user.id) {
    return { error: "Unauthorized" };
  }

  // Create ticket
  await prisma.ticket.create({
    data: {
      orderId,
      openedById: user.id,
      subject,
      status: "OPEN",
      messages: {
        create: {
          senderId: user.id,
          content: description,
        }
      }
    }
  });

  // Update order status to DISPUTED
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DISPUTED",
      timelineEvents: {
        create: {
          status: "DISPUTED",
          note: `Dispute opened by ${user.role}: ${subject}`
        }
      }
    }
  });

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/seller/orders/${orderId}`);
  redirect(user.role === "SELLER" ? `/seller/orders/${orderId}` : `/account/orders/${orderId}`);
}
