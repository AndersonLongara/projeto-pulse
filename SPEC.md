# 🏗️ TECHNICAL SPECIFICATION (SPEC)

## 💻 STACK TECNOLÓGICA CURRENT

### Frontend & Framework
- **Framework:** Next.js 16.1.2 (App Router, Turbopack)
- **Linguagem:** TypeScript 5.x
- **Estilização:** Tailwind CSS 4.0
- **Componentes:** Radix UI (Primitives) + Lucide React (Icons)
- **State Management:** Zustand + React Query (TanStack Query)

### Backend & Database
- **Database:** PostgreSQL (Production) / SQLite (Dev)
- **ORM:** Prisma ORM 6.19.2
- **Auth:** Custom JWT (Jose + Bcryptjs)
- **API:** Next.js Server Actions & Route Handlers

### AI & LLM Integration
- **SDK:** Vercel AI SDK (`ai`, `@ai-sdk/openai`)
- **Provider:** OpenRouter (via OpenAI Interface)
- **Model Standard:** Modelos otimizados para chat (ex: GPT-4o, Claude 3.5 Sonnet via OpenRouter)

## 🗄️ ARQUITETURA DE DADOS (ERD SUMMARY)

### `User`
- Identificação única via `matricula` e `email`.
- Senhas hasheadas (Bcrypt).
- Roles: `USER`, `ADMIN`, `SUPER_ADMIN`.
- Relacionamentos: Chats, Logs.

### `ChatSession`
- Sessão de conversa persistente.
- Status Machine: `ACTIVE_IA` -> `WAITING_HUMAN` -> `HUMAN_INTERVENTION`.
- Owner: `userId`.
- Supervisor: `assignedAdminId`.

### `ChatMessage`
- Mensagens individuais.
- Tipos: `USER`, `AI`, `ADMIN`.
- Metadata JSON para contexto de tokens/custo.

### `AuditLog`
- Rastreamento de ações críticas (`LOGIN`, `INTERVENTION`, etc.).

## 🔐 SEGURANÇA
- **Vars de Ambiente:** Gerenciadas via `.env` (não comitadas).
- **Proteção de Rotas:** Middleware (`middleware.ts`) para verificação de JWT.
- **Validação de Dados:** Zod schemas em todos os inputs.

## 📦 DEPLOYMENT
- **Plataforma:** Vercel (Recomendada).
- **Build Command:** `pnpm build` (inclui `prisma generate`).
- **Logs:** Vercel Runtime Logs.
