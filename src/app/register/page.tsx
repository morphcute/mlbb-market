import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) return redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-8">
        <h1 className="text-2xl font-semibold holo-text">Create buyer account</h1>
        <p className="mt-2 text-sm text-slate-300">Register to place orders</p>
        <RegisterForm />
      </div>
    </div>
  );
}
