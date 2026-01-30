
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createReviewAction(prevState: any, formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const orderId = String(formData.get("orderId"));
  const rating = parseInt(String(formData.get("rating")), 10);
  const comment = String(formData.get("comment"));

  if (!orderId || !rating) {
    return { error: "Missing fields" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return { error: "Order not found" };

  // Verify user is the buyer
  if (order.buyerId !== user.id) {
    return { error: "Unauthorized" };
  }

  // Verify order is completed
  if (order.status !== "COMPLETED") {
    return { error: "Order not completed" };
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { orderId },
  });

  if (existingReview) {
    return { error: "Review already exists" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          orderId,
          buyerId: user.id,
          sellerId: order.sellerId,
          rating,
          comment,
        }
      });

      // Update Seller Profile stats
      await tx.sellerProfile.update({
        where: { userId: order.sellerId },
        data: {
          ratingCount: { increment: 1 },
          ratingSum: { increment: rating }
        }
      });
    });

    revalidatePath(`/account/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating review:", error);
    return { error: "Failed to submit review" };
  }
}

export async function deleteReviewAction(orderId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const review = await prisma.review.findUnique({
      where: { orderId }
    });

    if (!review) {
      return { error: "Review not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { orderId }
      });

      // Revert Seller Profile stats
      await tx.sellerProfile.update({
        where: { userId: review.sellerId },
        data: {
          ratingCount: { decrement: 1 },
          ratingSum: { decrement: review.rating }
        }
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { error: "Failed to delete review" };
  }
}
