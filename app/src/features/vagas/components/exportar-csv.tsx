import { format } from 'date-fns'
import { type Table } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ACAO_LABELS, STATUS_LABELS } from '../data/campos'
import { type Vaga } from '../data/schema'
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

  function exportar() {
    const vagas = table.getFilteredRowModel().rows.map((row) => row.original)

    const cabecalhos = [
      'Chamado',
      'Código',
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
      ...(incluirSensiveis
        ? ['Candidato selecionado', 'Gênero', 'Candidato interno']
        : []),
    ]

    const linhas = vagas.map((vaga) => [
      vaga.chamado,
      vaga.codigoVaga,
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
    toast.success(`${vagas.length} vaga(s) exportada(s)`)
  }

  return (
    <Button variant='outline' size='sm' className='h-8' onClick={exportar}>
      <Download className='size-4' />
      Exportar CSV
    </Button>
  )
}
