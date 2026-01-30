import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { addDays } from "./time";
import { prisma } from "./prisma";

const SESSION_COOKIE = "session_token";
const DEFAULT_TTL_DAYS = 7;

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    (await cookies()).delete(SESSION_COOKIE);
    return null;
  }
  return session.user;
}

export async function createSession(userId: string, ttlDays = DEFAULT_TTL_DAYS) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = addDays(new Date(), ttlDays);
  await prisma.session.create({
    data: { userId, sessionToken: token, expiresAt },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: ttlDays * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;
  await prisma.session.deleteMany({ where: { sessionToken: token } });
  (await cookies()).delete(SESSION_COOKIE);
}
