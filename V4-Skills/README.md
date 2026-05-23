# V4-Skills

Repositório de skills de IA da V4 Company — automação de processos financeiros e operacionais.

---

## Skills disponíveis

| Skill | Descrição | Arquivos |
|-------|-----------|----------|
| `conta-azul-support` | Especialista Conta Azul para franqueados | SKILL.md + 5 refs + 10 POPs |
| `financial-report` | Relatório financeiro mensal consolidado da rede | SKILL.md |
| `financial-viz` | Tabelas e gráficos do relatório financeiro | SKILL.md |
| `valuation-v4` | Valuation de unidades (sócio, venda, M&A) | SKILL.md |

---

## Estrutura de pastas

```
V4-skills/
├── README.md
│
├── conta-azul-support/
│   ├── SKILL.md                          ← Skill principal (instruções ao Claude)
│   ├── GUIA-INSTALACAO-FRANQUEADO.md     ← Guia via arquivo .skill
│   ├── GUIA-INSTALACAO-GRATUITO.md       ← Guia via Projeto Claude (plano free)
│   ├── GUIA-INSTALACAO-PAGO.md           ← Guia via Projeto Claude (plano pago)
│   └── references/
│       ├── conciliacao.md                ← Resumo conciliação bancária
│       ├── glossario-plano-contas.md     ← O que lançar em cada categoria
│       ├── lancamentos-contratos.md      ← Contratos, contas a pagar, transferências
│       ├── plano-contas-dre-dfc.md       ← Estrutura plano de contas + DRE/DFC
│       ├── taxas-pagamentos-rotinas.md   ← Taxas V4 Finance/IUGU, PIX+cheque, rotinas
│       └── pops/                         ← POPs originais completos
│           ├── pop-conciliacao-bancaria-2026.md         (ADM/CBC-FIN-001 — 10/04/2026)
│           ├── pop-conciliacao-recebimentos-deducoes.md (ADM/FIN-CONC-001 — 08/01/2026)
│           ├── pop-adequacao-plano-contas-dre-dfc-2026.md (ADM/FIN-CONC-002 — 29/01/2026)
│           ├── pop-novo-relatorios-dre-dfc.md           (ADM/RDC-FIN-008 — 04/12/2025)
│           ├── pop-gerenciamento-contratos-2026.md      (ADM/GEC-FIN-006 — 20/03/2026)
│           ├── pop-contas-a-pagar-2026.md               (ADM/CAP-FIN-005 — 26/09/2025)
│           ├── pop-aplicacao-financeira-outras-contas.md (ADM/AFO-FIN-004 — 09/09/2025)
│           ├── pop-taxas-v4-finance-iugu.md             (ADM/FIN-CVTR-001 — 03/02/2026)
│           ├── pop-pagamentos-cheque.md                 (ADM/CHQ-001 — 2026)
│           └── pop-rotinas-e-rituais.md                 (ADM/RER-FIN-002 — 15/08/2025)
│
├── financial-report/
│   └── SKILL.md                          ← Skill completa (benchmarks, fórmulas, estrutura)
│
├── financial-viz/
│   └── SKILL.md                          ← Skill completa (paleta, gráficos, tabelas)
│
└── valuation-v4/
    └── SKILL.md                          ← Skill completa (FCFE V4, múltiplos EBITDA)
```

---

## Como instalar uma skill no Claude

1. Baixe o arquivo `.skill` correspondente (gerado via `package_skill.py`)
2. No Claude.ai, acesse **Configurações > Personalizar > Skills**
3. Clique em **Instalar skill** e faça upload do arquivo
4. A skill fica ativa automaticamente nas próximas conversas

---

## Como atualizar um POP

1. Substitua o arquivo correspondente em `conta-azul-support/references/pops/`
2. Atualize a data de versão na tabela do `SKILL.md`
3. Commit com mensagem: `fix: atualiza POP [código] v[data]`

Exemplo: `fix: atualiza POP ADM/CBC-FIN-001 v10/04/2026`

---

## Versionamento dos POPs

| Código | POP | Versão atual |
|--------|-----|-------------|
| ADM/CBC-FIN-001 | Conciliação Bancária Conta Azul | 10/04/2026 |
| ADM/FIN-CONC-001 | Conciliação de Recebimentos com Deduções | 08/01/2026 |
| ADM/FIN-CONC-002 | Adequação do Plano de Contas e DRE/DFC | 29/01/2026 |
| ADM/RDC-FIN-008 | Novo Relatórios DRE/DFC | 04/12/2025 |
| ADM/GEC-FIN-006 | Gerenciamento de Contratos | 20/03/2026 |
| ADM/CAP-FIN-005 | Contas a Pagar | 26/09/2025 |
| ADM/AFO-FIN-004 | Aplicação Financeira / Outras Contas | 09/09/2025 |
| ADM/FIN-CVTR-001 | Taxas V4 Finance e IUGU | 03/02/2026 |
| ADM/CHQ-001 | Processo Pagamentos PIX + Cheques | 2026 |
| ADM/RER-FIN-002 | Rotinas e Rituais do Coord. ADM | 15/08/2025 |
