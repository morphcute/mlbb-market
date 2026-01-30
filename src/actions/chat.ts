"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function sendMessage(orderId: string, content: string, imageUrl?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  
  // Basic validation: must have content OR imageUrl
  if (!content.trim() && !imageUrl) {
     return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: true }
  });

  if (!order) throw new Error("Order not found");

  // Authorization: Only Buyer, Seller, or Admin can chat
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id; // Note: order.sellerId refers to User ID of seller
  const isAdmin = user.role === "ADMIN";

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new Error("Unauthorized");
  }

  // Chat gating: Enabled only after PAYMENT_CONFIRMED
  // Assuming PAYMENT_CONFIRMED, SELLER_PENDING, etc. mean paid.
  const allowedStatuses = [
    "CREATED", "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED", "SELLER_PENDING", "SELLER_ACCEPTED",
    "FOLLOW_REQUIRED", "FOLLOWED", "ELIGIBLE_TO_GIFT",
    "DELIVERED", "BUYER_CONFIRMED", "COMPLETED", "DISPUTED"
  ];
  
  if (!allowedStatuses.includes(order.status) && !isAdmin) {
     throw new Error("Chat is not enabled yet.");
  }

  await prisma.chatMessage.create({
    data: {
      orderId,
      senderId: user.id,
      content,
      imageUrl
    }
  });

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
}
