import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { EXTRACT_FROM_IMAGE_PROMPT, EXTRACT_FROM_TEXT_PROMPT } from "@/lib/prompts";
import { extractTextFromPDF } from "@/lib/pdf-parser";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function validatePassword(req: NextRequest): boolean {
  const pw = req.headers.get("x-access-password") || "";
  const correct = process.env.ACCESS_PASSWORD || "anl2026";
  return pw === correct;
}

function isImage(type: string): boolean {
  return type.startsWith("image/");
}

async function parseXlsx(buffer: Buffer): Promise<string> {
  const ExcelJS = (await import("exceljs")).default;
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

    console.log("[analyze] file:", file.name, "type:", file.type, "size:", file.size);

    const openai = getOpenAIClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === "application/pdf";
    const isXlsx = file.type === XLSX_MIME || file.name.endsWith(".xlsx");

    let responseText: string;

    if (isPdf || isXlsx) {
      console.log("[analyze] extracting text from", isPdf ? "PDF" : "XLSX");

      let text: string;
      try {
        text = isPdf
          ? await extractTextFromPDF(buffer)
          : await parseXlsx(buffer);
      } catch (extractErr) {
        console.error("[analyze] extraction error:", extractErr);
        const msg = extractErr instanceof Error ? extractErr.message : String(extractErr);
        return NextResponse.json(
          { error: `Erro ao ler arquivo: ${msg}` },
          { status: 422 }
        );
      }

      console.log("[analyze] extracted text length:", text.length);

      if (!text.trim()) {
        return NextResponse.json(
          { error: "Não foi possível extrair dados do arquivo. Tente enviar como imagem." },
          { status: 422 }
        );
      }

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

      responseText = completion.choices[0]?.message?.content || "";
    } else if (isImage(file.type)) {
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: EXTRACT_FROM_IMAGE_PROMPT,
              },
            ],
          },
        ],
      });

      responseText = completion.choices[0]?.message?.content || "";
    } else {
      return NextResponse.json(
        { error: "Formato de arquivo não suportado. Use PDF, Excel (.xlsx) ou imagem." },
        { status: 400 }
      );
    }

    console.log("[analyze] AI response length:", responseText.length);

    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[analyze] error:", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
