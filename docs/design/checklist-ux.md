---
titulo: Checklist — UX
tipo: checklist
status: ativo (usar como definição de pronto de toda tela/fluxo)
data: 2026-07-20
fontes:
  - docs/design/ux-experiencia-do-usuario.md
  - docs/product/fluxos-do-usuario.md
  - docs/design/arquitetura-informacao.md (§14 estados do sistema)
---

# Checklist — UX

> Definição de pronto de experiência: **nenhuma tela ou fluxo é considerado entregue** sem passar
> por aqui. Aplicar por tela (seção A) e por fluxo ponta-a-ponta (seção B).

## A. Por tela

### Estados (os 4 obrigatórios — IA §14)
- [ ] **Vazio** desenhado, com CTA que tira o usuário do vazio (não só "nenhum resultado").
- [ ] **Carregando** com Skeleton no formato do conteúdo final.
- [ ] **Erro / sem permissão** tratado (inline ou `/erros/401|403|404|500`).
- [ ] **Feedback de ação** — toda mutação confirma com toast; erro diz o que houve + como resolver.

### Hierarquia e conteúdo
- [ ] A informação mais importante da tela responde à pergunta da persona em < 10 s
      (na lista: "o que vence hoje?" — SLA visível sem interação).
- [ ] Vocabulário canônico do CONTEXT.md ("Status" ≠ "Ação atual"; "SLA" só da vaga; "Arquivada").
- [ ] Rótulos, títulos e mensagens em pt-BR, verbos no infinitivo nos botões.
- [ ] Datas com formato explícito; contagens com unidade ("dias úteis" / "dias corridos").
- [ ] Dois eixos nunca misturados visualmente: Status = StatusBadge; Ação atual = stepper/coluna própria.

### Prevenção de erro
- [ ] Ações inválidas desabilitadas **com explicação** (tooltip), não escondidas nem falhando após clique.
- [ ] Ação destrutiva/irreversível pede confirmação com consequência explícita.
- [ ] Validação inline por campo; submit falho leva o foco ao primeiro campo inválido.
- [ ] Nenhuma sobrescrita silenciosa de dados (importação: opt-in por linha — decisão B8).

### Acessibilidade (alvo WCAG 2.2 AA)
- [ ] Navegável 100% por teclado (tab order lógico, Esc fecha overlays, Enter confirma).
- [ ] Foco visível em todos os controles.
- [ ] Cor nunca é o único canal (ícone + texto nos status/SLA).
- [ ] Contraste ≥ 4.5:1 no texto (atenção ao âmbar sobre fundo claro).
- [ ] Imagens/ícones informativos com texto alternativo; decorativos ocultos de leitores de tela.
- [ ] `prefers-reduced-motion` respeitado; legível com zoom 200%.

### Privacidade (LGPD — RF26)
- [ ] Campos sensíveis de candidato 🔒 só renderizam para papéis autorizados.
- [ ] Nenhum dado sensível em URL, título de aba ou toast.

## B. Por fluxo (ponta-a-ponta — ver fluxos F1–F9)

- [ ] O fluxo completa sem beco sem saída: toda exceção ⚠ tem caminho de volta.
- [ ] Passos mínimos: ações frequentes (F1, F2) em 1–2 cliques a partir da lista.
- [ ] O usuário sempre sabe **onde está** (breadcrumb/título) e **o que aconteceu** (feedback).
- [ ] Estado sobrevive a navegação: filtros da lista preservados na URL (voltar do detalhe não os perde).
- [ ] Recarregar a página no meio do fluxo não perde dados já confirmados.
- [ ] Fluxo testável com dados mock realistas (volumes plausíveis: dezenas de vagas, nomes reais-símile).

## C. Antes do teste com usuários (protótipo Vercel)

- [ ] Roteiro de teste cobre F1, F2, F3 e F6 no mínimo.
- [ ] Métricas de UX instrumentáveis (tempo de criação, identificação de estouros — ver
      [ux-experiencia-do-usuario.md](ux-experiencia-do-usuario.md) §8).
- [ ] Dados mock não contêm dados pessoais reais.
- [ ] Aprendizados do teste voltam para os docs (personas, fluxos) — doc vivo.
