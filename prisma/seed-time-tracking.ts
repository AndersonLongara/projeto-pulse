
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// User Matricula for "CAROLINA DO NASCIMENTO"
const MATRICULA = '7031146'

async function main() {
    console.log('🌱 Seeding Time Tracking data...')

    // Check if user exists
    const user = await prisma.user.findFirst({
        where: { matricula: MATRICULA }
    })

    if (!user) {
        console.error(`User with matricula ${MATRICULA} not found. Aborting.`)
        return
    }

    const USER_ID = user.id

    console.log(`Creating time records for user: ${user.nome}`)

    // Clear existing records for this user to avoid duplicates during dev
    await prisma.timeEvent.deleteMany({
        where: { timeRecord: { userId: USER_ID } }
    })
    await prisma.timeRecord.deleteMany({
        where: { userId: USER_ID }
    })

    // Helper to create record
    const createRecord = async (
        dateStr: string,
        dayOfWeek: string,
        status: string,
        workedMinutes: number,
        events: { tipo: string, horario: string }[]
    ) => {
        // Standard workday is 8h (480 min)
        const STANDARD_MINUTES = 480

        let balance = 0
        let extras = 0
        let owed = 0

        if (status === 'NORMAL') {
            balance = workedMinutes - STANDARD_MINUTES
            if (balance > 0) extras = balance
            if (balance < 0) owed = Math.abs(balance)
        } else if (status === 'FALTA') {
            balance = -STANDARD_MINUTES
            owed = STANDARD_MINUTES
        }

        const record = await prisma.timeRecord.create({
            data: {
                userId: USER_ID,
                data: dateStr,
                diaSemana: dayOfWeek,
                minutosTrabalhados: workedMinutes,
                minutosExtras: extras,
                minutosDevidos: owed,
                saldoDia: balance,
                status: status,
                events: {
                    create: events.map(e => ({
                        tipo: e.tipo,
                        horario: e.horario,
                        origem: "MANUAL"
                    }))
                }
            }
        })
        console.log(`Created record for ${dateStr}: ${status} (${balance > 0 ? '+' : ''}${balance} min)`)
    }

    // Generate last 7 days mockup

    // Day 1: Normal full day
    await createRecord('2026-02-04', 'quarta-feira', 'NORMAL', 480, [
        { tipo: 'ENTRADA', horario: '08:00' },
        { tipo: 'SAIDA', horario: '12:00' },
        { tipo: 'ENTRADA', horario: '13:00' },
        { tipo: 'SAIDA', horario: '17:00' }
    ])

    // Day 2: Overtime (+30m)
    await createRecord('2026-02-03', 'terça-feira', 'NORMAL', 510, [
        { tipo: 'ENTRADA', horario: '08:00' },
        { tipo: 'SAIDA', horario: '12:00' },
        { tipo: 'ENTRADA', horario: '13:00' },
        { tipo: 'SAIDA', horario: '17:30' }
    ])

    // Day 3: Late arrival (-15m)
    await createRecord('2026-02-02', 'segunda-feira', 'ATRASO', 465, [
        { tipo: 'ENTRADA', horario: '08:15' },
        { tipo: 'SAIDA', horario: '12:00' },
        { tipo: 'ENTRADA', horario: '13:00' },
        { tipo: 'SAIDA', horario: '17:00' }
    ])

    // Day 4: Friday (Left early -30m)
    await createRecord('2026-01-31', 'sexta-feira', 'NORMAL', 450, [
        { tipo: 'ENTRADA', horario: '08:00' },
        { tipo: 'SAIDA', horario: '12:00' },
        { tipo: 'ENTRADA', horario: '13:00' },
        { tipo: 'SAIDA', horario: '16:30' }
    ])

    // Today's Partial Record (Incomplete)
    // Assuming code runs 2026-02-05 (Thursday) based on context
    await createRecord('2026-02-05', 'quinta-feira', 'NORMAL', 240, [
        { tipo: 'ENTRADA', horario: '08:02' },
        { tipo: 'SAIDA', horario: '12:01' },
        { tipo: 'ENTRADA', horario: '13:03' }
        // No Exit yet
    ])

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
