import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { UserNav } from "@/components/UserNav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold holo-text tracking-tight">
            MLBB<span className="text-cyan-400">Market</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/listings?type=SKIN_GIFT" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Skins
            </Link>
            <Link href="/listings?type=ACCOUNT_SALE" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Accounts
            </Link>
            <Link href="/track" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Track Order
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
               <UserNav user={user} />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white border-none shadow-[0_0_15px_rgba(8,145,178,0.5)]">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black -z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Live Marketplace
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Premium MLBB Skins
            </span>
            <br />
            <span className="text-4xl md:text-6xl text-slate-500">& Verified Accounts</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            The safest place to buy Mobile Legends skins and accounts. 
            Escrow protection, verified sellers, and instant delivery tracking.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
             <HomeSearch />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-cyan-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-200">Safe Escrow</h3>
            <p className="text-slate-400">Payments are held secure until you confirm receipt. 100% money-back guarantee.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-200">Fast Delivery</h3>
            <p className="text-slate-400">Verified sellers with tracked delivery times. Get your skins and accounts fast.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-pink-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-200">Huge Selection</h3>
            <p className="text-slate-400">Thousands of skins and high-rank accounts available at competitive prices.</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 MLBB Market. Not affiliated with Moonton.</p>
        </div>
      </footer>
    </div>
  );
}
