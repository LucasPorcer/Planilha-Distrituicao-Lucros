import { NextRequest, NextResponse } from "next/server";
import { generateXLSX } from "@/lib/excel-generator";

function validatePassword(req: NextRequest): boolean {
  const pw = req.headers.get("x-access-password") || "";
  const correct = process.env.ACCESS_PASSWORD || "anl2026";
  return pw === correct;
}

export async function POST(req: NextRequest) {
  if (!validatePassword(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { transactions, banco, periodo, titular } = body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma transação fornecida" },
        { status: 400 }
      );
    }

    const buffer = await generateXLSX({ transactions, banco, periodo, titular });
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="distribuicao-lucros.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Generate XLSX error:", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
