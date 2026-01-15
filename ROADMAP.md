# Pulse IA - Roadmap de Desenvolvimento

Este documento detalha o backlog técnico e as fases de execução do MVP da plataforma Pulse. O progresso é acompanhado de forma atômica seguindo os padrões de Design Engineering e Zero Trust Security.

## 🟢 Fase 1: Fundação & Infraestrutura (Setup)

- [ ] **Next.js 15 Setup:** Inicialização com App Router e React 19
- [ ] **Design System:** Configuração do Tailwind com escala de 4px e tokens de cor "Cool Slate"
- [ ] **Security Hardening:** Implementação do `middleware.ts` com headers de segurança (CSP, HSTS)
- [ ] **Database Layer:** Configuração do Prisma ORM e schema inicial de `User` e `ChatSession`
- [ ] **Shadcn Integration:** Instalação e customização dos componentes base conforme diretrizes de raio de borda

## 🟡 Fase 2: Serviços & Mock ERP (The Brain)

- [ ] **Senior Mock Service:** Criação do `lib/services/senior-mock.ts` para simular dados de Férias, Folha e Ponto
- [ ] **PII Masking Layer:** Implementação de utilitários para anonimização de dados sensíveis antes do envio para IA
- [ ] **Validation Schemas:** Definição de todos os contratos de dados via Zod

## 🔵 Fase 3: SuperApp - Interface do Colaborador (PWA)

- [ ] **Chat UI:** Construção da interface de conversação humanizada (Warmth & Approachability)
- [ ] **PWA Configuration:** Setup do next-pwa, manifest e service workers para instalação mobile
- [ ] **AI Stream Engine:** Integração do fluxo de mensagens com suporte a streaming de texto
- [ ] **Navigation & Home:** Dashboards simples para acesso rápido a recibos e saldo de férias

## 🔴 Fase 4: Painel Administrativo (Precision & Density)

- [ ] **Auth System:** Fluxo de login seguro com JWT em Cookies HttpOnly
- [ ] **Admin Dashboard:** Visualização de métricas de uso (Atendimentos totais, temas mais buscados)
- [ ] **User Management:** CRUD de colaboradores para o RH gerenciar acessos
- [ ] **Audit Log:** Tela de monitoramento de conversas (Audit Trail) para intervenção humana

## 🟣 Fase 5: IA & Refinamento (Humanization)

- [ ] **RAG Implementation:** Configuração do contexto da IA com as regras de negócio da Pulse
- [ ] **Tone Alignment:** Ajuste fino da persona para o público < 25 anos
- [ ] **Transition Logic:** Implementação do fluxo de transferência para especialista humano

## 🏁 Fase 6: Lançamento & Entrega

- [ ] **Security Audit:** Validação final contra OWASP Top 10
- [ ] **Final QA:** Testes de responsividade e performance (Lighthouse)
- [ ] **Deployment:** Configuração da pipeline de CI/CD

---

### Legenda

- 🟢 Concluído / Em andamento
- 🟡 Planejado (Curto Prazo)
- 🔴 Planejado (Longo Prazo)
