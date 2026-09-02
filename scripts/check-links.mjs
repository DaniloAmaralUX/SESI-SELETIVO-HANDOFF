#!/usr/bin/env node
// Verifica os links internos de todos os .md do repositório: o caminho relativo
// existe? a âncora existe no arquivo de destino? Links externos (http/mailto)
// não são checados — a intenção é pegar link podre por arquivo movido ou título
// renomeado, que é o que quebra a navegação da documentação de handoff.
//
// Uso:  node scripts/check-links.mjs
// Saída: código 1 se houver link quebrado (é assim que o CI reprova).

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IGNORAR = new Set(['node_modules', '.git', 'dist', 'licenses'])

function listaMd(dir, acc = []) {
  for (const nome of readdirSync(dir)) {
    if (IGNORAR.has(nome)) continue
    const full = join(dir, nome)
    if (statSync(full).isDirectory()) listaMd(full, acc)
    else if (nome.endsWith('.md')) acc.push(full)
  }
  return acc
}

// Reproduz a geração de âncora do GitHub: minúsculas, pontuação removida,
// espaços viram hífen. Acentos são preservados.
function ancora(titulo) {
  return titulo
    .trim()
    .toLowerCase()
    .replace(/[`*_[\]()]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    // Cada espaço vira UM hífen — o GitHub NÃO colapsa espaços. Um símbolo
    // removido entre espaços (ex.: "a × b") gera hífen duplo na âncora real.
    .replace(/\s/g, '-')
}

function ancorasDe(arquivo) {
  const set = new Set()
  for (const linha of readFileSync(arquivo, 'utf8').split('\n')) {
    const m = linha.match(/^#{1,6}\s+(.*)$/)
    if (m) set.add(ancora(m[1]))
  }
  return set
}

const arquivos = listaMd(RAIZ)
const cache = new Map()
const quebrados = []
let total = 0

for (const arq of arquivos) {
  const txt = readFileSync(arq, 'utf8')
  // [texto](destino) — o (?<!!) descarta imagens
  const re = /(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g
  let m
  while ((m = re.exec(txt))) {
    const destino = m[1]
    if (/^(https?:|mailto:|#!)/.test(destino)) continue
    total++

    const [relPath, frag] = destino.split('#')
    const alvo =
      relPath === ''
        ? arq // âncora no próprio arquivo
        : resolve(dirname(arq), decodeURIComponent(relPath))

    if (!existsSync(alvo)) {
      quebrados.push([relative(RAIZ, arq), destino, 'caminho inexistente'])
      continue
    }

    if (frag && alvo.endsWith('.md')) {
      if (!cache.has(alvo)) cache.set(alvo, ancorasDe(alvo))
      if (!cache.get(alvo).has(decodeURIComponent(frag).toLowerCase())) {
        quebrados.push([relative(RAIZ, arq), destino, 'âncora inexistente'])
      }
    }
  }
}

console.log(
  `Links internos: ${total} verificados em ${arquivos.length} arquivos .md`
)

if (quebrados.length === 0) {
  console.log('Nenhum link quebrado.')
  process.exit(0)
}

console.error(`\n${quebrados.length} link(s) quebrado(s):\n`)
for (const [arq, destino, motivo] of quebrados) {
  console.error(`  ${arq}\n    -> ${destino}  (${motivo})\n`)
}
process.exit(1)
