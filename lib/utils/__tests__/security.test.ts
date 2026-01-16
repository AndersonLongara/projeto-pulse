/**
 * Security Utils Tests - PII Masking
 *
 * @see lib/utils/security.ts
 */

import { describe, it, expect } from "vitest";
import { maskCPF, maskSalary, maskEmail, maskPhone } from "@/lib/utils/security";

describe("maskCPF", () => {
  const validCPF = "12345678901";
  const formattedCPF = "123.456.789-01";

  describe("ADMIN role", () => {
    it("should show full CPF for admin", () => {
      expect(maskCPF(validCPF, "ADMIN")).toBe("123.456.789-01");
    });

    it("should handle already formatted CPF", () => {
      expect(maskCPF(formattedCPF, "ADMIN")).toBe("123.456.789-01");
    });
  });

  describe("RH role", () => {
    it("should partially mask CPF for RH", () => {
      const result = maskCPF(validCPF, "RH");
      expect(result).toBe("123.456.***.01");
      expect(result).toContain("***");
    });
  });

  describe("USER role", () => {
    it("should heavily mask CPF for regular users", () => {
      const result = maskCPF(validCPF, "USER");
      expect(result).toBe("***.***.*89-01");
      expect(result.startsWith("***")).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should return masked placeholder for empty string", () => {
      expect(maskCPF("", "ADMIN")).toBe("***.***.***-**");
    });

    it("should return masked placeholder for invalid CPF length", () => {
      expect(maskCPF("123", "ADMIN")).toBe("***.***.***-**");
    });

    it("should handle CPF with special characters", () => {
      expect(maskCPF("123.456.789-01", "ADMIN")).toBe("123.456.789-01");
    });
  });
});

describe("maskSalary", () => {
  const salary = 5500;

  describe("Own salary context", () => {
    it("should always show own salary regardless of role", () => {
      const result = maskSalary(salary, "USER", "own");
      expect(result).toContain("5.500");
    });
  });

  describe("Others salary context", () => {
    it("should show full salary for ADMIN viewing others", () => {
      const result = maskSalary(salary, "ADMIN", "others");
      expect(result).toContain("5.500");
    });

    it("should show full salary for RH viewing others", () => {
      const result = maskSalary(salary, "RH", "others");
      expect(result).toContain("5.500");
    });

    it("should mask salary range for USER viewing others", () => {
      const result = maskSalary(salary, "USER", "others");
      expect(result).toContain("5.000");
      expect(result).toContain("-");
    });
  });

  describe("Salary ranges for USER", () => {
    it("should return correct range for low salary", () => {
      const result = maskSalary(2500, "USER", "others");
      expect(result).toBe("R$ *.**0 - 3.000");
    });

    it("should return correct range for medium salary", () => {
      const result = maskSalary(4000, "USER", "others");
      expect(result).toBe("R$ 3.000 - 5.000");
    });

    it("should return correct range for high salary", () => {
      const result = maskSalary(15000, "USER", "others");
      expect(result).toBe("R$ 12.000+");
    });
  });
});

describe("maskEmail", () => {
  it("should mask most of email local part for USER", () => {
    const result = maskEmail("joao.silva@empresa.com", "USER");
    expect(result).toContain("j");
    expect(result).toContain("*");
    expect(result).toContain("@empresa.com");
  });

  it("should show full email for ADMIN", () => {
    const result = maskEmail("joao.silva@empresa.com", "ADMIN");
    expect(result).toBe("joao.silva@empresa.com");
  });
});

describe("maskPhone", () => {
  it("should mask middle digits of phone for USER", () => {
    const result = maskPhone("11999887766", "USER");
    expect(result).toContain("***");
  });

  it("should show full phone for ADMIN", () => {
    const result = maskPhone("11999887766", "ADMIN");
    expect(result).not.toContain("***");
  });
});
