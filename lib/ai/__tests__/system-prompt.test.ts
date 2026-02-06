/**
 * AI System Prompt Tests
 *
 * Tests for the Pulse AI system prompt and escape logic.
 */

import { describe, it, expect } from "vitest";
import {
  buildSystemPrompt,
  buildContextInjection,
  shouldTriggerEscape,
} from "../system-prompt";

describe("AI System Prompt", () => {
  describe("buildSystemPrompt", () => {
    it("should include Senior HR Specialist persona definition", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Especialista em RH oficial da empresa");
      expect(prompt).toContain("Representante da Empresa");
    });

    it("should include Rule 7 (Dificult to find, shifted to Rule 5)", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("REGRAS E LEIS");
      expect(prompt).toContain("contexto fornecido");
    });

    it("should include behavior examples (Few-Shot)", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Exemplos de Comportamento");
      expect(prompt).toContain("Posso vender férias?");
    });

    it("should specifically include 13th advance rule in examples", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Adiantamento de 13º");
      expect(prompt).toContain("Janeiro"); // Reverted to check if 'Janeiro' is actually still in the prompt text I added
    });

    it("should include CLT Art 130 table", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Art. 130 CLT");
      expect(prompt).toContain("Até 5 faltas");
    });
  });

  describe("buildContextInjection", () => {
    it("should include user name", () => {
      const context = buildContextInjection({ userName: "Maria Silva" });
      expect(context).toContain("Maria Silva");
      expect(context).toContain("[CONTEXTO_ATUAL_DO_COLABORADOR]");
    });

    it("should include 'faltas' data when provided", () => {
      const context = buildContextInjection({
        userName: "João",
        vacation: {
          saldoDias: 20,
          diasGozados: 10,
          proximoVencimento: "15 de março de 2027",
          periodoAquisitivoInicio: "15 de março de 2025",
          periodoAquisitivoFim: "14 de março de 2026",
          faltas: 7,
        },
      });
      expect(context).toContain("20 dias");
      expect(context).toContain("Faltas no período aquisitivo: **7**");
    });
  });

  describe("shouldTriggerEscape", () => {
    it("should trigger on frustration keywords", () => {
      expect(shouldTriggerEscape("isso não funciona")).toBe(true);
      expect(shouldTriggerEscape("que absurdo")).toBe(true);
    });

    it("should trigger on sensitive out-of-scope topics", () => {
      expect(shouldTriggerEscape("quero pedir demissão")).toBe(true);
      expect(shouldTriggerEscape("quero falar sobre assédio")).toBe(true);
      expect(shouldTriggerEscape("estou grávida")).toBe(true);
    });

    it("should NOT trigger on general legal questions (handled by persona)", () => {
      expect(shouldTriggerEscape("posso vender férias?")).toBe(false);
      expect(shouldTriggerEscape("como funciona o 13º?")).toBe(false);
      expect(shouldTriggerEscape("Prazos legais de aviso e recibo de férias")).toBe(false);
      expect(shouldTriggerEscape("Posso solicitar adiantamento de décimo terceiro com as férias")).toBe(false);
      expect(shouldTriggerEscape("Posso converter dias de férias em abono pecuniário (vender férias)")).toBe(false);
    });
  });
});

