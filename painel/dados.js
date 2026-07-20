// Painel de Controle — SESI Processo Seletivo
// Fonte de dados do painel (painel/index.html só renderiza este objeto).
// Ritual: ao fim de cada loop de trabalho, o agente atualiza este arquivo (ver CLAUDE.md).
// Formato JS (não JSON) para funcionar via file:// sem servidor.

window.PAINEL = {
  atualizadoEm: "2026-07-13",

  retomada: {
    ondeParei:
      "Painel de controle do projeto criado neste loop (brainstorm → plano → build), no worktree interactive-control-panel.",
    oQueMudou: [
      "Plano de requisitos do painel em docs/plans/2026-07-13-001-feat-painel-controle-projeto-plan.md",
      "painel/ criado (index.html + dados.js) — este cockpit",
      "Ritual de atualização do painel gravado no CLAUDE.md",
    ],
    proximoPasso:
      "Loop 1 — fatia vertical de Vagas: schema Zod da Vaga (features/vagas/data/schema.ts). Atenção: N1/N2 da planilha real seguem abertas — não congelar enums de Status/Ação sem confirmar com o RH.",
  },

  // Fases do roadmap aprovado (STRATEGY.md, decisão B4).
  // status: "nao-iniciada" | "em-andamento" | "concluida"
  roadmap: [
    {
      fase: "0",
      nome: "Fundações",
      rfs: "—",
      status: "nao-iniciada",
      nota: "Fundações de PROCESSO prontas (CLAUDE.md, STRATEGY, CI, docs); o código do app segue ~100% template shadcn-admin.",
      falta: [
        "Limpar resíduos de demo do template + rebrand + nav pt-BR",
        "Camada de dados",
        "Schema/enum de Status·Ação (decisão B1)",
        "Guard de rota RBAC (papel já existe em stores/auth-store.ts)",
      ],
    },
    {
      fase: "1",
      nome: "Núcleo CRUD",
      rfs: "RF01–08, RF16–17",
      status: "nao-iniciada",
      nota: "",
      falta: ["Lista + filtros", "Form criar/editar", "Detalhe", "Soft-delete", "Histórico/auditoria"],
    },
    {
      fase: "2",
      nome: "SLA & Processo",
      rfs: "RF09–15",
      status: "nao-iniciada",
      nota: "Motor de SLA puro (dias úteis, feriados por Unidade — ADR 0002).",
      falta: ["Motor de SLA (B2)", "Cronograma", "Timers gestor/jurídico", "Resultado"],
    },
    {
      fase: "3",
      nome: "Importação",
      rfs: "RF18–22",
      status: "nao-iniciada",
      nota: "Planilha é entrada não confiável (decisão B8).",
      falta: ["Parser", "Validação", "Dedup por chave", "Wizard/prévia"],
    },
    {
      fase: "4",
      nome: "Indicadores",
      rfs: "RF23–25",
      status: "nao-iniciada",
      nota: "Inclui o dashboard /indicadores do produto (não confundir com este painel).",
      falta: ["Dashboards", "Relatórios", "Exportação"],
    },
  ],

  decisoes: {
    tomadas: [
      {
        titulo: "Status e Ação como eixos independentes",
        onde: "docs/adr/0001-status-e-acao-como-eixos-independentes.md",
        resumo: "Toda Vaga tem Status (6 valores) E Ação atual (10 etapas); nunca se misturam.",
      },
      {
        titulo: "SLA em dias úteis com motor de feriados próprio",
        onde: "docs/adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md",
        resumo: "20 dias úteis calculados; feriados por Unidade; pausa em Suspensa/Congelada.",
      },
      {
        titulo: "Decisões B1–B8 da revisão do PRD",
        onde: "docs/product/PRD-sistema-rh-gestao-vagas.md",
        resumo: "Enums (B1), motor de SLA (B2), faseamento (B4), criação mínima (B5), LGPD (B6), atores (B7), importação (B8) — Seção 9 do PRD.",
      },
    ],
    // urgencia: "alta" | "media" | "baixa" (ordenar por urgência na renderização)
    pendentes: [
      {
        titulo: "Divergência planilha real × canônico (N1/N2)",
        urgencia: "alta",
        quem: "RH",
        contexto:
          "Planilha real tem 10 status / 34 ações vs 6/10 do canônico. Bloqueia congelar o schema da Vaga. Ver docs/product/duvidas-requisitos*.pdf.",
      },
      {
        titulo: "Backend + auth + RBAC (B3)",
        urgencia: "alta",
        quem: "infra/TI",
        contexto: "API própria vs BaaS vs mock; SSO SESI vs Clerk vs JWT. Condiciona histórico/auditoria reais.",
      },
      {
        titulo: "Reabertura de Vaga",
        urgencia: "media",
        quem: "produto/RH",
        contexto: "Novo registro vinculado vs reuso do mesmo; efeito no SLA e no histórico. Recomendação atual: novo registro vinculado.",
      },
      {
        titulo: "Identificador único da Vaga",
        urgencia: "media",
        quem: "produto/RH",
        contexto: "Nº do chamado E código, ou E/OU?",
      },
      {
        titulo: "Meta de SLA uniforme?",
        urgencia: "media",
        quem: "produto/RH",
        contexto: "20 dias úteis para tudo, ou varia por tipo de contrato/cargo? Validar meta única antes de configurar por contrato.",
      },
      {
        titulo: "LGPD — retenção e anonimização",
        urgencia: "media",
        quem: "DPO",
        contexto: "Política concreta de prazo de retenção/anonimização antes do go-live.",
      },
      {
        titulo: "Direção visual SESI",
        urgencia: "baixa",
        quem: "design/marca",
        contexto: "Paleta azul #0057B8 + âmbar e par Archivo/IBM Plex são PROPOSTA — validar com o manual de marca.",
      },
    ],
  },

  // Maturidade conforme docs/README.md
  artefatos: [
    { nome: "CONTEXT.md — linguagem ubíqua", caminho: "CONTEXT.md", area: "raiz", status: "vivo" },
    { nome: "STRATEGY.md — âncora de produto", caminho: "STRATEGY.md", area: "raiz", status: "v1 viva" },
    { nome: "PRD — Gestão de Vagas", caminho: "docs/product/PRD-sistema-rh-gestao-vagas.md", area: "produto", status: "em-revisao" },
    { nome: "Revisão do PRD + reaproveitamento", caminho: "docs/product/PRD-review-e-plano-reaproveitamento.md", area: "produto", status: "revisão" },
    { nome: "Arquitetura da Informação", caminho: "docs/design/arquitetura-informacao.md", area: "design", status: "proposta" },
    { nome: "Design System", caminho: "docs/design/design-system.md", area: "design", status: "v0.1 proposta" },
    { nome: "IA — apresentação (PDF)", caminho: "docs/design/arquitetura-informacao-apresentacao.pdf", area: "design", status: "—" },
    { nome: "Stack de referência", caminho: "docs/engineering/stack.md", area: "engenharia", status: "referência" },
    { nome: "Estudo shadcn/ui", caminho: "docs/engineering/estudo-shadcn.md", area: "engenharia", status: "referência" },
    { nome: "Arquitetura de módulos", caminho: "docs/engineering/arquitetura-de-modulos.md", area: "engenharia", status: "referência" },
    { nome: "ADR 0001 — dois eixos", caminho: "docs/adr/0001-status-e-acao-como-eixos-independentes.md", area: "adr", status: "aceita" },
    { nome: "ADR 0002 — SLA dias úteis", caminho: "docs/adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md", area: "adr", status: "aceita" },
    { nome: "Plano — Painel de Controle", caminho: "docs/plans/2026-07-13-001-feat-painel-controle-projeto-plan.md", area: "plano", status: "requirements-only" },
  ],

  atividade: [
    { data: "2026-07-13", resumo: "Painel de controle do projeto: brainstorm, plano de requisitos e build do cockpit (este loop)." },
    { data: "2026-07-13", resumo: "Natureza da entrega documentada (protótipo hi-fi + handoff) e dúvidas de requisitos v1/v2 (branch)." },
    { data: "2026-07-13", resumo: "Auto-trigger de context7/ui-skills autorizado; plano do Loop 1 — fatia de Vagas (branch)." },
    { data: "2026-07-13", resumo: "Compound Engineering instalado: CLAUDE.md, STRATEGY.md, CI na raiz (#1)." },
    { data: "2026-07-13", resumo: "Estrutura inicial do repo: docs na raiz, app (template shadcn-admin) em app/." },
  ],

  craft: {
    validacao: "Proposta — validar com o manual de marca do SESI. Ver aplicado aqui NÃO valida a direção.",
    fonte: "docs/design/design-system.md",
    paleta: [
      { nome: "azul-sesi", hex: "#0057B8", papel: "Primária institucional (ações, marca)" },
      { nome: "azul-profundo", hex: "#072B5A", papel: "Rail / ênfase" },
      { nome: "grafite", hex: "#141A22", papel: "Foreground" },
      { nome: "aço", hex: "#5B6673", papel: "Muted foreground" },
      { nome: "névoa", hex: "#F4F6FA", papel: "Background" },
      { nome: "âmbar-industrial", hex: "#F2A900", papel: "Assinatura + atenção" },
    ],
    statusTokens: [
      { token: "--status-ok", hex: "#1E874B", regra: "≤ ~14 dias úteis" },
      { token: "--status-warn", hex: "#F2A900", regra: "15–20 dias úteis" },
      { token: "--status-danger", hex: "#C6362F", regra: "> 20 dias úteis (estourado)" },
      { token: "--status-muted", hex: "#5B6673", regra: "Pausado (Suspensa/Congelada)" },
    ],
    tipografia: [
      { papel: "Display", familia: "Archivo", stack: "'Archivo', system-ui, sans-serif", exemplo: "Gestão de Vagas" },
      { papel: "Corpo", familia: "IBM Plex Sans", stack: "'IBM Plex Sans', system-ui, sans-serif", exemplo: "A Vaga tem Status e Ação atual — dois eixos independentes." },
      { papel: "Dados", familia: "IBM Plex Mono", stack: "'IBM Plex Mono', ui-monospace, monospace", exemplo: "VAGA-2026-041 · 14 d.ú. · 20 d.ú." },
    ],
    radius: [
      { nome: "sm", px: 6 },
      { nome: "md", px: 8 },
      { nome: "lg", px: 10 },
      { nome: "xl", px: 14 },
    ],
    componentesDominio: ["StatusBadge", "SLAIndicator", "StageStepper", "Timeline"],
  },
};
