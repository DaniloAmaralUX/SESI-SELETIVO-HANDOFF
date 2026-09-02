// Geração de CSV (RF25) — função PURA: recebe cabeçalhos e linhas, devolve o
// texto. Separador ';' (Excel pt-BR) e BOM para acentuação correta. O download
// em si (DOM) fica em baixarCsv, separado para a parte pura ser testável.

const SEPARADOR = ';'

// Caracteres que fazem Excel/LibreOffice/Sheets tratarem a célula como FÓRMULA.
// As células carregam texto livre do usuário (observações por etapa, motivo de
// cancelamento, campos vindos de CSV importado), e uma célula iniciada por eles
// vira código executável na planilha de quem abre o arquivo — o escape entre
// aspas NÃO protege, porque a aspa é consumida como delimitador do CSV.
const GATILHOS_FORMULA = ['=', '+', '-', '@', '\t', '\r']

// Desarma a fórmula preservando o texto legível: a aspa simples inicial é
// consumida pela planilha como "trate o resto como texto". Número segue número
// (`-5` é dado, `-1+1` é fórmula), senão uma coluna de contagem viraria texto e
// perderia soma e ordenação no Excel.
function neutralizarFormula(texto: string): string {
  if (!GATILHOS_FORMULA.includes(texto[0])) return texto
  if (texto.trim() !== '' && Number.isFinite(Number(texto))) return texto
  return `'${texto}`
}

function escaparCelula(valor: unknown): string {
  if (valor === undefined || valor === null) return ''
  const texto = neutralizarFormula(String(valor))
  // Aspas, separador ou quebra de linha exigem célula entre aspas duplas
  if (/[";\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

export function gerarCsv(
  cabecalhos: string[],
  linhas: Array<Array<unknown>>
): string {
  const todas = [cabecalhos, ...linhas]
  return todas
    .map((linha) => linha.map(escaparCelula).join(SEPARADOR))
    .join('\r\n')
}

// Dispara o download no navegador. BOM faz o Excel abrir em UTF-8.
export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob(['\uFEFF' + conteudo], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}
