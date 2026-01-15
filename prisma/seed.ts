/**
 * Database Seed Script
 *
 * Creates demo users for testing authentication and RBAC.
 *
 * Run with: npx tsx prisma/seed.ts
 */

import { hash } from "bcryptjs";
import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({ url: "file:./prisma/dev.db" });

  console.log("🌱 Seeding database...\n");

  // Hash passwords
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  // Helper to generate CUID-like IDs
  const genId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;

  // Insert Super Admin
  const superAdminId = genId();
  await client.execute({
    sql: `INSERT OR REPLACE INTO users (id, matricula, email, nome, passwordHash, role, cargo, departamento, ativo, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [superAdminId, "00001", "super@pulse.com", "Super Administrador", adminPassword, "SUPER_ADMIN", "Diretor de RH", "Diretoria", 1],
  });
  console.log("✅ Super Admin: super@pulse.com");

  // Insert Admin
  const adminId = genId();
  await client.execute({
    sql: `INSERT OR REPLACE INTO users (id, matricula, email, nome, passwordHash, role, cargo, departamento, ativo, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [adminId, "00002", "admin@pulse.com", "Administrador RH", adminPassword, "ADMIN", "Coordenador de RH", "Recursos Humanos", 1],
  });
  console.log("✅ Admin: admin@pulse.com");

  // Insert Regular Users
  const users = [
    { matricula: "12345", email: "maria@pulse.com", nome: "Maria Silva Santos", cargo: "Analista de Sistemas", departamento: "Tecnologia" },
    { matricula: "12346", email: "joao@pulse.com", nome: "João Pedro Oliveira", cargo: "Desenvolvedor Full Stack", departamento: "Tecnologia" },
    { matricula: "12347", email: "ana@pulse.com", nome: "Ana Carolina Ferreira", cargo: "Designer UX/UI", departamento: "Produto" },
  ];

  const mariaId = genId();
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const id = i === 0 ? mariaId : genId();
    await client.execute({
      sql: `INSERT OR REPLACE INTO users (id, matricula, email, nome, passwordHash, role, cargo, departamento, ativo, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [id, u.matricula, u.email, u.nome, userPassword, "USER", u.cargo, u.departamento, 1],
    });
    console.log(`✅ User: ${u.email}`);
  }

  // Create sample chat session for Maria
  const sessionId = "demo-session-001";
  await client.execute({
    sql: `INSERT OR REPLACE INTO chat_sessions (id, userId, titulo, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [sessionId, mariaId, "Consulta sobre férias", "ACTIVE_IA"],
  });

  // Add sample messages
  const messages = [
    { senderType: "USER", senderId: mariaId, content: "Oi! Quero saber quantos dias de férias eu tenho disponíveis." },
    { senderType: "AI", senderId: null, content: "Olá, Maria! 👋 Consultando seu saldo de férias...\n\nVocê tem **20 dias** de férias disponíveis no período aquisitivo atual (2025-2026).\n\nPosso te ajudar a agendar suas férias?" },
    { senderType: "USER", senderId: mariaId, content: "Sim! Quero tirar 10 dias em março." },
    { senderType: "AI", senderId: null, content: "Ótimo! Para agendar 10 dias em março de 2026, preciso de algumas informações:\n\n1. **Data de início:** Qual dia de março você prefere iniciar?\n2. **Abono pecuniário:** Deseja vender algum dia?\n\nLembrando que o período mínimo é de 5 dias consecutivos. 📅" },
  ];

  for (const msg of messages) {
    const msgId = genId();
    await client.execute({
      sql: `INSERT INTO chat_messages (id, sessionId, senderType, senderId, content, createdAt)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [msgId, sessionId, msg.senderType, msg.senderId, msg.content],
    });
  }
  console.log("✅ Demo chat session created for Maria");

  console.log("\n🎉 Seed completed successfully!");
  
  client.close();
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
