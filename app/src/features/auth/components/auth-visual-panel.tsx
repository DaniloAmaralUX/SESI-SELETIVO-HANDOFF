import { lazy, Suspense, useEffect, useState } from 'react'
import { SesiWordmark } from '@/assets/logo'
import BlurText from '@/components/react-bits/BlurText'

// Painel visual do login: fluido WebGL interativo (LiquidEther, do registry
// Dev Studio UI) sobre navy profundo, com o discurso do produto por cima.
// Regras da skill webgl-components (ui-skills.com):
// - lazy: three.js só entra no bundle da rota de auth, nunca no app;
// - fallback é superfície de produção: gradiente CSS com a MESMA identidade
//   (azuis SESI) cobre reduced-motion, WebGL ausente e o intervalo de load;
// - canvas é decorativo → aria-hidden; overlay não captura o ponteiro.
// Movimento reduzido desliga as DUAS animações do painel — o fluido e a
// manchete (BlurText é material de registry e não conhece a media query, então
// quem decide é este componente).
const LiquidEther = lazy(() => import('@/components/react-bits/LiquidEther'))

// Paleta da logo sobre #050b14: o navy oficial clareado em dois passos + o
// verde EXATO do í (#65BC45) como o gesto de cor da marca dentro do fluido
const CORES_FLUIDO = ['#1d55c0', '#4f95e5', '#65bc45']

const MQ_DESKTOP = '(min-width: 64rem)'
const MQ_MOVIMENTO_REDUZIDO = '(prefers-reduced-motion: reduce)'

const MANCHETE = 'Cada vaga no prazo, do rascunho à contratação.'
// tracking-tight: display grande pede letter-spacing levemente negativo
// (better-typography: letter-spacing by size)
const MANCHETE_CLASSES =
  'mt-3 max-w-xl font-(family-name:--font-heading) text-4xl font-semibold tracking-tight text-balance text-white xl:text-5xl'

function prefereMovimentoReduzido(): boolean {
  return window.matchMedia(MQ_MOVIMENTO_REDUZIDO).matches
}

function podeAnimarWebGL(): boolean {
  // O painel só existe ≥lg — sem ele, nem vale baixar o chunk do three.js
  if (!window.matchMedia(MQ_DESKTOP).matches) {
    return false
  }
  if (prefereMovimentoReduzido()) {
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    // Sem GPU real o fluido vira rasterização por software e trava a aba —
    // melhor cair direto no gradiente estático
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    return gl !== null
  } catch {
    return false
  }
}

/** Gradiente estático com a identidade do painel — fallback e loading. */
function FundoEstatico() {
  return (
    <div
      aria-hidden='true'
      className='absolute inset-0'
      style={{
        background:
          'radial-gradient(120% 90% at 80% 10%, rgba(96,165,250,0.28), transparent 55%),' +
          'radial-gradient(90% 80% at 15% 85%, rgba(29,78,216,0.35), transparent 60%),' +
          'radial-gradient(70% 60% at 50% 50%, rgba(129,140,248,0.12), transparent 70%)',
      }}
    />
  )
}

export function AuthVisualPanel() {
  const [animar, setAnimar] = useState(false)
  const [movimentoReduzido, setMovimentoReduzido] = useState(false)

  useEffect(() => {
    const sincronizar = () => {
      setAnimar(podeAnimarWebGL())
      setMovimentoReduzido(prefereMovimentoReduzido())
    }
    sincronizar()

    // Largura: se a janela crescer até lg depois do mount, liga o fluido na
    // hora. Movimento: a preferência pode mudar no SO com a aba aberta.
    const mqs = [
      window.matchMedia(MQ_DESKTOP),
      window.matchMedia(MQ_MOVIMENTO_REDUZIDO),
    ]
    mqs.forEach((mq) => mq.addEventListener('change', sincronizar))
    return () =>
      mqs.forEach((mq) => mq.removeEventListener('change', sincronizar))
  }, [])

  return (
    <section
      aria-label='Apresentação do sistema de gestão de vagas'
      className='relative isolate hidden flex-1 overflow-hidden rounded-3xl bg-[#050b14] lg:block'
    >
      <FundoEstatico />
      {animar && (
        <Suspense fallback={null}>
          <div aria-hidden='true' className='absolute inset-0'>
            <LiquidEther
              colors={CORES_FLUIDO}
              mouseForce={18}
              cursorSize={110}
              resolution={0.5}
              autoDemo
              autoSpeed={0.4}
              autoIntensity={1.8}
              autoResumeDelay={2500}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </Suspense>
      )}

      {/* Véu inferior para garantir contraste do texto sobre o fluido */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#050b14]/95 via-[#050b14]/45 to-transparent'
      />

      <div className='pointer-events-none absolute inset-0 flex flex-col justify-end p-10 xl:p-12'>
        <div className='flex flex-col items-start'>
          {/* Logo alinhada à esquerda com o bloco de copy, logo acima do
              eyebrow — um único lockup, não um elemento solto no topo */}
          <SesiWordmark tom='knockout' className='mb-4 text-4xl' />
          {/* Verde SESI (hue oficial 136) auditado p/ texto sobre o navy (|Lc| 66) */}
          <p className='text-xs font-medium tracking-widest text-[oklch(0.78_0.18_136)] uppercase'>
            Processo seletivo · SESI-PE
          </p>
          {movimentoReduzido ? (
            <p className={MANCHETE_CLASSES}>{MANCHETE}</p>
          ) : (
            <BlurText
              text={MANCHETE}
              animateBy='words'
              delay={90}
              stepDuration={0.3}
              className={MANCHETE_CLASSES}
            />
          )}
          {/* Corpo e chips auditados APCA (75/60) sobre o navy do painel */}
          <p className='mt-4 max-w-md text-sm text-pretty text-[oklch(0.85_0.03_250)]'>
            Acompanhe o SLA de 20 dias úteis, registre cada movimento no
            histórico e feche o processo com relatórios prontos.
          </p>
          <ul className='mt-8 flex flex-wrap gap-2'>
            {[
              'SLA de 20 dias úteis',
              '7 etapas de status',
              'LGPD por papel',
            ].map((chip) => (
              <li
                key={chip}
                className='rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-[oklch(0.88_0.02_250)] backdrop-blur-sm'
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
