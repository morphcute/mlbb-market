import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 border-r border-white/10 p-6">
        <h2 className="text-xl font-bold holo-text mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <a href="/admin/dashboard" className="block text-slate-300 hover:text-white">Dashboard</a>
          <a href="/admin/users" className="block text-slate-300 hover:text-white">Users</a>
          <a href="/admin/listings" className="block text-slate-300 hover:text-white">Listings</a>
          <a href="/admin/orders" className="block text-slate-300 hover:text-white">Orders</a>
          <a href="/" className="block text-slate-300 hover:text-white mt-8 pt-8 border-t border-white/10">Back to Site</a>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
