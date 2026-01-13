/**
 * DÉSACTIVÉ - Migration vers Clerk
 * Conservé pour référence.
 *
 * import { handlers } from "@/lib/auth-nextauth";
 * export const { GET, POST } = handlers;
 */

import { NextResponse } from "next/server";

// Retourner 410 Gone pour indiquer que l'auth a migré vers Clerk
export async function GET() {
  return NextResponse.json(
    { message: "Auth migrated to Clerk. Use /sign-in instead." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Auth migrated to Clerk. Use /sign-in instead." },
    { status: 410 }
  );
}
