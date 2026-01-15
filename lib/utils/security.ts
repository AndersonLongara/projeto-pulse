/**
 * Security Utilities - PII Protection Layer
 *
 * Implements Zero Trust data masking for sensitive fields.
 * Must be applied at BFF layer BEFORE sending data to client.
 *
 * @see .github/agents/Master.agent.md - Section 3 (Security Protocols)
 */

import type { Employee, Payslip, PayslipData, UserRole } from "@/lib/services/senior-mock";

// ===========================================
// TYPES
// ===========================================

export interface MaskOptions {
  /** Role determines masking level */
  role: UserRole;
  /** Context-specific masking rules */
  context?: "list" | "detail" | "export";
}

// ===========================================
// MASK FUNCTIONS - CPF
// ===========================================

/**
 * Mask CPF based on user role
 *
 * ADMIN: Full CPF visible
 * RH: Partial mask (123.456.***-**)
 * USER: Heavy mask (***.***.789-00)
 */
export function maskCPF(cpf: string, role: UserRole): string {
  if (!cpf) return "***.***.***-**";

  // Remove any existing formatting
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return "***.***.***-**";

  switch (role) {
    case "ADMIN":
      // Full visibility
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;

    case "RH":
      // Partial mask - show first 6 digits
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.***.${cleaned.slice(9)}`;

    case "USER":
    default:
      // Heavy mask - show only last 4 digits
      return `***.***.*${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
}

// ===========================================
// MASK FUNCTIONS - Salary
// ===========================================

/**
 * Mask salary based on user role and context
 *
 * ADMIN: Full visibility
 * RH: Full visibility in detail, approximate in list
 * USER: Own salary visible, others masked
 */
export function maskSalary(
  value: number,
  role: UserRole,
  context: "own" | "others" = "own"
): string {
  const formatted = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Users can always see their own salary
  if (context === "own") return formatted;

  switch (role) {
    case "ADMIN":
    case "RH":
      return formatted;

    case "USER":
    default:
      // Mask with range indication
      if (value < 3000) return "R$ *.**0 - 3.000";
      if (value < 5000) return "R$ 3.000 - 5.000";
      if (value < 8000) return "R$ 5.000 - 8.000";
      if (value < 12000) return "R$ 8.000 - 12.000";
      return "R$ 12.000+";
  }
}

// ===========================================
// MASK FUNCTIONS - Email
// ===========================================

/**
 * Mask email address
 *
 * ADMIN: Full visibility
 * RH: Full visibility
 * USER: Partial mask (m***@empresa.com)
 */
export function maskEmail(email: string, role: UserRole): string {
  if (!email || !email.includes("@")) return "***@***.***";

  if (role === "ADMIN" || role === "RH") return email;

  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;

  return `${local[0]}${"*".repeat(local.length - 1)}@${domain}`;
}

// ===========================================
// MASK FUNCTIONS - Phone
// ===========================================

/**
 * Mask phone number
 *
 * ADMIN: Full visibility
 * RH: Partial mask
 * USER: Heavy mask
 */
export function maskPhone(phone: string, role: UserRole): string {
  if (!phone) return "(**) *****-****";

  const cleaned = phone.replace(/\D/g, "");

  if (role === "ADMIN") {
    // Format and return full
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  if (role === "RH") {
    // Show area code and last 4 digits
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 2)}) *****-${cleaned.slice(-4)}`;
    }
    return "(**) *****-****";
  }

  // USER: Only last 2 digits
  if (cleaned.length >= 2) {
    return `(**) *****-**${cleaned.slice(-2)}`;
  }
  return "(**) *****-****";
}

// ===========================================
// OBJECT MASKING - Employee
// ===========================================

/**
 * Apply PII masking to Employee object
 * Creates a new object with masked sensitive fields
 */
export function maskEmployee<T extends Partial<Employee>>(
  employee: T,
  options: MaskOptions
): T {
  const { role, context = "detail" } = options;

  return {
    ...employee,
    cpf: employee.cpf ? maskCPF(employee.cpf, role) : undefined,
    email: employee.email ? maskEmail(employee.email, role) : undefined,
    salarioBase: employee.salarioBase
      ? parseFloat(
          maskSalary(employee.salarioBase, role, "others")
            .replace(/[^\d,.-]/g, "")
            .replace(",", ".") || "0"
        )
      : undefined,
    // For list context, also truncate names
    nome:
      context === "list" && role === "USER" && employee.nome
        ? employee.nomeAbreviado || employee.nome.split(" ")[0]
        : employee.nome,
  } as T;
}

// ===========================================
// OBJECT MASKING - Payslip
// ===========================================

/**
 * Apply PII masking to PayslipData
 * Salary data is only visible to the owner or ADMIN/RH
 */
export function maskPayslipData(
  data: PayslipData,
  options: MaskOptions & { isOwner: boolean }
): PayslipData {
  const { role, isOwner } = options;

  // Owner or privileged roles see everything
  if (isOwner || role === "ADMIN" || role === "RH") {
    return data;
  }

  // Non-owner users cannot see payslip data
  return {
    ...data,
    holerites: data.holerites.map((h) => ({
      ...h,
      salarioBruto: 0,
      salarioLiquido: 0,
      totalProventos: 0,
      totalDescontos: 0,
      fgts: 0,
      inssPatronal: 0,
      proventos: [],
      descontos: [],
      _display: {
        bruto: "***",
        liquido: "***",
        descontos: "***",
      },
    })),
    resumoAnual: {
      ...data.resumoAnual,
      totalBruto: 0,
      totalLiquido: 0,
      totalDescontos: 0,
      mediaLiquida: 0,
    },
  };
}

// ===========================================
// BATCH MASKING - Generic
// ===========================================

/**
 * Apply masking to an array of employees
 */
export function maskEmployeeList<T extends Partial<Employee>>(
  employees: T[],
  options: MaskOptions
): T[] {
  return employees.map((e) => maskEmployee(e, { ...options, context: "list" }));
}

// ===========================================
// UTILITY - Detect PII
// ===========================================

/**
 * Check if a string contains potential PII patterns
 * Useful for logging sanitization
 */
export function containsPII(text: string): boolean {
  const patterns = [
    /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF
    /\d{11}/, // CPF without dots
    /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/, // CNPJ
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
    /\(\d{2}\)\s?\d{4,5}-?\d{4}/, // Phone
  ];

  return patterns.some((pattern) => pattern.test(text));
}

/**
 * Sanitize text by removing potential PII
 * For use in logs and error messages
 */
export function sanitizeForLog(text: string): string {
  return text
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "[CPF]")
    .replace(/\d{11}/g, "[DOC]")
    .replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, "[CNPJ]")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
    .replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}/g, "[PHONE]");
}

// ===========================================
// EXPORTS - Convenience
// ===========================================

export const mask = {
  cpf: maskCPF,
  salary: maskSalary,
  email: maskEmail,
  phone: maskPhone,
  employee: maskEmployee,
  employeeList: maskEmployeeList,
  payslip: maskPayslipData,
};

export default mask;
