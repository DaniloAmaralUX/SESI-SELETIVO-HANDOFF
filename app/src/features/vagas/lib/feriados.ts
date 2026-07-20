import { addDays } from 'date-fns'

// Motor de feriados PRÓPRIO (ADR 0002): sem biblioteca/serviço externo. Tudo é
// função pura sobre dado — os feriados são calculados/tabelados e injetados no
// cálculo de dias úteis, nunca buscados via I/O. Datas em horário local.

// Domingo de Páscoa pelo algoritmo de Butcher (Gregoriano). Base dos feriados
// móveis nacionais (Carnaval, Sexta-feira Santa, Corpus Christi).
export function pascoa(ano: number): Date {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31) // 3 = março, 4 = abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(ano, mes - 1, dia)
}

type Feriado = { data: Date; nome: string }

function emAno(ano: number, mes: number, dia: number, nome: string): Feriado {
  return { data: new Date(ano, mes - 1, dia), nome }
}

// Feriados nacionais: fixos + móveis derivados da Páscoa.
export function feriadosNacionais(ano: number): Feriado[] {
  const domingoPascoa = pascoa(ano)
  return [
    emAno(ano, 1, 1, 'Confraternização Universal'),
    { data: addDays(domingoPascoa, -48), nome: 'Carnaval (segunda)' },
    { data: addDays(domingoPascoa, -47), nome: 'Carnaval (terça)' },
    { data: addDays(domingoPascoa, -2), nome: 'Sexta-feira Santa' },
    emAno(ano, 4, 21, 'Tiradentes'),
    emAno(ano, 5, 1, 'Dia do Trabalho'),
    { data: addDays(domingoPascoa, 60), nome: 'Corpus Christi' },
    emAno(ano, 9, 7, 'Independência'),
    emAno(ano, 10, 12, 'Nossa Senhora Aparecida'),
    emAno(ano, 11, 2, 'Finados'),
    emAno(ano, 11, 15, 'Proclamação da República'),
    emAno(ano, 11, 20, 'Consciência Negra'),
    emAno(ano, 12, 25, 'Natal'),
  ]
}

// Feriados LOCAIS por Unidade (as Unidades são municípios de Pernambuco).
// Estadual (Data Magna de PE, 06/03) vale para todas; o municipal varia.
// ⚠️ Dados de protótipo — as datas municipais devem ser validadas com o RH/TI
// antes do go-live (a tabela é o ponto de configuração do ADR 0002).
const DATA_MAGNA_PE = { mes: 3, dia: 6, nome: 'Data Magna de Pernambuco' }

const FERIADOS_MUNICIPAIS: Record<
  string,
  { mes: number; dia: number; nome: string }
> = {
  'SESI Recife': {
    mes: 12,
    dia: 8,
    nome: 'Nossa Senhora da Conceição (Recife)',
  },
  'SESI Paulista': { mes: 9, dia: 11, nome: 'Emancipação de Paulista' },
  'SESI Caruaru': { mes: 5, dia: 18, nome: 'Emancipação de Caruaru' },
  'SESI Petrolina': { mes: 9, dia: 21, nome: 'Emancipação de Petrolina' },
  'SESI Cabo de Santo Agostinho': {
    mes: 7,
    dia: 7,
    nome: 'Emancipação do Cabo de Santo Agostinho',
  },
  'SESI Goiana': { mes: 8, dia: 5, nome: 'Emancipação de Goiana' },
}

// Feriados locais (estadual + municipal) da Unidade, no ano. Unidade
// desconhecida → só o estadual (as nacionais entram por feriadosDaUnidade).
function feriadosLocais(unidade: string, ano: number): Feriado[] {
  const locais: Feriado[] = [
    emAno(ano, DATA_MAGNA_PE.mes, DATA_MAGNA_PE.dia, DATA_MAGNA_PE.nome),
  ]
  const municipal = FERIADOS_MUNICIPAIS[unidade]
  if (municipal) {
    locais.push(emAno(ano, municipal.mes, municipal.dia, municipal.nome))
  }
  return locais
}

// Todos os feriados aplicáveis à Unidade no ano: nacionais + locais.
export function feriadosDaUnidade(unidade: string, ano: number): Date[] {
  return [...feriadosNacionais(ano), ...feriadosLocais(unidade, ano)].map(
    (f) => f.data
  )
}

// Feriados da Unidade cobrindo todos os anos do intervalo [inicio, fim] — para
// SLAs que atravessam a virada de ano.
export function feriadosDaUnidadeNoIntervalo(
  unidade: string,
  inicio: Date,
  fim: Date
): Date[] {
  const datas: Date[] = []
  for (let ano = inicio.getFullYear(); ano <= fim.getFullYear(); ano++) {
    datas.push(...feriadosDaUnidade(unidade, ano))
  }
  return datas
}
