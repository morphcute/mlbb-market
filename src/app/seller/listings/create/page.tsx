import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { CreateListingForm } from "./create-listing-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Listing | Seller Center",
};

export default async function CreateListingPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") redirect("/login");
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/apply");

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
      <CreateListingForm />
    </div>
  );
}
