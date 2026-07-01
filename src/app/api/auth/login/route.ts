import { NextResponse, type NextRequest } from "next/server";
import { ApiError, login, setTokens } from "@/lib/auth";
import { CredentialsError, parseCredentials } from "@/lib/credentials";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = parseCredentials(await req.json().catch(() => null));
    await setTokens(await login(email, password));
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof CredentialsError) return NextResponse.json({ message: e.message }, { status: 400 });
    if (e instanceof ApiError) return NextResponse.json({ message: e.message }, { status: e.status });
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
