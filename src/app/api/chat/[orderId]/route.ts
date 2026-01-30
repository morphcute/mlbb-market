import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return new NextResponse("Not Found", { status: 404 });

  // Authorization check
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isBuyer && !isSeller && !isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, role: true }
      }
    }
  });

  return NextResponse.json(messages);
}