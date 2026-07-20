# SESI · Processo Seletivo — Sistema de RH / Gestão de Vagas

Produto operacional interno do **SESI** para **cadastrar, acompanhar e medir o funil de vagas** de um
processo seletivo — do recebimento da solicitação ao encerramento — com foco em **prazo (SLA)** e
**visibilidade de gargalos**.

> **Status:** MVP em construção (design + front). Baseline técnica sobre o template
> [`shadcn-admin`](https://github.com/satnaing/shadcn-admin) (ver [Proveniência](#proveniência)).

---

## O que o sistema é (em um parágrafo)

A entidade central é a **Vaga**. Toda Vaga tem, **simultaneamente**, dois eixos independentes:

- **Status** — a *situação* da Vaga (Aberta · Suspensa · Congelada · Cancelada · Finalizada · Arquivada).
  Controla o **cronômetro de SLA**.
- **Ação atual** — a *etapa* no processo seletivo (Solicitação recebida → … → Admissão, 10 etapas ordenadas).

O **SLA** pertence exclusivamente à Vaga (meta de **20 dias úteis**, pausa em Suspensa/Congelada). O
vocabulário completo e canônico está em **[CONTEXT.md](CONTEXT.md)** — a fonte única da linguagem do domínio.

**Atores com login:** Recrutador/a (RH), Gestora de RH, Administrador.
**Referenciados (dados, não usuários):** Gestor solicitante, Jurídico.

---

## Estrutura do repositório

```
.
├── CONTEXT.md          # Linguagem ubíqua — fonte única do vocabulário do domínio (leia primeiro)
├── README.md           # Este arquivo — porta de entrada
├── CONTRIBUTING.md     # Como rodar, testar e contribuir
├── docs/               # Documentação (produto · design · engenharia · ADRs) — ver docs/README.md
│   ├── product/        # PRD e revisão de requisitos
│   ├── design/         # Arquitetura da Informação + Design System
│   ├── engineering/    # Stack, estudo do shadcn, arquitetura de módulos, handoff
│   ├── adr/            # Architecture Decision Records
│   └── solutions/      # Aprendizados de execução (gotchas e padrões)
└── app/                # A aplicação (Vite + React 19 + TanStack + shadcn/ui + Tailwind v4)
```

---

## Começar rápido

Pré-requisitos: **Node 20+** e **pnpm**. O app vive em `app/`.

```bash
cd app
pnpm install
pnpm dev          # sobe o Vite em modo desenvolvimento
```

Outros comandos úteis (dentro de `app/`): `pnpm build`, `pnpm lint`, `pnpm format`, `pnpm test`.
Detalhes em **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## Documentação — por onde entrar

| Você é… | Comece por |
|---|---|
| **Qualquer pessoa** | [CONTEXT.md](CONTEXT.md) (vocabulário) · [docs/README.md](docs/README.md) (índice geral) |
| **Produto** | [docs/product/PRD-sistema-rh-gestao-vagas.md](docs/product/PRD-sistema-rh-gestao-vagas.md) |
| **Design / UX** | [docs/design/arquitetura-informacao.md](docs/design/arquitetura-informacao.md) · [docs/design/design-system.md](docs/design/design-system.md) |
| **Engenharia** | [docs/engineering/stack.md](docs/engineering/stack.md) · [docs/engineering/arquitetura-de-modulos.md](docs/engineering/arquitetura-de-modulos.md) |
| **Decisões duras** | [docs/adr/](docs/adr/) |

---

## Proveniência

O `app/` foi iniciado a partir do template open-source **[`shadcn-admin`](https://github.com/satnaing/shadcn-admin)**
(MIT, por [@satnaing](https://github.com/satnaing)). O histórico completo do fork permanece preservado em
[`DaniloAmaralUX/shadcn-admin`](https://github.com/DaniloAmaralUX/shadcn-admin). Este repositório parte de
um histórico limpo, focado no produto SESI; a licença original do template está em
[`app/LICENSE`](app/LICENSE). O plano de reaproveitamento do template está em
[docs/product/PRD-review-e-plano-reaproveitamento.md](docs/product/PRD-review-e-plano-reaproveitamento.md)
e no [estudo do shadcn/ui](docs/engineering/estudo-shadcn.md).
