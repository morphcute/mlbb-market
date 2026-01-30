import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
       <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold holo-text tracking-tight">
            MLBB<span className="text-cyan-400">Market</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-slate-400 mb-8">Enter your order ID to see real-time status updates.</p>
          
          <div className="flex gap-2 mb-8">
            <Input placeholder="Order ID (e.g. clh...)" className="bg-white/5 border-white/10 h-12" />
            <Button className="h-12 px-6 bg-cyan-600 hover:bg-cyan-500">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-left hidden">
            {/* Result placeholder */}
            <div className="font-bold mb-2">Order #12345</div>
            <div className="text-cyan-400 font-mono text-sm">Status: PAYMENT_PENDING</div>
          </div>
        </div>
      </main>
    </div>
  );
}
