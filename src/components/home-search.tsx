"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/listings");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skins, heroes, or ranks..." 
          className="pl-10 h-12 bg-white/5 border-white/10 focus:border-cyan-500/50 text-white w-full"
        />
      </div>
      <Button type="submit" className="h-12 px-8 bg-cyan-600 hover:bg-cyan-500 text-white w-full md:w-auto">
        Search
      </Button>
    </form>
  );
}
