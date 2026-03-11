import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { EXTRACT_FROM_IMAGE_PROMPT, EXTRACT_FROM_TEXT_PROMPT } from "@/lib/prompts";
import { extractTextFromPDF } from "@/lib/pdf-parser";

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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const openai = getOpenAIClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === "application/pdf";

    let responseText: string;

    if (isPdf) {
      const text = await extractTextFromPDF(buffer);

      if (!text.trim()) {
        return NextResponse.json(
          { error: "Não foi possível extrair texto do PDF. Tente enviar como imagem." },
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
    } else {
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
    }

    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Analyze error:", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
