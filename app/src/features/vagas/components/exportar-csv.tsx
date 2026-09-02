import { format } from 'date-fns'
import { type Table } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ACAO_LABELS, STATUS_LABELS } from '../data/campos'
import { type Vaga } from '../data/schema'
import { useVagasStore } from '../data/vagas-store'
import { gerarCsv, baixarCsv } from '../lib/csv'
import { podeVerDadosSensiveis, usePapel } from '../lib/papel'
import { slaDaVaga } from '../lib/sla-vaga'

function data(d?: Date): string {
  return d ? format(d, 'dd/MM/yyyy') : ''
}

// Exporta as linhas FILTRADAS da lista (RF25). Campos sensíveis de candidato
// (LGPD/B6) só entram no arquivo para Admin — para os demais papéis o CSV
// nem contém as colunas.
export function ExportarCsv({ table }: { table: Table<Vaga> }) {
  const papel = usePapel()
  const incluirSensiveis = podeVerDadosSensiveis(papel)
  // Lookup fora do recorte filtrado: a origem de uma reabertura pode não
  // estar nas linhas exportadas
  const todas = useVagasStore((s) => s.vagas)

  function exportar() {
    const vagas = table.getFilteredRowModel().rows.map((row) => row.original)
    const codigoPorId = new Map(todas.map((v) => [v.id, v.codigoVaga]))

    const cabecalhos = [
      'Chamado',
      'Código',
      'Código da vaga de origem',
      'Cargo',
      'Função',
      'Unidade',
      'Área',
      'Gestor solicitante',
      'Recrutadora',
      'Tipo de contrato',
      'PcD',
      'Status',
      'Ação atual',
      'Data de abertura',
      'SLA (dias úteis)',
      'Divulgação do resultado',
      'Candidatos aplicados',
      'Gerou banco',
      'Observações (etapas)',
      ...(incluirSensiveis
        ? ['Candidato selecionado', 'Gênero', 'Candidato interno']
        : []),
    ]

    const linhas = vagas.map((vaga) => [
      vaga.chamado,
      vaga.codigoVaga,
      vaga.reaberturaDe
        ? (codigoPorId.get(vaga.reaberturaDe) ?? vaga.reaberturaDe)
        : '',
      vaga.cargo,
      vaga.funcao,
      vaga.unidade,
      vaga.area,
      vaga.gestorSolicitante,
      vaga.recrutadora,
      vaga.tipoContrato,
      vaga.pcd ? 'Sim' : 'Não',
      STATUS_LABELS[vaga.status],
      ACAO_LABELS[vaga.acaoAtual],
      data(vaga.dataAbertura),
      slaDaVaga(vaga),
      data(vaga.divulgacaoResultado),
      vaga.qtdCandidatosAplicados,
      vaga.gerouBanco === undefined ? '' : vaga.gerouBanco ? 'Sim' : 'Não',
      (vaga.observacoesEtapas ?? [])
        .map(
          (obs) =>
            `[${ACAO_LABELS[obs.etapa]}] ${obs.texto} (${obs.por}, ${data(obs.em)})`
        )
        .join(' | '),
      ...(incluirSensiveis
        ? [
            vaga.candidatoSelecionado,
            vaga.genero,
            vaga.candidatoInterno === undefined
              ? ''
              : vaga.candidatoInterno
                ? 'Sim'
                : 'Não',
          ]
        : []),
    ])

    baixarCsv(
      `vagas-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      gerarCsv(cabecalhos, linhas)
    )
    toast.success(
      vagas.length === 1
        ? '1 vaga exportada'
        : `${vagas.length} vagas exportadas`
    )
  }

  return (
    <Button variant='outline' size='sm' className='h-8' onClick={exportar}>
      <Download className='size-4' />
      Exportar CSV
    </Button>
  )
}
