import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Vacation Periods for MARIA DA SILVA (Matrícula: 894)...\n");

    const user = await prisma.user.findUnique({
        where: { matricula: "894" },
        include: {
            vacationPeriods: {
                orderBy: { inicioAquisitivo: 'asc' }
            }
        }
    });

    if (!user) {
        console.log("❌ User not found!");
        return;
    }

    console.log(`👤 Collaborator: ${user.nome}`);
    console.log(`🆔 Matrícula: ${user.matricula}`);
    console.log(`📅 Total Periods Linked: ${user.vacationPeriods.length}\n`);

    console.log("--- PERÍODOS SALVOS ---");
    user.vacationPeriods.forEach((p, index) => {
        console.log(`\n📌 Período #${index + 1}`);
        console.log(`   🗓️ Aquisitivo: ${p.inicioAquisitivo.toLocaleDateString()} a ${p.fimAquisitivo.toLocaleDateString()}`);
        console.log(`   💰 Saldo de Dias: ${p.diasSaldo}`);
        console.log(`   🏖️ Dias Gozados: ${p.diasGozados}`);
        if (p.ultFeriasInicio) {
            console.log(`   ✅ Últimas Férias: ${p.ultFeriasInicio.toLocaleDateString()} (R$ ${p.ultFeriasLiquido})`);
        } else {
            console.log(`   ⚠️ Nenhuma férias tirada neste período.`);
        }
    });
}

main()
    .catch((e) => {
        console.error("❌ Verification error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
