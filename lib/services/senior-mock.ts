/**
 * Senior Mock Service - Unified Data Layer
 *
 * Centralized mock data service simulating Senior ERP integration.
 * Serves both Admin Dashboard (desktop) and SuperApp (PWA mobile).
 *
 * Features:
 * - Unified data for Férias, Folha, Benefícios, Ponto
 * - Responsive metadata (short/long labels)
 * - ISO 8601 dates for flexible UI formatting
 * - Admin metrics aggregation
 *
 * @see .github/agents/Master.agent.md - Section 4
 */

// ===========================================
// TYPES - Core Entities
// ===========================================

export type UserRole = "ADMIN" | "RH" | "USER";

export interface Employee {
  id: string;
  matricula: string;
  nome: string;
  nomeAbreviado: string; // Short label for mobile
  email: string;
  cpf: string; // Raw CPF (will be masked by security layer)
  cargo: string;
  cargoAbreviado: string;
  departamento: string;
  departamentoAbreviado: string;
  dataAdmissao: string; // ISO 8601
  salarioBase: number;
  status: "ativo" | "inativo" | "ferias" | "afastado";
}

// ===========================================
// TYPES - Vacation (Férias)
// ===========================================

export interface VacationData {
  employeeId: string;
  saldoDias: number;
  diasGozados: number;
  diasVendidos: number;
  periodoAquisitivo: DateRange;
  periodoConcessivo: DateRange;
  proximoVencimento: string; // ISO 8601
  historico: VacationRecord[];
  /** Metadata for responsive UI */
  _meta: {
    saldoLabel: { short: string; long: string };
    statusLabel: { short: string; long: string };
  };
}

export interface VacationRecord {
  id: string;
  dataInicio: string; // ISO 8601
  dataFim: string; // ISO 8601
  dias: number;
  status: "pendente" | "aprovada" | "rejeitada" | "gozada" | "cancelada";
  abonoPecuniario: boolean;
  diasAbono: number;
  valorAbono: number;
  observacao?: string;
  aprovadoPor?: string;
  dataAprovacao?: string; // ISO 8601
}

export interface DateRange {
  inicio: string; // ISO 8601
  fim: string; // ISO 8601
}

// ===========================================
// TYPES - Events (Eventos)
// ===========================================

export type EventType = 
  | "ferias"
  | "avaliacao"
  | "treinamento"
  | "aniversario_empresa"
  | "prazo_documentos"
  | "reuniao";

export interface UpcomingEvent {
  id: string;
  tipo: EventType;
  titulo: string;
  descricao: string;
  data: string; // ISO 8601
  dataFim?: string; // Para eventos que duram múltiplos dias (férias)
  prioridade: "baixa" | "media" | "alta";
  acao?: {
    label: string;
    href: string;
  };
}

// ===========================================
// TYPES - Payroll (Folha)
// ===========================================

export interface PayslipData {
  employeeId: string;
  holerites: Payslip[];
  resumoAnual: AnnualPayrollSummary;
  /** Metadata for responsive UI */
  _meta: {
    ultimoHolerite: { short: string; long: string };
  };
}

export interface Payslip {
  id: string;
  competencia: string; // MM/YYYY
  competenciaISO: string; // YYYY-MM for sorting
  salarioBruto: number;
  proventos: PayslipItem[];
  descontos: PayslipItem[];
  totalProventos: number;
  totalDescontos: number;
  salarioLiquido: number;
  fgts: number;
  inssPatronal: number;
  dataPagamento: string; // ISO 8601
  status: "processado" | "pago" | "pendente";
  /** Labels for tabular display (font-mono) */
  _display: {
    bruto: string;
    liquido: string;
    descontos: string;
  };
}

export interface PayslipItem {
  codigo: string;
  descricao: string;
  descricaoAbreviada: string;
  referencia: string; // e.g., "30 dias", "8%"
  valor: number;
  tipo: PayslipItemType;
}

export type PayslipItemType =
  | "salario"
  | "hora_extra"
  | "adicional"
  | "bonus"
  | "inss"
  | "irrf"
  | "vt"
  | "vr"
  | "plano_saude"
  | "plano_odonto"
  | "pensao"
  | "emprestimo"
  | "outros";

export interface AnnualPayrollSummary {
  ano: number;
  totalBruto: number;
  totalLiquido: number;
  totalDescontos: number;
  mediaLiquida: number;
  mesesProcessados: number;
}

// ===========================================
// TYPES - Benefits (Benefícios)
// ===========================================

export interface BenefitsData {
  employeeId: string;
  beneficios: Benefit[];
  totalMensal: number;
  /** Metadata for responsive UI */
  _meta: {
    resumo: { short: string; long: string };
  };
}

export interface Benefit {
  id: string;
  tipo: BenefitType;
  nome: string;
  nomeAbreviado: string;
  operadora?: string;
  plano?: string;
  valor: number;
  valorDesconto: number;
  coparticipacao: boolean;
  ativo: boolean;
  dataInicio: string; // ISO 8601
  dataFim?: string; // ISO 8601
  dependentes: number;
  /** Display data for tabular rendering */
  _display: {
    valor: string;
    status: string;
  };
}

export type BenefitType =
  | "vt"
  | "vr"
  | "va"
  | "plano_saude"
  | "plano_odonto"
  | "seguro_vida"
  | "gympass"
  | "auxilio_creche"
  | "auxilio_educacao"
  | "ppr";

// ===========================================
// TYPES - Time Tracking (Ponto)
// ===========================================

export interface ClockEventsData {
  employeeId: string;
  registros: ClockRecord[];
  resumoMes: MonthlyClockSummary;
  bancoHoras: number; // Saldo em minutos
  /** Metadata for responsive UI */
  _meta: {
    bancoHorasLabel: { short: string; long: string };
    statusHoje: { short: string; long: string };
  };
}

export interface ClockRecord {
  id: string;
  data: string; // ISO 8601
  eventos: ClockEvent[];
  horasTrabalhadas: number; // Em minutos
  horasEsperadas: number; // Em minutos
  saldo: number; // Diferença em minutos
  status: ClockStatus;
  justificativa?: string;
  anexoAtestado?: string;
  /** Display data */
  _display: {
    trabalhadas: string; // "08:30"
    saldo: string; // "+00:30" ou "-01:00"
    status: string;
  };
}

export interface ClockEvent {
  tipo: "entrada" | "saida";
  horario: string; // HH:mm
  fonte: "relogio" | "app" | "manual" | "ajuste";
  localizacao?: { lat: number; lng: number };
}

export type ClockStatus =
  | "normal"
  | "falta"
  | "atestado"
  | "ferias"
  | "folga"
  | "feriado"
  | "compensacao"
  | "incompleto";

export interface MonthlyClockSummary {
  competencia: string; // MM/YYYY
  diasTrabalhados: number;
  diasUteis: number;
  horasTrabalhadas: number; // Em minutos
  horasEsperadas: number; // Em minutos
  horasExtras: number; // Em minutos
  faltas: number;
  atestados: number;
  atrasos: number;
}

// ===========================================
// TYPES - Admin Metrics (Dashboard)
// ===========================================

export interface AdminMetrics {
  /** Visão geral de colaboradores */
  colaboradores: {
    total: number;
    ativos: number;
    inativos: number;
    emFerias: number;
    afastados: number;
  };
  /** Métricas de ponto do mês atual */
  ponto: {
    competencia: string;
    totalFaltas: number;
    totalAtestados: number;
    totalAtrasos: number;
    mediaHorasExtras: number; // Em minutos
    colaboradoresComPendencia: number;
  };
  /** Métricas de folha */
  folha: {
    competencia: string;
    totalBruto: number;
    totalLiquido: number;
    mediaSalarial: number;
    totalEncargos: number;
  };
  /** Métricas de férias */
  ferias: {
    colaboradoresEmFerias: number;
    feriasAVencer30Dias: number;
    feriasAVencer60Dias: number;
    solicitacoesPendentes: number;
  };
  /** Métricas de benefícios */
  beneficios: {
    totalMensal: number;
    utilizacaoPlanoSaude: number; // Percentual
    utilizacaoVR: number; // Percentual
  };
  /** Métricas de IA/Chat */
  atendimentos: {
    totalMes: number;
    mediaTempoResposta: number; // Em segundos
    taxaResolucao: number; // Percentual
    temasMaisConsultados: { tema: string; count: number }[];
  };
  /** Timestamp da última atualização */
  atualizadoEm: string; // ISO 8601
}

// ===========================================
// MOCK DATA - Employees Database
// ===========================================

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    matricula: "12345",
    nome: "Maria Silva Santos",
    nomeAbreviado: "Maria S.",
    email: "maria.silva@empresa.com",
    cpf: "123.456.789-00",
    cargo: "Analista de Sistemas Sênior",
    cargoAbreviado: "Analista Sr.",
    departamento: "Tecnologia da Informação",
    departamentoAbreviado: "TI",
    dataAdmissao: "2022-03-15",
    salarioBase: 8500.0,
    status: "ativo",
  },
  {
    id: "emp-002",
    matricula: "12346",
    nome: "João Pedro Oliveira",
    nomeAbreviado: "João P.",
    email: "joao.oliveira@empresa.com",
    cpf: "234.567.890-11",
    cargo: "Desenvolvedor Full Stack",
    cargoAbreviado: "Dev Full Stack",
    departamento: "Tecnologia da Informação",
    departamentoAbreviado: "TI",
    dataAdmissao: "2023-01-10",
    salarioBase: 7200.0,
    status: "ativo",
  },
  {
    id: "emp-003",
    matricula: "12347",
    nome: "Ana Carolina Ferreira",
    nomeAbreviado: "Ana C.",
    email: "ana.ferreira@empresa.com",
    cpf: "345.678.901-22",
    cargo: "Coordenadora de RH",
    cargoAbreviado: "Coord. RH",
    departamento: "Recursos Humanos",
    departamentoAbreviado: "RH",
    dataAdmissao: "2021-06-01",
    salarioBase: 9500.0,
    status: "ativo",
  },
  {
    id: "emp-004",
    matricula: "12348",
    nome: "Carlos Eduardo Lima",
    nomeAbreviado: "Carlos E.",
    email: "carlos.lima@empresa.com",
    cpf: "456.789.012-33",
    cargo: "Analista Financeiro",
    cargoAbreviado: "Analista Fin.",
    departamento: "Financeiro",
    departamentoAbreviado: "Fin.",
    dataAdmissao: "2020-09-20",
    salarioBase: 6800.0,
    status: "ferias",
  },
  {
    id: "emp-005",
    matricula: "12349",
    nome: "Beatriz Costa Souza",
    nomeAbreviado: "Beatriz C.",
    email: "beatriz.souza@empresa.com",
    cpf: "567.890.123-44",
    cargo: "Designer UX/UI",
    cargoAbreviado: "Designer UX",
    departamento: "Tecnologia da Informação",
    departamentoAbreviado: "TI",
    dataAdmissao: "2024-02-01",
    salarioBase: 6500.0,
    status: "ativo",
  },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCurrencyDisplay(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format minutes to HH:mm with sign
 * Exported for testing
 */
export function formatMinutesToHours(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Get employee by ID
 * Exported for testing
 */
export function getEmployeeById(userId: string): Employee | undefined {
  return MOCK_EMPLOYEES.find((e) => e.id === userId);
}

// ===========================================
// SERVICE FUNCTIONS - Vacation (Férias)
// ===========================================

/**
 * Get vacation data for a user
 * Unified for both SuperApp (user view) and Admin (RH view)
 */
export async function getVacationData(userId: string): Promise<VacationData | null> {
  await delay(80);

  const employee = getEmployeeById(userId);
  if (!employee) return null;

  const saldoDias = 20;
  const diasGozados = 10;

  return {
    employeeId: userId,
    saldoDias,
    diasGozados,
    diasVendidos: 0,
    periodoAquisitivo: {
      inicio: "2025-03-15",
      fim: "2026-03-14",
    },
    periodoConcessivo: {
      inicio: "2026-03-15",
      fim: "2027-03-14",
    },
    proximoVencimento: "2027-03-14",
    historico: [
      {
        id: "vac-001",
        dataInicio: "2025-07-01",
        dataFim: "2025-07-10",
        dias: 10,
        status: "gozada",
        abonoPecuniario: false,
        diasAbono: 0,
        valorAbono: 0,
        aprovadoPor: "emp-003",
        dataAprovacao: "2025-05-15",
      },
      {
        id: "vac-002",
        dataInicio: "2026-01-15",
        dataFim: "2026-01-24",
        dias: 10,
        status: "aprovada",
        abonoPecuniario: false,
        diasAbono: 0,
        valorAbono: 0,
        aprovadoPor: "emp-003",
        dataAprovacao: "2025-11-20",
      },
    ],
    _meta: {
      saldoLabel: {
        short: `${saldoDias}d`,
        long: `${saldoDias} dias disponíveis`,
      },
      statusLabel: {
        short: "OK",
        long: "Período em dia",
      },
    },
  };
}

// ===========================================
// SERVICE FUNCTIONS - Payroll (Folha)
// ===========================================

/**
 * Get payslip data for a user
 * Returns detailed payslips with display-ready values
 */
export async function getPayslips(userId: string): Promise<PayslipData | null> {
  await delay(100);

  const employee = getEmployeeById(userId);
  if (!employee) return null;

  const salarioBase = employee.salarioBase;
  const inss = Math.min(salarioBase * 0.14, 828.38);
  const baseIRRF = salarioBase - inss;
  const irrf = baseIRRF > 4664.68 ? (baseIRRF - 4664.68) * 0.275 + 869.36 : 0;
  const vt = salarioBase * 0.06;
  const planoSaude = 350.0;
  const totalDescontos = inss + irrf + vt + planoSaude;
  const liquido = salarioBase - totalDescontos;

  const createPayslip = (competencia: string, competenciaISO: string, dataPagamento: string): Payslip => ({
    id: `pay-${competenciaISO}-${userId}`,
    competencia,
    competenciaISO,
    salarioBruto: salarioBase,
    proventos: [
      {
        codigo: "001",
        descricao: "Salário Base",
        descricaoAbreviada: "Salário",
        referencia: "30 dias",
        valor: salarioBase,
        tipo: "salario",
      },
    ],
    descontos: [
      {
        codigo: "101",
        descricao: "INSS",
        descricaoAbreviada: "INSS",
        referencia: "14%",
        valor: inss,
        tipo: "inss",
      },
      {
        codigo: "102",
        descricao: "Imposto de Renda Retido na Fonte",
        descricaoAbreviada: "IRRF",
        referencia: "27,5%",
        valor: irrf,
        tipo: "irrf",
      },
      {
        codigo: "103",
        descricao: "Vale Transporte",
        descricaoAbreviada: "VT",
        referencia: "6%",
        valor: vt,
        tipo: "vt",
      },
      {
        codigo: "104",
        descricao: "Plano de Saúde",
        descricaoAbreviada: "Plano Saúde",
        referencia: "Titular",
        valor: planoSaude,
        tipo: "plano_saude",
      },
    ],
    totalProventos: salarioBase,
    totalDescontos,
    salarioLiquido: liquido,
    fgts: salarioBase * 0.08,
    inssPatronal: salarioBase * 0.2,
    dataPagamento,
    status: "pago",
    _display: {
      bruto: formatCurrencyDisplay(salarioBase),
      liquido: formatCurrencyDisplay(liquido),
      descontos: formatCurrencyDisplay(totalDescontos),
    },
  });

  const holerites: Payslip[] = [
    createPayslip("12/2025", "2025-12", "2026-01-05"),
    createPayslip("11/2025", "2025-11", "2025-12-05"),
    createPayslip("10/2025", "2025-10", "2025-11-05"),
    createPayslip("09/2025", "2025-09", "2025-10-05"),
    createPayslip("08/2025", "2025-08", "2025-09-05"),
    createPayslip("07/2025", "2025-07", "2025-08-05"),
  ];

  const totalBruto = holerites.reduce((sum, h) => sum + h.salarioBruto, 0);
  const totalLiquido = holerites.reduce((sum, h) => sum + h.salarioLiquido, 0);

  return {
    employeeId: userId,
    holerites,
    resumoAnual: {
      ano: 2025,
      totalBruto,
      totalLiquido,
      totalDescontos: totalBruto - totalLiquido,
      mediaLiquida: totalLiquido / holerites.length,
      mesesProcessados: holerites.length,
    },
    _meta: {
      ultimoHolerite: {
        short: "12/2025",
        long: "Dezembro de 2025",
      },
    },
  };
}

// ===========================================
// SERVICE FUNCTIONS - Benefits (Benefícios)
// ===========================================

/**
 * Get benefits data for a user
 */
export async function getBenefits(userId: string): Promise<BenefitsData | null> {
  await delay(70);

  const employee = getEmployeeById(userId);
  if (!employee) return null;

  const beneficios: Benefit[] = [
    {
      id: "ben-001",
      tipo: "vr",
      nome: "Vale Refeição",
      nomeAbreviado: "VR",
      operadora: "Alelo",
      valor: 33.0 * 22, // Dias úteis
      valorDesconto: 0,
      coparticipacao: false,
      ativo: true,
      dataInicio: "2022-03-15",
      dependentes: 0,
      _display: {
        valor: formatCurrencyDisplay(33.0 * 22),
        status: "Ativo",
      },
    },
    {
      id: "ben-002",
      tipo: "vt",
      nome: "Vale Transporte",
      nomeAbreviado: "VT",
      operadora: "SPTrans",
      valor: 510.0,
      valorDesconto: employee.salarioBase * 0.06,
      coparticipacao: true,
      ativo: true,
      dataInicio: "2022-03-15",
      dependentes: 0,
      _display: {
        valor: formatCurrencyDisplay(510.0),
        status: "Ativo",
      },
    },
    {
      id: "ben-003",
      tipo: "plano_saude",
      nome: "Plano de Saúde Unimed",
      nomeAbreviado: "Saúde",
      operadora: "Unimed",
      plano: "Executivo Nacional",
      valor: 850.0,
      valorDesconto: 350.0,
      coparticipacao: true,
      ativo: true,
      dataInicio: "2022-03-15",
      dependentes: 0,
      _display: {
        valor: formatCurrencyDisplay(850.0),
        status: "Ativo",
      },
    },
    {
      id: "ben-004",
      tipo: "plano_odonto",
      nome: "Plano Odontológico Odontoprev",
      nomeAbreviado: "Odonto",
      operadora: "Odontoprev",
      plano: "Integral",
      valor: 45.0,
      valorDesconto: 0,
      coparticipacao: false,
      ativo: true,
      dataInicio: "2022-03-15",
      dependentes: 0,
      _display: {
        valor: formatCurrencyDisplay(45.0),
        status: "Ativo",
      },
    },
    {
      id: "ben-005",
      tipo: "gympass",
      nome: "Wellhub (Gympass)",
      nomeAbreviado: "Gympass",
      operadora: "Wellhub",
      plano: "Gold",
      valor: 0,
      valorDesconto: 0,
      coparticipacao: false,
      ativo: true,
      dataInicio: "2024-01-01",
      dependentes: 0,
      _display: {
        valor: "Gratuito",
        status: "Ativo",
      },
    },
    {
      id: "ben-006",
      tipo: "seguro_vida",
      nome: "Seguro de Vida",
      nomeAbreviado: "Seguro",
      operadora: "Porto Seguro",
      plano: "Básico",
      valor: 25.0,
      valorDesconto: 0,
      coparticipacao: false,
      ativo: true,
      dataInicio: "2022-03-15",
      dependentes: 0,
      _display: {
        valor: formatCurrencyDisplay(25.0),
        status: "Ativo",
      },
    },
  ];

  const totalMensal = beneficios
    .filter((b) => b.ativo)
    .reduce((sum, b) => sum + b.valor, 0);

  return {
    employeeId: userId,
    beneficios,
    totalMensal,
    _meta: {
      resumo: {
        short: `${beneficios.filter((b) => b.ativo).length} ativos`,
        long: `${beneficios.filter((b) => b.ativo).length} benefícios ativos`,
      },
    },
  };
}

// ===========================================
// SERVICE FUNCTIONS - Clock Events (Ponto)
// ===========================================

/**
 * Get clock events data for a user
 */
export async function getClockEvents(userId: string): Promise<ClockEventsData | null> {
  await delay(90);

  const employee = getEmployeeById(userId);
  if (!employee) return null;

  // Generate mock records for current month
  const hoje = new Date();
  const registros: ClockRecord[] = [];

  // Generate 15 working days of records
  for (let i = 15; i >= 0; i--) {
    const date = new Date(hoje);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    const isToday = i === 0;
    const horasTrabalhadas = isToday ? 240 : 480; // 4h if today (still working), 8h otherwise
    const horasEsperadas = 480;
    const saldo = horasTrabalhadas - horasEsperadas;

    registros.push({
      id: `clock-${dateStr}`,
      data: dateStr,
      eventos: isToday
        ? [
            { tipo: "entrada", horario: "08:02", fonte: "relogio" },
            { tipo: "saida", horario: "12:01", fonte: "relogio" },
            { tipo: "entrada", horario: "13:03", fonte: "relogio" },
          ]
        : [
            { tipo: "entrada", horario: "08:00", fonte: "relogio" },
            { tipo: "saida", horario: "12:00", fonte: "relogio" },
            { tipo: "entrada", horario: "13:00", fonte: "relogio" },
            { tipo: "saida", horario: "17:00", fonte: "relogio" },
          ],
      horasTrabalhadas,
      horasEsperadas,
      saldo,
      status: isToday ? "incompleto" : "normal",
      _display: {
        trabalhadas: `${Math.floor(horasTrabalhadas / 60).toString().padStart(2, "0")}:${(horasTrabalhadas % 60).toString().padStart(2, "0")}`,
        saldo: formatMinutesToHours(saldo),
        status: isToday ? "Em andamento" : "Completo",
      },
    });
  }

  const diasTrabalhados = registros.filter((r) => r.status === "normal").length;
  const horasTrabalhadas = registros.reduce((sum, r) => sum + r.horasTrabalhadas, 0);
  const bancoHoras = registros.reduce((sum, r) => sum + r.saldo, 0);

  return {
    employeeId: userId,
    registros,
    resumoMes: {
      competencia: `${(hoje.getMonth() + 1).toString().padStart(2, "0")}/${hoje.getFullYear()}`,
      diasTrabalhados,
      diasUteis: 22,
      horasTrabalhadas,
      horasEsperadas: 22 * 480,
      horasExtras: Math.max(0, bancoHoras),
      faltas: 0,
      atestados: 0,
      atrasos: 2,
    },
    bancoHoras,
    _meta: {
      bancoHorasLabel: {
        short: formatMinutesToHours(bancoHoras),
        long: `Banco de horas: ${formatMinutesToHours(bancoHoras)}`,
      },
      statusHoje: {
        short: "Trabalhando",
        long: "Atualmente trabalhando",
      },
    },
  };
}

// ===========================================
// SERVICE FUNCTIONS - Admin Metrics
// ===========================================

/**
 * Get aggregated metrics for Admin Dashboard
 * This function is exclusive to RH/ADMIN roles
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  await delay(150);

  const hoje = new Date().toISOString();
  const competencia = `${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${new Date().getFullYear()}`;

  const totalColaboradores = MOCK_EMPLOYEES.length;
  const ativos = MOCK_EMPLOYEES.filter((e) => e.status === "ativo").length;
  const emFerias = MOCK_EMPLOYEES.filter((e) => e.status === "ferias").length;

  const totalBruto = MOCK_EMPLOYEES.reduce((sum, e) => sum + e.salarioBase, 0);
  const mediaSalarial = totalBruto / totalColaboradores;

  return {
    colaboradores: {
      total: totalColaboradores,
      ativos,
      inativos: 0,
      emFerias,
      afastados: 0,
    },
    ponto: {
      competencia,
      totalFaltas: 3,
      totalAtestados: 2,
      totalAtrasos: 8,
      mediaHorasExtras: 45, // 45 minutos
      colaboradoresComPendencia: 2,
    },
    folha: {
      competencia,
      totalBruto,
      totalLiquido: totalBruto * 0.72, // Aproximação
      mediaSalarial,
      totalEncargos: totalBruto * 0.35,
    },
    ferias: {
      colaboradoresEmFerias: emFerias,
      feriasAVencer30Dias: 2,
      feriasAVencer60Dias: 4,
      solicitacoesPendentes: 1,
    },
    beneficios: {
      totalMensal: totalColaboradores * 2100, // Aproximação
      utilizacaoPlanoSaude: 85,
      utilizacaoVR: 98,
    },
    atendimentos: {
      totalMes: 156,
      mediaTempoResposta: 12, // 12 segundos
      taxaResolucao: 94,
      temasMaisConsultados: [
        { tema: "Férias", count: 45 },
        { tema: "Holerite", count: 38 },
        { tema: "Benefícios", count: 32 },
        { tema: "Ponto", count: 28 },
        { tema: "Outros", count: 13 },
      ],
    },
    atualizadoEm: hoje,
  };
}

// ===========================================
// SERVICE FUNCTIONS - Employee Data
// ===========================================

/**
 * Get employee by ID
 */
export async function getEmployee(userId: string): Promise<Employee | null> {
  await delay(50);
  return getEmployeeById(userId) || null;
}

/**
 * Get all employees (Admin only)
 */
export async function getAllEmployees(): Promise<Employee[]> {
  await delay(100);
  return [...MOCK_EMPLOYEES];
}

/**
 * Search employees by name, matricula or email
 */
export async function searchEmployees(query: string): Promise<Employee[]> {
  await delay(80);
  const lowerQuery = query.toLowerCase();
  return MOCK_EMPLOYEES.filter(
    (e) =>
      e.nome.toLowerCase().includes(lowerQuery) ||
      e.matricula.includes(query) ||
      e.email.toLowerCase().includes(lowerQuery)
  );
}

// ===========================================
// SERVICE FUNCTIONS - Upcoming Events
// ===========================================

/**
 * Get upcoming events for a user
 * Returns relevant HR events like vacations, evaluations, trainings, etc.
 */
export async function getUpcomingEvents(userId: string): Promise<UpcomingEvent[]> {
  await delay(60);

  const employee = getEmployeeById(userId);
  if (!employee) return [];

  const hoje = new Date();
  const events: UpcomingEvent[] = [];

  // Próximas férias programadas (da página de férias)
  const vacation = await getVacationData(userId);
  const feriasAprovadas = vacation?.historico.filter(h => h.status === "aprovada") || [];
  
  for (const ferias of feriasAprovadas) {
    const dataInicio = new Date(ferias.dataInicio);
    if (dataInicio > hoje) {
      events.push({
        id: `event-ferias-${ferias.id}`,
        tipo: "ferias",
        titulo: "Férias Programadas",
        descricao: `${ferias.dias} dias de férias`,
        data: ferias.dataInicio,
        dataFim: ferias.dataFim,
        prioridade: "alta",
        acao: {
          label: "Ver detalhes",
          href: "/ferias",
        },
      });
    }
  }

  // Aniversário de empresa (tempo de casa)
  const dataAdmissao = new Date(employee.dataAdmissao);
  const proximoAniversario = new Date(hoje.getFullYear(), dataAdmissao.getMonth(), dataAdmissao.getDate());
  
  // Se já passou este ano, pega o do ano que vem
  if (proximoAniversario < hoje) {
    proximoAniversario.setFullYear(hoje.getFullYear() + 1);
  }
  
  const diasAteAniversario = Math.ceil((proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  // Mostrar apenas se faltar menos de 60 dias
  if (diasAteAniversario <= 60 && diasAteAniversario > 0) {
    const anosDeEmpresa = proximoAniversario.getFullYear() - dataAdmissao.getFullYear();
    events.push({
      id: "event-aniversario-empresa",
      tipo: "aniversario_empresa",
      titulo: `${anosDeEmpresa} anos na empresa`,
      descricao: `Você completa ${anosDeEmpresa} ${anosDeEmpresa === 1 ? 'ano' : 'anos'} de empresa`,
      data: proximoAniversario.toISOString().split("T")[0],
      prioridade: "baixa",
    });
  }

  // Avaliação de desempenho (semestral - junho e dezembro)
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  let proximaAvaliacao: Date | null = null;
  
  if (mesAtual < 5) {
    // Próxima é em junho
    proximaAvaliacao = new Date(anoAtual, 5, 15); // 15 de junho
  } else if (mesAtual < 11) {
    // Próxima é em dezembro
    proximaAvaliacao = new Date(anoAtual, 11, 10); // 10 de dezembro
  } else {
    // Próxima é junho do ano que vem
    proximaAvaliacao = new Date(anoAtual + 1, 5, 15);
  }
  
  const diasAteAvaliacao = Math.ceil((proximaAvaliacao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasAteAvaliacao <= 45 && diasAteAvaliacao > 0) {
    events.push({
      id: "event-avaliacao",
      tipo: "avaliacao",
      titulo: "Avaliação de Desempenho",
      descricao: "Ciclo semestral de avaliação",
      data: proximaAvaliacao.toISOString().split("T")[0],
      prioridade: "media",
      acao: {
        label: "Preparar autoavaliação",
        href: "/perfil",
      },
    });
  }

  // Treinamento obrigatório (exemplo: segurança do trabalho anual)
  const dataUltimoTreinamento = new Date(2025, 2, 10); // 10 de março de 2025
  const proximoTreinamento = new Date(dataUltimoTreinamento);
  proximoTreinamento.setFullYear(proximoTreinamento.getFullYear() + 1);
  
  const diasAteTreinamento = Math.ceil((proximoTreinamento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasAteTreinamento <= 30 && diasAteTreinamento > 0) {
    events.push({
      id: "event-treinamento",
      tipo: "treinamento",
      titulo: "Treinamento de Segurança",
      descricao: "Treinamento obrigatório anual",
      data: proximoTreinamento.toISOString().split("T")[0],
      prioridade: "alta",
      acao: {
        label: "Agendar horário",
        href: "/chat",
      },
    });
  }

  // Prazo para declaração de dependentes (anual - sempre em abril)
  const prazoDependentes = new Date(anoAtual, 3, 30); // 30 de abril
  if (prazoDependentes < hoje) {
    prazoDependentes.setFullYear(anoAtual + 1);
  }
  
  const diasAtePrazo = Math.ceil((prazoDependentes.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasAtePrazo <= 45 && diasAtePrazo > 0) {
    events.push({
      id: "event-dependentes",
      tipo: "prazo_documentos",
      titulo: "Declaração de Dependentes",
      descricao: "Prazo para atualização de dependentes (IR)",
      data: prazoDependentes.toISOString().split("T")[0],
      prioridade: "media",
      acao: {
        label: "Atualizar dados",
        href: "/perfil",
      },
    });
  }

  // Ordenar eventos por data (mais próximo primeiro)
  events.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return events;
}

// ===========================================
// UTILITY FUNCTIONS - Exported for Testing
// ===========================================

/**
 * Calculate vacation balance
 * Brazilian law: 30 days per aquisitive period
 */
export function calculateVacationBalance(
  totalDays: number,
  usedDays: number,
  soldDays: number
): number {
  const balance = totalDays - usedDays - soldDays;
  return Math.max(0, balance);
}

/**
 * Calculate vacation periods based on admission date
 */
export function calculateVacationPeriods(admissionDate: Date): {
  aquisitivo: { inicio: string; fim: string };
  concessivo: { inicio: string; fim: string };
} {
  const hoje = new Date();
  
  // Find current aquisitive period
  let aquisitivoInicio = new Date(admissionDate);
  while (aquisitivoInicio < hoje) {
    const nextYear = new Date(aquisitivoInicio);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    if (nextYear > hoje) break;
    aquisitivoInicio = nextYear;
  }
  
  const aquisitivoFim = new Date(aquisitivoInicio);
  aquisitivoFim.setFullYear(aquisitivoFim.getFullYear() + 1);
  aquisitivoFim.setDate(aquisitivoFim.getDate() - 1);
  
  const concessivoInicio = new Date(aquisitivoFim);
  concessivoInicio.setDate(concessivoInicio.getDate() + 1);
  
  const concessivoFim = new Date(concessivoInicio);
  concessivoFim.setFullYear(concessivoFim.getFullYear() + 1);
  concessivoFim.setDate(concessivoFim.getDate() - 1);
  
  return {
    aquisitivo: {
      inicio: aquisitivoInicio.toISOString().split("T")[0],
      fim: aquisitivoFim.toISOString().split("T")[0],
    },
    concessivo: {
      inicio: concessivoInicio.toISOString().split("T")[0],
      fim: concessivoFim.toISOString().split("T")[0],
    },
  };
}
