# Pulse IA - Roadmap de Desenvolvimento

Este documento detalha o backlog técnico e as fases de execução do MVP da plataforma Pulse. O progresso é acompanhado de forma atômica seguindo os padrões de Design Engineering e Zero Trust Security.

## Fase 1: Fundação e Infraestrutura (Setup) - CONCLUIDA

- [x] **Next.js 15 Setup:** Inicializacao com App Router e React 19
- [x] **Design System:** Configuracao do Tailwind com escala de 4px e tokens de cor Cool Slate
- [x] **Security Hardening:** Implementacao do middleware.ts com headers de seguranca (CSP, HSTS)
- [x] **Database Layer:** Configuracao do Prisma ORM e schema inicial de User e ChatSession
- [x] **Shadcn Integration:** Instalacao e customizacao dos componentes base conforme diretrizes de raio de borda

## Fase 2: Servicos e Mock ERP (The Brain) - CONCLUIDA

- [x] **Senior Mock Service:** Criacao do lib/services/senior-mock.ts para simular dados de Ferias, Folha e Ponto
- [x] **PII Masking Layer:** Implementacao de utilitarios para anonimizacao de dados sensiveis antes do envio para IA
- [x] **Validation Schemas:** Definicao de todos os contratos de dados via Zod

## Fase 3: Auth, RBAC e Interface Unificada - CONCLUIDA

- [x] **SQLite + Prisma 7:** Migracao para SQLite com adapter libsql para simplicidade no MVP
- [x] **Auth System:** JWT em HttpOnly cookies via jose, bcryptjs para senhas
- [x] **RBAC Middleware:** Protecao de rotas por role (SUPER_ADMIN, ADMIN, USER)
- [x] **Login Page:** Interface de autenticacao com redirecionamento por role
- [x] **Database Seed:** Script de seed com usuarios demo e sessao de chat

### SuperApp - Interface do Colaborador
- [x] **Chat UI:** Interface mobile-first com typing indicators e mensagens fluidas
- [x] **Bottom Navigation:** Navegacao touch-friendly com icones Phosphor
- [x] **AI Mock Responses:** Respostas simuladas para temas (ferias, holerite, ponto, beneficios)

### Admin - Torre de Controle
- [x] **Dashboard:** Metricas em tempo real (conversas ativas, intervencoes humanas)
- [x] **Sidebar Navigation:** Menu lateral com acesso rapido a todas as secoes
- [x] **Chat List (Control Tower):** Lista de conversas com status e contagem de mensagens
- [x] **Chat Detail:** Visualizacao do historico completo com sidebar de informacoes
- [x] **Intervention Controls:** Botoes Assumir Conversa e Devolver para IA
- [x] **Admin Chat Input:** Input especializado para respostas durante intervencao

## Fase 4: PWA e Refinamento - PLANEJADA

- [ ] **PWA Configuration:** Setup do next-pwa, manifest e service workers
- [ ] **Offline Support:** Caching de mensagens e dados essenciais
- [ ] **Push Notifications:** Alertas de novas mensagens e atualizacoes

## Fase 5: IA e Humanizacao - PLANEJADA

- [ ] **RAG Implementation:** Contexto da IA com regras de negocio da Pulse
- [ ] **Tone Alignment:** Ajuste fino da persona para publico jovem
- [ ] **Streaming Responses:** Suporte a streaming de texto em tempo real

## Fase 6: Lancamento e Entrega - PLANEJADA

- [ ] **Security Audit:** Validacao contra OWASP Top 10
- [ ] **Final QA:** Testes de responsividade e performance (Lighthouse)
- [ ] **Deployment:** Pipeline de CI/CD

---

### Credenciais de Demo

| Role | Email | Senha |
|------|-------|-------|
| Super Admin | super@pulse.com | admin123 |
| Admin | admin@pulse.com | admin123 |
| Usuario | maria@pulse.com | user123 |
