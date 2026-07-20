# ADR 0002 — SLA em dias úteis com motor de feriados próprio por unidade

- **Status:** Aceita
- **Data:** 2026-07-13
- **Decisão de origem:** B2 do PRD (RF09 / RF10 / RF11 / RF12)

## Contexto

O SLA da Vaga (meta de 20 dias úteis, da abertura à Divulgação do resultado) precisa contar **dias úteis**.
Dias úteis dependem de feriados, e os feriados **variam por localidade**: além dos nacionais (inclusive os
móveis — Carnaval, Sexta-feira Santa, Corpus Christi), cada **Unidade** do SESI está em um município com seu
próprio calendário (feriados estaduais/municipais).

Duas escolhas estavam em aberto: (a) usar uma biblioteca externa de feriados/calendário, ou (b) manter uma
**tabela de feriados própria** e calcular internamente.

## Decisão

Calcular o SLA em **dias úteis** com um **motor próprio**, alimentado por uma **tabela de feriados
configurável por Unidade/município**, sobre utilitários de data já disponíveis — **sem** depender de um
serviço/biblioteca externa de feriados.

Distinções de contagem fixadas na linguagem (ver [CONTEXT.md](../../CONTEXT.md)):

- **SLA** (Vaga) e **Tempo do gestor** correm em **dias úteis**.
- **Tempo do jurídico** corre em **dias corridos**.
- O SLA **pausa** nos Status Suspensa e Congelada.

## Consequências

**Positivas**
- Controle total do calendário; feriados locais por Unidade sem depender de terceiros nem de rede.
- Regra de negócio auditável e testável de ponta a ponta.

**Negativas / custos**
- A tabela de feriados (nacionais móveis + locais por Unidade) precisa ser **mantida** a cada ano.
- Administração de Unidades e feriados vira funcionalidade de primeira classe (tela de admin).
- **Difícil de reverter** depois que relatórios e indicadores dependerem do valor calculado.

## Notas

Timers auxiliares têm contagens distintas de propósito: o do gestor mede resposta interna (dias úteis), o do
jurídico reflete prazo corrido do parecer. Nenhum dos dois tem meta nesta versão — são **durações medidas**,
não SLAs.
