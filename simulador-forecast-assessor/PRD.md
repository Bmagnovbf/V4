# PRD — Simulador de Forecast para Assessor V4
**V4 Company | Rascunho | Agosto/2026**

---

## 1. Visão Geral

### O problema
O funil de Expansão tem saída binária: ou o lead vira franqueado (tripé de 3
sócios, ~R$ 60K + Taxa de Franquia + giro), ou é perda. O **Assessor V4** é o
produto para o profissional solo, sênior, especialista numa vertical, que quer
entrar no ecossistema sem ser dono de operação — ticket de entrada R$ 20K.

Assim como o candidato a franqueado, esse lead precisa ver, antes de assinar, se
a matemática fecha: quanto ele fatura, quanto sobra, em quanto tempo paga a
entrada.

### A solução
Mesmo intuito e mesmo uso do `simulador-forecast` da franquia — dashboard visual
de alto nível gerado a partir de poucos inputs, usado pelo consultor durante a
call de conversão. Mas com motor próprio: o Assessor não tem unidade, não tem
equipe, não tem horizontes H1–H5 e não tem CAPEX de escritório.

### Objetivo principal
Validar, de forma rápida e visual, se a **renda projetada do Assessor** é
compatível com a ambição e o capital do candidato.

---

## 2. O que muda em relação ao simulador de franquia

| Dimensão | Franquia | Assessor |
|----------|----------|----------|
| Unidade de análise | Faturamento bruto da unidade | Renda líquida do indivíduo |
| Entrada | ~R$ 60K + Taxa de Franquia + giro | R$ 20K (Trilha Assessor) |
| Motor | Engenharia reversa da meta de faturamento | Mix de contratos nas 3 fontes |
| Estrutura de custo | CSP + Comercial + G&A + broker + headcount | Impostos + freelancers + ferramentas |
| Escala | Horizontes H1–H5 | Cap operacional (~15 contratos) |
| Deduções | Royalty 20% + impostos + inadimplência | Split por fonte (35% / 80% / comissão) |
| Ramp-up | Curva de faturamento em 12 meses | Gate da Trilha (Imersão → Vivência → Banca) antes da 1ª receita |

---

## 3. Produtos e as 3 fontes de receita

Fonte dos números: planilha **"ASSESSOR V4 · DRE PROJETADO 12 MESES"**. Onde a
planilha divergia do doc do produto ou do deck de venda, vale a planilha
(decisão de ago/2026).

> A planilha é **norte, não regra**. Ela também está em construção. O motor a
> usa como referência de ordem de grandeza e como caso de teste, mas premissas
> podem mudar sem que a planilha mude junto.

Dois produtos entram no escopo do Assessor. Ter e Potencializar ficam fora.

| Produto | Ticket | Natureza | Fonte 1 (matriz) | Fonte 2 (self) |
|---|---|---|---|---|
| Saber | R$ 12.000 | one-time, no mês da entrega | 30% → R$ 3.600 | 80% → R$ 9.600 |
| Executar | R$ 3.500/mês | recorrente, contrato de 6 meses | 35% → R$ 1.225 | 80% → R$ 2.800 |

O split é **por produto**, não único — o "35% da Fonte 1" do doc e do deck vale
para o Executar; o Saber alocado paga 30%.

**Fonte 3 — originação sem operação.** O Assessor vende um cliente que ele não
vai operar e recebe **o CAC daquele cliente**, one-time, no mês da originação.
O CAC é definido como **15% do deal no Saber** (R$ 1.800) e **2× o MRR no
Executar** (R$ 7.000) — não são duas alternativas, é a mesma regra escrita de
dois jeitos nos materiais. Não gera CSP, porque ele não entrega.

É a linha de receita que sustenta o BP do assessor de veia mais comercial.

**Override do padrinho:** não entra no cálculo do Assessor.

---

## 4. O motor

A planilha desenha a rampa à mão. O simulador precisa de uma rampa que responda
ao candidato, então o motor generaliza assim:

```
% comercial do perfil
  → capacidade de ORIGINAR (contratos/mês que ele traz)
% operacional + dedicação
  → capacidade de OPERAR (teto de projetos ativos simultâneos)

  originação que CABE na capacidade  → Fonte 2 (80%)
  originação que TRANSBORDA          → Fonte 3 (CAC)
  vagas restantes da carteira        → Fonte 1 (matriz aloca, 30/35%)

  → receita por produto × split da fonte
  → (−) Simples 6%, CSP Saber, CSP Executar, freelas+ferramentas
  → renda líquida → caixa acumulado → breakeven e payback
```

### Os dois tetos

Operador e comercial esbarram em limites diferentes, e é o perfil que decide
qual dos dois morde:

- **Operador:** até **15 projetos ativos** simultâneos. Acima de
  `pct_operacional_ref` (55%) a capacidade é cheia; abaixo, cai proporcional.
- **Comercial:** não tem teto operacional, tem teto de vendas. Um closer no
  talo toca **38 calls novas/mês** e converte **20%** de reunião realizada em
  venda → **7,6 vendas/mês** a 100% comercial, já rampado no M12.

| Perfil | Ativos M12 | Fonte 3 | Renda M12 | Líquido ano 1 |
|---|---|---|---|---|
| 20% comercial | 15 | – | R$ 17.703 | R$ 97.434 |
| 40% comercial | 15 | – | R$ 26.630 | R$ 139.065 |
| 50% comercial | 14 | – | R$ 30.113 | R$ 153.172 |
| 60% comercial | 11 | – | R$ 32.617 | R$ 160.569 |
| 70% comercial | 8 | 11% | R$ 31.727 | R$ 157.562 |
| 80% comercial | 6 | 30% | R$ 28.315 | R$ 141.241 |
| 100% comercial | 0 | 100% | R$ 21.170 | R$ 94.518 |

A Fonte 3 não é receita comum: no geral a carteira vem de clientes da matriz e
de outras unidades, e o cliente que o Assessor vende ele quer operar. Ela só
liga acima de ~65% comercial, quando a capacidade de operar já caiu o
suficiente para o que ele vende não caber.

### Achado: a Fonte 3 paga bem menos que operar

Comparando o mesmo contrato nas duas pontas:

| | Operando (Fonte 2) | Só originando (Fonte 3) | Razão |
|---|---|---|---|
| Saber | R$ 9.600 − R$ 1.500 CSP = **R$ 8.100** | **R$ 1.800** | 4,5× |
| Executar (6 meses) | R$ 16.800 − R$ 6.000 CSP = **R$ 10.800** | **R$ 7.000** | 1,5× |

É por isso que a renda não cresce monotonicamente com o % comercial: o
Assessor 100% comercial precisaria de um volume muito maior que 7,6 vendas/mês
para compensar. Se a BU quiser que o caminho comercial seja tão atrativo
quanto o operacional, o ajuste é no CAC (hoje 15% do Saber) ou no teto de
vendas — não no motor.

### Conflito conhecido com a planilha

Sob a premissa do closer, o cenário **Upside** da planilha (líquido de
R$ 207.350 no ano 1) **não é alcançável** — o motor satura em ~R$ 162 mil por
volta de 65% comercial. A planilha assume que o Assessor opera 15 projetos
**e** vende 4/mês ao mesmo tempo; o teto de 7,6 vendas/mês não comporta as
duas coisas. O cenário Base reproduz em +0,1%, num perfil de ~45% comercial.

Decisão pendente: vale a premissa do closer ou vale o Upside da planilha?

### Validação
`test_dre.mjs` compara a saída do motor com os dois cenários da planilha.
Rodar com `npx tsc -p tsconfig.test.json && node test_dre.mjs`.

---

## 5. Inputs do candidato

Só vira input o que o candidato sabe sobre si mesmo. Benchmark da rede
(tickets, splits, CSP, imposto, duração do Executar, rampa da matriz) fica em
`src/config/params.ts`.

| Input | Formato | O que altera |
|---|---|---|
| Meta de renda líquida no M12 | slider R$ 5–45K | Termômetro: renda projetada vs. meta |
| Perfil operacional × comercial | slider 0–100% | Mix entre as 3 fontes — a alavanca central |
| Dedicação | integral / parcial | Teto de projetos ativos (15 ou 8) |
| Entrada na rede | à vista / 12x | Curva de caixa e payback |
| Reserva de capital de giro | slider R$ 0–60K | Termômetro: fôlego para atravessar M1–M4 |

---

## 6. Dashboard

- Termômetro em três eixos: reserva vs. exigido pelo ramp-up, payback, renda vs. meta
- KPIs: renda no M12, líquido do ano 1, payback, projetos ativos
- Cards das 3 fontes com contagem de contratos e share da receita
- Área empilhada: receita por fonte, 12 meses
- Barras + linha: renda líquida mensal e caixa acumulado, com a meta marcada
- Tabela do DRE completo, linha a linha, com coluna de ano

---

## 7. Pendências

### Calibração do motor (🔴 no `/params`)
- [ ] `comercial.originacao_max_mes = 10` — contratos/mês de um Assessor 100%
      comercial. É extrapolação linear do DRE; precisa de sanidade da operação.
- [ ] `carteira.cap_ativos_parcial = 8` — teto com dedicação parcial
- [ ] Thresholds do termômetro (reserva, payback, meta)

### Produto
- [ ] Taxa de manutenção anual do Selo — não entra no DRE hoje
- [ ] Crédito do upgrade: R$ 20K integral (deck diz integral; doc deixa em aberto)
- [ ] Churn/renovação do Executar além dos 6 meses do contrato

### Divergências abertas nos materiais
- [ ] Premissa "15 ativos no M12 = 8 Saber + 7 Executar" não bate com a planilha
      (no M12 do Base são 4 Saber novos + 11 Executar ativos)
- [ ] "12x R$ 1.197" na aba de premissas vs. "12x R$ 1.700" no deck — usei o deck

### Escopo futuro
- [ ] Exportação (o simulador da franquia usa `pptxgenjs`)
- [ ] Simulação do lado da matriz
- [ ] Os 3 caminhos pós-12 meses
