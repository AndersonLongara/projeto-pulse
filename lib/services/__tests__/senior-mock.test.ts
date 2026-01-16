/**
 * Senior Mock Service Tests - Vacation Calculations
 *
 * @see lib/services/senior-mock.ts
 */

import { describe, it, expect } from "vitest";
import {
  getVacationData,
  calculateVacationBalance,
  getEmployeeById,
  formatMinutesToHours,
  calculateVacationPeriods,
} from "@/lib/services/senior-mock";

describe("Vacation Data", () => {
  describe("getVacationData", () => {
    it("should return vacation data for valid user", async () => {
      const data = await getVacationData("emp-001");
      
      expect(data).not.toBeNull();
      expect(data?.employeeId).toBe("emp-001");
      expect(data?.saldoDias).toBeTypeOf("number");
      expect(data?.diasGozados).toBeTypeOf("number");
    });

    it("should return null for invalid user", async () => {
      const data = await getVacationData("invalid-id");
      expect(data).toBeNull();
    });

    it("should include valid period dates in ISO format", async () => {
      const data = await getVacationData("emp-001");
      
      expect(data?.periodoAquisitivo.inicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(data?.periodoAquisitivo.fim).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should include metadata labels", async () => {
      const data = await getVacationData("emp-001");
      
      expect(data?._meta.saldoLabel.short).toBeDefined();
      expect(data?._meta.saldoLabel.long).toBeDefined();
    });
  });

  describe("calculateVacationBalance", () => {
    it("should calculate correct balance (total - used - sold)", () => {
      // Standard Brazilian vacation: 30 days per year
      const balance = calculateVacationBalance(30, 10, 5);
      expect(balance).toBe(15);
    });

    it("should not return negative balance", () => {
      const balance = calculateVacationBalance(30, 25, 10);
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    it("should handle zero values", () => {
      const balance = calculateVacationBalance(30, 0, 0);
      expect(balance).toBe(30);
    });
  });

  describe("calculateVacationPeriods", () => {
    it("should calculate aquisitive period correctly", () => {
      const admissionDate = new Date("2024-03-15");
      const periods = calculateVacationPeriods(admissionDate);
      
      expect(periods.aquisitivo).toBeDefined();
      expect(periods.aquisitivo.inicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should calculate concessivo period", () => {
      const admissionDate = new Date("2024-03-15");
      const periods = calculateVacationPeriods(admissionDate);
      
      expect(periods.concessivo).toBeDefined();
      expect(periods.concessivo.inicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe("Employee Data", () => {
  describe("getEmployeeById", () => {
    it("should return employee for valid ID", () => {
      const employee = getEmployeeById("emp-001");
      expect(employee).not.toBeUndefined();
      expect(employee?.id).toBe("emp-001");
    });

    it("should return undefined for invalid ID", () => {
      const employee = getEmployeeById("invalid");
      expect(employee).toBeUndefined();
    });

    it("should include all required fields", () => {
      const employee = getEmployeeById("emp-001");
      
      expect(employee?.matricula).toBeDefined();
      expect(employee?.nome).toBeDefined();
      expect(employee?.email).toBeDefined();
      expect(employee?.cpf).toBeDefined();
      expect(employee?.cargo).toBeDefined();
    });
  });
});

describe("Utility Functions", () => {
  describe("formatMinutesToHours", () => {
    it("should format positive minutes correctly", () => {
      expect(formatMinutesToHours(90)).toBe("+01:30");
    });

    it("should format negative minutes correctly", () => {
      expect(formatMinutesToHours(-45)).toBe("-00:45");
    });

    it("should format zero as +00:00", () => {
      expect(formatMinutesToHours(0)).toBe("+00:00");
    });

    it("should handle large values", () => {
      expect(formatMinutesToHours(600)).toBe("+10:00");
    });
  });
});
