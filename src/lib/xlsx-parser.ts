export async function extractTextFromXLSX(buffer: Buffer): Promise<string> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();
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
