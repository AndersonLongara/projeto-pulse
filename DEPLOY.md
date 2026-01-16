# 🚀 Guia de Deploy - Pulse IA na Vercel

Este guia detalha os passos para fazer deploy do Pulse IA na Vercel com PostgreSQL.

---

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [OpenRouter](https://openrouter.ai) (para IA)
- Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 1️⃣ Criar Banco de Dados PostgreSQL

### Opção A: Vercel Postgres (Recomendado)

1. Acesse [vercel.com/storage](https://vercel.com/storage)
2. Clique em **Create Database** → **Postgres**
3. Dê um nome (ex: `pulse-db`)
4. Selecione a região mais próxima dos seus usuários
5. Copie as variáveis geradas:
   - `POSTGRES_URL` → Use como `DATABASE_URL`
   - `POSTGRES_URL_NON_POOLING` → Use como `DIRECT_URL`

### Opção B: Neon (Free Tier Generoso)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Use a mesma string para `DATABASE_URL` e `DIRECT_URL`

### Opção C: Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings** → **Database** → **Connection string**
3. Copie a **Session mode** para `DATABASE_URL`
4. Copie a **Direct connection** para `DIRECT_URL`

---

## 2️⃣ Criar Projeto na Vercel

### Via Dashboard

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte seu repositório Git (GitHub/GitLab/Bitbucket)
3. Selecione o repositório `projeto-pulse`
4. Vercel detectará automaticamente Next.js
5. **NÃO clique em Deploy ainda!** Configure as variáveis primeiro.

### Via CLI (Opcional)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Vincular projeto
vercel link

# Deploy
vercel --prod
```

---

## 3️⃣ Configurar Variáveis de Ambiente

No dashboard do projeto na Vercel, vá em **Settings** → **Environment Variables**.

### Variáveis Obrigatórias

| Nome | Valor | Ambiente |
|------|-------|----------|
| `DATABASE_URL` | String de conexão PostgreSQL (com pooler) | Production, Preview |
| `DIRECT_URL` | String de conexão direta (sem pooler) | Production, Preview |
| `JWT_SECRET` | Chave secreta de 32+ caracteres | Production, Preview |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` (sua chave) | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://seu-projeto.vercel.app` | Production |

### Gerar JWT_SECRET

```bash
# No terminal (Linux/Mac)
openssl rand -base64 32

# No PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

**Exemplo de resultado:** `K7xM2pQ9vL4wN8yR3tZ6uC1fJ5hB0aE+XsDg=`

---

## 4️⃣ Executar Migrations do Banco

### Primeira vez (criar tabelas)

Após o deploy inicial, você precisa criar as tabelas no banco de produção:

```bash
# Clone o projeto localmente (se ainda não tiver)
git clone https://github.com/seu-usuario/projeto-pulse.git
cd projeto-pulse

# Instale as dependências
pnpm install

# Configure as variáveis de produção localmente
# Crie um arquivo .env.production.local com:
DATABASE_URL="sua-string-de-conexao-producao"
DIRECT_URL="sua-string-direta-de-conexao"

# Execute o push do schema
pnpm prisma db push

# (Opcional) Popule com dados iniciais
pnpm prisma db seed
```

### Via Vercel CLI (Alternativa)

```bash
# Puxa as variáveis de ambiente da Vercel
vercel env pull .env.production.local

# Executa o push
npx prisma db push
```

---

## 5️⃣ Deploy Final

1. Volte ao dashboard da Vercel
2. Clique em **Deployments** → **Redeploy** (ou faça um novo commit)
3. Aguarde o build completar (~2-3 minutos)
4. Acesse a URL gerada!

---

## 6️⃣ Verificar o Deploy

### Checklist Pós-Deploy

- [ ] Acesse a URL de produção
- [ ] Teste o login com as credenciais demo:
  - Super Admin: `super@pulse.com` / `admin123`
  - Admin: `admin@pulse.com` / `admin123`
  - Usuário: `maria@pulse.com` / `user123`
- [ ] Teste o chat com IA
- [ ] Verifique o PWA (instale no celular)
- [ ] Confirme que o tema dark/light funciona

### Seed de Dados em Produção

Se precisar popular o banco com dados de demonstração:

```bash
# Com variáveis de produção configuradas
npx tsx prisma/seed.ts
```

---

## 🔧 Troubleshooting

### Erro: "PrismaClientInitializationError"
- Verifique se `DATABASE_URL` está correto
- Confirme que o IP da Vercel está na whitelist do banco (se aplicável)

### Erro: "JWT_SECRET must be set"
- Adicione a variável `JWT_SECRET` no dashboard da Vercel

### Chat IA não responde
- Verifique se `OPENROUTER_API_KEY` está configurada
- Confirme que a chave tem créditos disponíveis

### Erro de CORS ou CSP
- O middleware.ts já está configurado para aceitar domínios `.vercel.app`
- Se usar domínio customizado, adicione ao `NEXT_PUBLIC_APP_URL`

---

## 📊 Monitoramento

### Vercel Analytics (Opcional)
1. No dashboard do projeto, vá em **Analytics**
2. Ative o Analytics (gratuito para projetos hobby)

### Logs
1. Vá em **Deployments** → selecione um deploy → **Functions**
2. Veja os logs em tempo real

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [x] JWT em HttpOnly cookies (já implementado)
- [x] Headers de segurança CSP, HSTS, etc. (middleware.ts)
- [x] Validação Zod em todas as Server Actions
- [x] Senhas hasheadas com bcrypt
- [ ] Ativar 2FA na conta Vercel
- [ ] Rotacionar JWT_SECRET periodicamente
- [ ] Monitorar logs de acesso

---

## 📝 Comandos Úteis

```bash
# Ver logs de produção
vercel logs

# Listar variáveis de ambiente
vercel env ls

# Adicionar variável
vercel env add JWT_SECRET

# Remover variável
vercel env rm JWT_SECRET

# Rollback para deploy anterior
vercel rollback
```

---

## ✅ Pronto!

Seu Pulse IA está rodando em produção! 🎉

**Links Úteis:**
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação OpenRouter](https://openrouter.ai/docs)

---

*Última atualização: Janeiro 2026*
