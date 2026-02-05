# ✅ TODO LIST (PROJECT STATUS)

## 🚨 DÍVIDA TÉCNICA & HIGH PRIORITY
- [ ] Padronizar `.cursorrules` com as diretrizes da AltraHub.
- [ ] Validar fluxo de autenticação (JWT) e Middleware.
- [ ] Revisar implementação do Design System (Cores, Fontes) no `globals.css`.

## 🔄 BACKLOG DE FUNCIONALIDADES

### Autenticação & Usuários
- [x] Setup Inicial do Prisma Schema (`User` model).
- [x] Implementar tela de Login (UI Final).
- [x] Implementar rota de API para Login (`/api/auth/login`).
- [x] Implementar criação de usuário (Importação de Dados Reais).

### Chat & IA
- [x] Configuração do Vercel AI SDK.
- [x] Implementar interface de Chat (Layout responsivo).
- [x] Conectar Chat com API de Stream.
- [x] Salvar histórico de mensagens no banco (`ChatMessage`).

### Admin & Gestão
- [x] Dashboard de Visão Geral (HR Command Center).
- [x] Detalhes do Colaborador (Visão 360º).
- [x] Listagem com Filtros e Busca.
- [ ] Lista de conversas ativas.
- [ ] Funcionalidade de "Assumir Conversa" (Human Handoff).

### SuperApp (Autoatendimento)
- [x] Integração de Férias com Banco de Dados.
- [x] Integração de Holerites com Banco de Dados.
- [x] Integração de Ponto (Time Tracking) com Banco de Dados.
- [x] Integração de Benefícios com Banco de Dados.

### Compliance
- [ ] Middleware para Logging de Ações Críticas.
- [ ] Visualizador de Logs de Auditoria.

## 🧪 TESTING & QA
- [ ] Configurar testes unitários para Services críticos.
- [ ] Teste E2E do fluxo de Login.
