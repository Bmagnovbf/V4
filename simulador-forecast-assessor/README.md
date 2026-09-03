# Simulador de Forecast — Assessor V4

App interno (Next.js 14 + TypeScript + Tailwind) que projeta receita, custos e
renda líquida de um **Assessor V4** nos primeiros 24 meses.

> Projeto **irmão** do `simulador-forecast` (franquia completa), que continua em
> produção e **não deve ser alterado**. Mesma stack, mesmo design system, mesmo
> fluxo — mas o motor de cálculo é totalmente distinto: o Assessor não tem
> unidade, equipe nem horizontes H1–H5.

## Rodando localmente

```bash
npm install
npm run dev     # http://localhost:3000
```

No WSL desta máquina não há Node nativo — use o do Windows:

```bash
export PATH="$PATH:/mnt/c/Program Files/nodejs"
```

## Rotas

| Rota | O que é |
|------|---------|
| `/` | Tela de input (meta de faturamento, retirada, perfil, rede, reserva) |
| `/dashboard` | Termômetro, KPIs, 3 fontes, gráficos e DRE completo |
| `/params` | Painel somente leitura dos benchmarks vigentes |

## Documentação

| Arquivo | O que é |
|---|---|
| `PRD.md` | O produto: problema, escopo, inputs, o que ainda está aberto |
| `SPEC.md` | A regra de cálculo, linha a linha — para discordar de um número sem ler o código |

## Onde ficam os números

`src/config/params.ts` é a **única** fonte de verdade. Editar → push → Vercel
faz deploy. Cada parâmetro está marcado com ✅ (travado no doc oficial),
🟡 (decisão em aberto) ou 🔴 (premissa ainda não discutida).

## Validação

O motor reproduz a planilha "ASSESSOR V4 · DRE PROJETADO 12 MESES":

```bash
npx tsc -p tsconfig.test.json && node test_dre.mjs
```

Compara os cenários Base e Upside contra a planilha e verifica que nenhum
contrato é fracionário em 126 combinações × 12 meses. Valores em R$ toleram 15%
de desvio — a planilha usa uma rampa desenhada à mão e o motor usa uma rampa
generativa que responde ao perfil do candidato. Meses toleram ±1.

Base reproduz em +10,3% no líquido do ano; Upside em −13,8%.

E a auditoria do espaço de inputs, que procura quebras estruturais e
incoerências narrativas em todas as combinações de rede, perfil, meta, retirada
e reserva:

```bash
npx tsc -p tsconfig.test.json && node audit.mjs
```

## Deploy

**https://simulador-assessor.vercel.app**

Projeto Vercel `simulador-assessor`, apontando para o monorepo `Bmagnovbf/V4`,
branch `main`, com **Root Directory = `simulador-forecast-assessor`**. Push na
`main` dispara o build. Público, sem Deployment Protection.

Pendente: marcar "Automatically expose System Environment Variables" nas env
vars do projeto, para o rodapé do `/params` mostrar a data do deploy em vez de
"dev local".
