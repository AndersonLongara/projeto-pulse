/**
 * Import Vacations Script
 * 
 * Imports vacation data from JSON and links it to users by matricula.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const vacationData = [
  {
    "nome_colaborador": "Ana Silva",
    "id_funcionario": "F001",
    "data_inicio": "2026-03-01",
    "data_fim": "2026-03-15",
    "dias_gozados": 15,
    "status": "Aprovado"
  },
  {
    "nome_colaborador": "Bruno Oliveira",
    "id_funcionario": "F002",
    "data_inicio": "2026-06-10",
    "data_fim": "2026-06-30",
    "dias_gozados": 20,
    "status": "Pendente"
  },
  {
    "nome_colaborador": "Carla Santos",
    "id_funcionario": "F003",
    "data_inicio": "2026-12-20",
    "data_fim": "2027-01-05",
    "dias_gozados": 16,
    "status": "Planejado"
  }
];

async function main() {
  console.log("🚀 Starting vacation data import...\n");

  for (const data of vacationData) {
    // 1. Find or create user
    const email = `${data.nome_colaborador.toLowerCase().replace(/ /g, ".")}@pulse.com`;
    
    const user = await prisma.user.upsert({
      where: { matricula: data.id_funcionario },
      update: {
        nome: data.nome_colaborador,
      },
      create: {
        matricula: data.id_funcionario,
        email: email,
        nome: data.nome_colaborador,
        passwordHash: "$2a$12$LQv3c1yqBWVHxkd0Lha6COYz6TtxMQJqhN8/ZWDtndK9wW7A4Vlq6", // demo123
        role: "USER",
        ativo: true,
      },
    });

    console.log(`👤 User: ${user.nome} (${user.matricula})`);

    // 2. Create vacation request
    const vacation = await prisma.vacationRequest.create({
      data: {
        userId: user.id,
        dataInicio: new Date(data.data_inicio),
        dataFim: new Date(data.data_fim),
        diasGozados: data.dias_gozados,
        status: data.status.toUpperCase(),
      },
    });

    console.log(`✅ Vacation: ${vacation.status} - ${data.data_inicio} to ${data.data_fim}\n`);
  }

  console.log("🎉 Import completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Import error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
