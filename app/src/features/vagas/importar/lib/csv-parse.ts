import {
  ACOES_VAGA,
  STATUS_VAGA,
  type AcaoVaga,
  type StatusVaga,
  type Vaga,
} from '../../data/schema'

// Parser e validação da importação de planilha CSV (RF18–RF22).
// Funções PURAS, sem I/O: recebem o texto do arquivo e devolvem estruturas
// tipadas + erros por linha. A gravação fica na porta de persistência.

// ---------- Parse de baixo nível ----------

// Divide o CSV respeitando aspas (célula com separador/quebra) e CRLF.
// Detecta o separador (';' pt-BR ou ',') pela primeira linha.
export function parseCsv(texto: string): string[][] {
  const semBom = texto.replace(/^\uFEFF/, '')
  const primeiraLinha = semBom.split(/\r?\n/, 1)[0] ?? ''
  const separador =
    (primeiraLinha.match(/;/g)?.length ?? 0) >=
    (primeiraLinha.match(/,/g)?.length ?? 0)
      ? ';'
      : ','

  const linhas: string[][] = []
  let celula = ''
  let linha: string[] = []
  let entreAspas = false

  for (let i = 0; i < semBom.length; i++) {
    const ch = semBom[i]
    if (entreAspas) {
      if (ch === '"') {
        if (semBom[i + 1] === '"') {
          celula += '"'
          i++
        } else {
          entreAspas = false
        }
      } else {
        celula += ch
      }
    } else if (ch === '"') {
      entreAspas = true
    } else if (ch === separador) {
      linha.push(celula)
      celula = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && semBom[i + 1] === '\n') i++
      linha.push(celula)
      celula = ''
      linhas.push(linha)
      linha = []
    } else {
      celula += ch
    }
  }
  if (celula !== '' || linha.length > 0) {
    linha.push(celula)
    linhas.push(linha)
  }

  // Descarta linhas totalmente vazias
  return linhas.filter((l) => l.some((c) => c.trim() !== ''))
}

// ---------- Layout (RF20) ----------

// Normaliza cabeçalho p/ comparação: minúsculas, sem acento, sem espaços extras
function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Cabeçalhos do layout oficial da planilha (template de importação)
export const CABECALHOS_OBRIGATORIOS = [
  'chamado',
  'codigo da vaga',
  'gestor solicitante',
  'unidade',
  'area',
  'cargo',
  'tipo de contrato',
  'recrutadora',
  'data de abertura',
] as const

export const CABECALHOS_OPCIONAIS = [
  'data de recebimento',
  'status',
  'acao atual',
  'nivel',
  'funcao',
  'motivo da contratacao',
  'pcd',
  'observacoes',
  'qtd candidatos aplicados',
] as const

export function validarLayout(cabecalhos: string[]): string[] {
  const presentes = new Set(cabecalhos.map(normalizar))
  return CABECALHOS_OBRIGATORIOS.filter((c) => !presentes.has(c)).map(
    (c) => `Coluna obrigatória ausente: "${c}"`
  )
}

// ---------- Mapeamento de linhas ----------

export type ErroLinha = { linha: number; mensagem: string }

export type LinhaImportada = {
  // nº da linha no arquivo (1-based, contando o cabeçalho como 1)
  linha: number
  vaga: Omit<Vaga, 'id'>
}

const TIPOS_CONTRATO: Record<string, Vaga['tipoContrato']> = {
  determinado: 'determinado',
  indeterminado: 'indeterminado',
  estagiario: 'estagiario',
  intermitente: 'intermitente',
}

function parseData(valor: string): Date | undefined {
  const m = valor.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return undefined
  const data = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(data.getTime()) ? undefined : data
}

function parseStatus(valor: string): StatusVaga | undefined {
  const v = normalizar(valor)
  return STATUS_VAGA.find((s) => s === v)
}

function parseAcao(valor: string): AcaoVaga | undefined {
  const v = normalizar(valor).replace(/\s+/g, '-')
  return ACOES_VAGA.find((a) => a === v)
}

export function mapearLinhas(
  linhas: string[][],
  nomeArquivo: string
): { importadas: LinhaImportada[]; erros: ErroLinha[] } {
  const [cabecalho, ...dados] = linhas
  const indice = new Map(cabecalho.map((c, i) => [normalizar(c), i]))
  const col = (linha: string[], nome: string): string =>
    linha[indice.get(nome) ?? -1]?.trim() ?? ''

  const importadas: LinhaImportada[] = []
  const erros: ErroLinha[] = []

  dados.forEach((linha, i) => {
    const numeroLinha = i + 2 // 1-based + cabeçalho
    const chamado = col(linha, 'chamado')
    const codigoVaga = col(linha, 'codigo da vaga')

    const faltando: string[] = []
    if (!chamado && !codigoVaga) faltando.push('chamado e/ou código da vaga')
    for (const campo of [
      'gestor solicitante',
      'unidade',
      'area',
      'cargo',
      'recrutadora',
    ]) {
      if (!col(linha, campo)) faltando.push(campo)
    }

    const tipoContrato =
      TIPOS_CONTRATO[normalizar(col(linha, 'tipo de contrato'))]
    if (!tipoContrato) faltando.push('tipo de contrato (valor inválido)')

    const dataAbertura = parseData(col(linha, 'data de abertura'))
    if (!dataAbertura) faltando.push('data de abertura (use dd/mm/aaaa)')

    if (faltando.length > 0 || !tipoContrato || !dataAbertura) {
      erros.push({
        linha: numeroLinha,
        mensagem: `Linha ${numeroLinha}: ${faltando.join('; ')}`,
      })
      return
    }

    const status = parseStatus(col(linha, 'status')) ?? 'aberta'
    const acaoAtual =
      parseAcao(col(linha, 'acao atual')) ?? 'solicitacao-recebida'
    const qtd = Number.parseInt(col(linha, 'qtd candidatos aplicados'), 10)

    importadas.push({
      linha: numeroLinha,
      vaga: {
        chamado: chamado || codigoVaga,
        codigoVaga: codigoVaga || chamado,
        dataRecebimento:
          parseData(col(linha, 'data de recebimento')) ?? dataAbertura,
        origemDoCadastro: 'importacao',
        fonteDosDados: nomeArquivo,
        gestorSolicitante: col(linha, 'gestor solicitante'),
        unidade: col(linha, 'unidade'),
        area: col(linha, 'area'),
        tipoContrato,
        motivoContratacao: col(linha, 'motivo da contratacao') || undefined,
        cargo: col(linha, 'cargo'),
        nivel: (['I', 'II', 'III', 'IV', 'V', 'VI'] as const).find(
          (n) => n === col(linha, 'nivel').toUpperCase()
        ),
        funcao: col(linha, 'funcao') || undefined,
        pcd: normalizar(col(linha, 'pcd')) === 'sim',
        recrutadora: col(linha, 'recrutadora'),
        dataAbertura,
        status,
        acaoAtual,
        dataAcao: dataAbertura,
        observacoes: col(linha, 'observacoes') || undefined,
        motivoCancelamento:
          status === 'cancelada' ? 'Importada como cancelada' : undefined,
        qtdCandidatosAplicados: Number.isFinite(qtd) ? qtd : undefined,
      },
    })
  })

  return { importadas, erros }
}

// ---------- Duplicidade (RF21) ----------

export type LinhaComDuplicidade = LinhaImportada & { duplicada: boolean }

// Uma linha é duplicada se o nº do chamado OU o código já existem no sistema
export function marcarDuplicadas(
  importadas: LinhaImportada[],
  existentes: Pick<Vaga, 'chamado' | 'codigoVaga'>[]
): LinhaComDuplicidade[] {
  const chamados = new Set(existentes.map((v) => normalizar(v.chamado)))
  const codigos = new Set(existentes.map((v) => normalizar(v.codigoVaga)))
  return importadas.map((item) => ({
    ...item,
    duplicada:
      chamados.has(normalizar(item.vaga.chamado)) ||
      codigos.has(normalizar(item.vaga.codigoVaga)),
  }))
}
