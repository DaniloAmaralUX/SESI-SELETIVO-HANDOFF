# NOTICE — código de terceiros

Este repositório incorpora código de terceiros. O arquivo lista a origem e a
situação de licença de cada bloco, para que a equipe que assume o projeto e o
jurídico saibam o que está embarcado no entregável.

---

## 1. Template base — shadcn-admin

- **Origem:** https://github.com/satnaing/shadcn-admin
- **Autoria:** Sat Naing
- **Licença:** MIT (Copyright © 2024 Sat Naing) — texto integral em
  [`licenses/shadcn-admin-MIT.txt`](licenses/shadcn-admin-MIT.txt)
- **O que veio daqui:** a estrutura inicial do app (layout, rotas, sidebar,
  telas de auth e de erro, boa parte de `src/components/`).

A MIT exige que o aviso de copyright seja preservado na redistribuição — por
isso o texto está em `licenses/`. O aviso **não** significa que Sat Naing
detém direitos sobre o sistema de gestão de vagas construído por cima dele.

## 2. Dependências de npm

As dependências declaradas em `app/package.json` seguem as licenças dos
respectivos pacotes (majoritariamente MIT). Para o inventário completo:

```bash
npx license-checker --production --summary
```

---

## Nota de proveniência desta versão

Esta é a **versão de referência visual** do sistema (identidade shadcn-admin
padrão, sem redesign de marca). Ela não incorpora nenhum registry de UI de
terceiro além do template base acima — nenhum componente de galeria externa,
nenhum efeito decorativo com licença adicional a verificar. Todas as
correções funcionais e de domínio (SLA, status, observações, segurança
operacional) são as mesmas de qualquer outra versão do sistema; o que muda
entre elas é só a camada visual.
