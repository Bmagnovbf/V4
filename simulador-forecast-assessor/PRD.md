# PRD — Simulador de Forecast para Assessor V4
**V4 Company | Versão 1.1 | Setembro/2026**
**Status: no ar em https://simulador-assessor.vercel.app**

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
matriz aloca um pace fixo de 1–2 clientes/mês       → Fonte 1 · Alocação
network + % comercial → vendas próprias
  → o que couber na capacidade ele opera            → Fonte 2 · Self-sourced
  → o que exceder ele repassa e recebe o CAC        → Fonte 3 · Originação

→ receita por produto × split da fonte
→ (−) Simples 6%, CSP, freelas + ferramentas
→ resultado do negócio · remuneração total · caixa → breakeven e payback
```

### Os dois tetos

Operador e comercial esbarram em limites diferentes, e é o perfil que decide
qual dos dois morde:

- **Operador:** até **13 projetos ativos**. Acima de `pct_operacional_ref`
  (55%) a capacidade é cheia; abaixo, cai proporcional. A matriz para de alocar
  ao atingir o teto; ele pode passar disso vendendo por conta própria, até 1,2×.
- **Comercial:** não tem teto operacional, tem teto de vendas. Um closer no
  talo toca **38 calls novas/mês** e converte **20%** de reunião realizada em
  venda → **7,6 vendas/mês** a 100% comercial e rede média, já rampado no M12.

Perfil variando, rede média:

| Perfil | Ativos M12 | Fonte 3 | Remuneração | Resultado | Líquido ano 1 |
|---|---|---|---|---|---|
| 20% comercial | 7 | – | R$ 17.873 | R$ 9.348 | R$ 61.893 |
| 40% comercial | 11 | – | R$ 31.759 | R$ 21.556 | R$ 120.093 |
| 50% comercial | 13 | – | R$ 38.336 | R$ 28.204 | R$ 149.193 |
| 60% comercial | 10 | 22% | R$ 34.329 | R$ 23.726 | R$ 148.207 |
| 70% comercial | 8 | 35% | R$ 31.080 | R$ 22.080 | R$ 139.877 |
| 80% comercial | 6 | 36% | R$ 30.767 | R$ 23.767 | R$ 143.669 |
| 100% comercial | 0 | 100% | R$ 18.523 | R$ 18.523 | R$ 88.596 |

A Fonte 3 não é receita comum: no geral a carteira vem da matriz e de outras
unidades, e o cliente que o Assessor traz ele quer operar. Ela só liga acima de
~55% comercial, quando a capacidade de operar já caiu o suficiente para o que
ele vende não caber.

### O efeito da rede

Rede fixa em 35% comercial:

| Rede | Self | Alocação | Remuneração | Horas | Líquido ano 1 |
|---|---|---|---|---|---|
| Baixa | 58% | 42% | R$ 18.014 | 152h | R$ 60.261 |
| Média | 72% | 28% | R$ 28.472 | 206h | R$ 107.673 |
| Alta | **80%** | **20%** | R$ 36.036 | 250h | R$ 149.193 |

A rede alta chega ao 80/20 que o produto persegue, porque a Fonte 2 paga 80%
contra os 30–35% da alocação.

### O CSP é remuneração, não desembolso

Quem entrega é o próprio Assessor, então o CSP é o preço da hora dele, não
dinheiro que sai do bolso.

```
Custo de Serviço Prestado (CSP)      ← pagamento das horas dele
(−) Freelas + ferramentas            ← desembolso: overhead + CSP terceirizado
(=) Resultado do negócio             ← a margem, o "dividendo"
Remuneração Total = CSP + Resultado  ← o que fica com ele
```

**Remuneração Total** responde "quanto eu ganho"; **Resultado do negócio**
responde "isso é um negócio ou um autoemprego bem pago".

Acima de **190h/mês** ele não dá conta sozinho: o CSP das horas excedentes vira
freelancer, sai da Remuneração Total e entra na linha de freelas. É o que dá
consequência econômica ao excesso, sem trava artificial — crescer além da
própria capacidade continua valendo a pena, só que com margem menor.

### Achado: a Fonte 3 paga bem menos que operar

Comparando o mesmo contrato nas duas pontas:

| | Operando (Fonte 2) | Só originando (Fonte 3) | Razão |
|---|---|---|---|
| Saber | R$ 9.600 − R$ 1.500 CSP = **R$ 8.100** | **R$ 1.800** | 4,5× |
| Executar (6 meses) | R$ 16.800 − R$ 6.000 CSP = **R$ 10.800** | **R$ 7.000** | 1,5× |

É por isso que a remuneração não cresce monotonicamente com o % comercial. Se a
BU quiser que o caminho comercial seja tão atrativo quanto o operacional, o
ajuste é no CAC (hoje 15% do Saber) ou no teto de vendas — não no motor.

### Validação
`test_dre.mjs` compara a saída com os dois cenários da planilha e verifica que
nenhum contrato é fracionário em 126 combinações × 12 meses. Rodar com
`npx tsc -p tsconfig.test.json && node test_dre.mjs`.

Base reproduz em **−0,1%** no líquido do ano; Upside em **−4,5%**.

---

## 5. Inputs do candidato

Só vira input o que o candidato sabe sobre si mesmo. Benchmark da rede
(tickets, splits, CSP, horas, imposto, duração do Executar, pace da matriz)
fica em `src/config/params.ts`.

| Input | Formato | O que altera |
|---|---|---|
| Meta de faturamento no M12 | slider R$ 5–40K | Receita recebida mensal — termômetro: faturamento vs. meta |
| Retirada mínima mensal | slider R$ 2–15K | Define a reserva necessária |
| Perfil operacional × comercial | slider 0–100% | Mix entre as 3 fontes — a alavanca central |
| Rede de relacionamento | baixa / média / alta | Multiplica as vendas próprias — empurra a carteira para a Fonte 2 |
| Dedicação | integral / parcial | Teto de projetos ativos (13 ou 8) |
| Reserva de capital de giro | slider R$ 0–150K | Termômetro: cobre a retirada até a remuneração alcançá-la |

A **forma de pagamento da entrada não é input**: a matriz aloca no mesmo pace
independentemente, então o campo não alterava a projeção.

---

## 6. Dashboard

- Termômetro em dois eixos: reserva vs. retirada mínima e faturamento vs. meta.
  O payback é KPI de apoio, não critério — com a entrada baixa ele fica entre
  M4 e M6 em qualquer cenário
- KPIs: remuneração total, resultado do negócio, horas de entrega, projetos no
  M12, payback da entrada, reserva necessária, capital total
- Cards das 3 fontes com contagem de contratos e share da receita
- Área empilhada: receita por fonte, 12 meses
- Barras + linha: renda mensal e caixa acumulado, com meta e retirada marcadas
- Tabela do DRE completo, linha a linha, com coluna de ano

---

## 7. Pendências

### Calibração (🔴 no `/params`)
Sem lastro empírico — esta será a primeira turma, não há assessores em operação
para medir. Ficam como estimativa até a turma rodar.

- [ ] `network.fator` (0,5 / 1,0 / 1,5) — quanto rede alta vende a mais que média
- [ ] `carteira.tolerancia_self = 1,2×` — até onde ele rompe o cap por conta própria
- [ ] `carteira.cap_ativos_parcial = 8` — teto com dedicação parcial
- [ ] `carteira.pct_operacional_ref = 55%` — onde a capacidade começa a cair
- [ ] Thresholds do termômetro (reserva, payback, meta)

### Produto
- [ ] Taxa de manutenção anual do Selo — não entra no DRE hoje
- [ ] Churn/renovação do Executar além dos 6 meses de contrato
- [ ] Mix dinâmico por retirada — analisado e adiado (ver abaixo)

### Analisado e adiado
**Priorizar Saber quando a retirada é alta.** Simulado em set/2026. Melhora o
caixa do primeiro semestre em 43% e reduz a reserva necessária, mas o ganho no
ano 1 é artefato de horizonte truncado: contando o backlog de Executar que cai
depois do M12, o mix 70/30 é o melhor dos quatro testados. Reavaliar só com KPI
de base recorrente e backlog na tela, senão o candidato veria o cenário pior
como se fosse o melhor.

---

## 8. Fora do escopo

- **Exportação em PDF ou PPT.** Decisão de set/2026: o simulador existe para o
  candidato entender a dinâmica e as correlações durante a call, não para virar
  material que ele leva embora. O foco seguinte é capacidade operacional.
- Produtos **Ter** e **Potencializar**
- **Override do padrinho** no cálculo do Assessor
- Simulação do lado da matriz
- Os 3 caminhos pós-12 meses
- Autenticação
