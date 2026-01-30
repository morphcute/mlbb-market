import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Metadata } from "next";

async function roleRedirect() {
  const user = await getSessionUser();
  if (!user) return;
  if (user.role === "ADMIN") return redirect("/admin/dashboard");
  if (user.role === "SELLER") {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });
    if (seller && seller.status === "VERIFIED") return redirect("/seller/dashboard");
    return redirect("/seller/status");
  }
  return redirect("/account/orders");
}

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  await roleRedirect();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-8">
        <h1 className="text-2xl font-semibold holo-text">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-300">Login to continue</p>
        <LoginForm />
      </div>
    </div>
  );
}
