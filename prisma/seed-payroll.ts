
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// User Matricula for "CAROLINA DO NASCIMENTO"
const MATRICULA = '7031146'

async function main() {
    console.log('🌱 Seeding Payroll data...')

    // Check if user exists
    const user = await prisma.user.findFirst({
        where: { matricula: MATRICULA }
    })

    if (!user) {
        console.error(`User with matricula ${MATRICULA} not found. Aborting.`)
        return
    }

    const USER_ID = user.id

    console.log(`Creating payslips for user: ${user.nome}`)

    // Clear existing records
    await prisma.payslipItem.deleteMany({
        where: { payslip: { userId: USER_ID } }
    })
    await prisma.payslip.deleteMany({
        where: { userId: USER_ID }
    })

    // Helper to create payslip
    const createPayslip = async (
        competencia: string, // MM/YYYY
        competenciaISO: string, // YYYY-MM
        dataPagamento: Date,
        salarioBruto: number,
        inssPatronal: number,
        fgts: number,
        items: {
            codigo: string,
            descricao: string,
            referencia: string,
            valor: number,
            tipo: 'PROVENTO' | 'DESCONTO',
            subtipo?: string
        }[]
    ) => {

        const proventos = items.filter(i => i.tipo === 'PROVENTO').reduce((acc, i) => acc + i.valor, 0)
        const descontos = items.filter(i => i.tipo === 'DESCONTO').reduce((acc, i) => acc + i.valor, 0)
        const liquido = proventos - descontos

        await prisma.payslip.create({
            data: {
                userId: USER_ID,
                competencia,
                competenciaISO,
                dataPagamento,
                salarioBruto,
                salarioLiquido: liquido,
                totalProventos: proventos,
                totalDescontos: descontos,
                fgts,
                inssPatronal,
                status: "PAGO",
                items: {
                    create: items.map(i => ({
                        codigo: i.codigo,
                        descricao: i.descricao,
                        referencia: i.referencia,
                        valor: i.valor,
                        tipo: i.tipo,
                        subtipo: i.subtipo
                    }))
                }
            }
        })
        console.log(`Created payslip for ${competencia}`)
    }

    // Payslip 1: Janeiro 2026
    await createPayslip(
        '01/2026',
        '2026-01',
        new Date('2026-02-05'),
        9500.00,
        1900.00, // Estimativa 20%
        760.00,  // 8%
        [
            { codigo: '001', descricao: 'Salário Base', referencia: '30 dias', valor: 9500.00, tipo: 'PROVENTO', subtipo: 'salario' },
            { codigo: '501', descricao: 'INSS', referencia: '14%', valor: 825.82, tipo: 'DESCONTO', subtipo: 'inss' },
            { codigo: '502', descricao: 'IRRF', referencia: '27.5%', valor: 1395.23, tipo: 'DESCONTO', subtipo: 'irrf' },
            { codigo: '510', descricao: 'Vale Transporte', referencia: '6%', valor: 510.00, tipo: 'DESCONTO', subtipo: 'vt' },
            { codigo: '512', descricao: 'Plano de Saúde', referencia: 'Copart.', valor: 350.00, tipo: 'DESCONTO', subtipo: 'saude' }
        ]
    )

    // Payslip 2: Dezembro 2025
    await createPayslip(
        '12/2025',
        '2025-12',
        new Date('2026-01-05'),
        9500.00,
        1900.00,
        760.00,
        [
            { codigo: '001', descricao: 'Salário Base', referencia: '30 dias', valor: 9500.00, tipo: 'PROVENTO', subtipo: 'salario' },
            { codigo: '501', descricao: 'INSS', referencia: '14%', valor: 825.82, tipo: 'DESCONTO', subtipo: 'inss' },
            { codigo: '502', descricao: 'IRRF', referencia: '27.5%', valor: 1395.23, tipo: 'DESCONTO', subtipo: 'irrf' },
            { codigo: '510', descricao: 'Vale Transporte', referencia: '6%', valor: 510.00, tipo: 'DESCONTO', subtipo: 'vt' },
            { codigo: '512', descricao: 'Plano de Saúde', referencia: 'Copart.', valor: 120.00, tipo: 'DESCONTO', subtipo: 'saude' } // Menor coparticipação
        ]
    )

    // Payslip 3: 13º Salário (2ª Parcela)
    await createPayslip(
        '13/2025',
        '2025-13-2',
        new Date('2025-12-20'),
        9500.00,
        1900.00,
        760.00,
        [
            { codigo: '002', descricao: '13º Salário', referencia: 'Integral', valor: 9500.00, tipo: 'PROVENTO', subtipo: '13' },
            { codigo: '550', descricao: 'Adiantamento 13º', referencia: '-', valor: 4750.00, tipo: 'DESCONTO', subtipo: '13_adiantamento' },
            { codigo: '501', descricao: 'INSS 13º', referencia: '14%', valor: 825.82, tipo: 'DESCONTO', subtipo: 'inss' },
            { codigo: '502', descricao: 'IRRF 13º', referencia: '27.5%', valor: 1395.23, tipo: 'DESCONTO', subtipo: 'irrf' }
        ]
    )

    // Payslip 4: Novembro 2025
    await createPayslip(
        '11/2025',
        '2025-11',
        new Date('2025-12-05'),
        9500.00,
        1900.00,
        760.00,
        [
            { codigo: '001', descricao: 'Salário Base', referencia: '30 dias', valor: 9500.00, tipo: 'PROVENTO', subtipo: 'salario' },
            { codigo: '501', descricao: 'INSS', referencia: '14%', valor: 825.82, tipo: 'DESCONTO', subtipo: 'inss' },
            { codigo: '502', descricao: 'IRRF', referencia: '27.5%', valor: 1395.23, tipo: 'DESCONTO', subtipo: 'irrf' },
            { codigo: '510', descricao: 'Vale Transporte', referencia: '6%', valor: 510.00, tipo: 'DESCONTO', subtipo: 'vt' },
            { codigo: '003', descricao: 'Horas Extras 50%', referencia: '10h', valor: 650.00, tipo: 'PROVENTO', subtipo: 'he' }
        ]
    )

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
