/**
 * Import Real Vacation Data Script
 * 
 * Imports complex vacation data from JSON:
 * - Handles DD/MM/YYYY date format
 * - Handles "3.000,00" number format
 * - Populates specific VacationPeriod data
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Data from user prompt
const rawData = [
    {
        "MATRICULA": 894,
        "NOME": "MARIA DA SILVA",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "04/06/2024",
        "FINAL_PERIODO_AQUIS": "03/06/2025",
        "QTD_DIAS_DIREITO_ACUM": "30",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 15,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "15",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "20/05/2026",
        "DIREITO_FOLGA_CCT": "Sim",
        "INICIO_ULT_FERIAS": "29/12/2025",
        "FINAL_ULT_FERIAS": "14/01/2026",
        "QTD_DIAS_ULT_FERIAS": "15",
        "PAGTO_ULT_FERIAS": "23/12/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 3675.31,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 14702.03,
        "DESCONTOS_ULT_FERIAS": 3824.03,
        "LIQUIDO_ULT_FERIAS": "10878"
    },
    {
        "MATRICULA": 894,
        "NOME": "MARIA DA SILVA",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "04/06/2025",
        "FINAL_PERIODO_AQUIS": "03/06/2026",
        "QTD_DIAS_DIREITO_ACUM": 22.5,
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": 22.5,
        "QTD_AVOS_ACUMULADOS": 9,
        "DATA_LIMITE_CONCESSAO": "05/05/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "29/12/2025",
        "FINAL_ULT_FERIAS": "14/01/2026",
        "QTD_DIAS_ULT_FERIAS": "15",
        "PAGTO_ULT_FERIAS": "23/12/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 3675.31,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 14702.03,
        "DESCONTOS_ULT_FERIAS": 3824.03,
        "LIQUIDO_ULT_FERIAS": "10878"
    },
    {
        "MATRICULA": 2377,
        "NOME": "ANA  DE OLIVEIRA",
        "SITUACAO_ATUAL": "Férias",
        "INICIO_PERIODO_AQUIS": "08/03/2025",
        "FINAL_PERIODO_AQUIS": "07/03/2026",
        "QTD_DIAS_DIREITO_ACUM": "30",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "30",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "06/02/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "19/01/2026",
        "FINAL_ULT_FERIAS": "09/02/2026",
        "QTD_DIAS_ULT_FERIAS": "20",
        "PAGTO_ULT_FERIAS": "14/01/2026",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 1449.25,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 5797.4,
        "DESCONTOS_ULT_FERIAS": 1619.4,
        "LIQUIDO_ULT_FERIAS": "4178"
    },
    {
        "MATRICULA": 7032188,
        "NOME": "JOSÉ DOS SANTOS",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "23/09/2024",
        "FINAL_PERIODO_AQUIS": "22/09/2025",
        "QTD_DIAS_DIREITO_ACUM": "24",
        "QTD_FALTAS": 7,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "24",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "30/08/2026",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": null,
        "FINAL_ULT_FERIAS": null,
        "QTD_DIAS_ULT_FERIAS": null,
        "PAGTO_ULT_FERIAS": null,
        "VALOR_ABONO_PECUNIARIO": null,
        "TERÇO_ABONO_PECUNIARIO": null,
        "TERÇO_FERIAS": NaN,
        "DECIMO_TERC_ADIANTADO": null,
        "PROVENTOS_ULT_FERIAS": NaN,
        "DESCONTOS_ULT_FERIAS": NaN,
        "LIQUIDO_ULT_FERIAS": null
    },
    {
        "MATRICULA": 7032188,
        "NOME": "JOSÉ DOS SANTOS",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "23/09/2025",
        "FINAL_PERIODO_AQUIS": "22/09/2026",
        "QTD_DIAS_DIREITO_ACUM": "8",
        "QTD_FALTAS": 7,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "8",
        "QTD_AVOS_ACUMULADOS": 4,
        "DATA_LIMITE_CONCESSAO": "15/09/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": null,
        "FINAL_ULT_FERIAS": null,
        "QTD_DIAS_ULT_FERIAS": null,
        "PAGTO_ULT_FERIAS": null,
        "VALOR_ABONO_PECUNIARIO": null,
        "TERÇO_ABONO_PECUNIARIO": null,
        "TERÇO_FERIAS": NaN,
        "DECIMO_TERC_ADIANTADO": null,
        "PROVENTOS_ULT_FERIAS": NaN,
        "DESCONTOS_ULT_FERIAS": NaN,
        "LIQUIDO_ULT_FERIAS": null
    },
    {
        "MATRICULA": 7031146,
        "NOME": "CAROLINA DO NASCIMENTO",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "03/06/2025",
        "FINAL_PERIODO_AQUIS": "02/06/2026",
        "QTD_DIAS_DIREITO_ACUM": "8",
        "QTD_FALTAS": 32,
        "QTD_AFAST": 44,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "8",
        "QTD_AVOS_ACUMULADOS": 8,
        "DATA_LIMITE_CONCESSAO": "26/05/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": null,
        "FINAL_ULT_FERIAS": null,
        "QTD_DIAS_ULT_FERIAS": null,
        "PAGTO_ULT_FERIAS": null,
        "VALOR_ABONO_PECUNIARIO": null,
        "TERÇO_ABONO_PECUNIARIO": null,
        "TERÇO_FERIAS": NaN,
        "DECIMO_TERC_ADIANTADO": null,
        "PROVENTOS_ULT_FERIAS": NaN,
        "DESCONTOS_ULT_FERIAS": NaN,
        "LIQUIDO_ULT_FERIAS": null
    },
    {
        "MATRICULA": 7021907,
        "NOME": "JOANA FREITAS",
        "SITUACAO_ATUAL": "Auxílio Doença",
        "INICIO_PERIODO_AQUIS": "01/08/2025",
        "FINAL_PERIODO_AQUIS": "31/07/2026",
        "QTD_DIAS_DIREITO_ACUM": "15",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 180,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "15",
        "QTD_AVOS_ACUMULADOS": 6,
        "DATA_LIMITE_CONCESSAO": "02/07/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "18/03/2025",
        "FINAL_ULT_FERIAS": "03/04/2025",
        "QTD_DIAS_ULT_FERIAS": "15",
        "PAGTO_ULT_FERIAS": "12/03/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 702.15,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 2809.43,
        "DESCONTOS_ULT_FERIAS": 230.43,
        "LIQUIDO_ULT_FERIAS": "2579"
    },
    {
        "MATRICULA": 7025909,
        "NOME": "RAFAELA CARVALHO SILVA",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "13/02/2025",
        "FINAL_PERIODO_AQUIS": "12/02/2026",
        "QTD_DIAS_DIREITO_ACUM": "30",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "30",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "14/01/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "05/01/2026",
        "FINAL_ULT_FERIAS": "16/01/2026",
        "QTD_DIAS_ULT_FERIAS": "10",
        "PAGTO_ULT_FERIAS": "30/12/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 612.11,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 2448.58,
        "DESCONTOS_ULT_FERIAS": 197.58,
        "LIQUIDO_ULT_FERIAS": "2251"
    },
    {
        "MATRICULA": 7003939,
        "NOME": "ANA ROSA FARIAS",
        "SITUACAO_ATUAL": "Licença Maternidade",
        "INICIO_PERIODO_AQUIS": "15/08/2024",
        "FINAL_PERIODO_AQUIS": "14/08/2025",
        "QTD_DIAS_DIREITO_ACUM": "30",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "30",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "16/07/2026",
        "DIREITO_FOLGA_CCT": "Sim",
        "INICIO_ULT_FERIAS": "25/06/2025",
        "FINAL_ULT_FERIAS": "11/07/2025",
        "QTD_DIAS_ULT_FERIAS": "15",
        "PAGTO_ULT_FERIAS": "18/06/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 1832.77,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 7331.37,
        "DESCONTOS_ULT_FERIAS": 1713.37,
        "LIQUIDO_ULT_FERIAS": "5618"
    },
    {
        "MATRICULA": 7003939,
        "NOME": "ANA ROSA FARIAS",
        "SITUACAO_ATUAL": "Licença Maternidade",
        "INICIO_PERIODO_AQUIS": "15/08/2025",
        "FINAL_PERIODO_AQUIS": "14/08/2026",
        "QTD_DIAS_DIREITO_ACUM": "15",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "15",
        "QTD_AVOS_ACUMULADOS": 6,
        "DATA_LIMITE_CONCESSAO": "16/07/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "25/06/2025",
        "FINAL_ULT_FERIAS": "11/07/2025",
        "QTD_DIAS_ULT_FERIAS": "15",
        "PAGTO_ULT_FERIAS": "18/06/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 1832.77,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 7331.37,
        "DESCONTOS_ULT_FERIAS": 1713.37,
        "LIQUIDO_ULT_FERIAS": "5618"
    },
    {
        "MATRICULA": 7002699,
        "NOME": "DANIELLE FERNANDES ",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "06/03/2025",
        "FINAL_PERIODO_AQUIS": "05/03/2026",
        "QTD_DIAS_DIREITO_ACUM": 27.5,
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": 27.5,
        "QTD_AVOS_ACUMULADOS": 11,
        "DATA_LIMITE_CONCESSAO": "04/02/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "09/02/2026",
        "FINAL_ULT_FERIAS": "02/03/2026",
        "QTD_DIAS_ULT_FERIAS": "20",
        "PAGTO_ULT_FERIAS": "04/02/2026",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 1359.64,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 5439.19,
        "DESCONTOS_ULT_FERIAS": 1402.19,
        "LIQUIDO_ULT_FERIAS": "4037"
    },
    {
        "MATRICULA": 7005465,
        "NOME": "VIVIANE PEREIRA MENDES",
        "SITUACAO_ATUAL": "Auxílio Doença",
        "INICIO_PERIODO_AQUIS": "20/05/2024",
        "FINAL_PERIODO_AQUIS": "19/05/2025",
        "QTD_DIAS_DIREITO_ACUM": "30",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "30",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "20/04/2026",
        "DIREITO_FOLGA_CCT": "Sim",
        "INICIO_ULT_FERIAS": "03/02/2025",
        "FINAL_ULT_FERIAS": "24/02/2025",
        "QTD_DIAS_ULT_FERIAS": "20",
        "PAGTO_ULT_FERIAS": "29/01/2025",
        "VALOR_ABONO_PECUNIARIO": 944.75,
        "TERÇO_ABONO_PECUNIARIO": 316.97,
        "TERÇO_FERIAS": 633.94,
        "DECIMO_TERC_ADIANTADO": 1417.13,
        "PROVENTOS_ULT_FERIAS": 5221.44,
        "DESCONTOS_ULT_FERIAS": 205.44,
        "LIQUIDO_ULT_FERIAS": "5016"
    },
    {
        "MATRICULA": 7005465,
        "NOME": "VIVIANE PEREIRA MENDES",
        "SITUACAO_ATUAL": "Auxílio Doença",
        "INICIO_PERIODO_AQUIS": "20/05/2025",
        "FINAL_PERIODO_AQUIS": "19/05/2026",
        "QTD_DIAS_DIREITO_ACUM": "20",
        "QTD_FALTAS": 0,
        "QTD_AFAST": 8,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "20",
        "QTD_AVOS_ACUMULADOS": 8,
        "DATA_LIMITE_CONCESSAO": "20/04/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "03/02/2025",
        "FINAL_ULT_FERIAS": "24/02/2025",
        "QTD_DIAS_ULT_FERIAS": "20",
        "PAGTO_ULT_FERIAS": "29/01/2025",
        "VALOR_ABONO_PECUNIARIO": 944.75,
        "TERÇO_ABONO_PECUNIARIO": 316.97,
        "TERÇO_FERIAS": 633.94,
        "DECIMO_TERC_ADIANTADO": 1417.13,
        "PROVENTOS_ULT_FERIAS": 5221.44,
        "DESCONTOS_ULT_FERIAS": 205.44,
        "LIQUIDO_ULT_FERIAS": "5016"
    },
    {
        "MATRICULA": 7025699,
        "NOME": "FERNANDA ALVES",
        "SITUACAO_ATUAL": "Trabalhando",
        "INICIO_PERIODO_AQUIS": "06/02/2025",
        "FINAL_PERIODO_AQUIS": "05/02/2026",
        "QTD_DIAS_DIREITO_ACUM": "30",
        "QTD_FALTAS": 1,
        "QTD_AFAST": 0,
        "QTD_FERIAS_GOZADAS": 0,
        "QTD_DIAS_ABONO_PECUNIARIO": 0,
        "QTD_DIAS_SALDO": "30",
        "QTD_AVOS_ACUMULADOS": 12,
        "DATA_LIMITE_CONCESSAO": "07/01/2027",
        "DIREITO_FOLGA_CCT": "Período não vencido",
        "INICIO_ULT_FERIAS": "22/12/2025",
        "FINAL_ULT_FERIAS": "07/01/2026",
        "QTD_DIAS_ULT_FERIAS": "15",
        "PAGTO_ULT_FERIAS": "17/12/2025",
        "VALOR_ABONO_PECUNIARIO": "0",
        "TERÇO_ABONO_PECUNIARIO": "0",
        "TERÇO_FERIAS": 684.17,
        "DECIMO_TERC_ADIANTADO": "0",
        "PROVENTOS_ULT_FERIAS": 2736.84,
        "DESCONTOS_ULT_FERIAS": 727.84,
        "LIQUIDO_ULT_FERIAS": "2009"
    }
];

// Helpers
function parseDate(dateStr: string | null): Date | null {
    if (!dateStr || dateStr === "null") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    // DD/MM/YYYY -> MM/DD/YYYY for JS Date
    return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
}

function parseNumber(val: any): number {
    if (typeof val === "number") {
        if (isNaN(val)) return 0;
        return val;
    }
    if (!val || val === "null" || val === "NaN") return 0;
    // Handle "3.000,00" -> 3000.00
    if (typeof val === "string") {
        const clean = val.replace(/\./g, "").replace(",", ".");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    }
    return 0;
}

function parseDecimal(val: any): number | null {
    const num = parseNumber(val);
    if (num === 0 && (val === "null" || val === null || val === undefined || val === "NaN")) return null;
    return num;
}

async function main() {
    console.log("🚀 Starting REAL vacation data import (14 records)...\n");

    for (const row of rawData) {
        // 1. Find or create user
        const matricula = String(row.MATRICULA);
        const email = `${row.NOME.split(" ")[0].toLowerCase()}.${matricula}@pulse.com`;

        // Simplistic password hash (demo123)
        const passwordHash = "$2a$12$LQv3c1yqBWVHxkd0Lha6COYz6TtxMQJqhN8/ZWDtndK9wW7A4Vlq6";

        const user = await prisma.user.upsert({
            where: { matricula },
            update: {
                nome: row.NOME,
                situacao: row.SITUACAO_ATUAL,
            },
            create: {
                matricula,
                email,
                nome: row.NOME,
                passwordHash,
                role: "USER",
                situacao: row.SITUACAO_ATUAL,
                ativo: true,
            },
        });

        console.log(`👤 User: ${user.nome} [${user.matricula}]`);

        // 2. Create Vacation Period
        // Using inicioAquisitivo + userId as unique logic identification would be ideal, 
        // but here we just create entries as it's an import script.

        const inicioAquis = parseDate(row.INICIO_PERIODO_AQUIS);
        const fimAquis = parseDate(row.FINAL_PERIODO_AQUIS);

        if (inicioAquis && fimAquis) {
            await prisma.vacationPeriod.create({
                data: {
                    userId: user.id,
                    inicioAquisitivo: inicioAquis,
                    fimAquisitivo: fimAquis,
                    dataLimite: parseDate(row.DATA_LIMITE_CONCESSAO),

                    diasDireito: parseNumber(row.QTD_DIAS_DIREITO_ACUM),
                    diasSaldo: parseNumber(row.QTD_DIAS_SALDO),
                    diasGozados: parseNumber(row.QTD_FERIAS_GOZADAS),
                    diasAbono: parseNumber(row.QTD_DIAS_ABONO_PECUNIARIO),

                    avosAdquiridos: parseNumber(row.QTD_AVOS_ACUMULADOS),
                    faltas: parseNumber(row.QTD_FALTAS),
                    afastamentos: parseNumber(row.QTD_AFAST),
                    direitoFolgaCct: row.DIREITO_FOLGA_CCT,

                    // Last Vacation Snapshot
                    ultFeriasInicio: parseDate(row.INICIO_ULT_FERIAS),
                    ultFeriasFim: parseDate(row.FINAL_ULT_FERIAS),
                    ultFeriasDias: parseNumber(row.QTD_DIAS_ULT_FERIAS),
                    ultFeriasDataPagto: parseDate(row.PAGTO_ULT_FERIAS),

                    // Financials
                    ultFeriasValorAbono: parseNumber(row.VALOR_ABONO_PECUNIARIO),
                    ultFeriasTercoAbono: parseNumber(row.TERÇO_ABONO_PECUNIARIO),
                    ultFeriasTerco: parseNumber(row.TERÇO_FERIAS),
                    ultFerias13Adiantado: parseNumber(row.DECIMO_TERC_ADIANTADO),
                    ultFeriasProventos: parseNumber(row.PROVENTOS_ULT_FERIAS),
                    ultFeriasDescontos: parseNumber(row.DESCONTOS_ULT_FERIAS),
                    ultFeriasLiquido: parseNumber(row.LIQUIDO_ULT_FERIAS),
                },
            });
            console.log(`   ✅ Period: ${row.INICIO_PERIODO_AQUIS} - ${row.FINAL_PERIODO_AQUIS}`);
        } else {
            console.log(`   ❌ Skipped period due to invalid dates: ${row.INICIO_PERIODO_AQUIS}`);
        }
    }

    console.log("\n🎉 Real data import completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Import error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
