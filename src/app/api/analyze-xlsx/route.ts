import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { EXTRACT_FROM_TEXT_PROMPT } from "@/lib/prompts";
import ExcelJS from "exceljs";

function validatePassword(req: NextRequest): boolean {
  const pw = req.headers.get("x-access-password") || "";
  const correct = process.env.ACCESS_PASSWORD || "anl2026";
  return pw === correct;
}

async function xlsxToText(buffer: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  const lines: string[] = [];
  workbook.eachSheet((sheet) => {
    lines.push(`=== ${sheet.name} ===`);
    sheet.eachRow((row) => {
      const values = row.values as (string | number | null | undefined)[];
      const cells = values
        .slice(1)
        .map((v) => (v != null ? String(v) : ""))
        .join(" | ");
      if (cells.trim()) lines.push(cells);
    });
  });

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  if (!validatePassword(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    console.log("[analyze-xlsx] file:", file.name, "size:", file.size);

    const buffer = Buffer.from(await file.arrayBuffer());

    let text: string;
    try {
      text = await xlsxToText(buffer);
    } catch (extractErr) {
      console.error("[analyze-xlsx] parse error:", extractErr);
      const msg = extractErr instanceof Error ? extractErr.message : String(extractErr);
      return NextResponse.json({ error: `Erro ao ler Excel: ${msg}` }, { status: 422 });
    }

    console.log("[analyze-xlsx] extracted text length:", text.length);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Não foi possível extrair dados do Excel." },
        { status: 422 }
      );
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: EXTRACT_FROM_TEXT_PROMPT + text,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";
    console.log("[analyze-xlsx] AI response length:", responseText.length);

    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[analyze-xlsx] error:", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
