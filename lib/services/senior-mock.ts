/**
 * Senior Mock Service
 *
 * Centralized mock data service for simulating Senior ERP integration.
 * Provides fake data for: Férias, Folha, Benefícios, Ponto
 *
 * @see .github/agents/Master.agent.md - Section 4
 */

// ===========================================
// TYPES
// ===========================================

export interface Employee {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  cpf: string; // Masked: ***.***.***-XX
  cargo: string;
  departamento: string;
  dataAdmissao: string;
}

export interface VacationBalance {
  employeeId: string;
  saldoDias: number;
  periodoAquisitivo: {
    inicio: string;
    fim: string;
  };
  periodoConcessivo: {
    inicio: string;
    fim: string;
  };
  feriasAgendadas: VacationSchedule[];
}

export interface VacationSchedule {
  id: string;
  dataInicio: string;
  dataFim: string;
  dias: number;
  status: "pendente" | "aprovada" | "rejeitada" | "gozada";
  abonoPecuniario: boolean;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  competencia: string; // MM/YYYY
  salarioBruto: number;
  descontos: PaySlipDeduction[];
  totalDescontos: number;
  salarioLiquido: number;
  dataPagamento: string;
}

export interface PaySlipDeduction {
  descricao: string;
  valor: number;
  tipo: "inss" | "irrf" | "vt" | "vr" | "plano_saude" | "outros";
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  data: string;
  entradas: string[];
  saidas: string[];
  horasTrabalhadas: string;
  status: "normal" | "falta" | "atestado" | "ferias" | "folga";
  observacao?: string;
}

export interface Benefit {
  id: string;
  employeeId: string;
  tipo: "vt" | "vr" | "va" | "plano_saude" | "plano_odonto" | "gympass";
  nome: string;
  valor: number;
  ativo: boolean;
}

// ===========================================
// MOCK DATA
// ===========================================

const mockEmployee: Employee = {
  id: "emp-001",
  matricula: "12345",
  nome: "Maria Silva",
  email: "maria.silva@empresa.com",
  cpf: "***.***. ***-89", // Masked for PII protection
  cargo: "Analista de Sistemas",
  departamento: "Tecnologia",
  dataAdmissao: "2022-03-15",
};

const mockVacationBalance: VacationBalance = {
  employeeId: "emp-001",
  saldoDias: 20,
  periodoAquisitivo: {
    inicio: "2024-03-15",
    fim: "2025-03-14",
  },
  periodoConcessivo: {
    inicio: "2025-03-15",
    fim: "2026-03-14",
  },
  feriasAgendadas: [
    {
      id: "vac-001",
      dataInicio: "2025-07-01",
      dataFim: "2025-07-10",
      dias: 10,
      status: "aprovada",
      abonoPecuniario: false,
    },
  ],
};

const mockPaySlips: PaySlip[] = [
  {
    id: "pay-001",
    employeeId: "emp-001",
    competencia: "12/2025",
    salarioBruto: 8500.0,
    descontos: [
      { descricao: "INSS", valor: 828.38, tipo: "inss" },
      { descricao: "IRRF", valor: 869.36, tipo: "irrf" },
      { descricao: "Vale Transporte", valor: 510.0, tipo: "vt" },
      { descricao: "Plano de Saúde", valor: 350.0, tipo: "plano_saude" },
    ],
    totalDescontos: 2557.74,
    salarioLiquido: 5942.26,
    dataPagamento: "2025-01-05",
  },
  {
    id: "pay-002",
    employeeId: "emp-001",
    competencia: "11/2025",
    salarioBruto: 8500.0,
    descontos: [
      { descricao: "INSS", valor: 828.38, tipo: "inss" },
      { descricao: "IRRF", valor: 869.36, tipo: "irrf" },
      { descricao: "Vale Transporte", valor: 510.0, tipo: "vt" },
      { descricao: "Plano de Saúde", valor: 350.0, tipo: "plano_saude" },
    ],
    totalDescontos: 2557.74,
    salarioLiquido: 5942.26,
    dataPagamento: "2025-12-05",
  },
];

const mockBenefits: Benefit[] = [
  {
    id: "ben-001",
    employeeId: "emp-001",
    tipo: "vr",
    nome: "Vale Refeição",
    valor: 33.0,
    ativo: true,
  },
  {
    id: "ben-002",
    employeeId: "emp-001",
    tipo: "vt",
    nome: "Vale Transporte",
    valor: 510.0,
    ativo: true,
  },
  {
    id: "ben-003",
    employeeId: "emp-001",
    tipo: "plano_saude",
    nome: "Plano de Saúde Unimed",
    valor: 350.0,
    ativo: true,
  },
  {
    id: "ben-004",
    employeeId: "emp-001",
    tipo: "gympass",
    nome: "Wellhub (Gympass)",
    valor: 0,
    ativo: true,
  },
];

// ===========================================
// SERVICE FUNCTIONS
// ===========================================

/**
 * Get employee data by ID
 */
export async function getEmployee(employeeId: string): Promise<Employee | null> {
  // Simulate API delay
  await delay(100);
  return employeeId === mockEmployee.id ? mockEmployee : null;
}

/**
 * Get vacation balance for an employee
 */
export async function getVacationBalance(
  employeeId: string
): Promise<VacationBalance | null> {
  await delay(100);
  return employeeId === mockVacationBalance.employeeId
    ? mockVacationBalance
    : null;
}

/**
 * Get payslips for an employee (most recent first)
 */
export async function getPaySlips(
  employeeId: string,
  limit: number = 3
): Promise<PaySlip[]> {
  await delay(100);
  return mockPaySlips
    .filter((p) => p.employeeId === employeeId)
    .slice(0, limit);
}

/**
 * Get benefits for an employee
 */
export async function getBenefits(employeeId: string): Promise<Benefit[]> {
  await delay(100);
  return mockBenefits.filter((b) => b.employeeId === employeeId);
}

/**
 * Get time records for an employee (specific month)
 */
export async function getTimeRecords(
  employeeId: string,
  month: string // MM/YYYY
): Promise<TimeRecord[]> {
  await delay(100);
  // Generate mock time records for the month
  return generateMockTimeRecords(employeeId, month);
}

// ===========================================
// HELPERS
// ===========================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockTimeRecords(
  employeeId: string,
  month: string
): TimeRecord[] {
  const [mm, yyyy] = month.split("/");
  const daysInMonth = new Date(Number(yyyy), Number(mm), 0).getDate();
  const records: TimeRecord[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Number(yyyy), Number(mm) - 1, day);
    const dayOfWeek = date.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().split("T")[0];

    records.push({
      id: `time-${dateStr}`,
      employeeId,
      data: dateStr,
      entradas: ["08:00", "13:00"],
      saidas: ["12:00", "17:00"],
      horasTrabalhadas: "08:00",
      status: "normal",
    });
  }

  return records;
}

// ===========================================
// PII MASKING UTILITIES
// ===========================================

/**
 * Mask CPF for display (show only last 2 digits)
 */
export function maskCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `***.***. ***-${digits.slice(-2)}`;
}

/**
 * Mask salary value (show range instead of exact value)
 */
export function maskSalary(value: number): string {
  if (value < 3000) return "Até R$ 3.000";
  if (value < 5000) return "R$ 3.000 - R$ 5.000";
  if (value < 8000) return "R$ 5.000 - R$ 8.000";
  if (value < 12000) return "R$ 8.000 - R$ 12.000";
  return "Acima de R$ 12.000";
}
