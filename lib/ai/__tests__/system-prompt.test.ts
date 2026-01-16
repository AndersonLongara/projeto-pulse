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
    it("should include persona definition", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Pulse Helper");
      expect(prompt).toContain("24 anos");
    });

    it("should include scope definition", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Férias");
      expect(prompt).toContain("Folha de Pagamento");
      expect(prompt).toContain("Ponto Eletrônico");
      expect(prompt).toContain("Benefícios");
    });

    it("should include escape protocol", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("Protocolo de Escape");
      expect(prompt).toContain("especialistas humanos");
    });

    it("should include markdown formatting rules", () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain("negrito");
      expect(prompt).toContain("tabelas Markdown");
    });
  });

  describe("buildContextInjection", () => {
    it("should include user name", () => {
      const context = buildContextInjection({ userName: "Maria Silva" });
      expect(context).toContain("Maria Silva");
      expect(context).toContain("[CONTEXTO_ATUAL_DO_COLABORADOR]");
    });

    it("should include vacation data when provided", () => {
      const context = buildContextInjection({
        userName: "João",
        vacation: {
          saldoDias: 20,
          diasGozados: 10,
          proximoVencimento: "15 de março de 2027",
          periodoAquisitivoInicio: "15 de março de 2025",
          periodoAquisitivoFim: "14 de março de 2026",
        },
      });
      expect(context).toContain("20 dias");
      expect(context).toContain("10 dias");
      expect(context).toContain("Férias");
    });

    it("should include payroll data when provided", () => {
      const context = buildContextInjection({
        userName: "Ana",
        payroll: {
          ultimaCompetencia: "12/2025",
          salarioBruto: 8500,
          salarioLiquido: 6000,
          totalDescontos: 2500,
          dataPagamento: "05 de janeiro de 2026",
          descontos: [
            { descricao: "INSS", referencia: "14%", valor: 828.38 },
          ],
        },
      });
      expect(context).toContain("12/2025");
      expect(context).toContain("8500");
      expect(context).toContain("INSS");
    });

    it("should include clock data when provided", () => {
      const context = buildContextInjection({
        userName: "Carlos",
        clock: {
          bancoHoras: "+02:30",
          statusHoje: "Trabalhando",
          diasTrabalhados: 15,
          diasUteis: 22,
        },
      });
      expect(context).toContain("+02:30");
      expect(context).toContain("Trabalhando");
      expect(context).toContain("15/22");
    });

    it("should include benefits when provided", () => {
      const context = buildContextInjection({
        userName: "Beatriz",
        benefits: [
          { nome: "Vale Refeição", valor: 726, status: "Ativo" },
          { nome: "Plano de Saúde", valor: 850, status: "Ativo" },
        ],
      });
      expect(context).toContain("Vale Refeição");
      expect(context).toContain("Plano de Saúde");
    });
  });

  describe("shouldTriggerEscape", () => {
    it("should trigger on frustration keywords", () => {
      expect(shouldTriggerEscape("isso não funciona")).toBe(true);
      expect(shouldTriggerEscape("estou cansado disso")).toBe(true);
      expect(shouldTriggerEscape("que absurdo")).toBe(true);
    });

    it("should trigger on out-of-scope topics", () => {
      expect(shouldTriggerEscape("quero pedir demissão")).toBe(true);
      expect(shouldTriggerEscape("quando terei uma promoção")).toBe(true);
      expect(shouldTriggerEscape("quero falar sobre assédio")).toBe(true);
    });

    it("should not trigger on normal HR questions", () => {
      expect(shouldTriggerEscape("quanto tempo de férias tenho?")).toBe(false);
      expect(shouldTriggerEscape("quero ver meu holerite")).toBe(false);
      expect(shouldTriggerEscape("meu ponto está correto?")).toBe(false);
    });

    it("should be case insensitive", () => {
      expect(shouldTriggerEscape("DEMISSÃO")).toBe(true);
      expect(shouldTriggerEscape("Promoção")).toBe(true);
    });
  });
});
