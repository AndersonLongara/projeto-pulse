
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Debugging Database Data...')

    const users = await prisma.user.findMany({
        where: { matricula: '7031146' },
        include: {
            _count: {
                select: {
                    payslips: true,
                    benefits: true,
                    timeRecords: true
                }
            }
        }
    })

    console.log(`Found ${users.length} users:`)
    for (const u of users) {
        console.log(`- [${u.id}] ${u.nome} (${u.email})`)
        console.log(`  Payslips: ${u._count.payslips}`)
        console.log(`  Benefits: ${u._count.benefits}`)
        console.log(`  TimeRecords: ${u._count.timeRecords}`)
        console.log('---')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
