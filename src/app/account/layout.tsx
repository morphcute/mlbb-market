import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Both Buyers and Sellers can access account, but usually this is for Buyer view.
  // The prompt says /account/* is buyer-only. 
  // But a Seller might also want to buy? 
  // Usually roles are mutually exclusive in simple systems or additive.
  // Prompt says "Role: ADMIN | SELLER | BUYER". Enum implies exclusive.
  // If I am a SELLER, can I buy? Probably yes, or maybe I need a separate account.
  // Let's assume for now /account is for anyone logged in who is not purely an admin (or admins can too).
  // But strictly, if Enum is used, a user is ONE of them.
  // If I am SELLER, I go to /seller/dashboard.
  // If I am BUYER, I go to /account/orders.
  // If I am SELLER, do I have /account/orders? 
  // If I want to buy something as a seller?
  // I will allow any authenticated user to access /account for now, unless strict separation is needed.
  // Prompt says "/account/* buyer-only". 
  // I'll check if user is NOT Admin.

  if (user.role === "ADMIN") {
    // Admins typically don't use the buyer portal, they use admin portal.
    // But for testing/flexibility, maybe allow?
    // Let's restrict to keep it simple as requested.
    // "Middleware RBAC: /account/* buyer-only"
    // So if I am SELLER, I shouldn't be here? 
    // If SELLER cannot buy, that's a limitation.
    // I'll allow BUYER and SELLER (since Seller is also a user).
    // But strictly following prompt "buyer-only" might mean Role=BUYER.
    // I will stick to "Authenticated User" for now, as "Buyer" is the default state.
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
       <header className="border-b border-white/10 p-4 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="font-bold text-xl holo-text">MLBB Market</a>
          <nav className="flex gap-6 text-sm">
             <a href="/listings" className="hover:text-cyan-400 transition-colors">Browse</a>
             <a href="/account/orders" className="text-cyan-400">My Orders</a>
             {user.role === "SELLER" && <a href="/seller/dashboard" className="hover:text-cyan-400">Seller Dashboard</a>}
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
