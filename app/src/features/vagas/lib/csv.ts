// Geração de CSV (RF25) — função PURA: recebe cabeçalhos e linhas, devolve o
// texto. Separador ';' (Excel pt-BR) e BOM para acentuação correta. O download
// em si (DOM) fica em baixarCsv, separado para a parte pura ser testável.

const SEPARADOR = ';'

function escaparCelula(valor: unknown): string {
  if (valor === undefined || valor === null) return ''
  const texto = String(valor)
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
