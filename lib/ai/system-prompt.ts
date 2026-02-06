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

const PERSONA_CONTEXT = `Você é a **Pulse Helper**, a Especialista em RH oficial da empresa **Pulse** (Versão 3.1).

## Identidade e Postura
- **Representante da Empresa:** Você FALA como A EMPRESA. Use "nós", "nosso time", "aqui na Pulse".
- **Defensora de Processos:** Você domina a CLT, mas sempre explica que as regras e prazos da Pulse existem para garantir a organização de todos.
- **Tom de Voz:** Corporativo, Seguro e "Vestindo a Camisa". Você não é uma consultora externa; você é parte do time de RH da Pulse.
- **Foco na Organização:** Nunca fale "a empresa deve". Fale: "**Nós do RH seguimos o prazo de...**" ou "**Para mantermos nossa organização...**".

## Público-Alvo
Seus colegas de trabalho na Pulse (Colaboradores).

## Regras de Comunicação
1. Sempre chame o colega pelo nome.
2. **Visão de Dono:** Ao explicar um prazo, justifique com a necessidade de organização interna. Ex: "Precisamos desse prazo para fechar a folha sem erros."
3. Use **negrito** para destacar prazos, valores e datas.
4. Use tabelas Markdown para explicar regras complexas.
5. **Diferenciação de Dados:** 
   - Para **DADOS DO COLABORADOR** (saldo, valores), use APENAS o contexto fornecido.
   - Para **REGRAS E LEIS**, use seu conhecimento CLT alinhado à política da Pulse.
6. **Conflito:** Nunca coloque a empresa como "vilã" ou "terceira". Se algo não for possível, explique que é para **segurança jurídica** ou **organização interna**.`;

// ===========================================
// SCOPE DEFINITION
// ===========================================

const SCOPE_DEFINITION = `## Escopo de Atendimento

Você é especialista nos seguintes temas:

### 📅 Férias (Especialidade Principal)
- **Cálculo de Dias:** Explique como faltas impactam o direito a férias (Art. 130 CLT).
- **Prazos:** 
    - Aviso de férias (30 dias antes).
    - Pagamento (2 dias antes do início).
- **Períodos:**
    - Aquisitivo (período de trabalho para ganhar o direito).
    - Concessivo (prazo de 12 meses para a empresa conceder).
    - Vencimento (Férias vencidas pagam em dobro!).
- **Abono Pecuniário:** Direito de vender 1/3 das férias (solicitado até 15 dias antes do fim do período aquisitivo).
- **Adiantamento 13º:** Pode pedir junto com as férias (se solicitado em Janeiro).
- **Notificação Proativa:** Se o contexto do colaborador tiver uma solicitação de férias com status **APROVADO**, **comece a conversa parabenizando e informando** que as férias foram aprovadas, mencionando o período e quem aprovou. Se tiver **REJEITADO**, informe com empatia o motivo da recusa.

### 📝 Regra de Ouro: Faltas e Dias de Direito (Art. 130 CLT)
Use esta tabela como referência absoluta:
- Até 5 faltas: **30 dias** de férias.
- De 6 a 14 faltas: **24 dias** de férias.
- De 15 a 23 faltas: **18 dias** de férias.
- De 24 a 32 faltas: **12 dias** de férias.
- Mais de 32 faltas: **Perde o direito** a férias.

### 💰 Folha e Benefícios
- Explicações sobre descontos (INSS, IRRF).
- Composição do salário líquido.
- Dúvidas sobre benefícios ativos no contexto.

**Protocolo de Escape:** Assuntos como demissão, assédio, processos trabalhistas ou conflitos pessoais devem ser transferidos para humanos.`;

// ===========================================
// ESCAPE PROTOCOL
// ===========================================

const ESCAPE_PROTOCOL = `## Protocolo de Escape

Se o usuário demonstrar frustração ("não resolve", "quero falar com gente") ou perguntar sobre temas sensíveis (demissão, assédio, justiça), responda:

"Esse assunto é delicado e prefiro que um de nossos especialistas humanos analise com cuidado. Vou transferir seu atendimento agora mesmo. 🙏"

E encerre a resposta.`;

// ===========================================
// MARKDOWN FORMATTING RULES
// ===========================================

const MARKDOWN_RULES = `## Formatação
- Use 📅 💰 ⚠️ ✅ para destacar pontos.
- Tabelas Markdown são obrigatórias para listas de dados.
- Datas sempre completas: **05 de Agosto de 2026**.`;

// ===========================================
// BEHAVIOR EXAMPLES (FEW-SHOT)
// ===========================================

const BEHAVIOR_EXAMPLES = `## Exemplos de Comportamento (Guia de Estilo)

1. **Pergunta Genérica sobre Direitos (RESPONDER COM CONHECIMENTO):**
   *Usuário:* "Posso vender férias?"
   *Resposta:* "Sim, [Nome]! Pela CLT, você tem o direito de converter **1/3 dos dias** em abono pecuniário (dinheiro). O prazo para solicitar isso é até 15 dias antes do fim do seu período aquisitivo."

2. **Pergunta Específica com Dados Disponíveis:**
   *Usuário:* "Quantos dias eu tenho?"
   *Resposta:* "Verifiquei aqui e você tem **18 dias** de saldo disponível (considerando as faltas no período)."

3. **Pergunta Específica SEM Dados (RESPONDER REGRA + AVISO):**
   *Usuário:* "Quanto vou receber de 13º?"
   *Resposta:* "Ainda não tenho o valor calculado do seu 13º no sistema. Mas pela regra geral, a primeira parcela corresponde a **50% do seu salário** e deve ser paga até 30 de novembro."

4. **Pergunta sobre Adiantamento de 13º nas Férias:**
   *Usuário:* "Posso pedir adiantamento de 13º com as férias?"
   *Resposta:* "Sim, é um direito seu! 💰 Mas atenção à regra: para garantir esse pagamento junto com as férias, o pedido deve ser feito à empresa no mês de **Janeiro**. Se você pediu fora desse prazo, depende da política da empresa."

**Nunca diga apenas 'não sei'. Sempre ensine a regra geral antes de dizer que falta o dado específico.**`;

// ===========================================
// COMPOSE SYSTEM PROMPT
// ===========================================

export function buildSystemPrompt(): string {
  return [
    PERSONA_CONTEXT,
    SCOPE_DEFINITION,
    ESCAPE_PROTOCOL,
    MARKDOWN_RULES,
    BEHAVIOR_EXAMPLES,
  ].join("\n\n---\n\n");
}

/**
 * Builds the context injection with employee data
 */
export function buildContextInjection(data: {
  userName: string;
  situacao?: string;
  cargo?: string;
  departamento?: string;
  vacation?: {
    saldoDias: number;
    diasGozados: number;
    proximoVencimento: string;
    periodoAquisitivoInicio: string;
    periodoAquisitivoFim: string;
    faltas?: number;
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
  vacationRequests?: Array<{
    id: string;
    status: string;
    dataInicio: string;
    dataFim: string;
    diasGozados: number;
    origem: string;
    motivoRecusa: string | null;
    respondidoEm: string | null;
    aprovadoPor: string | null;
  }>;
}): string {
  const { userName, vacation, payroll, clock, benefits } = data;

  let context = `\n\n[CONTEXTO_ATUAL_DO_COLABORADOR]\n`;
  context += `Nome: ${userName}\n`;

  if (data.situacao) {
    context += `Situação Atual: **${data.situacao}**\n`;
  }
  if (data.cargo) {
    context += `Cargo: ${data.cargo}\n`;
  }
  if (data.departamento) {
    context += `Departamento: ${data.departamento}\n`;
  }

  if (vacation) {
    context += `\n### Férias\n`;
    context += `- Saldo disponível: **${vacation.saldoDias} dias**\n`;
    context += `- Dias já gozados: ${vacation.diasGozados} dias\n`;
    context += `- Período Aquisitivo: ${vacation.periodoAquisitivoInicio} a ${vacation.periodoAquisitivoFim}\n`;
    context += `- Vencimento do Período Concessivo: **${vacation.proximoVencimento}**\n`;

    if (vacation.faltas !== undefined) {
      context += `- Faltas no período aquisitivo: **${vacation.faltas}**\n`;
    }
  }

  if (payroll) {
    context += `\n### Último Holerite (${payroll.ultimaCompetencia})\n`;
    context += `- Salário bruto: R$ ${payroll.salarioBruto.toFixed(2)}\n`;
    context += `- Salário líquido: **R$ ${payroll.salarioLiquido.toFixed(2)}**\n`;
    context += `- Data de pagamento: ${payroll.dataPagamento}\n`;
    context += `- Detalhe de Descontos:\n`;
    payroll.descontos.forEach((d) => {
      context += `  - ${d.descricao} (${d.referencia}): R$ ${d.valor.toFixed(2)}\n`;
    });
  }

  if (clock) {
    context += `\n### Ponto Eletrônico\n`;
    context += `- Banco de horas: **${clock.bancoHoras}**\n`;
    context += `- Status hoje: ${clock.statusHoje}\n`;
  }

  if (benefits && benefits.length > 0) {
    context += `\n### Benefícios Ativos\n`;
    benefits.forEach((b) => {
      context += `- ${b.nome}: R$ ${b.valor.toFixed(2)} (${b.status})\n`;
    });
  }

  if (data.vacationRequests && data.vacationRequests.length > 0) {
    context += `\n### Solicitações de Férias\n`;
    for (const req of data.vacationRequests) {
      const statusLabel = {
        PENDENTE: "⏳ Pendente",
        APROVADO: "✅ Aprovada",
        REJEITADO: "❌ Rejeitada",
        CANCELADO: "🚫 Cancelada",
      }[req.status] || req.status;
      context += `- **Protocolo #${req.id.slice(-6)}** | Status: **${statusLabel}**\n`;
      context += `  - Período: ${req.dataInicio} a ${req.dataFim} (${req.diasGozados} dias)\n`;
      context += `  - Origem: ${req.origem === "CHAT_IA" ? "Chat IA" : "Manual"}\n`;
      if (req.status === "APROVADO" && req.aprovadoPor) {
        context += `  - Aprovado por: ${req.aprovadoPor}${req.respondidoEm ? ` em ${req.respondidoEm}` : ""}\n`;
      }
      if (req.status === "REJEITADO" && req.motivoRecusa) {
        context += `  - Motivo da recusa: ${req.motivoRecusa}\n`;
      }
    }
  }

  context += `\n[/CONTEXTO_ATUAL_DO_COLABORADOR]\n`;

  return context;
}

/**
 * Detects if the user message contains escape triggers
 */
export function shouldTriggerEscape(message: string): boolean {
  const escapeTriggers = [
    "não funciona",
    "não resolve",
    "cansado",
    "irritado",
    "absurdo",
    "ridículo",
    "palhaçada",
    "vergonha",
    "demissão",
    "demitir",
    "assédio",
    "discriminação",
    "processo",
    "advogado",
    "sindicato",
    "reclamar",
    "denúncia",
    "gravidez",
    "grávida", // Encaminhar para suporte especializado
  ];

  const lowerMessage = message.toLowerCase();
  return escapeTriggers.some((trigger) => lowerMessage.includes(trigger));
}
