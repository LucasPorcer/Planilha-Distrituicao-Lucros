import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ACCESS_PASSWORD || "anl2026";

  if (password === correct) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
}
