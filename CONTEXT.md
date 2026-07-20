# CONTEXT — Linguagem ubíqua do SESI Processo Seletivo

Glossário canônico do domínio. É a **fonte única da linguagem**: todo código, tela, doc e conversa deve
usar estes termos com estes sentidos. Não é especificação nem lista de requisitos — só **vocabulário**.

> Convenções: ✔ resolvido · ⏳ em aberto (decisão de produto pendente).
> Regra de higiene: um termo sobrecarregado (ex.: "Gestor", "Chamado", "SLA") **nunca** aparece sozinho —
> usa-se sempre a forma canônica desambiguada abaixo.

---

## Entidade central

**Vaga** — a unidade de trabalho do sistema e o objeto ao redor do qual tudo orbita. Representa uma posição
a ser preenchida, acompanhada da solicitação inicial até o encerramento do processo seletivo. Toda Vaga tem,
**simultaneamente**, um **Status** e uma **Ação atual** (os dois eixos). Não se apaga uma Vaga: encerra-se
(Cancelada/Finalizada) e, depois, arquiva-se.

---

## Os dois eixos

Invariante central do domínio: **Status e Ação atual são independentes e nunca se misturam.** Uma Vaga
Aberta pode estar em qualquer etapa; o Status diz a *situação*, a Ação atual diz *onde no processo*.

### Status (situação da Vaga)

Controla o **cronômetro de SLA**. Seis valores:

| Status | Significado | Efeito no SLA |
|---|---|---|
| **Aberta** | Processo em andamento | conta |
| **Suspensa** | Pausada por decisão do RH/gestor | **pausa** |
| **Congelada** | Pausada por bloqueio externo | **pausa** |
| **Cancelada** | Encerrada **sem** contratação (exige **motivo**) | encerra |
| **Finalizada** | Encerrada **com** contratação | encerra |
| **Arquivada** | Fora da operação; preserva histórico (estado pós-terminal) | não conta |

**Matriz de transições (B1)** — nem todo Status vai para qualquer outro. Regra vigente (dado remapeável,
não hard-coded): Aberta → {Suspensa, Congelada, Cancelada, Finalizada}; Suspensa/Congelada → {Aberta,
Cancelada}; Finalizada/Cancelada → Arquivada; Arquivada é terminal. Cancelar exige **motivo**.

### Ação atual (etapa no processo seletivo)

Onde a Vaga está no fluxo. Dez etapas **ordenadas**:

1. Solicitação recebida
2. Encaminhada ao gestor
3. Chamado jurídico
4. Inscrições
5. Prova
6. Entrevista RH
7. Entrevista gestor
8. Habilitação
9. Divulgação do resultado
10. Admissão

**Habilitação** — etapa de verificação de aptidão/elegibilidade do(s) candidato(s) antes do resultado.

---

## Prazos

O ponto de maior confusão histórica; a linguagem aqui é deliberadamente estrita.

**SLA** — pertence **exclusivamente à Vaga**. Tem **meta de 20 dias úteis**. Começa na abertura da Vaga e
encerra na **Divulgação do resultado** (quando congela no valor final). Pausa nos Status **Suspensa** e
**Congelada**. É o único prazo com "meta". → visualizado pelo painel/indicador de SLA.

**Tempo do gestor** — **duração medida** entre o encaminhamento ao gestor e o retorno dele, em **dias úteis**.
É uma medição, **não** um SLA (não tem meta). Nunca chamar de "SLA do gestor".

**Tempo do jurídico** — **duração medida** entre a abertura do chamado jurídico e o recebimento do parecer,
em **dias corridos**. É uma medição, **não** um SLA. Nunca chamar de "SLA do jurídico".

**Dia útil** — dia que conta para o SLA e para o Tempo do gestor. Exclui sábados/domingos, feriados nacionais
(inclusive móveis: Carnaval, Sexta-feira Santa, Corpus Christi) e os **feriados próprios da Unidade**. (O
Tempo do jurídico, por contraste, corre em dias **corridos**.)

---

## Atores

**Com acesso ao sistema (login):**

**Recrutador/a (RH)** — cria, edita e acompanha Vagas; importa planilhas. É quem opera o dia a dia.

**Gestora de RH** — acompanha SLAs, gargalos e resultados; supervisiona. Papel de gestão, não de operação.

**Administrador** — gere usuários, Unidades e feriados, auditoria e exportação de dados sensíveis.

**Referenciados (sem acesso ao sistema — são dados, não usuários):**

**Gestor solicitante** — a pessoa da área que solicitou a Vaga e a quem ela é encaminhada. Distinto da
Gestora de RH. É a contraparte da etapa "Encaminhada ao gestor" / "Entrevista gestor" e do **Tempo do gestor**.

**Jurídico** — a área que emite parecer sobre a Vaga. Contraparte da etapa "Chamado jurídico" e do
**Tempo do jurídico**.

---

## Termos de apoio

**Unidade** — unidade do SESI onde a Vaga existe; vinculada a um município, o que determina seu **calendário
de feriados próprio** (base do cálculo de dia útil).

**Área** — subdivisão organizacional dentro de uma Unidade (departamento/setor) à qual a Vaga pertence.

**Cargo** — o posto de trabalho da Vaga (com nível/função associados).

**Chamado da vaga** — o identificador administrativo da Vaga (nº do chamado / código da vaga). **Não confundir**
com o Chamado jurídico.

**Chamado jurídico** — o nº do chamado aberto junto ao Jurídico para uma Vaga. É também o nome da etapa (3) de
Ação atual. Distinto do Chamado da vaga.

**Vaga PCD** — Vaga destinada a Pessoa com Deficiência.

**Candidato selecionado** — a pessoa registrada como escolhida ao Finalizar a Vaga. É um **dado da Vaga**,
não uma entidade gerida (ver "Fora do escopo").

**Banco de candidatos** — indicação de que a Vaga gerou um cadastro reaproveitável para contratações futuras.

**Gênero** 🔒 — dado do candidato coletado para indicador de diversidade; sensível a LGPD (exige finalidade).

---

## Termos em aberto ⏳

**Reabertura** — reabrir uma Vaga encerrada (Cancelada/Finalizada). **Semântica ainda não decidida**: reabrir
gera uma **nova Vaga** ou reusa o **mesmo registro**? Afeta diretamente o histórico (Timeline) e a contagem de
SLA. *Recomendação atual:* criar um **novo registro vinculado à Vaga anterior** (preserva o SLA e o histórico
originais intactos, e torna a reabertura auditável). — decisão de produto pendente.

---

## Fora do escopo (evitar scope creep)

**Candidato como entidade** — o sistema **não gere candidatos individualmente** (sem CRUD de candidatos, sem
pipeline por pessoa). Ele registra apenas **campos da Vaga**: candidato selecionado, quantidade de candidatos
aplicados e se gerou banco. Falar em "gerenciar candidatos" está fora do domínio atual.

---

> **Proveniência:** termos destilados de [docs/product/PRD-sistema-rh-gestao-vagas.md](docs/product/PRD-sistema-rh-gestao-vagas.md)
> e [docs/design/arquitetura-informacao.md](docs/design/arquitetura-informacao.md). Decisões duras registradas em
> [docs/adr/](docs/adr/).
