"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, ShoppingBag, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/actions/auth";

type UserNavProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "SELLER" | "BUYER";
  };
};

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="w-4 h-4" />
        {user.name || "My Account"}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-bold text-white truncate">{user.name || "User"}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          
          <div className="p-1">
            <Link href="/account/orders" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-lg cursor-pointer">
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </div>
            </Link>

            {user.role === "SELLER" && (
              <Link href="/seller/dashboard" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-lg cursor-pointer">
                  <ShieldCheck className="w-4 h-4" />
                  Seller Dashboard
                </div>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-lg cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </div>
              </Link>
            )}
          </div>

          <div className="p-1 border-t border-white/10">
             <form action={logoutAction}>
                <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-lg cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
