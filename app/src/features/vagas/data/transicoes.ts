import { type StatusVaga } from './schema'

// Matriz de transições de Status como DADO (não hard-coded), conforme B1 do PRD
// (docs/product/PRD-sistema-rh-gestao-vagas.md:164). Os dois eixos são
// independentes (ADR 0001): isto governa só o Status (situação), nunca a Ação.
//
//   Aberta            → Suspensa, Congelada, Cancelada, Finalizada
//   Suspensa/Congelada → Aberta, Cancelada
//   Finalizada/Cancelada → Arquivada
//   Arquivada          → (terminal)
//
// "A confirmar no planejamento" no PRD — por isso vive como dado remapeável, e o
// teste guiado com as usuárias valida a matriz.
export const TRANSICOES: Record<StatusVaga, StatusVaga[]> = {
  aberta: ['suspensa', 'congelada', 'cancelada', 'finalizada'],
  suspensa: ['aberta', 'cancelada'],
  congelada: ['aberta', 'cancelada'],
  finalizada: ['arquivada'],
  cancelada: ['arquivada'],
  arquivada: [],
}

// Destinos de Status válidos a partir do status atual.
export function transicoesPermitidas(atual: StatusVaga): StatusVaga[] {
  return TRANSICOES[atual]
}

// A transição de -> para é permitida pela matriz?
export function podeTransicionar(de: StatusVaga, para: StatusVaga): boolean {
  return TRANSICOES[de].includes(para)
}
