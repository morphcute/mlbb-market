import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mlbb.com' },
    update: {},
    create: {
      email: 'admin@mlbb.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  })

  // Seller
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@mlbb.com' },
    update: {},
    create: {
      email: 'seller@mlbb.com',
      name: 'Pro Seller',
      passwordHash,
      role: 'SELLER',
    },
  })

  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      displayName: 'TopGlobalSeller',
      status: 'VERIFIED',
      level: 'GOLD',
      active: true,
    },
  })

  // Buyer
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@mlbb.com' },
    update: {},
    create: {
      email: 'buyer@mlbb.com',
      name: 'Casual Buyer',
      passwordHash,
      role: 'BUYER',
    },
  })

  // Listings
  // 1. Skin Gift
  const skin = await prisma.skin.create({
    data: {
      name: 'Gusion K',
      slug: 'gusion-k-' + Math.random().toString(36).substring(7),
      category: 'K-Series',
      active: true
    }
  })

  const skinListing = await prisma.listing.create({
    data: {
      sellerId: sellerProfile.id,
      title: 'Gusion - K',
      slug: 'gusion-k-skin-' + Math.random().toString(36).substring(7),
      description: 'The legendary K skin for Gusion. Requires 7 days friendship.',
      pricePhp: 1200,
      type: 'SKIN_GIFT',
      stock: 5,
      deliveryEtaDays: 8,
      status: 'ACTIVE',
      terms: 'Must follow my account ID 12345678',
      skinId: skin.id
    }
  })

  // 2. Account Sale
  const accountSpec = await prisma.accountSpec.create({
    data: {
      rank: 'Mythic Glory',
      region: 'PH',
      server: '1001',
      heroesCount: 120,
      skinsCount: 300,
      bindStatus: 'All Unbind Available'
    }
  })

  const accountListing = await prisma.listing.create({
    data: {
      sellerId: sellerProfile.id,
      title: 'Mythic Glory 100 Stars Account',
      slug: 'mythic-glory-account-' + Math.random().toString(36).substring(7),
      description: 'High end account with 300 skins including Collectors.',
      pricePhp: 15000,
      type: 'ACCOUNT_SALE',
      stock: 1,
      deliveryEtaHours: 24,
      status: 'ACTIVE',
      terms: 'Full surrender of email and moonton account.',
      accountSpecId: accountSpec.id
    }
  })

  console.log({ admin, sellerUser, buyerUser, skinListing, accountListing })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
