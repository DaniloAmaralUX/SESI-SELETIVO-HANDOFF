import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { Link, useNavigate } from '@tanstack/react-router'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileUp,
  TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { STATUS_LABELS } from '../data/campos'
import { useVagasStore } from '../data/vagas-store'
import { gerarCsv, baixarCsv } from '../lib/csv'
import { labelDoPapel, usePapel } from '../lib/papel'
import {
  CABECALHOS_OBRIGATORIOS,
  CABECALHOS_OPCIONAIS,
  mapearLinhas,
  marcarDuplicadas,
  parseCsv,
  validarLayout,
  type ErroLinha,
  type LinhaComDuplicidade,
} from './lib/csv-parse'

// Wizard de importação de planilha (RF18–RF22, IA §11):
// 1 Upload → 2 Validação → 3 Prévia (duplicadas destacadas) → 4 Confirmação.
// A planilha é entrada SECUNDÁRIA (carga inicial/histórico/lote — CONTEXT.md).

const PASSOS = ['Upload', 'Validação', 'Prévia', 'Confirmação'] as const

type Analise = {
  nomeArquivo: string
  errosLayout: string[]
  errosLinhas: ErroLinha[]
  linhas: LinhaComDuplicidade[]
}

export function ImportarVagas() {
  const navigate = useNavigate()
  const papel = usePapel()
  const vagasExistentes = useVagasStore((s) => s.vagas)
  const importar = useVagasStore((s) => s.importar)

  const [passo, setPasso] = useState(0)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const novas = analise?.linhas.filter((l) => !l.duplicada) ?? []
  const duplicadas = analise?.linhas.filter((l) => l.duplicada) ?? []
  const temErroBloqueante =
    !analise || analise.errosLayout.length > 0 || novas.length === 0

  async function aoEscolherArquivo(arquivo: File | undefined) {
    if (!arquivo) return
    const texto = await arquivo.text()
    const linhas = parseCsv(texto)
    if (linhas.length === 0) {
      setAnalise({
        nomeArquivo: arquivo.name,
        errosLayout: ['Arquivo vazio ou ilegível.'],
        errosLinhas: [],
        linhas: [],
      })
      setPasso(1)
      return
    }
    const errosLayout = validarLayout(linhas[0])
    if (errosLayout.length > 0) {
      setAnalise({
        nomeArquivo: arquivo.name,
        errosLayout,
        errosLinhas: [],
        linhas: [],
      })
      setPasso(1)
      return
    }
    const { importadas, erros } = mapearLinhas(linhas, arquivo.name)
    setAnalise({
      nomeArquivo: arquivo.name,
      errosLayout: [],
      errosLinhas: erros,
      linhas: marcarDuplicadas(importadas, vagasExistentes),
    })
    setPasso(1)
  }

  function baixarModelo() {
    const cabecalhos = [
      ...CABECALHOS_OBRIGATORIOS,
      ...CABECALHOS_OPCIONAIS,
    ].map((c) => c.replace(/\b\w/g, (l) => l.toUpperCase()))
    baixarCsv('modelo-importacao-vagas.csv', gerarCsv([...cabecalhos], []))
  }

  function confirmarImportacao() {
    const criadas = importar(
      novas.map((l) => l.vaga),
      labelDoPapel(papel)
    )
    toast.success(
      `${criadas.length} vaga(s) importada(s)` +
        (duplicadas.length > 0
          ? ` · ${duplicadas.length} duplicada(s) ignorada(s)`
          : '')
    )
    navigate({ to: '/vagas' })
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <PapelSwitcher />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/vagas'>
              <ArrowLeft className='size-4' />
              Voltar para vagas
            </Link>
          </Button>
        </div>

        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Importar planilha
          </h1>
          <p className='text-muted-foreground'>
            Entrada secundária: carga inicial, histórico ou atualização em lote.
            Novas vagas devem ser cadastradas direto no sistema.
          </p>
        </div>

        <StepperWizard passoAtual={passo} />

        {passo === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selecione o arquivo CSV</CardTitle>
              <CardDescription>
                Use o modelo oficial para garantir o layout esperado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <FileUp />
                  </EmptyMedia>
                  <EmptyTitle>Envie a planilha de vagas</EmptyTitle>
                  <EmptyDescription>
                    Arquivo .csv separado por ponto e vírgula, com datas no
                    formato dd/mm/aaaa.
                  </EmptyDescription>
                </EmptyHeader>
                <div className='flex flex-wrap justify-center gap-2'>
                  <input
                    ref={inputRef}
                    type='file'
                    accept='.csv,text/csv'
                    className='sr-only'
                    onChange={(e) => aoEscolherArquivo(e.target.files?.[0])}
                  />
                  <Button onClick={() => inputRef.current?.click()}>
                    <FileUp className='size-4' />
                    Escolher arquivo
                  </Button>
                  <Button variant='outline' onClick={baixarModelo}>
                    <Download className='size-4' />
                    Baixar modelo CSV
                  </Button>
                </div>
              </Empty>
            </CardContent>
          </Card>
        )}

        {passo === 1 && analise && (
          <Card>
            <CardHeader>
              <CardTitle>Validação do arquivo</CardTitle>
              <CardDescription>{analise.nomeArquivo}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {analise.errosLayout.length > 0 ? (
                <Alert variant='destructive'>
                  <TriangleAlert />
                  <AlertTitle>Layout inválido (RF20)</AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc ps-4'>
                      {analise.errosLayout.map((erro) => (
                        <li key={erro}>{erro}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle2 />
                  <AlertTitle>Layout reconhecido</AlertTitle>
                  <AlertDescription>
                    {analise.linhas.length + analise.errosLinhas.length}{' '}
                    linha(s) de dados encontradas.
                  </AlertDescription>
                </Alert>
              )}

              {analise.errosLinhas.length > 0 && (
                <Alert variant='destructive'>
                  <TriangleAlert />
                  <AlertTitle>
                    {analise.errosLinhas.length} linha(s) com erro serão
                    ignoradas
                  </AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc ps-4'>
                      {analise.errosLinhas.slice(0, 8).map((erro) => (
                        <li key={erro.linha}>{erro.mensagem}</li>
                      ))}
                      {analise.errosLinhas.length > 8 && (
                        <li>
                          +{analise.errosLinhas.length - 8} outro(s) erro(s)
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setPasso(0)}>
                  <ArrowLeft className='size-4' />
                  Trocar arquivo
                </Button>
                <Button
                  disabled={temErroBloqueante && analise.linhas.length === 0}
                  onClick={() => setPasso(2)}
                >
                  Revisar dados
                  <ArrowRight className='size-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {passo === 2 && analise && (
          <Card>
            <CardHeader>
              <CardTitle>Prévia da importação (RF22)</CardTitle>
              <CardDescription>
                Revise antes de gravar. Duplicadas por nº do chamado ou código
                (RF21) não serão importadas.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Chamado</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Abertura</TableHead>
                      <TableHead>Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analise.linhas.map((item) => (
                      <TableRow
                        key={item.linha}
                        className={cn(item.duplicada && 'opacity-60')}
                      >
                        <TableCell>{item.linha}</TableCell>
                        <TableCell>{item.vaga.chamado}</TableCell>
                        <TableCell>{item.vaga.codigoVaga}</TableCell>
                        <TableCell>{item.vaga.cargo}</TableCell>
                        <TableCell>{item.vaga.unidade}</TableCell>
                        <TableCell>{STATUS_LABELS[item.vaga.status]}</TableCell>
                        <TableCell>
                          {format(item.vaga.dataAbertura, 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          {item.duplicada ? (
                            <Badge variant='destructive'>Duplicada</Badge>
                          ) : (
                            <Badge variant='secondary'>Nova</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setPasso(1)}>
                  <ArrowLeft className='size-4' />
                  Voltar
                </Button>
                <Button
                  disabled={novas.length === 0}
                  onClick={() => setPasso(3)}
                >
                  Continuar
                  <ArrowRight className='size-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {passo === 3 && analise && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmar importação</CardTitle>
              <CardDescription>
                A gravação registra a origem e o evento de importação no
                histórico de cada vaga (RF16/RF17).
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <dl className='grid gap-4 sm:grid-cols-3'>
                <Resumo titulo='Serão importadas' valor={novas.length} />
                <Resumo
                  titulo='Duplicadas ignoradas'
                  valor={duplicadas.length}
                />
                <Resumo
                  titulo='Linhas com erro'
                  valor={analise.errosLinhas.length}
                />
              </dl>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setPasso(2)}>
                  <ArrowLeft className='size-4' />
                  Voltar
                </Button>
                <Button
                  disabled={novas.length === 0}
                  onClick={confirmarImportacao}
                >
                  <Check className='size-4' />
                  Importar {novas.length} vaga(s)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}

function Resumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className='rounded-md border p-4'>
      <dt className='text-sm text-muted-foreground'>{titulo}</dt>
      <dd className='text-2xl font-bold tabular-nums'>{valor}</dd>
    </div>
  )
}

// Stepper horizontal do wizard — mesmo idioma visual do AcaoStepper
function StepperWizard({ passoAtual }: { passoAtual: number }) {
  return (
    <ol className='flex flex-wrap items-center gap-2'>
      {PASSOS.map((passo, indice) => {
        const concluido = indice < passoAtual
        const atual = indice === passoAtual
        return (
          <li key={passo} className='flex items-center gap-2'>
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full border text-xs font-medium',
                concluido &&
                  'border-primary bg-primary text-primary-foreground',
                atual && 'border-primary text-primary ring-2 ring-primary/30',
                !concluido && !atual && 'border-border text-muted-foreground'
              )}
              aria-current={atual ? 'step' : undefined}
            >
              {concluido ? <Check className='size-3.5' /> : indice + 1}
            </span>
            <span
              className={cn(
                'text-sm',
                atual
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {passo}
            </span>
            {indice < PASSOS.length - 1 && (
              <span className='h-px w-6 bg-border' aria-hidden='true' />
            )}
          </li>
        )
      })}
    </ol>
  )
}
