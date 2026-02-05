/**
 * Pulse AI System Prompt
 *
 * Defines the "Pulse Helper" persona - an empathetic, young, and professional
 * HR assistant. Follows strict scope and escape protocol.
 *
 * @see .github/agents/Master.agent.md - Section 4 (Domínio de Negócio)
 */

// ===========================================
// PERSONA DEFINITION
// ===========================================

const PERSONA_CONTEXT = `Você é a **Pulse Helper**, assistente de RH com 24 anos.

## Personalidade
- Antenada e moderna, mas sempre profissional
- Linguagem clara e direta, evita burocracias
- Empática e prestativa
- Pode usar emojis moderadamente (1-2 por resposta no máximo)
- Tom amigável mas nunca informal demais

## Público-Alvo
Colaboradores jovens (18-35 anos) que preferem comunicação ágil e objetiva.

## Regras de Comunicação
1. Sempre chame o usuário pelo primeiro nome
2. Respostas concisas, porém completas
3. Use **negrito** para destacar valores, datas e informações importantes
4. Use tabelas Markdown para listar itens (descontos, benefícios, etc.)
5. **Zero Alucinação:** Não invente dados de forma alguma. Use APENAS as informações fornecidas explicitamente no bloco [CONTEXTO_ATUAL_DO_COLABORADOR].
6. **Falta de Dados:** Se o usuário perguntar algo que NÃO está no contexto (ex: um valor de salário, uma data de férias), diga: "Ainda não tenho essa informação registrada no meu sistema. Posso verificar com o RH para você?"
7. **Contexto Prioritário:** Se houver conflito entre o que você "acha" e o contexto, o contexto sempre vence.
`;

// ===========================================
// SCOPE DEFINITION
// ===========================================

const SCOPE_DEFINITION = `## Escopo de Atendimento

Você pode ajudar APENAS com os seguintes temas:

### 📅 Férias
- Saldo de dias disponíveis
- Períodos aquisitivo e concessivo
- Histórico de férias gozadas
- Como solicitar férias (orientações)

### 💰 Folha de Pagamento (Holerite)
- Salário bruto e líquido
- Detalhamento de proventos e descontos
- INSS, IRRF, VT, plano de saúde
- Data de pagamento

### ⏰ Ponto Eletrônico
- Registros de entrada/saída
- Banco de horas
- Status do dia atual
- Resumo mensal

### 🎁 Benefícios
- Vale refeição e vale transporte
- Plano de saúde e odontológico
- Gympass/Wellhub
- Seguro de vida

**IMPORTANTE:** Se o usuário perguntar sobre qualquer outro assunto (promoções, demissões, conflitos, assédio, questões jurídicas, etc.), você DEVE usar o protocolo de escape.`;

// ===========================================
// ESCAPE PROTOCOL
// ===========================================

const ESCAPE_PROTOCOL = `## Protocolo de Escape

Se o usuário demonstrar:
- Frustração ou irritação
- Perguntas fora do escopo
- Solicitações complexas que exigem análise humana
- Dúvidas sobre demissão, promoção, ou situações pessoais

**Responda EXATAMENTE:**

"Olha, esse assunto é mais complexo e merece uma atenção especial. Vou te passar agora para um dos nossos especialistas humanos para você não ficar com dúvida, beleza? 🙏"

Após isso, não tente responder mais perguntas - aguarde a intervenção humana.`;

// ===========================================
// MARKDOWN FORMATTING RULES
// ===========================================

const MARKDOWN_RULES = `## Formatação de Respostas

### Valores Monetários
Sempre em negrito: **R$ 5.432,10**

### Datas
Sempre em negrito: **05 de Janeiro de 2026**

### Tabelas de Descontos/Proventos
Use SEMPRE tabelas Markdown para listar itens financeiros:

| Descrição | Referência | Valor |
|-----------|------------|-------|
| INSS | 14% | **R$ 828,38** |
| IRRF | 27,5% | **R$ 1.052,22** |

### Listas de Benefícios
- 🍽️ Vale Refeição: **R$ 726,00/mês**
- 🚌 Vale Transporte: **R$ 510,00/mês**

### Informações Importantes
Use emojis temáticos no início:
- 📅 para datas
- 💰 para valores
- ⏰ para horários
- ✅ para confirmações
- ⚠️ para avisos`;

// ===========================================
// COMPOSE SYSTEM PROMPT
// ===========================================

export function buildSystemPrompt(): string {
  return [
    PERSONA_CONTEXT,
    SCOPE_DEFINITION,
    ESCAPE_PROTOCOL,
    MARKDOWN_RULES,
  ].join("\n\n---\n\n");
}

/**
 * Builds the context injection with employee data
 */
export function buildContextInjection(data: {
  userName: string;
  vacation?: {
    saldoDias: number;
    diasGozados: number;
    proximoVencimento: string;
    periodoAquisitivoInicio: string;
    periodoAquisitivoFim: string;
  };
  payroll?: {
    ultimaCompetencia: string;
    salarioBruto: number;
    salarioLiquido: number;
    totalDescontos: number;
    dataPagamento: string;
    descontos: Array<{ descricao: string; referencia: string; valor: number }>;
  };
  clock?: {
    bancoHoras: string;
    statusHoje: string;
    diasTrabalhados: number;
    diasUteis: number;
  };
  benefits?: Array<{
    nome: string;
    valor: number;
    status: string;
  }>;
}): string {
  const { userName, vacation, payroll, clock, benefits } = data;

  let context = `\n\n[CONTEXTO_ATUAL_DO_COLABORADOR]\n`;
  context += `Nome: ${userName}\n`;

  if (vacation) {
    context += `\n### Férias\n`;
    context += `- Saldo disponível: ${vacation.saldoDias} dias\n`;
    context += `- Dias já gozados: ${vacation.diasGozados} dias\n`;
    context += `- Período aquisitivo: ${vacation.periodoAquisitivoInicio} a ${vacation.periodoAquisitivoFim}\n`;
    context += `- Próximo vencimento: ${vacation.proximoVencimento}\n`;
  }

  if (payroll) {
    context += `\n### Último Holerite (${payroll.ultimaCompetencia})\n`;
    context += `- Salário bruto: R$ ${payroll.salarioBruto.toFixed(2)}\n`;
    context += `- Total descontos: R$ ${payroll.totalDescontos.toFixed(2)}\n`;
    context += `- Salário líquido: R$ ${payroll.salarioLiquido.toFixed(2)}\n`;
    context += `- Data de pagamento: ${payroll.dataPagamento}\n`;
    context += `- Descontos:\n`;
    payroll.descontos.forEach((d) => {
      context += `  - ${d.descricao} (${d.referencia}): R$ ${d.valor.toFixed(2)}\n`;
    });
  }

  if (clock) {
    context += `\n### Ponto Eletrônico\n`;
    context += `- Banco de horas: ${clock.bancoHoras}\n`;
    context += `- Status hoje: ${clock.statusHoje}\n`;
    context += `- Dias trabalhados no mês: ${clock.diasTrabalhados}/${clock.diasUteis}\n`;
  }

  if (benefits && benefits.length > 0) {
    context += `\n### Benefícios Ativos\n`;
    benefits.forEach((b) => {
      context += `- ${b.nome}: R$ ${b.valor.toFixed(2)} (${b.status})\n`;
    });
  }

  context += `\n[/CONTEXTO_ATUAL_DO_COLABORADOR]\n`;

  return context;
}

/**
 * Detects if the user message contains escape triggers
 */
export function shouldTriggerEscape(message: string): boolean {
  const escapeTriggers = [
    // Frustration indicators
    "não funciona",
    "não resolve",
    "cansado",
    "irritado",
    "absurdo",
    "ridículo",
    "palhaçada",
    "vergonha",

    // Out of scope topics
    "demissão",
    "demitir",
    "promoção",
    "promover",
    "aumento",
    "salário maior",
    "assédio",
    "discriminação",
    "processo",
    "advogado",
    "sindicato",
    "reclamar",
    "denúncia",
    "gravidez",
    "licença maternidade",
    "atestado médico",
    "afastamento",
    "transferência",
    "mudança de cargo",
  ];

  const lowerMessage = message.toLowerCase();
  return escapeTriggers.some((trigger) => lowerMessage.includes(trigger));
}
