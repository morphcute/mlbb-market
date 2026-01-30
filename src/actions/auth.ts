"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthState = {
  error?: string;
  message?: string;
};

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return { error: "Invalid email or password format" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password" };

  await createSession(user.id);

  // Redirect logic based on role
  if (user.role === "ADMIN") redirect("/admin/dashboard");
  if (user.role === "SELLER") {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (seller && seller.status === "VERIFIED") redirect("/seller/dashboard");
    redirect("/seller/status");
  }
  redirect("/account/orders");
  // This line is unreachable but satisfies TS
  return {};
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function registerAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const parsed = registerSchema.safeParse({ name, email, password });
  if (!parsed.success) return { error: "Invalid input format" };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email already registered" };

  const passwordHash = await hashPassword(password);
  
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "BUYER" },
    });
    await createSession(user.id);
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }

  redirect("/account/orders");
  // Unreachable
  return {};
}
