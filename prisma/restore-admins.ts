import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🛡️ Restoring Admin Users...\n");

    const adminPassword = await hash("admin123", 12);

    // 1. Super Admin
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
    console.log("✅ Super Admin restored: super@pulse.com");

    // 2. Admin RH
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
    console.log("✅ Admin RH restored: admin@pulse.com");
}

main()
    .catch((e) => {
        console.error("❌ Restore error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
