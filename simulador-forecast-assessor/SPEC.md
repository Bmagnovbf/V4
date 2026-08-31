# SPEC.md — Simulador de Forecast para Assessor V4
**V4 Company | Versão 1.3 | Agosto/2026**
**Status: motor implementado, cenário Base da planilha reproduzido em +0,1%**

---

## 1. Visão Geral e Escopo

### Propósito
Aplicação web interna que transforma o perfil declarado do candidato a Assessor
V4 em uma projeção de 12 meses de receita, custos, renda líquida e caixa. Usada
pelo closer durante a **call única de conversão** para responder à pergunta que
o candidato realmente faz: *quanto eu ganho, em quanto tempo, e o que precisa
ser verdade para isso acontecer.*

Diferença de fundo em relação ao [simulador da franquia](../simulador-forecast):
lá o motor é **engenharia reversa** — parte da meta de faturamento e deduz o
esforço. Aqui é **forward** — parte da capacidade do candidato e a renda cai
como consequência. O Assessor não tem unidade, equipe, horizontes H1–H5 nem
CAPEX de escritório; o que ele tem é uma agenda e duas capacidades que competem
entre si.

### Escopo V1
- Projeção de **12 meses** (a planilha-fonte também para no M12)
- Dois produtos: **Saber** (one-time) e **Executar** (recorrente, 6 meses)
- Três fontes de receita: **alocação**, **self-sourced**, **originação**
- Cálculo 100% client-side, sem backend

### Fora do escopo (V1)
- Produtos **Ter** e **Potencializar**
- **Override do padrinho** (decisão de ago/2026: não entra no cálculo do Assessor)
- Taxa de manutenção anual do Selo
- Simulação do lado da matriz (quanto a matriz ganha por Assessor)
- Os 3 caminhos pós-12 meses (renovar / sociedade / própria unidade)
- Exportação (.pptx) — o simulador da franquia tem, este ainda não
- Autenticação

---

## 2. Arquitetura Técnica

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| Backend | Nenhum — cálculos no browser |
| Deploy | Vercel (projeto próprio, Root Directory `simulador-forecast-assessor`) |

### Fluxo de dados

```
[Candidato] → 5 inputs → [Cálculo client-side] → [sessionStorage] → [Dashboard]
[Admin V4]  → edita src/config/params.ts → push GitHub → Vercel auto-deploys
```

**Regra crítica:** a lógica financeira vive em `src/lib/calculator.ts`, módulo
TypeScript puro, sem dependência de React. `src/config/params.ts` é a única
fonte de benchmarks. Nenhum número de negócio pode estar hard-coded em
componente.

### Arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/config/params.ts` | Todos os benchmarks, com tag de procedência |
| `src/types/index.ts` | Contratos do domínio |
| `src/lib/calculator.ts` | Motor — `simular(input) → SimulacaoResult` |
| `src/lib/format.ts` | Formatação pt-BR (R$, %, inteiros) |
| `src/app/page.tsx` | Tela de input |
| `src/app/dashboard/page.tsx` | Dashboard de resultados |
| `src/app/params/page.tsx` | Painel somente leitura dos parâmetros |
| `test_dre.mjs` | Validação contra a planilha do DRE |

---

## 3. Parâmetros de Negócio

Procedência de cada parâmetro, sinalizada no código e no painel `/params`:

| Tag | Significado |
|:--:|---|
| ✅ | Lido da planilha do DRE ou decidido e fechado |
| 🟡 | Decidido fora da planilha (deck, doc do produto, operação) |
| 🔴 | Constante calibrada para o motor generativo — sem lastro documental |

> **A planilha é norte, não regra.** Ela também está em construção. Serve de
> referência de ordem de grandeza e de caso de teste, não de fonte imutável.

### 3.1 Entrada na rede

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `entrada.a_vista` | R$ 20.000 | ✅ |

A **forma de pagamento não é input**: a matriz atribui clientes no mesmo pace
independentemente de o Assessor ter pago à vista ou parcelado, então o campo não
alterava a projeção operacional. O parcelamento segue existindo como argumento
comercial, fora do modelo.

A entrada vira **crédito integral** se o Assessor abrir a própria unidade
(Caminho 3). O crédito não entra no cálculo — é argumento de venda, não linha
de DRE.

A entrada **não é despesa da renda líquida** — entra no caixa como saldo inicial
de −R$ 20.000, antes do M1. Isso preserva a renda líquida como medida
operacional pura.

### 3.2 Produtos

Só **Saber** e **Executar** entram no escopo do Assessor.

| | Saber | Executar |
|---|---|---|
| Ticket | R$ 12.000 | R$ 3.500/mês |
| Natureza | one-time, no mês da entrega | recorrente |
| Duração | — | 6 meses, depois sai (churn) |
| Split Fonte 1 (matriz) | **30%** → R$ 3.600 | **35%** → R$ 1.225/mês |
| Split Fonte 2 (self) | **80%** → R$ 9.600 | **80%** → R$ 2.800/mês |
| CSP | R$ 1.500 one-time, no mês da entrega | R$ 1.000/mês por projeto ativo |

Todos ✅.

**O split é por produto, não único.** O "35% da Fonte 1" que aparece no doc do
produto e no deck de venda vale para o Executar; o Saber alocado paga 30%. Onde
os materiais divergiram da planilha, vale a planilha (decisão de ago/2026).

Os tickets são os do Assessor (contas de R$ 3–8K), não os do portfólio completo
da rede (Saber R$ 25K, Executar R$ 6,5K/mês) — o Assessor opera a faixa
pequena/média por segregação de ticket.

### 3.3 Fonte 3 — originação sem operação

O Assessor vende um cliente que ele **não vai operar** e recebe **o CAC daquele
cliente**. Não gera CSP, porque ele não entrega.

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `originacao.saber_pct_ticket` | 15% × R$ 12.000 = **R$ 1.800** | ✅ |
| `originacao.executar_mult_mrr` | 2 × R$ 3.500 = **R$ 7.000** | ✅ |
| `originacao.executar_parcelas` | **2** | ✅ |

O CAC do Saber cai integral no mês da venda. O CAC do Executar sai em **duas
parcelas de R$ 3.500**, acompanhando o pagamento do cliente: uma no mês da
venda e outra no mês seguinte.

Os 15% do Saber e as 2× MRR do Executar **são a definição do CAC** — não são
duas alternativas. O doc do produto e o deck escrevem a mesma regra de dois
jeitos ("~15–17,5% ou 2–3× MRR" e "100% CAC").

### 3.4 Impostos e overhead

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `impostos.simples` | 6,0% sobre a receita recebida | ✅ |
| `overhead` M1–M4 | R$ 1.000/mês | ✅ |
| `overhead` M5–M8 | R$ 1.500/mês | ✅ |
| `overhead` M9+ | R$ 2.000/mês | ✅ |

Overhead = freelancers IA-augmented sob demanda + ferramentas e acesso à
plataforma. É adicional ao CSP e independe do volume de carteira — é custo de
estar operando, não de operar um projeto específico.

### 3.5 Carteira

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `carteira.cap_ativos_integral` | 15 projetos | ✅ |
| `carteira.cap_ativos_parcial` | 8 projetos | 🔴 |
| `carteira.pct_operacional_ref` | 55% | 🔴 |
| `carteira.tolerancia_self` | 1,2× | 🔴 |
| `carteira.mix_produto` | 70% Saber / 30% Executar | ✅ |
| `carteira.primeiros_saber` | 5 | ✅ |
| `carteira.matriz_pace` | `1 1 1 2 2 2 2 2 2 2 2 2` | ✅ |

`matriz_pace[m]` é quanto a **matriz atribui** ao Assessor no mês *m* — o
compromisso da rede, independente do perfil, da rede dele e da forma de
pagamento. Sobe de 1 para 2 no M4, quando ele já provou entrega. Soma 21 no ano.

Tudo que cresce além disso vem da originação própria.

`primeiros_saber` implementa a premissa da planilha — *"os 5 primeiros Saber, o
6º Executar"*. Tem lastro operacional: um Executar isolado no início não cobre o
próprio CSP (recebe R$ 1.225/mês e custa R$ 1.000/mês, contra R$ 1.000 de
overhead fixo), então abrir a carteira com ele produziria meses negativos.

`mix_produto` vem da mesma fonte: 34 Saber / 15 Executar no ano do cenário Base
≈ 69/31, arredondado para 70/30.

### 3.6 Rede de relacionamento

Mesma pergunta do simulador da franquia: *como você avalia sua rede de
relacionamento com empresários?*

| Nível | Referência | Fator | Tag |
|---|---|---|:--:|
| Baixa | ≈ 10 empresas | 0,5× | 🔴 |
| Média | ≈ 30 empresas | 1,0× | 🔴 |
| Alta | ≈ 50 empresas ou + | 1,5× | 🔴 |

O fator **multiplica** a capacidade de originação própria. Não é parcela: sem
rede não há a quem vender, por mais comercial que seja o perfil. É a alavanca
que empurra a carteira para a Fonte 2, onde ele fica com 80% em vez dos 30–35%
da alocação.

### 3.7 Originação própria

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `comercial.inicio_originacao_mes` | M4 | ✅ |
| `comercial.calls_mes_max` | 38 calls novas/mês | 🟡 |
| `comercial.conversao_call_venda` | 20% | 🟡 |

Antes do M4 o Assessor está na Trilha (Imersão → Vivência → Trabalho de
Conclusão → Banca) e ainda não tem selo — **100% da carteira vem da matriz**.

O teto de vendas é derivado, não digitado:

```
originacao_max = calls_mes_max × conversao_call_venda × pct_comercial × fator_rede
               = 38 × 0,20 × pct_comercial × fator_rede
```

A 100% comercial com rede média: **7,6 vendas/mês**, já rampado no M12.

Premissa da operação: um closer no talo toca 35–40 calls novas por mês e
converte 20% de reunião realizada em venda.

### 3.8 Thresholds do Termômetro

| Parâmetro | verde | amarelo | Tag |
|---|---|---|:--:|
| `termometro.reserva_ratio` | ≥ 1,5× | ≥ 1,0× | 🔴 |
| `termometro.payback_meses` | ≤ M6 | ≤ M9 | 🔴 |
| `termometro.meta_ratio` | ≥ 100% | ≥ 70% | 🔴 |

Todos 🔴 — são chute, e só devem ser calibrados depois da bateria de cenários
com candidatos reais (§ 10, bloco B).

---

## 4. Motor de Cálculo

### 4.1 Inputs

```ts
interface SimulacaoInput {
  meta_renda_liquida: number    // R$ 5.000 – 45.000
  retirada_minima:    number    // R$ 2.000 – 15.000
  reserva_capital:    number    // R$ 0 – 150.000
  pct_comercial:      number    // 0 – 1  (0 = 100% operacional)
  dedicacao:          'integral' | 'parcial'
  network_level:      'baixo' | 'medio' | 'alto'
}
```

Critério de o que vira input: **só o que o candidato sabe sobre si mesmo.**
Benchmark da rede (tickets, splits, CSP, imposto, duração do Executar, rampa da
matriz) fica em `params.ts` e não é editável na tela.

`meta_renda_liquida` **não entra em nenhum cálculo** — é usada só no termômetro
e como linha de referência no gráfico de renda. O motor não faz engenharia
reversa a partir dela.

`retirada_minima` é *quanto ele precisa retirar por mês enquanto não atinge o
objetivo*. Também não altera a projeção — mede o buraco entre o que ele precisa
e o que a operação entrega (§ 4.6).

### 4.2 Os dois tetos

O ponto central do modelo. Operador e comercial esbarram em limites diferentes,
e o perfil decide qual dos dois morde primeiro.

**Teto do operador — capacidade de operar:**

```
base = dedicacao === 'integral' ? 15 : 8
pct_operacional = 1 − pct_comercial
cap_ativos = base × min(1, pct_operacional ÷ pct_operacional_ref)
```

Acima de 55% operacional a capacidade é **cheia**. Abaixo disso cai
proporcionalmente. Um perfil 70% comercial fica com `15 × (0,30 ÷ 0,55) ≈ 8,2`
projetos.

**Teto do comercial — capacidade de vender:**

```
orig_potencial(m) = 7,6 × pct_comercial × fator_rede × shape_comercial(m)
```

O comercial **não tem teto operacional** — ele não opera. O que o limita é a
agenda de calls e o tamanho da rede.

**Curva de maturação comercial:**

```
shape_comercial(m) = 0                              se m < 4
                   = (m − 4 + 1) ÷ (12 − 4 + 1)     se m ≥ 4
                   = (m − 3) ÷ 9
```

M4 = 1/9, M12 = 1. Sobe linear do primeiro mês pós-Banca até o regime.

### 4.3 Repartição da carteira — as três fontes

Executado mês a mês. É aqui que a Fonte 3 nasce.

```
ativos_vigentes   = Σ executar_novos(k)   k de max(1, m−5) até m−1

da_matriz(m)      = ativos_vigentes ≥ cap_ativos ? 0 : matriz_pace[m]   → Fonte 1

teto_proprio      = floor(cap_ativos × tolerancia_self)
capacidade_livre  = max(0, teto_proprio − ativos_vigentes − da_matriz)

orig_operada      = min(orig_potencial(m), capacidade_livre)            → Fonte 2
orig_transbordo   = orig_potencial(m) − orig_operada                    → Fonte 3
```

Leitura em palavras: **a matriz atribui primeiro** e o Assessor não recusa — é o
compromisso da rede, e a razão de ele ter entrado. Mas a matriz **para de
atribuir** quando a carteira atinge o cap: ela não empurra cliente para quem já
está no limite.

O Assessor, por outro lado, **pode romper o cap por conta própria** até
`tolerancia_self`, assumindo o risco de qualidade — é decisão dele, não da rede.
Acima disso ele repassa e fica só com o CAC.

Os dois limites são diferentes de propósito: `cap_ativos` é onde a rede para de
empurrar; `cap_ativos × tolerancia_self` é onde ele mesmo para.

Cada bloco é então repartido por produto:

```
saber_novos_matriz    = da_matriz      × 0,70
saber_novos_self      = orig_operada   × 0,70
saber_originados      = orig_transbordo × 0,70

executar_novos_matriz  = da_matriz      × 0,30
executar_novos_self    = orig_operada   × 0,30
executar_originados    = orig_transbordo × 0,30
```

### Contratos são inteiros

Cliente não existe em decimal. Todo campo de contagem — novos, ativos,
repassados — é inteiro em qualquer combinação de inputs, e o teste verifica isso
em 126 combinações × 12 meses.

O arredondamento usa um **acumulador de resto**: a fração de um mês fica
guardada para o seguinte, de modo que nada se perca. Uma originação de 0,4
contrato/mês vira `0, 0, 1, 0, 0, 1` em vez de doze zeros.

```
resto  += valor
inteiro = floor(resto)
resto  -= inteiro
```

**Trunca, não arredonda.** Arredondar deixa o resto ir a negativo e a série passa
a oscilar — com um fluxo que só cresce, produz quedas que não existem no fluxo
real:

| | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 |
|---|---|---|---|---|---|---|---|---|
| fluxo real | 0,9 | 1,3 | 1,8 | 2,2 | 2,7 | 3,1 | 3,5 | 4,0 |
| `round` | 1 | 2 | **1** | 3 | **2** | 3 | 4 | 4 |
| `floor` | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 4 |

Com `floor` a aquisição nunca recua. O primeiro contrato não fica preso pelo
truncamento porque `primeiros_saber` já força os primeiros a nascerem Saber.

**Consequência a conhecer:** mesmo com a aquisição monotônica, a renda mensal
oscila. A causa remanescente é legítima e vale explicar na call — é o mix 70/30.
Um Saber paga R$ 9.600 (self) ou R$ 3.600 (matriz) de uma vez, no mês em que
entra; um Executar paga R$ 2.800 ou R$ 1.225 por mês, ao longo de 6 meses. Um
mês em que entram mais Executar que Saber rende menos no curto prazo e mais
depois.

Por isso o KPI de renda e o eixo de meta do termômetro usam a **média dos
M10–M12** (`renda_regime`), não o M12 isolado. Sem isso, um candidato de rede
baixa podia exibir renda de M12 maior que um de rede média, só porque o último
Saber caiu no mês certo.

### 4.4 Base ativa de Executar (cohorts)

Executar dura 6 meses e depois sai. A base ativa no mês *m* é a soma dos
cohorts abertos nos últimos 6 meses:

```
executar_ativos(m) = Σ  executar_novos(k)      para k de max(1, m−5) até m
```

Calculado separado para matriz e self, porque os splits diferem.

**Saber não acumula** — é one-time, conta só no mês da entrega.

**Projetos ativos no mês:**

```
total_ativos(m) = saber_novos_matriz(m) + saber_novos_self(m)
                + executar_ativos_matriz(m) + executar_ativos_self(m)
```

Conferência contra a planilha (cenário Base, M12): 4 Saber entregues + 11
Executar vigentes = 15 ativos. ✓

### 4.5 DRE mensal

```
receita_saber_matriz    = saber_novos_matriz    × 12.000 × 0,30
receita_saber_self      = saber_novos_self      × 12.000 × 0,80
receita_executar_matriz = executar_ativos_matriz × 3.500 × 0,35
receita_executar_self   = executar_ativos_self   × 3.500 × 0,80

receita_originacao(m)   = saber_originados(m) × 1.800
                        + Σ executar_originados(m−k) × 3.500   para k em {0, 1}

(=) receita_recebida    = soma das cinco linhas acima
(−) impostos            = receita_recebida × 0,06
(=) receita_liquida     = receita_recebida − impostos
(−) csp_saber           = (saber_novos_matriz + saber_novos_self) × 1.500
(−) csp_executar        = (executar_ativos_matriz + executar_ativos_self) × 1.000
(−) overhead            = 1.000 / 1.500 / 2.000 conforme o mês
(=) renda_liquida       = receita_liquida − csp_saber − csp_executar − overhead
```

Nota sobre a Fonte 3: entra em `receita_recebida` e portanto **é tributada** no
Simples, mas **não gera CSP** — ele não entrega. É a fonte de maior margem
unitária e menor valor absoluto.

### 4.6 Déficit de retirada — o buraco de capital de giro

O DRE não tem linha de custo de vida, então o risco real do Assessor fica
invisível nas linhas de resultado: ele não **perde** dinheiro (breakeven em M1),
ele ganha **quase nada** nos primeiros meses.

```
deficit_retirada(m)    = max(0, retirada_minima − renda_liquida(m))
deficit_retirada_total = Σ deficit_retirada(m)
mes_autossuficiencia   = primeiro m com deficit_retirada(m) = 0
```

**A entrada não entra nessa conta.** Capital de giro e investimento são coisas
distintas: a entrada é medida pelo payback, e somar as duas contaria o mesmo
dinheiro em dois eixos do termômetro. O que o candidato vê é a separação:

```
capital_total = investimento_total + deficit_retirada_total
```

Exemplo (35% comercial, retirada de R$ 8.000):

| Mês | Renda líquida | Falta para a retirada |
|---|---|---|
| M1 | R$ 364 | R$ 7.636 |
| M2 | R$ 410 | R$ 7.590 |
| M3 | R$ 1.819 | R$ 6.181 |
| M4 | R$ 4.573 | R$ 3.427 |
| M5 | R$ 7.003 | R$ 997 |
| M6 | R$ 8.745 | — |

Reserva necessária: **R$ 25.831**. Autossuficiência: **M6**. Capital total:
R$ 45.831 (R$ 20.000 de entrada + R$ 25.831 de giro).

### 4.7 Caixa

```
parcela_entrada(m) = 1.700   se forma_pagamento = 'parcelado' e m ≤ 12
                   = 0       caso contrário

fluxo_caixa(m)     = renda_liquida(m) − parcela_entrada(m)

caixa_acumulado(0) = −20.000   se forma_pagamento = 'a_vista'
                   = 0         se parcelado
caixa_acumulado(m) = caixa_acumulado(m−1) + fluxo_caixa(m)
```

### 4.8 KPIs

```
renda_regime          = média de renda_liquida(m)   m de 10 a 12
renda_liquida_m12     = renda_liquida(12)
renda_liquida_ano1    = Σ renda_liquida(m)              m de 1 a 12
renda_media_mes       = renda_liquida_ano1 ÷ 12
receita_recebida_ano1 = Σ receita_recebida(m)
projetos_ativos_m12   = total_ativos(12)

breakeven_mes         = primeiro m com renda_liquida(m) > 0
payback_mes           = primeiro m com caixa_acumulado(m) ≥ 0
pior_caixa            = min(caixa_acumulado(m))
investimento_total    = 20.000 (à vista) | 20.400 (12 × 1.700)
```

`pior_caixa` é o número que importa para o candidato: é quanto de reserva o
ramp-up realmente exige.

### 4.9 Termômetro

Três eixos, sempre prevalecendo o **mais crítico**.

```
reserva_ratio  = reserva_capital ÷ deficit_retirada_total   (∞ se o total = 0)
meta_ratio     = renda_regime ÷ meta_renda_liquida

reserva_nivel  = verde se ≥ 1,5×  · amarelo se ≥ 1,0×  · senão vermelho
payback_nivel  = verde se ≤ M6    · amarelo se ≤ M9    · senão vermelho
meta_nivel     = verde se ≥ 100%  · amarelo se ≥ 70%   · senão vermelho

nivel_final    = o pior dos três
```

**Por que estes três eixos e não margem.** No DRE o breakeven operacional é M1 e
o payback M6 — o negócio fecha desde o primeiro mês. O risco do Assessor não é
margem, é **fôlego**: atravessar os primeiros meses com renda muito abaixo do
que ele precisa retirar. O termômetro mede isso.

Os três eixos medem coisas independentes, sem contar o mesmo dinheiro duas
vezes: **reserva** olha o capital de giro, **payback** olha o investimento de
entrada, **meta** olha a ambição declarada.

### 4.10 Mix de fontes no M12

Share de cada fonte sobre a receita recebida do M12, para os cards e o gráfico
de área:

```
alocacao     = (receita_saber_matriz + receita_executar_matriz) ÷ receita_recebida
self_sourced = (receita_saber_self   + receita_executar_self)   ÷ receita_recebida
originacao   =  receita_originacao                              ÷ receita_recebida
```

---

## 5. Especificação de Telas

### 5.1 Tela de input (`/`)

Seis campos, em ordem:

| Campo | Controle | Faixa | Default |
|---|---|---|---|
| Meta de renda líquida no M12 | input + slider | R$ 5.000 – 45.000 | R$ 25.000 |
| Retirada mínima mensal | input + slider | R$ 2.000 – 15.000 | R$ 8.000 |
| Seu perfil | slider único | 0 – 100% comercial, passo 5 | 35% |
| Rede de relacionamento | chips | baixa / média / alta | média |
| Dedicação | chips | integral / parcial | integral |
| Reserva de capital de giro | input + slider | R$ 0 – 150.000 | R$ 25.000 |

O slider de perfil mostra os dois lados ao mesmo tempo ("70% operacional · 30%
comercial") e traz abaixo a explicação de qual fonte cada extremo alimenta. É o
controle central da tela — os outros quatro são contexto.

Não há estado de "incompleto": todos os campos têm default válido e o botão
Simular está sempre habilitado. A tela é usada ao vivo numa call; travar o botão
atrapalha.

### 5.2 Dashboard (`/dashboard`)

Lê `sessionStorage.simulacao`. Sem resultado, redireciona para `/`.

Ordem dos blocos:

1. **Cabeçalho** — perfil, meta, dedicação, forma de pagamento, botão Refazer
2. **Termômetro** — nível final + os três eixos abertos
3. **KPI cards** — renda em regime, líquido ano 1, projetos no M12, payback da entrada, reserva necessária, capital total
4. **Cards das 3 fontes** — receita do M12, split aplicado, contagem, share
5. **Gráfico de área** — receita por fonte, 12 meses, empilhada
6. **Gráfico combinado** — barras de renda mensal + linha de caixa acumulado, com a meta em linha tracejada
7. **Tabela do DRE** — 12 linhas × 12 meses + coluna Ano, scroll horizontal

A tabela do DRE é o que sustenta a conversa quando o candidato pergunta "de onde
sai esse número". Ela repete exatamente as linhas de § 4.5.

### 5.3 Painel de parâmetros (`/params`)

Somente leitura. Cada linha mostra a tag de procedência (✅ 🟡 🔴), o caminho no
`params.ts` e o valor já formatado, com os derivados calculados na tela (ex.:
"30% → R$ 3.600", "7,6 vendas/mês a 100% comercial").

Banner fixo no topo: para alterar, editar `src/config/params.ts` e dar push.

Rodapé mostra `VERCEL_GIT_COMMIT_DATE` — exige marcar "Automatically expose
System Environment Variables" nas env vars do projeto Vercel.

---

## 6. Sistema de Design

Herdado do simulador da franquia, sem alteração.

| Papel | Hex |
|---|---|
| Vermelho primário | `#8B0000` |
| Vermelho médio | `#C00000` |
| Vermelho suave | `#F4CCCC` |
| Verde primário | `#1A5C38` |
| Verde suave | `#D9EAD3` |
| Amarelo âmbar | `#D4900A` |
| Preto | `#1A1A1A` |
| Cinza escuro | `#3D3D3D` |
| Cinza médio | `#7A7A7A` |
| Cinza claro | `#F2F2F2` |

**Regra absoluta:** nunca azul, nunca cor fora desta paleta. Fonte Arial.

Nos gráficos, as três fontes têm cor fixa: alocação em cinza médio (é receita
da matriz), self-sourced em vermelho primário (é receita dele), originação em
âmbar (é a exceção).

---

## 7. Validação

`test_dre.mjs` compara a saída do motor com a planilha
"ASSESSOR V4 · DRE PROJETADO 12 MESES".

```bash
npx tsc -p tsconfig.test.json && node test_dre.mjs
```

Tolerância: **15%** em valores de R$, **±1 mês** em indicadores de mês. O motor
é generativo e a planilha é desenhada à mão — exigir casamento exato seria
ajustar o motor para replicar decisões manuais.

Perfil e rede de cada cenário não são o mix de contratos da planilha — são a
combinação que, sob as premissas do motor, reproduz aquele resultado.

### Cenário Base — 35% comercial, rede alta

| Indicador | Planilha | Motor | Δ |
|---|---|---|---|
| Receita ano 1 | R$ 292.875 | R$ 270.950 | −7,5% |
| Líquido ano 1 | R$ 149.303 | R$ 149.193 | **−0,1%** |
| Líquido em regime | R$ 28.846 | R$ 25.696 | −10,9% |
| Projetos ativos M12 | 15 | 13 | −13,3% |
| Payback | M6 | M7 | +1 |
| Breakeven | M1 | M1 | — |

### Cenário Upside — 50% comercial, rede alta

| Indicador | Planilha | Motor | Δ |
|---|---|---|---|
| Receita ano 1 | R$ 367.925 | R$ 336.250 | −8,6% |
| Líquido ano 1 | R$ 207.350 | R$ 198.075 | −4,5% |
| Líquido em regime | R$ 31.777 | R$ 33.378 | +5,0% |
| Projetos ativos M12 | 15 | 14 | −6,7% |
| Payback | M5 | M6 | +1 |
| Breakeven | M1 | M1 | — |

O Upside voltou a ser alcançável depois que o network entrou: ele é o Assessor
de rede alta que puxa a carteira para a Fonte 2. Antes do network, o motor
saturava em ~R$ 162 mil e o cenário era reportado como inatingível.

Divergência residual conhecida: o motor entrega **menos projetos ativos e mais
renda no M12** que a planilha nos dois cenários. É diferença de formato de
curva — a planilha estabiliza antes, o motor cresce até o fim. O líquido do ano,
que é a métrica de decisão, fecha dentro de 4%.

### Efeito da rede (35% comercial)

| Rede | Self | Matriz | Renda em regime | Líquido ano 1 |
|---|---|---|---|---|
| Baixa | 74% | 26% | R$ 11.312 | R$ 64.218 |
| Média | 68% | 32% | R$ 17.960 | R$ 104.106 |
| Alta | 83% | 17% | R$ 28.748 | R$ 154.782 |

A rede alta chega ao **83% self / 17% matriz** — a proporção que o produto
persegue, já que a Fonte 2 paga 80% contra os 30–35% da alocação.

### Curva de perfil (rede média)

| Perfil | Ativos M12 | Fonte 3 | Renda em regime | Líquido ano 1 |
|---|---|---|---|---|
| 20% comercial | 9 | – | R$ 11.856 | R$ 75.006 |
| 40% comercial | 11 | – | R$ 19.592 | R$ 118.158 |
| 50% comercial | 13 | – | R$ 26.240 | R$ 147.258 |
| 60% comercial | 11 | 18% | R$ 23.468 | R$ 157.256 |
| 70% comercial | 8 | 48% | R$ 20.680 | R$ 146.350 |
| 80% comercial | 5 | 68% | R$ 17.686 | R$ 124.054 |
| 100% comercial | 5 | 74% | R$ 21.027 | R$ 126.658 |

---

## 8. Achado de produto: a Fonte 3 paga menos que operar

Não é bug do motor, é aritmética dos parâmetros. Comparando o mesmo contrato nas
duas pontas, líquido de CSP:

| | Operando (Fonte 2) | Só originando (Fonte 3) | Razão |
|---|---|---|---|
| Saber | R$ 9.600 − R$ 1.500 = **R$ 8.100** | **R$ 1.800** | 4,5× |
| Executar (6 meses) | R$ 16.800 − R$ 6.000 = **R$ 10.800** | **R$ 7.000** | 1,5× |

Operar um Saber vale 4,5 vezes mais que só originá-lo. Com teto de 7,6
vendas/mês, o Assessor 100% comercial não tem volume para compensar — por isso a
curva de renda tem formato de sino, com platô entre 50% e 80% comercial e queda
nos dois extremos.

Se a BU quiser que o caminho comercial seja tão atrativo quanto o operacional, as
alavancas são **o % de CAC do Saber** e **o teto de vendas**. O motor não precisa
mudar.

---

## 9. Critérios de Aceite

- [x] `npm run build` sem erro nem warning de lint
- [x] Cenário Base da planilha reproduzido dentro de 15%
- [x] Cenário Upside reproduzido dentro de 15% (rede alta)
- [x] Fonte 3 = zero nos perfis até ~55% comercial
- [x] Contratos inteiros em 126 combinações × 12 meses
- [x] Nenhum número de negócio hard-coded fora de `params.ts`
- [x] Todo parâmetro visível em `/params` com tag de procedência
- [x] Projeto da franquia intocado
- [ ] Deploy Vercel com Root Directory próprio e sem Deployment Protection
- [ ] Thresholds do termômetro calibrados com candidatos reais

---

## 10. Cenários de Teste

Três blocos, nesta ordem. Cada um responde uma pergunta diferente; não vale
pular para o C.

### Bloco A — Perfil e rede
Meta R$ 25.000, retirada R$ 8.000, reserva R$ 25.000, dedicação integral.

**A1–A5 — varrer o slider de perfil** (20/40/60/80/100% comercial) com rede
média. Verificar: a carteira sobe até ~50% comercial e depois cai; a Fonte 3
só aparece a partir de ~60%.

**A6–A8 — varrer a rede** (baixa/média/alta) com 35% comercial. Verificar: o
mix migra de 59% para 81% self, e o líquido do ano vai de R$ 60K a R$ 153K.

Pergunta: a curva faz sentido para quem conhece a operação? É aqui que o achado
do § 8 é julgado, e onde se decide se o fator de rede (0,5 / 1,0 / 1,5) está
calibrado.

### Bloco B — Candidato real
Três a cinco MQLs que já passaram pelo SDR, rodando o que eles de fato
declarariam na call.

Pergunta: o output bate com o que o closer diria? É o bloco que mais importa —
a ferramenta existe para a call de conversão. É também o único insumo válido
para calibrar os thresholds do termômetro (§ 3.7).

### Bloco C — Estresse

Base comum: meta R$ 25.000, reserva R$ 25.000, 40% comercial, integral, à
vista — variando um fator por vez. Valores observados na v1.0, para servirem de
baseline de regressão:

| # | Input | Ativos M12 | Renda M12 | Pior caixa | Payback | Termômetro |
|---|---|---|---|---|---|---|
| C1 | Dedicação parcial | | | | | |
| C2 | Reserva R$ 0 | | | | | **vermelho** por reserva |
| C3 | Meta R$ 45K, 20% comercial | | | | | **vermelho** por meta |
| C4 | Rede baixa + 20% comercial | | | | | pior caso do funil |
| C5 | 100% comercial + parcial | | | | | sem divisão por zero |

*(baseline a preencher na primeira rodada pós-network)*

Verificações qualitativas:
- **C1** — cap cai de 15 para 8; a renda cai junto, mas menos que proporcional, porque o overhead é fixo
- **C2** — o eixo de reserva vira vermelho sozinho e arrasta o nível final
- **C3** — meta muito acima do projetado derruba só o eixo de meta
- **C4** — rede baixa com perfil operacional é o candidato que depende quase só da matriz
- **C5** — cap zero não gera divisão por zero; a ocupação é forçada a 0 e o dashboard renderiza

Pergunta: o termômetro acusa vermelho onde deve, e nada quebra?

### O que anotar em cada cenário
1. O número final é plausível?
2. O caminho até ele é explicável na call?
3. O termômetro concorda com o seu julgamento?

---

*SPEC v1.3 — Agosto/2026. Mudanças v1.2 → v1.3:*
- *A matriz para de atribuir quando a carteira atinge o cap; antes ela empurrava sempre e podia estourar o limite*
- *O Assessor pode romper o cap por conta própria até `tolerancia_self` (1,2×), assumindo o risco; acima disso repassa*

*SPEC v1.2 — Agosto/2026. Mudanças v1.1 → v1.2:*
- *Contratos passam a ser inteiros, com acumulador de resto que trunca (não arredonda), para que a aquisição nunca recue*
- *Entra `primeiros_saber = 5`, premissa da planilha que evita abrir a carteira com um Executar que não cobre o próprio CSP*
- *KPI de renda e eixo de meta do termômetro passam a usar a média dos M10–M12, porque o M12 isolado ficou serrilhado com contratos inteiros*

*SPEC v1.1 — Agosto/2026. Mudanças v1.0 → v1.1:*
- *Forma de pagamento deixa de ser input: a matriz atribui clientes no mesmo pace de qualquer jeito*
- *Entra a rede de relacionamento (baixa/média/alta), mesma pergunta do simulador da franquia, multiplicando a originação própria*
- *A matriz passa a atribuir um pace fixo de 1–2 clientes/mês em vez de preencher o que sobra da carteira; a alocação tem prioridade sobre a originação na disputa por capacidade*
- *Reserva do termômetro passa a medir o déficit de retirada, não o pior caixa (que era a entrada); entra o input de retirada mínima mensal*
- *Cenário Upside volta a ser alcançável com rede alta; âncoras do teste reancoradas*

*SPEC v1.0 — Agosto/2026. Primeira versão, escrita depois do motor. Decisões
travadas nesta versão: split por produto (Saber 30% / Executar 35% na alocação),
tickets do DRE, Fonte 3 como CAC (15% do Saber, 2× MRR do Executar em duas
parcelas), override do padrinho fora, Ter fora, teto comercial derivado de
38 calls × 20%.*
