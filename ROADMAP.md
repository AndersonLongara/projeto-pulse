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

## Fase 4: PWA e Refinamento - CONCLUIDA

- [x] **PWA Configuration:** next-pwa configurado no next.config.ts com Workbox
- [x] **Manifest.json:** display:standalone, theme_color Slate, icones SVG 192x192 e 512x512
- [x] **Meta Tags PWA:** Apple Touch Icon, viewport, theme-color no layout principal
- [x] **Offline Support:** Service Worker com estrategias de cache (CacheFirst, NetworkFirst, StaleWhileRevalidate)
- [x] **Offline Indicator:** Componente visual de status de conexao no SuperApp
- [x] **Push Notifications:** Infraestrutura Web Push API com NotificationPermissionButton
- [x] **Pagina de Perfil:** Configuracoes do usuario com botao de permissao de notificacoes
- [x] **Vitest Setup:** Configuracao completa com React Testing Library e jsdom
- [x] **Testes de Seguranca:** maskCPF, maskSalary, maskEmail, maskPhone (18 testes)
- [x] **Testes de Ferias:** calculateVacationBalance, calculateVacationPeriods, formatMinutesToHours (16 testes)
- [x] **Testes de Design System:** Grid 4px, touch targets >=44px, acessibilidade (16 testes)

**Total: 63 testes passando**

## Fase 5: IA e Humanizacao - CONCLUIDA

- [x] **OpenRouter Integration:** Provider configurado com Vercel AI SDK (@ai-sdk/openai)
- [x] **Modelo Gemini:** google/gemini-2.0-flash-lite-preview-02-05:free via OpenRouter
- [x] **System Prompt:** Persona "Pulse Helper" com tom jovem e empatico
- [x] **RAG Implementation:** Contexto do colaborador (ferias, folha, ponto, beneficios) injetado antes de cada resposta
- [x] **Streaming Responses:** streamText com feedback em tempo real na UI
- [x] **Protocolo de Escape:** Deteccao de frustração e temas fora do escopo para intervencao humana
- [x] **Markdown Engine:** react-markdown com tabelas, negrito e formatacao rica
- [x] **Smart Scroll:** Auto-scroll inteligente que pausa quando usuario sobe na conversa
- [x] **Typing Indicator:** Indicador de "digitando" com animacao de fade
- [x] **Bubble Design:** Bolhas IA (Slate-50) e Usuario (Primary) conforme design system

**Arquivos criados:**
- `lib/ai/system-prompt.ts` - Persona e protocolo de escape
- `lib/ai/openrouter.ts` - Configuracao do provider OpenRouter
- `app/api/chat/route.ts` - API Route com streaming e RAG
- `app/(superapp)/chat/chat-interface-streaming.tsx` - UI de chat com streaming

## Fase 6: Experiencia de Valor (Home & Ferias) - CONCLUIDA

### 1. Pagina de Inicio (Home) - `app/(superapp)/home/page.tsx`

**Objetivo:** Colaborador vê tudo o que importa em 5 segundos

- [x] **Greeting Card:** Card de boas-vindas com avatar e saudacao dinamica
- [x] **Quick Actions Grid:** 4 botoes de acesso rapido (Chat IA, Holerites, Ferias, Ponto)
- [x] **Shortcuts de Valor:**
  - [x] Card "Ultimo Holerite" com valor liquido e botao "Ver Detalhes"
  - [x] Card "Ferias" com saldo de dias e vencimento
  - [x] Card "Banco de Horas" com status do dia
  - [x] Card "Beneficios Ativos" com lista resumida
- [x] **Skeleton Loading:** Estados de carregamento com loading.tsx

### 2. Pagina de Ferias - `app/(superapp)/ferias/page.tsx`

**Objetivo:** Interface de gestao completa de ferias

- [x] **Balance Header:** Circulo de progresso SVG com dias disponiveis, gozados e programados
- [x] **Timeline de Periodos:** Lista visual com periodo aquisitivo e concessivo
- [x] **Alerta de Vencimento:** Notificacao quando periodo esta proximo de vencer
- [x] **Historico:** Lista com ultimos periodos de ferias e status
- [x] **CTA Flutuante:** Botao "Solicitar Ferias" que abre chat com contexto
- [x] **Skeleton Loading:** Estados de carregamento com loading.tsx

### 3. Admin Analytics - `app/(admin)/analytics/page.tsx`

**Objetivo:** Dashboard de gestao e metricas

- [x] **Metricas Cards:** Total chats, IA resolvidos, intervencao humana, tempo medio
- [x] **Grafico de Volume:** Barras empilhadas IA vs Humano (ultimos 7 dias)
- [x] **Nuvem de Temas:** Ferias, Ponto, Pagamento, Beneficios com analise de keywords
- [x] **Conversas Criticas:** Lista de atendimentos que necessitaram intervencao
- [x] **Skeleton Loading:** Estados de carregamento com loading.tsx

### 4. Restricoes Tecnicas Implementadas

- [x] **Tipografia:** font-mono tabular-nums para numeros de dias e valores monetarios
- [x] **Toque:** Espacamento minimo de gap-4 (16px) entre botoes
- [x] **Layout Responsivo:** Desktop adaptado com max-width e cards
- [x] **Skeleton States:** Componentes de loading para melhor UX em todas as paginas

## Fase 7: Completude do MVP e Entrega - EM PROGRESSO

### 7.1 Bug Fixes Resolvidos

- [x] **API Chat Fix:** Corrigido erro de validacao OpenRouter - alterado modelo para `google/gemini-2.5-flash-lite` e reescrita da API com fetch direto
- [x] **Desktop Responsive:** Adicionado header desktop ao SuperApp com navegacao horizontal e max-width container
- [x] **Home Routing Fix:** Removido `app/page.tsx` que redirecionava USER para `/chat` - agora "/" mostra o dashboard corretamente
- [x] **Chat Loading State:** Criado `loading.tsx` para pagina de chat corrigindo erro de componente

### 7.2 Paginas Funcionais do SuperApp - CONCLUIDO

- [x] **Pagina de Folha (`/folha`):** Lista de holerites com proventos/descontos, resumo anual, download PDF
- [x] **Pagina de Ponto (`/ponto`):** Espelho de ponto, banco de horas, marcacoes do dia, resumo mensal
- [x] **Pagina de Beneficios (`/beneficios`):** Lista de planos ativos/inativos, valores, dependentes, coparticipacao

### 7.3 Paginas Funcionais do Admin - CONCLUIDO

- [x] **Gerenciamento de Usuarios (`/users`):** Listagem, criacao, edicao, redefinicao de senha
- [x] **RBAC Completo:** Apenas Super Admin pode criar/editar admins e desativar usuarios
- [x] **Componentes UI:** Dialog, Select, DropdownMenu, Switch, Label (Shadcn/Radix)

### 7.4 Finalizacao - CONCLUIDO

- [x] **Security Audit:** Validacao contra OWASP Top 10 (`SECURITY.md`)
- [x] **Final QA:** Testes de responsividade e performance (Lighthouse CI configurado)
- [x] **Deployment:** Pipeline de CI/CD (`.github/workflows/ci.yml`)

### Arquivos Criados na Fase 7.4

- `.github/workflows/ci.yml` - Pipeline completo: build, test, security, lighthouse, deploy
- `lighthouserc.json` - Configuracao do Lighthouse CI com thresholds
- `SECURITY.md` - Documentacao de conformidade OWASP Top 10

---

## MVP Concluido! 🎉

O Pulse IA esta pronto para producao com:

- ✅ SuperApp mobile-first para colaboradores
- ✅ Admin Dashboard para gestao de RH
- ✅ Chat IA com RAG e streaming
- ✅ PWA com suporte offline
- ✅ Seguranca Zero Trust (OWASP compliance)
- ✅ CI/CD automatizado

---

## Fase 8: Preparacao para Deploy (Vercel) - CONCLUIDO

### 8.1 Migracao de Database

- [x] **PostgreSQL:** Alterado datasource no `schema.prisma` de sqlite para postgresql
- [x] **Direct URL:** Adicionado `directUrl` para migrations (bypass connection pooler)
- [x] **Build Script:** Atualizado para `prisma generate && next build`
- [x] **Postinstall:** Hook adicionado para regenerar Prisma Client automaticamente

### 8.2 Configuracao de Ambiente

- [x] **`.env.example`:** Documentacao completa de todas as variaveis de ambiente
- [x] **Variaveis Vercel:** DATABASE_URL, DIRECT_URL, JWT_SECRET, OPENROUTER_API_KEY, NEXT_PUBLIC_APP_URL

### 8.3 Security Headers (Producao)

- [x] **CSP Atualizado:** Whitelist para dominios Vercel (`*.vercel.app`) e OpenRouter
- [x] **Connect-src:** Adicionado wss: para WebSockets e dominios dinamicos

### 8.4 Documentacao de Deploy

- [x] **`DEPLOY.md`:** Guia completo passo-a-passo para deploy na Vercel
- [x] **Troubleshooting:** Secao com solucoes para problemas comuns
- [x] **Comandos Uteis:** CLI Vercel para gerenciamento

### Arquivos Criados/Modificados na Fase 8

- `prisma/schema.prisma` - Migrado para PostgreSQL
- `package.json` - Scripts de build atualizados
- `.env.example` - Documentacao de variaveis
- `middleware.ts` - CSP com whitelist Vercel
- `DEPLOY.md` - Guia completo de deploy

---

## Projeto Pronto para Producao! 🚀

### Proximos Passos

1. Criar banco PostgreSQL (Vercel Postgres, Neon ou Supabase)
2. Configurar variaveis de ambiente na Vercel
3. Fazer deploy (`vercel --prod`)
4. Executar `prisma db push` contra o banco de producao
5. Popular dados iniciais com seed

---

### Credenciais de Demo

| Role | Email | Senha |
|------|-------|-------|
| Super Admin | super@pulse.com | admin123 |
| Admin | admin@pulse.com | admin123 |
| Usuario | maria@pulse.com | user123 |
