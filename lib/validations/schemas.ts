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
