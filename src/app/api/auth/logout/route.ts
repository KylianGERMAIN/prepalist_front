import { NextResponse, type NextRequest } from "next/server";
import { clearTokens } from "@/lib/auth";

export async function POST() {
  await clearTokens();
  return NextResponse.json({ ok: true });
}

/** Cible du middleware 401 de `serverApi`, qui a besoin d'une redirection. */
export async function GET(req: NextRequest) {
  await clearTokens();
  return NextResponse.redirect(new URL("/login", req.url));
}
