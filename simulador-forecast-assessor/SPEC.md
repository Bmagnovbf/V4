# SPEC.md — Simulador de Forecast para Assessor V4
**V4 Company | Versão 1.18 | Setembro/2026**
**Status: no ar em https://simulador-assessor.vercel.app — Base da planilha reproduzido em −0,1%**

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
- **Exportação em PDF ou PPT.** Decisão de set/2026: o simulador existe para o
  candidato entender a dinâmica e as correlações durante a call, não para virar
  material que ele leva embora. O foco seguinte é capacidade operacional.
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
| Horas de entrega | 42h no mês da entrega | 12h/mês enquanto vigente |

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

### 3.4 O CSP é remuneração, não desembolso

Quem entrega é o próprio Assessor. O **Custo de Serviço Prestado** é o preço da
hora dele, não dinheiro que sai do bolso — por isso o simulador o trata como
parte do que ele recebe, e não como despesa que reduz o que leva.

```
(=) Receita recebida
(−) Impostos
Custo de Serviço Prestado (CSP)      ← pagamento das horas dele
    CSP · Saber
    CSP · Executar
(−) Freelancers + ferramentas        ← desembolso: overhead + CSP terceirizado
(=) Resultado do negócio             ← a margem, o "dividendo"

Remuneração Total = CSP próprio + Resultado   ← o que fica com ele
```

**Até onde ele entrega sozinho.** O CSP só é remuneração dele enquanto as horas
cabem na jornada. Acima do limite ele precisa de freelancer, e o CSP das horas
excedentes deixa de ficar com ele.

O limite é de **190h/mês**, único: a COF obriga dedicação integral, então não há
cenário de jornada reduzida a modelar.

```
limite              = 190h
horas_terceirizadas = max(0, horas_alocadas − limite)
csp_terceirizado    = csp_total × (horas_terceirizadas ÷ horas_alocadas)
csp_proprio         = csp_total − csp_terceirizado
freelas_total       = overhead + csp_terceirizado
```

O rateio é proporcional às horas — não por projeto — para não criar degraus
artificiais quando a carteira cruza o limite.

A distinção importa para a leitura: **Remuneração Total** responde "quanto eu
ganho", e **Resultado do negócio** responde "isso é um negócio ou um autoemprego
bem pago". Tratar o CSP como custo puro subestimava a renda em 53% a 99%,
conforme o cenário.

O termômetro compara a retirada mínima com a **Remuneração Total** — exigir
reserva para cobrir um custo que ele não desembolsa inflava a reserva
necessária.

Decisão de ago/2026: não separamos quanto do CSP vai para freelancer e quanto é
trabalho próprio. Tudo é considerado valor que ele recebe. O overhead cobre o
apoio genérico à parte.

### 3.5 Impostos e overhead

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `impostos.simples` | 6,0% sobre a receita recebida | ✅ |
| `overhead` M1–M4 | R$ 1.000/mês | ✅ |
| `overhead` M5–M8 | R$ 1.500/mês | ✅ |
| `overhead` M9+ | R$ 2.000/mês | ✅ |

Overhead = freelancers IA-augmented sob demanda + ferramentas e acesso à
plataforma. É adicional ao CSP e independe do volume de carteira — é custo de
estar operando, não de operar um projeto específico.

### 3.6 Carteira

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `carteira.cap_ativos` | 13 projetos | ✅ |
| `carteira.pct_operacional_ref` | 55% | 🔴 |
| `carteira.tolerancia_self` | 1,2× | 🔴 |
| `carteira.mix_alocacao` | 40% Saber / 60% Executar | 🟡 |
| `carteira.mix_self` | 70% Saber / 30% Executar | ✅ |
| `carteira.primeiros_saber` | 5 | ✅ |
| `carteira.matriz_pace` | `1 1 2 2 2 3 3 3 3 3 3 3` | ✅ |

`matriz_pace[m]` é quanto a **matriz atribui** ao Assessor no mês *m* — o
compromisso da rede, independente do perfil, da rede dele e da forma de
pagamento. Sobe de 1 para 2 no M4, quando ele já provou entrega. Soma 21 no ano.

Tudo que cresce além disso vem da originação própria.

`primeiros_saber` implementa a premissa da planilha — *"os 5 primeiros Saber, o
6º Executar"*. Tem lastro operacional: um Executar isolado no início não cobre o
próprio CSP (recebe R$ 1.225/mês e custa R$ 1.000/mês, contra R$ 1.000 de
overhead fixo), então abrir a carteira com ele produziria meses negativos.

**O mix de produto é separado por fonte**, porque são decisões de agentes
diferentes: a matriz escolhe o que aloca, o Assessor escolhe o que vende.

- **Alocação — 40/60**, pesando no Executar. Na Fonte 1 ele rende R$ 102/h
  contra R$ 86/h do Saber, empilha, e entrega mais remuneração ao Assessor
  puramente operacional. Não vamos a 30/70 porque ali a carteira encosta em
  186h, sem folga antes das 190h em que passa a exigir freelancer.
- **Vendas próprias — 70/30**, como na planilha.

**A dedicação é integral em todo o modelo** (set/2026). A COF passa a trazer a
exclusividade como cláusula, então não existe cenário de dedicação parcial para
simular: cap, limite de horas próprias e vendas próprias rodam sempre em 100%.
Saíram do modelo os três parâmetros que faziam o corte — `cap_ativos_parcial`,
`limite_proprio_parcial` e `fator_vendas_parcial` —, o chip da tela de input e o
eixo correspondente da auditoria.

O KPI de horas mostra **as horas dele**, não as do projeto — o excedente aparece
à parte como entrega de freelancer. Sem essa separação, a tela dizia "112h/mês"
para alguém que na prática entrega 88h e paga freela pelo resto.

### 3.7 Rede de relacionamento

Mesma pergunta do simulador da franquia: *como você avalia sua rede de
relacionamento com empresários?*

| Nível | Faixa | Fator | Tag |
|---|---|---|:--:|
| Baixa | até 50 empresas | 0,5× | 🔴 |
| Média | 50 a 100 empresas | 1,0× | 🔴 |
| Alta | mais de 100 empresas | 1,5× | 🔴 |

As faixas foram redefinidas em set/2026 (antes eram ~10 / ~30 / ~50), e os
fatores foram **mantidos de propósito**: até 50 empresas ainda é pouco
empresário, então a régua nova descreve melhor o funil sem mudar a economia.

O fator **multiplica** a capacidade de originação própria. Não é parcela: sem
rede não há a quem vender, por mais comercial que seja o perfil. É a alavanca
que empurra a carteira para a Fonte 2, onde ele fica com 80% em vez dos 30–35%
da alocação.

### 3.8 Originação própria

| Parâmetro | Valor | Tag |
|---|---|:--:|
| `comercial.inicio_vendas_mes` | M4 | ✅ |
| `comercial.expoente_maturacao` | 0,8 | 🔴 |
| `comercial.calls_mes_max` | 38 calls novas/mês | 🟡 |
| `comercial.conversao_call_venda` | 20% | 🟡 |

Antes do M4 o Assessor está na Trilha (Imersão → Vivência → Trabalho de
Conclusão → Banca) e ainda não tem selo — **100% da carteira vem da Fonte 1**.

O teto de vendas é derivado, não digitado:

```
originacao_max = calls_mes_max × conversao_call_venda × pct_comercial × fator_rede
               = 38 × 0,20 × pct_comercial × fator_rede
```

A 100% comercial com rede média: **7,6 vendas/mês**, já rampado no M12.

Premissa da operação: um closer no talo toca 35–40 calls novas por mês e
converte 20% de reunião realizada em venda.

### 3.9 Thresholds do Termômetro

| Parâmetro | verde | amarelo | Tag |
|---|---|---|:--:|
| `termometro.reserva_ratio` | ≥ 1,5× | ≥ 1,0× | 🔴 |
| `termometro.meta_ratio` | ≥ 100% | ≥ 70% | 🔴 |

**O payback não é eixo do termômetro** (decisão de set/2026). Com a entrada
baixa ele cai entre M4 e M6 em todo o espaço de inputs e não separa cenário bom
de ruim — investimento baixo significa risco baixo e retorno rápido. Segue
exibido como KPI, mas como informação de apoio.

Todos 🔴 — são chute, e só devem ser calibrados depois da bateria de cenários
com candidatos reais (§ 10, bloco B).

---

## 4. Motor de Cálculo

### 4.1 Inputs

```ts
interface SimulacaoInput {
  meta_faturamento:   number    // R$ 5.000 – 40.000
  retirada_minima:    number    // R$ 2.000 – 15.000
  reserva_capital:    number    // R$ 0 – 150.000
  pct_comercial:      number    // 0 – 1  (0 = 100% operacional)
  network_level:      'baixo' | 'medio' | 'alto'
}
```

Critério de o que vira input: **só o que o candidato sabe sobre si mesmo.**
Benchmark da rede (tickets, splits, CSP, imposto, duração do Executar, rampa da
matriz) fica em `params.ts` e não é editável na tela.

`meta_faturamento` é a **receita recebida** mensal — o total que entra antes de
impostos, somando as três fontes. **Não entra em nenhum cálculo**: é usada só no
termômetro e como linha de referência no gráfico de receita. O motor não faz
engenharia reversa a partir dela.

O teto de R$ 40.000 é calibrado: de 303 combinações de rede e perfil, 10%
alcançam esse faturamento em regime, e 4% passam de R$ 45.000. Um teto mais
alto colocaria no slider números que nenhum cenário atinge, enviesando a
conversa logo no primeiro campo.

`retirada_minima` é *quanto ele precisa retirar por mês enquanto não atinge o
objetivo*. Também não altera a projeção — mede o buraco entre o que ele precisa
e o que a operação entrega (§ 4.6).

### 4.2 Os dois tetos

O ponto central do modelo. Operador e comercial esbarram em limites diferentes,
e o perfil decide qual dos dois morde primeiro.

**Teto do operador — capacidade de operar:**

```
base = cap_ativos            // 13, dedicação integral
pct_operacional = 1 − pct_comercial
cap_ativos = base × min(1, pct_operacional ÷ pct_operacional_ref)
```

Acima de 55% operacional a capacidade é **cheia**. Abaixo disso cai
proporcionalmente. Um perfil 70% comercial fica com `13 × (0,30 ÷ 0,55) ≈ 7,1`
projetos.

**Teto do comercial — capacidade de vender:**

```
vendas_proprias(m) = 7,6 × pct_comercial × fator_rede × shape_comercial(m)
```

O comercial **não tem teto operacional** — ele não opera. O que o limita é a
agenda de calls e o tamanho da rede.

**Curva de maturação comercial:**

```
shape_comercial(m) = 0                        se m < 4
                   = ((m − 3) ÷ 9) ^ 0,8      se m ≥ 4
```

A curva é **côncava**, não linear: quem sai da Banca já tem a rede aquecida por
três meses de imersão e não começa do zero absoluto. M4 = 17%, M6 = 42%,
M12 = 100%.

Com a curva linear (expoente 1), a venda própria só ficava relevante depois do
M8 — e como o payback acontece por volta do M5–M6, um Assessor que vende muito
terminava com o **mesmo payback** de um que depende só da alocação. O expoente
0,8 é o ponto onde a curva já diferencia os perfis sem afastar os cenários da
planilha além da tolerância.

### 4.3 Repartição da carteira — as três fontes

Executado mês a mês. É aqui que a Fonte 3 nasce.

```
ativos_vigentes   = Σ executar_novos(k)   k de max(1, m−5) até m−1

espaco_no_cap     = max(0, cap_ativos − ativos_vigentes)
da_matriz(m)      = min(matriz_pace[m], espaco_no_cap)                  → Fonte 1

teto_proprio      = floor(cap_ativos × tolerancia_self)
capacidade_livre  = max(0, teto_proprio − ativos_vigentes − da_matriz)

vendas_operadas   = min(vendas_proprias(m), capacidade_livre)           → Fonte 2
vendas_repassadas = vendas_proprias(m) − vendas_operadas                → Fonte 3
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
(=) csp_total           = csp_saber + csp_executar
(−) overhead            = 1.000 / 1.500 / 2.000 conforme o mês
(=) renda_liquida       = receita_liquida − csp_total − overhead
(=) remuneracao_total   = renda_liquida + csp_proprio

horas_alocadas          = saber_entregues × 42 + executar_vigentes × 12
```

Nota sobre a Fonte 3: entra em `receita_recebida` e portanto **é tributada** no
Simples, mas **não gera CSP** — ele não entrega. É a fonte de maior margem
unitária e menor valor absoluto.

### 4.6 Déficit de retirada — o buraco de capital de giro

O DRE não tem linha de custo de vida, então o risco real do Assessor fica
invisível nas linhas de resultado: ele não **perde** dinheiro (breakeven em M1),
ele ganha **quase nada** nos primeiros meses.

```
deficit_retirada(m)    = max(0, retirada_minima − remuneracao_total(m))
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

**Geração de caixa no período** fecha a outra metade da conta. O déficit mede só
a fase de consumo; o candidato também quer saber onde o ano termina, somando a
fase de geração:

```
geracao_caixa_periodo = Σ (remuneracao_total(m) − retirada_minima)
                      = geração dos meses acima da retirada
                        − deficit_retirada_total
```

As duas parcelas usam a mesma fórmula, com sinais opostos: antes da
autossuficiência a operação consome a reserva, depois dela devolve. O total
responde "no fim de 12 meses eu somei ou consumi caixa?" — pergunta que nem o
déficit (só a parte consumida) nem o `pior_caixa` (retorno do investimento, sem
retirada) respondem.

**A entrada também não entra aqui**, pela mesma razão do déficit. E a base é a
remuneração total, não o resultado do negócio: o CSP das horas dele é dinheiro
que chega na conta dele, e ignorá-lo faria a simulação pedir reserva para cobrir
um custo que ele não desembolsa.

No exemplo acima o consumo soma R$ 25.831 até o M5 e a geração dos meses
seguintes mais que compensa — o ano fecha em **+R$ 109.844** de caixa gerado.

### 4.7 Caixa

```
fluxo_caixa(m)     = remuneracao_total(m)

caixa_acumulado(0) = −20.000                              (entrada na rede)
caixa_acumulado(m) = caixa_acumulado(m−1) + fluxo_caixa(m)
payback            = primeiro m com caixa_acumulado(m) ≥ 0
```

O payback mede o **retorno do investimento**: a entrada de R$ 20.000 amortizada
pelo que o negócio devolve ao Assessor.

**A retirada mínima não entra aqui.** Ela é fluxo de caixa pessoal dele, não
custo do investimento — e já é medida pelo eixo de reserva do termômetro.
Descontá-la também no payback misturaria duas perguntas diferentes e contaria o
mesmo dinheiro em dois eixos.

A base é a **remuneração total**, não o resultado do negócio. Usar o resultado
distorcia a comparação entre produtos: um Executar alocado entrega R$ 7.350 de
remuneração ao longo do ciclo mas só R$ 1.350 de resultado, porque o CSP come
82% da receita — e o CSP volta para a mão dele. Medido pelo resultado, um mix
pesado em Executar parecia nunca pagar a entrada, quando na verdade é o que
mais entrega dinheiro.

| Contrato alocado | Receita | CSP | Resultado | Remuneração |
|---|---|---|---|---|
| Saber | R$ 3.600 | R$ 1.500 | R$ 2.100 | R$ 3.600 |
| Executar (6 meses) | R$ 7.350 | R$ 6.000 | R$ 1.350 | R$ 7.350 |

**Observação de calibração:** o payback varia entre M4 e M6 no espaço de inputs
— o perfil que vende paga antes do que depende só da alocação, mas a diferença é
de um ou dois meses. É consequência do investimento ser baixo frente à
remuneração mensal: com a entrada em R$ 20.000, qualquer cenário cobre o valor
no primeiro semestre. Os thresholds (verde ≤ M6, amarelo ≤ M9) deixam quase tudo
verde, então o eixo funciona melhor como informação de apoio do que como
critério de viabilidade.

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
investimento_total    = 20.000
```

`pior_caixa` é o número que importa para o candidato: é quanto de reserva o
ramp-up realmente exige.

### 4.9 Termômetro

Três eixos, sempre prevalecendo o **mais crítico**.

```
reserva_ratio  = reserva_capital ÷ deficit_retirada_total   (∞ se o total = 0)
meta_ratio     = faturamento_regime ÷ meta_faturamento

reserva_nivel  = verde se ≥ 1,5×  · amarelo se ≥ 1,0×  · senão vermelho
meta_nivel     = verde se ≥ 100%  · amarelo se ≥ 70%   · senão vermelho

nivel_final    = o pior dos dois        (calculado, não exibido)
```

**Por que estes três eixos e não margem.** No DRE o breakeven operacional é M1 e
o payback M6 — o negócio fecha desde o primeiro mês. O risco do Assessor não é
margem, é **fôlego**: atravessar os primeiros meses com renda muito abaixo do
que ele precisa retirar. O termômetro mede isso.

Os dois eixos medem coisas independentes: **reserva** olha o capital de giro,
**meta** olha a ambição declarada — comparando o faturamento em regime com a
meta, ambos em receita bruta. O investimento de entrada é medido à parte, pelo
KPI de payback.

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

Cinco campos, em ordem:

| Campo | Controle | Faixa | Default |
|---|---|---|---|
| Meta de faturamento no M12 | input + slider | R$ 5.000 – 40.000 | R$ 20.000 |
| Retirada mínima mensal | input + slider | R$ 2.000 – 15.000 | R$ 8.000 |
| Seu perfil | slider único | 0 – 100% comercial, passo 5 | 35% |
| Rede de relacionamento | chips | baixa / média / alta | média |
| Reserva de capital de giro | input + slider | R$ 0 – 150.000 | R$ 25.000 |

O slider de perfil mostra os dois lados ao mesmo tempo ("65% operacional · 35%
comercial"). É o controle central da tela — os outros três são contexto. A
dedicação integral não é campo: é cláusula da COF, e aparece como nota fixa no
cabeçalho da tela.

**Os campos não revelam a consequência da resposta** (decisão de set/2026). O
candidato deve responder sobre si mesmo, não sobre o resultado que quer ver. Os
textos de apoio definem o que se pergunta e dão referência para calibrar a
resposta — "Baixa = até 50 empresas · Média = 50 a 100 · Alta = mais de 100" —, nunca o
efeito no forecast. Dizer que a Fonte 2 paga 80% contra 30–35% da alocação
transformava o slider de perfil num campo de otimização.

Não há estado de "incompleto": todos os campos têm default válido e o botão
Simular está sempre habilitado. A tela é usada ao vivo numa call; travar o botão
atrapalha.

### 5.2 Dashboard (`/dashboard`)

Lê `sessionStorage.simulacao`. Sem resultado, redireciona para `/`.

Ordem dos blocos:

1. **Cabeçalho** — perfil, meta, retirada, rede, botão Refazer (a dedicação
   aparece como premissa fixa: integral)
2. **Leitura da simulação** — os dois indicadores individualizados, com selo e leitura em reais
3. **KPI cards** — remuneração total, geração de caixa no período, horas de entrega, projetos no M12, payback, reserva necessária
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

## 5b. O valor do investimento não aparece para o candidato

Decisão de set/2026: os **R$ 20.000 são informação interna**. Candidatos podem
ter pago valores diferentes, e o ticket médio não deve ser exibido em nenhuma
tela.

Consequências no produto:

- Os KPI cards mostram **"Payback do investimento"** sem o valor por trás, e o
  card "Capital total" foi removido — ele expunha a entrada por subtração, já
  que a reserva é conhecida.
- O termômetro fala em "Payback do investimento", não "da entrada".
- O rodapé de `/` e `/dashboard` não linka mais `/params`. O painel continua
  acessível por URL para o time, e ganhou um aviso de uso interno no topo —
  ele expõe tickets, splits, CSP e a entrada, nada disso para o candidato.

O valor segue em `params.ts` e no motor: o payback é calculado sobre ele, só não
é exibido.

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



### Cenário Base — 42,5% comercial, rede alta

| Indicador | Planilha | Motor | Δ |
|---|---|---|---|
| Receita ano 1 | R$ 292.875 | R$ 309.100 | +5,5% |
| Líquido ano 1 | R$ 149.303 | R$ 158.554 | +6,2% |
| Líquido em regime | R$ 28.846 | R$ 24.964 | −13,5% |
| Projetos ativos M12 | 15 | 15 | 0,0% |
| Payback | M6 | M5 | −1 |
| Breakeven | M1 | M1 | — |

### Cenário Upside — 55% comercial, rede alta

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

Divergência residual conhecida: o motor entrega **menos projetos ativos** que a
planilha nos dois cenários. É diferença de formato de curva — a planilha
estabiliza antes, o motor cresce até o fim. O líquido do ano, que é a métrica de
decisão, fecha dentro de 5%.

### Efeito da rede (35% comercial)

| Rede | Self | Alocação | Remuneração | Horas | Líquido ano 1 |
|---|---|---|---|---|---|
| Baixa | 58% | 42% | R$ 18.014 | 152h | R$ 60.261 |
| Média | 72% | 28% | R$ 28.472 | 206h | R$ 107.673 |
| Alta | **80%** | **20%** | R$ 36.036 | 250h | R$ 149.193 |

A rede alta chega ao **80% self / 20% alocação** — a proporção que o produto
persegue, já que a Fonte 2 paga 80% contra os 30–35% da Fonte 1.

### Curva de perfil (rede média)

| Perfil | Ativos M12 | Fonte 3 | Remuneração | Resultado | Líquido ano 1 |
|---|---|---|---|---|---|
| 20% comercial | 7 | – | R$ 17.873 | R$ 9.348 | R$ 61.893 |
| 40% comercial | 11 | – | R$ 31.759 | R$ 21.556 | R$ 120.093 |
| 50% comercial | 13 | – | R$ 38.336 | R$ 28.204 | R$ 149.193 |
| 60% comercial | 10 | 22% | R$ 34.329 | R$ 23.726 | R$ 148.207 |
| 70% comercial | 8 | 35% | R$ 31.080 | R$ 22.080 | R$ 139.877 |
| 80% comercial | 6 | 36% | R$ 30.767 | R$ 23.767 | R$ 143.669 |
| 100% comercial | 0 | 100% | R$ 18.523 | R$ 18.523 | R$ 88.596 |

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

## 8b. Horas e terceirização

Quando a linha de horas entrou, ela expôs um conflito: o cap de projetos e as
horas por produto descreviam operações incompatíveis. A resolução de set/2026
foi por três lados ao mesmo tempo — cap de 15 para 13, horas de 45/13 para
42/12, e o excedente acima de 190h/mês virando freelancer em vez de renda.

| Cenário | Ativos M12 | Horas em regime | Ocupação de 190h | CSP terceirizado/ano |
|---|---|---|---|---|
| Rede baixa · 20% com | 6 | 140h | 74% | — |
| Rede média · 35% com | 10 | 206h | 108% | R$ 5.429 |
| Rede alta · 35% com | 13 | 250h | 132% | R$ 11.979 |
| Rede alta · 50% com | 14 | 274h | 144% | R$ 20.947 |

O estouro continua existindo nos cenários fortes, mas agora tem consequência
econômica em vez de ficar como número solto: o Assessor que enche a carteira
passa a pagar freelancer, e isso aparece na linha de freelas e sai da
Remuneração Total. A tela mostra as duas sublinhas — "dos quais terceirizado" e
"das quais terceirizadas" — apenas quando há estouro.

Isso também dá um limite natural ao modelo sem trava artificial: crescer além da
própria capacidade continua valendo a pena, só que com margem menor.

## 8c. Auditoria do espaço de inputs

`audit.mjs` varre todas as combinações de rede, perfil, meta, retirada e
reserva, verificando estrutura e coerência narrativa:

```bash
npx tsc -p tsconfig.test.json && node audit.mjs
```

| Verificação | O que pega |
|---|---|
| KPIs finitos | divisão por zero, NaN |
| Contratos inteiros e não-negativos | quebra do acumulador |
| Identidades contábeis | soma das fontes, CSP, freelas, remuneração, geração de caixa |
| Carteira ≤ teto próprio | cap aplicado sobre a base errada |
| Rede maior nunca rende menos | inversão de monotonicidade |
| Mais reserva nunca piora o termômetro | threshold invertido |
| Retirada maior nunca reduz a reserva | sinal trocado |
| Vendas próprias nunca recuam | oscilação do arredondamento |
| Nível final = pior dos dois eixos | lógica do termômetro |
| Sem saltos > 50% no slider | descontinuidade na conversa |
| 0% comercial paga a entrada | narrativa do produto |
| Payback independe da retirada | mistura entre investimento e caixa pessoal |
| Quem vende mais paga antes | curva de maturação lenta demais |

Rodada de set/2026 encontrou quatro problemas, todos corrigidos: dedicação
parcial rendendo mais que integral, cap aplicado só sobre Executar, salto de 84%
no primeiro passo do slider e o perfil operacional sem payback em 12 meses. O
primeiro deixou de existir com a dedicação integral obrigatória, e a verificação
saiu da auditoria.

## 8d. O salto de 0% para 5% comercial é intencional

O primeiro passo do slider de perfil move a remuneração em regime em até 53%.
Investigado em set/2026 e **mantido**: é a economia do produto aparecendo, não
ruído de modelagem.

A 5% comercial o motor produz **3 contratos no ano** — coerente com a premissa
do closer (5% de 38 calls = 1,9/mês, 23 no ano, a 20% de conversão ≈ 4,6). O
volume está certo. O que pesa é quanto vale cada um:

| | Alocado | Próprio | Razão |
|---|---|---|---|
| Saber | R$ 3.600 | R$ 9.600 | **2,7×** |
| Executar (6 meses) | R$ 7.350 | R$ 16.800 | 2,3× |

Em rede alta com 5% comercial, a matriz aloca 31 contratos no ano (R$ 126.350) e
ele vende 3 (R$ 33.200): **9% do volume gerando 26% da receita**. Um único Saber
próprio vale R$ 9.600, contra R$ 8.387 de remuneração mensal de quem só recebe
alocação — um contrato próprio equivale a um mês inteiro na alocação.

Suavizar essa transição esconderia o principal argumento comercial do produto.

**Resíduo de medição conhecido:** os 3 contratos caem em M8, M10 e M12, e dois
deles estão dentro da janela de 3 meses do regime, o que amplifica. Medido no
ano o ganho é 26%; no regime, 53%. Janelas maiores reduzem para 42% (4 meses) e
35% (6 meses), ao custo de misturar meses de rampa no indicador de estado
estável. Mantida a janela de 3 meses.

A auditoria mede esse passo separadamente dos demais, justamente porque sair do
zero é descontinuidade legítima.

## 9. Critérios de Aceite

- [x] `npm run build` sem erro nem warning de lint
- [x] Cenário Base da planilha reproduzido dentro de 15%
- [x] Cenário Upside reproduzido dentro de 15% (rede alta)
- [x] Fonte 3 = zero nos perfis até ~55% comercial
- [x] CSP migra para freelas quando as horas passam de 190h/mês
- [x] `audit.mjs` limpo em todo o espaço de inputs
- [x] Contratos inteiros em 126 combinações × 12 meses
- [x] Nenhum número de negócio hard-coded fora de `params.ts`
- [x] Todo parâmetro visível em `/params` com tag de procedência
- [x] Projeto da franquia intocado
- [x] Deploy Vercel com Root Directory próprio e sem Deployment Protection
- [x] Nomenclatura das 3 fontes alinhada entre código, tela e documentação
- [ ] Thresholds do termômetro calibrados com candidatos reais
- [ ] `VERCEL_GIT_COMMIT_DATE` exposta (rodapé do `/params` mostra "dev local")

---

## 10. Cenários de Teste

Três blocos, nesta ordem. Cada um responde uma pergunta diferente; não vale
pular para o C.

### Bloco A — Perfil e rede
Meta R$ 25.000, retirada R$ 8.000, reserva R$ 25.000 (dedicação integral,
como em todo cenário).

**A1–A5 — varrer o slider de perfil** (20/40/60/80/100% comercial) com rede
média. Verificar: a carteira sobe até 50% comercial (13 projetos, o teto) e
depois cai; a Fonte 3 só aparece a partir de ~55%.

**A6–A8 — varrer a rede** (baixa/média/alta) com 35% comercial. Verificar: o
mix migra para mais self-sourced, e a partir da rede média a ocupação passa de
190h e começa a terceirizar.

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

Base comum: meta R$ 25.000, reserva R$ 25.000, 40% comercial, à vista — variando um fator por vez. Valores observados na v1.0, para servirem de
baseline de regressão:

| # | Input | Ativos M12 | Renda M12 | Pior caixa | Payback | Termômetro |
|---|---|---|---|---|---|---|
| C1 | Reserva R$ 0 | | | | | **vermelho** por reserva |
| C2 | Meta R$ 45K, 20% comercial | | | | | **vermelho** por meta |
| C3 | Rede baixa + 20% comercial | | | | | pior caso do funil |
| C4 | 100% comercial | | | | | sem divisão por zero |

*(baseline a preencher na primeira rodada pós-network)*

Verificações qualitativas:
- **C1** — o eixo de reserva vira vermelho sozinho e arrasta o nível final
- **C3** — meta muito acima do projetado derruba só o eixo de meta
- **C4** — rede baixa com perfil operacional é o candidato que depende quase só da matriz
- **C5** — cap zero não gera divisão por zero; a ocupação é forçada a 0 e o dashboard renderiza

Pergunta: o termômetro acusa vermelho onde deve, e nada quebra?

### O que anotar em cada cenário
1. O número final é plausível?
2. O caminho até ele é explicável na call?
3. O termômetro concorda com o seu julgamento?

---

*SPEC v1.18 — Setembro/2026:*
- *O card "Resultado do negócio" dá lugar a "Geração de caixa no período": Σ (remuneração total − retirada mínima) nos 12 meses, somando a fase de consumo da rampa e a de geração. O resultado do negócio segue no DRE e no § 3.5, mas como card ele respondia a uma pergunta que a Remuneração total já respondia melhor*
- *A auditoria ganha a identidade das duas fases: geração − déficit = geração de caixa do período*

*SPEC v1.17 — Setembro/2026:*
- *O card "Faturamento em regime" sai dos KPIs: o número já aparece na leitura da simulação, confrontado com a meta, e repetido como card competia com a remuneração total pela atenção*

*SPEC v1.16 — Setembro/2026:*
- *A dedicação integral vira cláusula da COF: saem os chips da tela de input, o campo `dedicacao` do input e os parâmetros `cap_ativos_parcial`, `limite_proprio_parcial` e `fator_vendas_parcial`. `cap_ativos_integral` passa a se chamar `cap_ativos`*
- *A auditoria perde o eixo de dedicação e o check "parcial < integral"; as demais 606 combinações caem para 303*

*SPEC v1.15 — Setembro/2026:*
- *O limite de horas próprias passa a depender da dedicação: 190h na integral, 88h na parcial. Com limite único o parcial nunca terceirizava e chegava a 33h por semana*
- *Cap da dedicação parcial cai de 6 para 5 projetos*
- *O KPI de horas passa a mostrar as horas dele, com as terceirizadas à parte*

*SPEC v1.14 — Setembro/2026:*
- *O termômetro deixa de dar veredito agregado: cada indicador ganha selo próprio e uma frase que explica o número em reais*

*SPEC v1.13 — Setembro/2026:*
- *Faixas de rede redefinidas: baixa até 50 empresas, média de 50 a 100, alta acima de 100*

*SPEC v1.12 — Setembro/2026:*
- *Os textos de apoio dos inputs deixam de revelar a consequência da resposta — o candidato responde sobre si, não sobre o resultado que quer ver*

*SPEC v1.11 — Setembro/2026:*
- *A meta passa de renda líquida para FATURAMENTO (receita recebida, antes de impostos), com teto de R$ 40.000 — alcançado por 10% dos cenários*
- *A linha de meta migra do gráfico de renda para o de receita; entra o KPI de faturamento em regime*

*SPEC v1.10 — Setembro/2026:*
- *O payback sai do termômetro e vira KPI de apoio: com a entrada baixa ele não separa cenário bom de ruim*

*SPEC v1.9 — Setembro/2026:*
- *Registrada a decisão de manter o salto de 0% → 5% comercial (§ 8d): reflete o split de 2,7× entre venda própria e alocação*

*SPEC v1.8 — Setembro/2026. Mudanças v1.7 → v1.8:*
- *O valor da entrada some da UI do candidato; `/params` deixa de ser linkado no rodapé e ganha aviso de uso interno*
- *Curva de maturação comercial vira côncava (expoente 0,8). Com a curva linear, a venda própria só pesava depois do M8 e o payback ficava igual entre quem vende e quem só recebe alocação*

*SPEC v1.7 — Setembro/2026. Mudanças v1.6 → v1.7:*
- *Payback corrigido: o caixa passa a acumular a remuneração total em vez do resultado do negócio. Medir pelo resultado subestimava o Executar, cujo CSP come 82% da receita mas volta para a mão do Assessor*
- *A retirada mínima NÃO entra no payback — é fluxo de caixa pessoal, não custo do investimento, e já é medida pelo eixo de reserva*
- *Mix de alocação vai de 50/50 para 40/60, pesando no Executar — com o payback correto, mais Executar entrega mais remuneração E paga antes*

*SPEC v1.6 — Setembro/2026. Mudanças v1.5 → v1.6, todas vindas da auditoria do espaço de inputs:*
- *O cap passa a contar a carteira inteira do mês (Saber + Executar); antes só Executar, e a carteira estourava o teto*
- *Dedicação parcial fica mais conservadora: cap de 8 para 6 e vendas próprias à metade — antes chegava a render mais que integral*
- *Pace da matriz sobe para até 3 clientes/mês, e o mix de alocação passa a ser separado do mix de vendas próprias (50/50 contra 70/30)*
- *Entra `audit.mjs`, que varre o espaço de inputs procurando quebras estruturais e incoerências narrativas*

*SPEC v1.5 — Setembro/2026. Mudanças v1.4 → v1.5:*
- *Nomenclatura das fontes alinhada no motor: "vendas próprias" é a capacidade de trazer cliente (alimenta as Fontes 2 e 3); "Originação" fica reservado para a Fonte 3*
- *Confirmado que o teto de 13 projetos é a carteira TOTAL e trava a Fonte 1 · Alocação*
- *Exportação (PDF/PPT) sai do escopo em definitivo*
- *§ 4.7 corrigida: o parcelamento da entrada não existe mais no motor*

*SPEC v1.4 — Setembro/2026. Mudanças v1.3 → v1.4:*
- *O CSP passa a ser tratado como remuneração do Assessor, não desembolso: entra o totalizador "Custo de Serviço Prestado (CSP)" e a linha "Remuneração Total (CSP + resultado)"*
- *Entra a estimativa de horas de entrega — 42h por Saber no mês, 12h/mês por Executar vigente*
- *Acima de 190h/mês o CSP das horas excedentes vira freelancer: sai da Remuneração Total e entra na linha de freelas + ferramentas*
- *Cap de projetos para repasse da matriz cai de 15 para 13*
- *Termômetro e meta passam a comparar contra a Remuneração Total*

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
