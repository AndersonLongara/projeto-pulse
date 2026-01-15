/**
 * Validation Schemas - Zod
 *
 * Centralized validation schemas for all Server Actions and form inputs.
 * Every API interaction must be validated through these schemas.
 *
 * @see .github/agents/Master.agent.md - Section 3 (Zero Trust)
 */

import { z } from "zod";

// ===========================================
// COMMON SCHEMAS
// ===========================================

/**
 * Brazilian CPF validation
 * Format: XXX.XXX.XXX-XX
 */
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato: XXX.XXX.XXX-XX");

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Email inválido")
  .toLowerCase()
  .trim();

/**
 * Brazilian phone validation
 * Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\(\d{2}\) \d{4,5}-\d{4}$/,
    "Telefone inválido. Use o formato: (XX) XXXXX-XXXX"
  );

/**
 * Date string validation (ISO format)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida. Use o formato: YYYY-MM-DD");

/**
 * Competência (month/year) validation
 * Format: MM/YYYY
 */
export const competenciaSchema = z
  .string()
  .regex(/^\d{2}\/\d{4}$/, "Competência inválida. Use o formato: MM/YYYY");

// ===========================================
// AUTHENTICATION SCHEMAS
// ===========================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(100, "Senha muito longa"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ===========================================
// VACATION SCHEMAS
// ===========================================

export const vacationRequestSchema = z
  .object({
    dataInicio: dateSchema,
    dataFim: dateSchema,
    abonoPecuniario: z.boolean().default(false),
    observacao: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const inicio = new Date(data.dataInicio);
      const fim = new Date(data.dataFim);
      return fim > inicio;
    },
    { message: "Data fim deve ser posterior à data início" }
  )
  .refine(
    (data) => {
      const inicio = new Date(data.dataInicio);
      const fim = new Date(data.dataFim);
      const diffDays = Math.ceil(
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 5;
    },
    { message: "Período mínimo de férias é de 5 dias" }
  );

export type VacationRequestInput = z.infer<typeof vacationRequestSchema>;

// ===========================================
// EMPLOYEE SCHEMAS
// ===========================================

export const employeeSearchSchema = z.object({
  query: z.string().min(2, "Digite pelo menos 2 caracteres").max(100),
  departamento: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type EmployeeSearchInput = z.infer<typeof employeeSearchSchema>;

// ===========================================
// CHAT / AI SCHEMAS
// ===========================================

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(2000, "Mensagem muito longa (máx. 2000 caracteres)"),
  sessionId: z.string().uuid().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ===========================================
// ID SCHEMAS
// ===========================================

export const uuidSchema = z.string().uuid("ID inválido");

export const employeeIdSchema = z
  .string()
  .regex(/^emp-\d{3,}$/, "ID de colaborador inválido");

// ===========================================
// PAGINATION SCHEMA
// ===========================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ===========================================
// DATA RESPONSE SCHEMAS (Unified Data Layer)
// ===========================================

/**
 * Vacation data response schema
 * Validates data from senior-mock.ts getVacationData()
 */
export const vacationDataSchema = z.object({
  employeeId: z.string(),
  saldoDias: z.number().min(0),
  diasGozados: z.number().min(0),
  diasVendidos: z.number().min(0),
  periodoAquisitivo: z.object({
    inicio: dateSchema,
    fim: dateSchema,
  }),
  periodoConcessivo: z.object({
    inicio: dateSchema,
    fim: dateSchema,
  }),
  proximoVencimento: dateSchema,
  historico: z.array(
    z.object({
      id: z.string(),
      dataInicio: dateSchema,
      dataFim: dateSchema,
      dias: z.number().min(1).max(30),
      status: z.enum(["pendente", "aprovada", "rejeitada", "gozada", "cancelada"]),
      abonoPecuniario: z.boolean(),
      diasAbono: z.number().min(0).max(10),
      valorAbono: z.number().min(0),
      observacao: z.string().optional(),
      aprovadoPor: z.string().optional(),
      dataAprovacao: dateSchema.optional(),
    })
  ),
  _meta: z.object({
    saldoLabel: z.object({ short: z.string(), long: z.string() }),
    statusLabel: z.object({ short: z.string(), long: z.string() }),
  }),
});

export type VacationDataResponse = z.infer<typeof vacationDataSchema>;

/**
 * Payslip item schema
 */
const payslipItemSchema = z.object({
  codigo: z.string(),
  descricao: z.string(),
  descricaoAbreviada: z.string(),
  referencia: z.string(),
  valor: z.number(),
  tipo: z.enum([
    "salario",
    "hora_extra",
    "adicional",
    "bonus",
    "inss",
    "irrf",
    "vt",
    "vr",
    "plano_saude",
    "plano_odonto",
    "pensao",
    "emprestimo",
    "outros",
  ]),
});

/**
 * Individual payslip schema
 */
export const payslipSchema = z.object({
  id: z.string(),
  competencia: competenciaSchema,
  competenciaISO: z.string().regex(/^\d{4}-\d{2}$/),
  salarioBruto: z.number().min(0),
  proventos: z.array(payslipItemSchema),
  descontos: z.array(payslipItemSchema),
  totalProventos: z.number().min(0),
  totalDescontos: z.number().min(0),
  salarioLiquido: z.number().min(0),
  fgts: z.number().min(0),
  inssPatronal: z.number().min(0),
  dataPagamento: dateSchema,
  status: z.enum(["processado", "pago", "pendente"]),
  _display: z.object({
    bruto: z.string(),
    liquido: z.string(),
    descontos: z.string(),
  }),
});

export type PayslipResponse = z.infer<typeof payslipSchema>;

/**
 * Complete payslip data response
 */
export const payslipDataSchema = z.object({
  employeeId: z.string(),
  holerites: z.array(payslipSchema),
  resumoAnual: z.object({
    ano: z.number(),
    totalBruto: z.number().min(0),
    totalLiquido: z.number().min(0),
    totalDescontos: z.number().min(0),
    mediaLiquida: z.number().min(0),
    mesesProcessados: z.number().min(0),
  }),
  _meta: z.object({
    ultimoHolerite: z.object({ short: z.string(), long: z.string() }),
  }),
});

export type PayslipDataResponse = z.infer<typeof payslipDataSchema>;

/**
 * Benefit schema
 */
export const benefitSchema = z.object({
  id: z.string(),
  tipo: z.enum([
    "vt",
    "vr",
    "va",
    "plano_saude",
    "plano_odonto",
    "seguro_vida",
    "gympass",
    "auxilio_creche",
    "auxilio_educacao",
    "ppr",
  ]),
  nome: z.string(),
  nomeAbreviado: z.string(),
  operadora: z.string().optional(),
  plano: z.string().optional(),
  valor: z.number().min(0),
  valorDesconto: z.number().min(0),
  coparticipacao: z.boolean(),
  ativo: z.boolean(),
  dataInicio: dateSchema,
  dataFim: dateSchema.optional(),
  dependentes: z.number().min(0),
  _display: z.object({
    valor: z.string(),
    status: z.string(),
  }),
});

export type BenefitResponse = z.infer<typeof benefitSchema>;

/**
 * Benefits data response
 */
export const benefitsDataSchema = z.object({
  employeeId: z.string(),
  beneficios: z.array(benefitSchema),
  totalMensal: z.number().min(0),
  _meta: z.object({
    resumo: z.object({ short: z.string(), long: z.string() }),
  }),
});

export type BenefitsDataResponse = z.infer<typeof benefitsDataSchema>;

/**
 * Clock event schema
 */
const clockEventSchema = z.object({
  tipo: z.enum(["entrada", "saida"]),
  horario: z.string().regex(/^\d{2}:\d{2}$/),
  fonte: z.enum(["relogio", "app", "manual", "ajuste"]),
  localizacao: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

/**
 * Clock record schema
 */
export const clockRecordSchema = z.object({
  id: z.string(),
  data: dateSchema,
  eventos: z.array(clockEventSchema),
  horasTrabalhadas: z.number().min(0),
  horasEsperadas: z.number().min(0),
  saldo: z.number(),
  status: z.enum([
    "normal",
    "falta",
    "atestado",
    "ferias",
    "folga",
    "feriado",
    "compensacao",
    "incompleto",
  ]),
  justificativa: z.string().optional(),
  anexoAtestado: z.string().optional(),
  _display: z.object({
    trabalhadas: z.string(),
    saldo: z.string(),
    status: z.string(),
  }),
});

export type ClockRecordResponse = z.infer<typeof clockRecordSchema>;

/**
 * Clock events data response
 */
export const clockEventsDataSchema = z.object({
  employeeId: z.string(),
  registros: z.array(clockRecordSchema),
  resumoMes: z.object({
    competencia: competenciaSchema,
    diasTrabalhados: z.number().min(0),
    diasUteis: z.number().min(0),
    horasTrabalhadas: z.number().min(0),
    horasEsperadas: z.number().min(0),
    horasExtras: z.number().min(0),
    faltas: z.number().min(0),
    atestados: z.number().min(0),
    atrasos: z.number().min(0),
  }),
  bancoHoras: z.number(),
  _meta: z.object({
    bancoHorasLabel: z.object({ short: z.string(), long: z.string() }),
    statusHoje: z.object({ short: z.string(), long: z.string() }),
  }),
});

export type ClockEventsDataResponse = z.infer<typeof clockEventsDataSchema>;

/**
 * Admin metrics schema
 */
export const adminMetricsSchema = z.object({
  colaboradores: z.object({
    total: z.number().min(0),
    ativos: z.number().min(0),
    inativos: z.number().min(0),
    emFerias: z.number().min(0),
    afastados: z.number().min(0),
  }),
  ponto: z.object({
    competencia: z.string(),
    totalFaltas: z.number().min(0),
    totalAtestados: z.number().min(0),
    totalAtrasos: z.number().min(0),
    mediaHorasExtras: z.number().min(0),
    colaboradoresComPendencia: z.number().min(0),
  }),
  folha: z.object({
    competencia: z.string(),
    totalBruto: z.number().min(0),
    totalLiquido: z.number().min(0),
    mediaSalarial: z.number().min(0),
    totalEncargos: z.number().min(0),
  }),
  ferias: z.object({
    colaboradoresEmFerias: z.number().min(0),
    feriasAVencer30Dias: z.number().min(0),
    feriasAVencer60Dias: z.number().min(0),
    solicitacoesPendentes: z.number().min(0),
  }),
  beneficios: z.object({
    totalMensal: z.number().min(0),
    utilizacaoPlanoSaude: z.number().min(0).max(100),
    utilizacaoVR: z.number().min(0).max(100),
  }),
  atendimentos: z.object({
    totalMes: z.number().min(0),
    mediaTempoResposta: z.number().min(0),
    taxaResolucao: z.number().min(0).max(100),
    temasMaisConsultados: z.array(
      z.object({
        tema: z.string(),
        count: z.number().min(0),
      })
    ),
  }),
  atualizadoEm: z.string(),
});

export type AdminMetricsResponse = z.infer<typeof adminMetricsSchema>;

// ===========================================
// EMPLOYEE DATA SCHEMA
// ===========================================

export const employeeSchema = z.object({
  id: z.string(),
  matricula: z.string(),
  nome: z.string(),
  nomeAbreviado: z.string(),
  email: emailSchema,
  cpf: cpfSchema,
  cargo: z.string(),
  cargoAbreviado: z.string(),
  departamento: z.string(),
  departamentoAbreviado: z.string(),
  dataAdmissao: dateSchema,
  salarioBase: z.number().min(0),
  status: z.enum(["ativo", "inativo", "ferias", "afastado"]),
});

export type EmployeeResponse = z.infer<typeof employeeSchema>;
