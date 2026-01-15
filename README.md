# Pulse IA - Ecossistema de RH & Comunicação Humanizada

O **Pulse IA** é uma plataforma corporativa de próxima geração desenhada para transformar a interação entre colaboradores e o departamento de RH/DP. Através de um **SuperApp** (PWA) e um **Dashboard Administrativo** de alta densidade, o sistema utiliza IA para descentralizar consultas e automatizar processos, integrando-se futuramente ao ERP Senior.

## 🚀 Visão Geral

O projeto visa substituir canais informais (como WhatsApp) por uma solução **segura, rápida e centralizada**, onde a IA atua como uma assistente de RH disponível 24/7 para sanar dúvidas sobre férias, pagamentos e benefícios.

## 🛠️ Stack Tecnológica (Core 2026)

- **Frontend:** Next.js 15 (App Router), React 19 (Server Components & Actions)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Ícones:** `@phosphor-icons/react`
- **Gestão de Estado:** TanStack Query (Server) + Zustand (Local)
- **Backend & DB:** Server Actions + Prisma ORM + PostgreSQL
- **Mobilidade:** PWA nativo via next-pwa

## 🎨 Design Engineering (The Standard)

A interface é guiada por princípios matemáticos de precisão e fluidez:

### Grid de 4px
Todo o espaçamento segue múltiplos de 4: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`.

### Hierarquia Visual

**Admin Dashboard:** Direção "Precision & Density"
- Foco em bordas sutis (`0.5px`)
- Tipografia `font-mono` para dados
- Alta densidade de informação

**SuperApp Colaborador:** Direção "Warmth & Approachability"
- Espaçamento generoso
- Sombras em camadas
- Alvos de toque otimizados (`>44px`)

### Tipografia
Foco em legibilidade e hierarquia semântica, utilizando `tabular-nums` para alinhamento de dados financeiros.

## 🛡️ Protocolo de Segurança (Zero Trust)

Segurança é o alicerce deste projeto para garantir a conformidade com a **LGPD** e a integridade dos dados de RH:

- **Autenticação:** JWT via Cookies HttpOnly, Secure e SameSite=Strict
- **Validação:** Validação estrita de schemas com Zod em todos os fluxos
- **Privacidade:** Mascaramento de dados sensíveis (PII) antes do processamento pela IA
- **Infraestrutura:** Implementação rigorosa de headers de segurança (CSP, HSTS, X-Frame-Options)

## 🤖 Inteligência Artificial & Domínios

A IA da Pulse está habilitada para responder sobre:

- **Férias:** Saldos, períodos concessivos e recibos
- **Folha de Pagamento:** Valores líquidos, descontos e datas
- **Benefícios:** PAT, VT, Planos de Saúde (Wellhub/TotalPass)
- **Ponto:** Atestados, faltas e espelho de ponto

## 📦 Estrutura do Projeto

```
├── app/                # Next.js App Router (Pages & Actions)
├── components/         # Shadcn & Custom UI Components
├── hooks/              # Reusable React Hooks
├── lib/                # Utility functions & Zod Schemas
├── services/           # Senior ERP Mock & IA Integration
├── store/              # Zustand state management
└── prisma/             # Database schema & migrations
```

## ⚙️ Configuração Local

**1. Clone o repositório:**
```bash
git clone https://github.com/org/pulse-ia.git
```

**2. Instale as dependências:**
```bash
pnpm install
```

**3. Configure o `.env`:**  
Baseie-se no `.env.example` para configurar o DB e as chaves de IA.

**4. Inicie o desenvolvimento:**
```bash
pnpm dev
```

---

**Desenvolvido por Souchat - 2026.**