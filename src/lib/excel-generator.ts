import ExcelJS from "exceljs";

interface Transaction {
  data: string;
  descricao: string;
  valor: number;
  beneficiario: string;
  id_operacao?: string;
}

interface GenerateOptions {
  transactions: Transaction[];
  banco?: string;
  periodo?: string;
  titular?: string;
}

function capitalizeMonth(periodo: string): string {
  return periodo.replace(/^\w/, (c) => c.toUpperCase());
}

export async function generateXLSX(opts: GenerateOptions): Promise<Buffer> {
  const { transactions, periodo } = opts;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ANL - Analisador de Extratos";
  workbook.created = new Date();

  const sheetName = periodo
    ? `Retiradas ${capitalizeMonth(periodo.split("/")[0])}`
    : "Retiradas";

  const sheet = workbook.addWorksheet(sheetName, {
    properties: { defaultColWidth: 18 },
  });

  const headerBg: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3F51B5" },
  };
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    size: 11,
    color: { argb: "FFFFFFFF" },
  };
  const headerBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: "thin", color: { argb: "FF303F9F" } },
    right: { style: "thin", color: { argb: "FF5C6BC0" } },
  };

  const headerRow = sheet.addRow([
    "Data da Retirada",
    "Descrição da Transação",
    "Valor Retirado (R$)",
    "Observações",
    "# ID da Operação",
    "Total Acumulado no Mês (R$)",
  ]);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = headerBg;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = headerBorder;
  });

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 6 },
  };

  let accumulated = 0;

  transactions.forEach((t, i) => {
    accumulated += Math.abs(t.valor);

    const row = sheet.addRow([
      t.data,
      t.descricao,
      Math.abs(t.valor),
      "Retirada de Lucro",
      t.id_operacao || "",
      accumulated,
    ]);

    const bgColor = i % 2 === 0 ? "FFFFFFFF" : "FFF5F5F5";
    row.eachCell((cell, colNumber) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
        right: { style: "hair", color: { argb: "FFE0E0E0" } },
      };
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle" };

      if (colNumber === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
      if (colNumber === 3 || colNumber === 6) {
        cell.numFmt = "#,##0.00";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      }
      if (colNumber === 4) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
      if (colNumber === 5) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { size: 10, color: { argb: "FF666666" } };
      }
    });
  });

  const totalRow = sheet.addRow([
    "Total Mensal",
    periodo || "",
    accumulated,
    "",
    "##",
    accumulated,
  ]);
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8EAF6" } };
    cell.border = {
      top: { style: "medium", color: { argb: "FF3F51B5" } },
      bottom: { style: "medium", color: { argb: "FF3F51B5" } },
    };
    cell.alignment = { vertical: "middle" };

    if (colNumber === 3 || colNumber === 6) {
      cell.numFmt = "#,##0.00";
      cell.font = { bold: true, size: 11, color: { argb: "FF1A237E" } };
      cell.alignment = { horizontal: "right", vertical: "middle" };
    }
    if (colNumber === 5) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  });

  sheet.getColumn(1).width = 18;
  sheet.getColumn(2).width = 40;
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 20;
  sheet.getColumn(5).width = 18;
  sheet.getColumn(6).width = 30;

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
