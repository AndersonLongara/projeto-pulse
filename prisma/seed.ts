/**
 * Database Seed Script
 *
 * Creates demo users for testing authentication and RBAC.
 *
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Hash passwords
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  // Insert Super Admin
  await prisma.user.upsert({
    where: { email: "super@pulse.com" },
    update: {},
    create: {
      matricula: "00001",
      email: "super@pulse.com",
      nome: "Super Administrador",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      cargo: "Diretor de RH",
      departamento: "Diretoria",
      ativo: true,
      theme: "system",
    },
  });
  console.log("✅ Super Admin: super@pulse.com");

  // Insert Admin
  await prisma.user.upsert({
    where: { email: "admin@pulse.com" },
    update: {},
    create: {
      matricula: "00002",
      email: "admin@pulse.com",
      nome: "Administrador RH",
      passwordHash: adminPassword,
      role: "ADMIN",
      cargo: "Coordenador de RH",
      departamento: "Recursos Humanos",
      ativo: true,
      theme: "system",
    },
  });
  console.log("✅ Admin: admin@pulse.com");

  // Insert Regular Users
  const users = [
    { matricula: "12345", email: "maria@pulse.com", nome: "Maria Silva Santos", cargo: "Analista de Sistemas", departamento: "Tecnologia" },
    { matricula: "12346", email: "joao@pulse.com", nome: "João Pedro Oliveira", cargo: "Desenvolvedor Full Stack", departamento: "Tecnologia" },
    { matricula: "12347", email: "ana@pulse.com", nome: "Ana Carolina Ferreira", cargo: "Designer UX/UI", departamento: "Produto" },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        matricula: u.matricula,
        email: u.email,
        nome: u.nome,
        passwordHash: userPassword,
        role: "USER",
        cargo: u.cargo,
        departamento: u.departamento,
        ativo: true,
        theme: "system",
      },
    });
    console.log(`✅ User: ${u.email}`);
  }

  // Get Maria's ID for chat session
  const maria = await prisma.user.findUnique({
    where: { email: "maria@pulse.com" },
  });

  if (!maria) {
    throw new Error("Maria not found");
  }

  // Create sample chat session for Maria
  const session = await prisma.chatSession.upsert({
    where: { id: "demo-session-001" },
    update: {},
    create: {
      id: "demo-session-001",
      userId: maria.id,
      titulo: "Consulta sobre férias",
      status: "ACTIVE_IA",
    },
  });

  // Add sample messages
  const messages = [
    { senderType: "USER" as const, senderId: maria.id, content: "Oi! Quero saber quantos dias de férias eu tenho disponíveis." },
    { senderType: "AI" as const, senderId: null, content: "Olá, Maria! 👋 Consultando seu saldo de férias...\n\nVocê tem **20 dias** de férias disponíveis no período aquisitivo atual (2025-2026).\n\nPosso te ajudar a agendar suas férias?" },
    { senderType: "USER" as const, senderId: maria.id, content: "Sim! Quero tirar 10 dias em março." },
    { senderType: "AI" as const, senderId: null, content: "Ótimo! Para agendar 10 dias em março de 2026, preciso de algumas informações:\n\n1. **Data de início:** Qual dia de março você prefere iniciar?\n2. **Abono pecuniário:** Deseja vender algum dia?\n\nLembrando que o período mínimo é de 5 dias consecutivos. 📅" },
  ];

  for (const msg of messages) {
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        senderType: msg.senderType,
        senderId: msg.senderId,
        content: msg.content,
      },
    });
  }
  console.log("✅ Demo chat session created for Maria");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
