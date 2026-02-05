
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// User Matricula for "CAROLINA DO NASCIMENTO"
const MATRICULA = '7031146'

async function main() {
    console.log('🌱 Seeding Benefits data...')

    // Check if user exists
    const user = await prisma.user.findFirst({
        where: { matricula: MATRICULA }
    })

    if (!user) {
        console.error(`User with matricula ${MATRICULA} not found. Aborting.`)
        return
    }

    const USER_ID = user.id

    console.log(`Creating benefits for user: ${user.nome}`)

    // Clear existing records
    await prisma.benefit.deleteMany({
        where: { userId: USER_ID }
    })

    // Active Benefits
    const activeBenefits = [
        {
            nome: "Vale Refeição",
            tipo: "vr",
            operadora: "Alelo",
            valor: 726.00,
            valorDesconto: 0.00,
            dependentes: 0,
            coparticipacao: false,
            ativo: true
        },
        {
            nome: "Vale Transporte",
            tipo: "vt",
            operadora: "SPTrans",
            valor: 510.00,
            valorDesconto: 510.00, // 6% usually
            dependentes: 0,
            coparticipacao: true,
            ativo: true
        },
        {
            nome: "Plano de Saúde Unimed",
            tipo: "plano_saude",
            operadora: "Unimed",
            plano: "Executivo Nacional",
            valor: 850.00,
            valorDesconto: 350.00,
            dependentes: 0,
            coparticipacao: true,
            ativo: true
        },
        {
            nome: "Seguro de Vida",
            tipo: "seguro_vida",
            operadora: "MetLife",
            valor: 45.00,
            valorDesconto: 0.00,
            dependentes: 0,
            coparticipacao: false,
            ativo: true
        }
    ]

    // Inactive Benefits (Available)
    const inactiveBenefits = [
        {
            nome: "Gympass",
            tipo: "gympass",
            operadora: "Wellhub",
            valor: 0.00,
            valorDesconto: 0.00,
            dependentes: 0,
            coparticipacao: false,
            ativo: false
        },
        {
            nome: "Plano Odontológico",
            tipo: "plano_odonto",
            operadora: "OdontoPrev",
            valor: 45.00,
            valorDesconto: 25.00,
            dependentes: 0,
            coparticipacao: false,
            ativo: false
        }
    ]

    // Create all benefits
    for (const benefit of [...activeBenefits, ...inactiveBenefits]) {
        await prisma.benefit.create({
            data: {
                userId: USER_ID,
                ...benefit
            }
        })
    }

    console.log('✅ Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
