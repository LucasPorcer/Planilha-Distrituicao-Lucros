export const EXTRACT_TRANSACTIONS_PROMPT = `Você é um especialista em análise de extratos bancários brasileiros.

Analise o extrato bancário fornecido e extraia SOMENTE as transações que são transferências PIX ou TED enviadas para uma PESSOA FÍSICA (PF).
Foque especificamente em:
- PIX enviados para pessoa física
- Transferências para pessoa física
- TEDs para pessoa física

IGNORE completamente:
- Pagamentos de boletos, contas, faturas
- Transferências para CNPJ / empresas / PJ
- Tarifas, IOF, impostos
- Entradas, créditos, depósitos, rendimentos
- Saques em caixa eletrônico
- Débitos automáticos de serviços

Para cada transação, retorne um objeto JSON com:
- "data": data da transação no formato "DD/MM/AAAA"
- "descricao": descrição completa da transação incluindo o nome do beneficiário (ex: "Transferência Pix enviada Ana Batista")
- "valor": valor ABSOLUTO da transação (número positivo, sem símbolo de moeda)
- "beneficiario": nome COMPLETO do beneficiário/destinatário (a pessoa que recebeu)
- "id_operacao": ID/código da operação se disponível no extrato, ou string vazia

Retorne APENAS um JSON válido no formato:
{
  "transactions": [
    { "data": "02/01/2026", "descricao": "Transferência Pix enviada Ana Batista", "valor": 240.61, "beneficiario": "Ana Batista", "id_operacao": "140382990100" }
  ],
  "banco": "Nome do banco identificado",
  "periodo": "mês/ano do extrato (ex: janeiro/2026)",
  "titular": "Nome do titular da conta"
}

REGRAS:
- Extraia TODAS as transferências para pessoa física, sem pular nenhuma
- Se houver transferências para MAIS DE UMA pessoa física, inclua todas
- Valores devem ser números (não strings)
- Datas no formato DD/MM/AAAA
- O campo "periodo" deve ser no formato "mês/ano" em português (ex: "janeiro/2026")
- Retorne SOMENTE o JSON, sem texto adicional, sem markdown, sem code blocks`;

export const EXTRACT_FROM_IMAGE_PROMPT = `${EXTRACT_TRANSACTIONS_PROMPT}

Analise a imagem do extrato bancário acima e extraia as transferências para pessoa física.`;

export const EXTRACT_FROM_TEXT_PROMPT = `${EXTRACT_TRANSACTIONS_PROMPT}

Analise o texto do extrato bancário abaixo e extraia as transferências para pessoa física:

---
`;
