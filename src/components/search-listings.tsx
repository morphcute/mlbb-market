"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export function SearchListings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Update local state if URL params change externally (e.g. navigation)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    
    // Reset page to 1 if we had pagination (not implemented yet, but good practice)
    // params.delete("page"); 

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 md:w-80">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
       <Input 
         value={query}
         onChange={(e) => setQuery(e.target.value)}
         placeholder="Search..." 
         className="pl-10 bg-white/5 border-white/10 text-white"
       />
    </form>
  );
}
