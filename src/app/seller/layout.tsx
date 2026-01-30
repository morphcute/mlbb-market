import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/seller/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-purple-500/20 p-4 bg-purple-950/10 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-xl holo-text">MLBB Market</a>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">SELLER</span>
          </div>
          <nav className="flex gap-6 text-sm">
             <a href="/seller/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</a>
             <a href="/seller/listings" className="hover:text-purple-400 transition-colors">My Listings</a>
             <a href="/seller/orders" className="hover:text-purple-400 transition-colors">Orders</a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
