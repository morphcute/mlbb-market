"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ListingType } from "@/generated/prisma";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createListing(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "SELLER") {
    throw new Error("Unauthorized");
  }

  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) {
    throw new Error("Seller profile not found");
  }

  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const pricePhp = Number(formData.get("pricePhp"));
  const type = String(formData.get("type")) as ListingType;
  const stock = Number(formData.get("stock") || 1);
  const deliveryEtaDays = Number(formData.get("deliveryEtaDays") || 0);
  const deliveryEtaHours = Number(formData.get("deliveryEtaHours") || 0);

  // Handle Image Upload
  const imageFile = formData.get("image") as File;
  let imageUrls: string[] = [];
  
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = Date.now() + "_" + imageFile.name.replace(/\s/g, "_");
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    imageUrls.push(`/uploads/${filename}`);
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);

  await prisma.listing.create({
    data: {
      seller: {
        connect: { id: seller.id }
      },
      title,
      slug,
      description,
      pricePhp,
      type,
      stock,
      deliveryEtaDays,
      deliveryEtaHours,
      status: "ACTIVE",
      terms: "Standard terms apply.",
      images: imageUrls,
      
      accountSpec: type === "ACCOUNT_SALE" ? {
           create: {
               rank: String(formData.get("rank") || "Legend"),
               region: String(formData.get("region") || "SEA"),
               mlbbId: String(formData.get("mlbbId") || ""),
               server: String(formData.get("server") || ""),
               heroesCount: Number(formData.get("heroesCount") || 0),
               skinsCount: Number(formData.get("skinsCount") || 0),
               bindStatus: String(formData.get("bindStatus") || "Moonton Only"),
           }
      } : undefined,

      skin: type === "SKIN_GIFT" ? {
          create: {
              name: title, // Simplified, ideally select from existing skins
              slug: slug + "-skin",
              category: "Skin"
          }
      } : undefined
    }
  });

  redirect("/seller/listings");
}
