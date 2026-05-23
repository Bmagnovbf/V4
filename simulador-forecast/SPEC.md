# SPEC.md — Simulador de Forecast para Franqueados V4
**V4 Company | Versão 3.3 | Maio/2026**
**Status: APROVADO — motor implementado, testes de consistência passando (0 erros)**

---

## 1. Visão Geral e Escopo

### Propósito
Aplicação web interna que transforma os inputs do candidato a franqueado — meta de faturamento bruto no mês 12, capital disponível, perfil de rede/experiência e **parâmetros aprendidos na imersão V4** (tickets e taxas de conversão) — em um dashboard visual de viabilidade. Motor de engenharia reversa: calcula o esforço operacional e financeiro necessário para atingir a meta declarada. Os parâmetros de imersão também servem como instrumento de validação pedagógica: valores incorretos produzem forecasts incorretos, tornando o erro visível.

### Escopo V1
- Candidatos com metas nos horizontes **H1, H2 e H3** (fat bruto até R$450.000/mês)
- Tiers de cliente elegíveis: **Tiny, Small e Medium**
- Dois canais de aquisição: **Inbound (Lead Broker)** e **Outbound (BDR — apenas Fase 1)**
- Projeção financeira de **24 meses**
- Exportação de **apresentação PowerPoint (.pptx)** — "Resumo Executivo do Business Plan"

### Fora do escopo (V1)
- Horizontes H4 e H5 (fat bruto > R$450.000/mês)
- Tiers Large (fat > R$50M/ano) e Enterprise
- Integração com sistemas internos

---

## 2. Arquitetura Técnica

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| PowerPoint | pptxgenjs (client-side) |
| Backend | Nenhum — cálculos no browser |
| Deploy | Vercel |

### Fluxo de dados

```
[Candidato] → 5 inputs + 3 MCQ → [Cálculo client-side] → [Dashboard] → [Download .pptx]
[Admin V4]  → edita src/config/params.ts → push GitHub → Vercel auto-deploys
```

**Regra crítica:** a lógica financeira deve ser implementada como módulo TypeScript puro em `src/lib/calculator.ts`, isolado da UI.

---

## 3. Parâmetros de Negócio

> Todos os valores ficam em `src/config/params.ts`. Para atualizar: editar e fazer push.

---

### 3.1 Horizontes e Thresholds

A classificação do horizonte é feita sobre o **faturamento bruto** declarado como meta no M12.

| Horizonte | Fat. Bruto/mês (max) | Escopo |
|-----------|:--------------------:|--------|
| H1 | R$ 60.000 | V1 |
| H2 | R$ 150.000 | V1 |
| H3 | R$ 450.000 | V1 |
| H4+ | > R$ 450.000 | Fora do escopo — bloqueado |

> Se `meta_fat_bruto > R$450.000`: bloquear simulação e exibir alerta de escopo.

---

### 3.2 Deduções e Coeficientes

| Dedução | % | Base |
|---------|:-:|------|
| Royalties V4 | 20% | Faturamento bruto |
| Impostos — Simples Nacional | 7,2% | Faturamento bruto |
| **Coeficiente líquido base** | **72,8%** | fat_bruto × 0,728 |

Para o P&L (inadimplência diferida):

| Mês | Inadimplência | Coeficiente efetivo |
|:---:|:-------------:|:-------------------:|
| M1–M3 | 0% | × 0,728 |
| M4+ | 4% | × 0,728 × 0,96 = × 0,69888 |

> Inadimplência entra a partir de M4 — clientes novos têm baixo índice inicial.

---

### 3.3 Mix de Tiers por Horizonte

| Tier | H1 | H2 | H3 |
|------|:--:|:--:|:--:|
| Tiny (fat < R$ 1,2M/ano) | 60% | 60% | 55% |
| Small (R$ 1,2M – R$ 2,4M/ano) | 30% | 25% | 30% |
| Medium+ (fat > R$ 25M/ano) | 10% | 15% | 15% |

---

### 3.4 Tickets Médios por Produto e Tier

> **v3.1 — Parâmetros configuráveis pelo candidato:** todos os tickets abaixo são os benchmarks de referência e servem de default no formulário de input. O candidato pode (e deve) editá-los para demonstrar absorção do conteúdo da imersão. Valores alterados impactam diretamente o forecast. Ver Seção 6.1 e 4.1.

#### Saber (projeto one-time — produto de aquisição)

| Tier | Ticket (benchmark) |
|------|------------------:|
| Tiny | R$ 18.200 |
| Small | R$ 19.589 |
| Medium | R$ 21.027 |

#### Ter (mensalidade recorrente)

| Tier | Ticket/mês (benchmark) |
|------|----------------------:|
| Tiny | R$ 2.900 |
| Small | R$ 3.500 |
| Medium | R$ 6.000 |

#### Executar (recorrente — exclusivo Medium e acima)

| Tier | Ticket/mês (benchmark) |
|------|----------------------:|
| Medium | R$ 5.500 |

#### Ter Pontual — Expansão de Base

O Ter Pontual não usa mais um valor fixo. A partir de v3.1, o ticket de expansão é o **blended dos tickets Ter** inseridos pelo candidato, ponderado pelo mix de tiers do horizonte. Default: blended dos benchmarks acima.

```
blended_ticket_ter = Σ mix[tier] × ticket_ter[tier]
receita_ter_expansao[M] = M >= 3 ? base_ativa[M] × 0,10 × blended_ticket_ter : 0
```

> **Regra:** Ter Pontual = zero em M1 e M2. Começa em M3 quando a base ativa já tem volume suficiente para expansão.

---

### 3.5 Mix de Aquisição e Regra 75/25

O motor de engenharia reversa usa dois splits para calibrar o volume alvo em M12:

#### Regra 75/25 — composição da receita em M12

| Componente | % da meta M12 |
|------------|:-------------:|
| Aquisição (Saber + Executar novos + Ter Pontual) | 75% |
| Retenção (Executar MRR acumulado de cohorts anteriores) | 25% |

#### Mix 80/20 — composição da receita de aquisição

| Produto | % da receita de aquisição |
|---------|:-------------------------:|
| Saber (one-time) | 80% |
| Executar novos (1ª mensalidade) | 20% |

```
meta_aquisicao_m12 = meta_fat_bruto × 0,75
N_saber_m12        = (meta_aquisicao_m12 × 0,80) / blended_ticket_saber
N_executar_m12     = (meta_aquisicao_m12 × 0,20) / ticket_executar_medium
N_total_m12        = N_saber_m12 + N_executar_m12
```

> **Nota sobre calibração:** a retenção Executar acumulada por 12 cohorts é sistematicamente maior que 25% da meta se N_total_m12 não for ajustado. Por isso, o motor usa **calibração em 2 passadas** (ver Seção 4.4) para garantir que fat_bruto em M12 ≈ meta declarada.

---

### 3.6 Dinâmica de Receita: Três Fluxos

```
fat_bruto[M] = receita_aquisicao[M] + receita_executar_retencao[M]
receita_aquisicao[M] = receita_saber[M] + receita_executar_acq[M] + receita_ter_expansao[M]
```

#### Fluxo 1 — Saber (aquisição one-time)

Clientes novos adquiridos via inbound (broker) e rede orgânica. O ticket é o blended do horizonte para inbound; o ticket do network_tier para orgânicos.

#### Fluxo 2 — Executar (cohort recorrente com churn)

O Executar tem dois caminhos de entrada:

- **Path A — Direto na aquisição:** fração `frac_executar = N_executar_m12 / N_total_m12` dos clientes inbound compra Executar diretamente.
- **Path B — Upsell de Saber Medium:** clientes que compraram Saber Medium no mês anterior são ofertados Executar. Conversão graduada (ver Seção 3.7).

A retenção usa **cohort-based tracking com churn**:

```
# Fator de churn de um cohort criado em m_prime, avaliado no mês m:
churn_factor(m_prime, m) = 0,85 ^ floor((m − m_prime) / 6)

# Trava de churn: só aplica churn quando a receita total de Executar ≥ R$40.000
# Abaixo da trava, todos os cohorts são mantidos sem churn (base pequena, 100% retenção)

base_executar[M] = Σ cohort_executar[m'] × churn_factor(m', M)   para m' ∈ [1, M-1]
receita_executar_retencao[M] = base_executar[M] × 5.500
```

> Interpretação do churn: 85% dos clientes renovam a cada 6 meses (15% de churn por renovação). Nos primeiros 6 meses de vida do cohort, não há churn. A trava de R$40k evita churn em bases pequenas onde a aleatoriedade tornaria o modelo impreciso. Retenção acumulada: 72% a 12 meses (0,85²), 61% a 18 meses (0,85³).

#### Fluxo 3 — Ter Pontual (expansão, a partir de M3)

```
base_ativa[M] = novos_saber[M] + novos_saber[M-1] + base_executar[M] + novos_executar[M]
receita_ter_expansao[M] = M >= 3 ? base_ativa[M] × 0,10 × 3.000 : 0
```

---

### 3.7 Upsell Saber → Executar (Path B)

A taxa de conversão do upsell Saber Medium → Executar é graduada:

```typescript
function taxa_upsell(n_medium_prev: number, experiencia: Experiencia): number {
  // Para n pequeno: AM foca em poucos clientes → converte quase 100%
  // Para n grande (regime): converge para 40%
  const base = n <= 0 ? 0
             : n <= 2.5 ? Math.min(1.0, 1.0 / n)
             : 0.40  // regime pleno
  return experiencia === 'solida' ? Math.min(1.0, base + 0.10) : base
}
```

| Volume Medium Saber (M-1) | Taxa efetiva (Teórico) | Taxa efetiva (Sólida) |
|:-------------------------:|:----------------------:|:---------------------:|
| 1 | 100% | 100% |
| 2 | 50% | 60% |
| 2,5 | 40% | 50% |
| ≥ 2,5 | 40% | 50% |

---

### 3.8 Canais de Aquisição

#### Inbound — Lead Broker

> **v3.1 — Taxas de conversão configuráveis pelo candidato:** os valores abaixo são benchmarks de referência e defaults. O candidato insere as taxas aprendidas na imersão; valores incorretos degradam o forecast. CPMQL permanece fixo (parâmetro admin, não editável pelo candidato).

| Tier | Taxa Conv. MQL→Venda (benchmark) | CPMQL |
|------|:--------------------------------:|------:|
| Tiny | 10% | R$ 567,67 |
| Small | 13% | R$ 582,96 |
| Medium | 9% | R$ 825,60 |

Métricas blended por horizonte (ponderadas pelo mix de tiers e pelos valores inseridos pelo candidato):

| Métrica | H1 | H2 | H3 |
|---------|:--:|:--:|:--:|
| Ticket Saber blended | R$ 18.899 | R$ 18.971 | R$ 19.041 |
| Conversão inbound blended | 10,80% | 10,60% | 10,75% |
| CPMQL blended | R$ 598,05 | R$ 610,18 | R$ 610,95 |

#### Broker: Fase 1 (pré break-even) vs Fase 2 (pós break-even)

O investimento em broker segue um regime de duas fases:

**Fase 1 — pré break-even (capital financia o broker):**
```
# Ideal calculado sobre o ALVO do M12, não sobre a receita atual.
# Garante que maior ambição exige comprometimento de broker proporcional desde M1.
fat_liq_m12_target = meta_fat_bruto × (1 − 0,20 − 0,072) × (1 − 0,04)
                   = meta_fat_bruto × 0,69888

ideal_broker_fase1   = max(R$ 15.000, fat_liq_m12_target × 16%)
capital_restante     = capital_disponivel + ebitda_acumulado   # ebitda_acum é negativo
custo_broker         = max(R$ 15.000, min(ideal_broker_fase1, ebitda_antes_broker + capital_restante))
```
O broker é limitado pelo caixa disponível. O piso de R$15.000 é sempre mantido.
Efeito prático: meta maior → `ideal_broker_fase1` maior → capital esgota mais rápido → break-even mais tardio e capital mínimo maior.

**Fase 2 — pós break-even (receita financia o broker):**
```
custo_broker = max(R$ 15.000, fat_liq × 16%)
```
O broker opera no nível ideal baseado na receita real — sem restrição de capital.

> Break-even = primeiro mês com EBITDA > 0. Uma vez atingido, o broker nunca mais retorna à Fase 1.

#### Outbound — BDRs (apenas Fase 1)

BDRs são acionados **exclusivamente quando o broker está abaixo do ideal** por restrição de capital. Na Fase 2, o broker já está no nível ótimo — não há necessidade de BDR.

```
broker_constrangido = custo_broker < ideal_broker − R$50   # tolerância de arredondamento

gap_clientes = broker_constrangido
  ? max(0, N_total_m12 × ramp − n_organic − broker / custo_por_cliente)
  : 0

leads_outbound_necessarios = gap_clientes / 0,03   # taxa conv outbound = 3%
bdr_count = ceil(leads_outbound_necessarios / 400)  # 400 leads/BDR/mês
custo_bdr  = bdr_count × R$ 2.500                  # R$2.500/BDR/mês
```

---

### 3.9 Curva de Ramp-Up

Derivada dos pesos trimestrais históricos da rede, com interpolação linear dentro de cada trimestre. M12 é a âncora (ramp = 1,0 = 100% da velocidade de regime).

| Trimestre | Peso anual | Meses | Fatores mensais |
|-----------|:----------:|:-----:|:---------------:|
| Q1 | 15% | M1, M2, M3 | 0,350 / 0,469 / 0,588 |
| Q2 | 25% | M4, M5, M6 | 0,765 / 0,781 / 0,797 |
| Q3 | 28% | M7, M8, M9 | 0,813 / 0,875 / 0,938 |
| Q4 | 32% | M10, M11, M12 | 1,000 / 1,000 / 1,000 |

> M10–M12 são flat em 1,0 (velocidade de cruzeiro atingida). A soma dos 12 fatores ≈ 9,376, o que implica que M12 representa ~10,7% do volume anual.

```typescript
// Índice 0 não utilizado; índice 1–12 = M1–M12; M13+ = 1,0 (crescimento separado)
ramp_up = [0, 0.350, 0.469, 0.588, 0.765, 0.781, 0.797, 0.813, 0.875, 0.938, 1.0, 1.0, 1.0]
```

---

### 3.10 Crescimento Pós-M12

A partir de M13, o volume de novos clientes cresce **6% ao mês** (composto) sobre o nível de M12.

```
growthFactor(m) = m <= 12 ? 1,0 : 1,06 ^ (m − 12)
N_total_efetivo[M] = N_total_m12 × ramp[M] × growthFactor(M)
```

---

### 3.11 Inputs de Qualificação: Rede e Experiência

#### Network Level (Baixo / Médio / Alto)

Injeção de MQLs orgânicos (custo zero):

| Nível | MQLs orgânicos totais | Período |
|-------|:---------------------:|:-------:|
| Baixo | 10 MQLs | M1–M3 (≈3,3/mês) |
| Médio | 30 MQLs | M1–M4 (≈7,5/mês) |
| Alto | 50 MQLs | M1–M6 (≈8,3/mês) |

Após o período, MQLs orgânicos = 0.

#### Network Tier (Tiny / Small / Medium)

Define o tier dos MQLs orgânicos. A conversão e o ticket seguem os parâmetros do tier selecionado (não o blended do horizonte).

> **Nota:** o `blended_ticket_saber` e o `blended_cpmql` do horizonte são usados para o pipeline inbound (broker). O `network_tier` afeta apenas os MQLs orgânicos — ticket e conversão do tier escolhido.

#### Experiência (Teórico / Sólida)

| Nível | Efeito no motor |
|-------|----------------|
| Teórico | Parâmetros base — upsell regime 40% |
| Sólida (Prática) | +10 pp na taxa de upsell Path B — regime 50% |

---

### 3.12 CAPEX e Investimento Inicial

| Item | Valor |
|------|------:|
| Taxa de franquia | R$ 100.000 |
| Escritório (estimativa baixa) | R$ 100.000 |
| Escritório (estimativa alta) | R$ 200.000 |
| **CAPEX de referência (midpoint)** | **R$ 150.000** |

Recomenda postergar escritório se `capital_disponivel < R$350.000`.

---

### 3.13 Headcount por Horizonte

Totais consolidados (equipe base — BDRs são adicionados dinamicamente conforme Seção 3.8):

| Área | H1 | H2 | H3 |
|------|:--:|:--:|:--:|
| CSP | 4 | 10 | 25 |
| Comercial | 2 | 3 | 6 |
| G&A | 1 | 3 | 5 |
| **Total** | **7** | **16** | **36** |

---

### 3.14 Estrutura de Custos Operacionais

Modelo único `max(piso, proporcional)` — válido para todos os meses, sem distinção de regime:

```
custo[M] = max(piso_mínimo, fat_liq[M] × proporção)
```

| Centro de Custo | Piso mínimo (R$/mês) | Proporção sobre fat. líquido |
|-----------------|---------------------:|:----------------------------:|
| CSP | R$ 14.600 | 35% |
| Broker (inbound) | R$ 15.000 | 16% |
| Comercial (equipe) | R$ 6.000 | 11% |
| G&A | R$ 9.000 | 18% |
| **Total mínimo** | **R$ 44.600** | — |
| **EBITDA em regime pleno** | — | **20%** (= 1 − 0,35 − 0,16 − 0,11 − 0,18) |

> O broker segue o modelo Fase 1/Fase 2 (Seção 3.8) e não a fórmula simples `max(piso, proporcional)` de outros centros de custo.

---

## 4. Motor de Cálculo

### 4.1 Inputs

#### Inputs obrigatórios (sliders + MCQs)

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `meta_fat_bruto` | number | Meta de fat. bruto em M12 (R$60K–R$450K) |
| `capital_disponivel` | number | Capital total disponível — CAPEX + giro |
| `network_level` | enum | `'baixo' \| 'medio' \| 'alto'` |
| `network_tier` | enum | `'tiny' \| 'small' \| 'medium'` |
| `experiencia` | enum | `'teorico' \| 'solida'` |

#### Parâmetros de imersão (editáveis — default = benchmarks V4)

| Variável | Tipo | Default | Descrição |
|----------|------|--------:|-----------|
| `ticket_saber_tiny` | number? | R$ 18.200 | Ticket Saber para clientes Tiny |
| `ticket_saber_small` | number? | R$ 19.589 | Ticket Saber para clientes Small |
| `ticket_saber_medium` | number? | R$ 21.027 | Ticket Saber para clientes Medium |
| `ticket_ter_tiny` | number? | R$ 2.900 | Ticket Ter para clientes Tiny |
| `ticket_ter_small` | number? | R$ 3.500 | Ticket Ter para clientes Small |
| `ticket_ter_medium` | number? | R$ 6.000 | Ticket Ter para clientes Medium |
| `ticket_executar_medium` | number? | R$ 5.500 | Ticket Executar (Medium+) |
| `conversao_mql_tiny` | number? | 10% | Taxa conv. MQL→Venda Tiny (decimal, ex: 0.10) |
| `conversao_mql_small` | number? | 13% | Taxa conv. MQL→Venda Small |
| `conversao_mql_medium` | number? | 9% | Taxa conv. MQL→Venda Medium |

> Todos os campos de imersão são opcionais (`?`). Quando ausentes, o motor usa os valores de `PARAMS` como fallback — garantindo backward-compatibility com sessões antigas.

---

### 4.2 Step 1 — Identificação do Horizonte

```typescript
function identificaHorizonte(meta_fat_bruto: number): Horizonte {
  if (meta_fat_bruto <= 60_000)  return 'H1'
  if (meta_fat_bruto <= 150_000) return 'H2'
  if (meta_fat_bruto <= 450_000) return 'H3'
  return 'H4+'
}
```

---

### 4.3 Step 2 — Métricas Blended por Horizonte

Calculadas a partir do mix de tiers do horizonte (não do `network_tier`). A partir de v3.1, usam os valores inseridos pelo candidato com fallback para PARAMS:

```typescript
blended_ticket_saber = Σ mix[tier] × (input.ticket_saber[tier] ?? PARAMS.tickets.saber[tier])
blended_ticket_ter   = Σ mix[tier] × (input.ticket_ter[tier]   ?? PARAMS.tickets.ter[tier])
blended_conversao    = Σ mix[tier] × (input.conversao_mql[tier] ?? PARAMS.canais.inbound.conversao[tier])
blended_cpmql        = Σ mix[tier] × PARAMS.canais.inbound.cpmql[tier]  // CPMQL fixo (admin)
```

`blended_ticket_ter` substitui o antigo `ter_pontual` (valor fixo R$3.000) no cálculo da expansão Ter. Com os defaults dos benchmarks, o blended resulta em ~R$3.390 (H1), ~R$3.515 (H2) e ~R$3.545 (H3).

---

### 4.4 Step 3 — Engenharia Reversa + Calibração 2 Passadas

#### 3a. Alvos iniciais (n_scale = 1,0)

```typescript
meta_aquisicao_m12 = meta_fat_bruto × 0,75
N_saber_m12_base   = (meta_aquisicao_m12 × 0,80) / blended_ticket_saber
N_executar_m12_base = (meta_aquisicao_m12 × 0,20) / ticket_executar_medium
N_total_m12        = (N_saber_m12_base + N_executar_m12_base) × n_scale  // n_scale = 1,0 na 1ª passada
```

As frações `frac_saber` e `frac_executar` são derivadas dos valores base (invariantes à escala):

```typescript
frac_saber    = N_saber_m12_base / (N_saber_m12_base + N_executar_m12_base)
frac_executar = N_executar_m12_base / (N_saber_m12_base + N_executar_m12_base)
```

#### 3b. Calibração em 2 passadas

O MRR acumulado de cohorts Executar de M1 a M11 inflaria `fat_bruto_M12` para ~2,2× a meta sem correção. A calibração em 2 passadas garante `fat_bruto_M12 ≈ meta`:

```
Passada 1: simular com n_scale = 1,0
           → mede fat_bruto_M12_raw

n_scale = meta_fat_bruto / fat_bruto_M12_raw   // tipicamente ≈ 0,45

Passada 2: simular com n_scale calculado
           → fat_bruto_M12 ≈ meta (erro residual < 3% por contribuição orgânica)
```

> A contribuição orgânica dos primeiros meses (M1–M4 para rede Média) não escala com `n_scale`, causando o resíduo de até 3%.

---

### 4.5 Step 4 — Simulação Mês a Mês (M1–M24)

#### 4.5.1 Pré-cômputo dos Cohorts Executar

Antes do loop mensal, calcula-se `cohort_executar[m]` para todo m ∈ [1, 24]:

```typescript
for m in 1..24:
  ramp = ramp_up[m] × growthFactor(m)
  n_inbound_total  = N_total_m12 × ramp
  n_inbound_saber  = n_inbound_total × frac_saber
  n_inbound_exec   = n_inbound_total × frac_executar
  n_organic        = organic_mqls[m-1] × conversao[network_tier]

  n_saber_arr[m]        = n_inbound_saber + n_organic
  n_medium_saber_arr[m] = n_inbound_saber × mix_medium[horizonte]
                        + (network_tier == 'medium' ? n_organic : 0)

  path_b = n_medium_saber_arr[m-1] × taxa_upsell(n_medium_saber_arr[m-1], experiencia)
  cohort_executar[m] = n_inbound_exec + path_b
```

#### 4.5.2 Loop P&L (M1–M24)

Para cada mês m, em ordem sequencial (estado acumulado):

```typescript
// Receita Saber (aquisição inbound + orgânicos)
receita_saber = n_saber_arr[m] × blended_ticket_saber
              + n_organic × ticket_saber[network_tier]
              // (nota: orgânicos usam ticket do network_tier, não blended)

// ticket_executar = input.ticket_executar_medium ?? PARAMS.tickets.executar.medium
// (declarado antes da engenharia reversa — usado em todas as referências abaixo)

// Receita Executar — novos (1ª mensalidade)
receita_executar_acq = cohort_executar[m] × ticket_executar

// Base de retenção Executar (cohorts M1..M-1 com churn)
base_sem_churn = Σ cohort_executar[m']  para m' ∈ [1, m-1]
apply_churn    = base_sem_churn × ticket_executar >= R$40.000   // trava

base_executar  = Σ cohort_executar[m'] × (apply_churn ? churn_factor(m', m) : 1,0)
receita_executar_ret = base_executar × ticket_executar

// Ter Pontual (apenas M3+) — usa blended_ticket_ter (ver Seção 4.3)
base_ativa   = n_saber_arr[m] + n_saber_arr[m-1] + base_executar + cohort_executar[m]
receita_ter  = m >= 3 ? base_ativa × 0,10 × blended_ticket_ter : 0

// Totais
receita_aquisicao = receita_saber + receita_executar_acq + receita_ter
fat_bruto  = receita_aquisicao + receita_executar_ret
fat_liq    = fat_bruto × (m <= 3 ? 0,728 : 0,69888)

// Ineficiência de onboarding (M1–M3): time inexperiente em V4
// Acima de 5 novos clientes/mês, CSP sobe para refletir retrabalho e menor eficiência
total_novos_m        = n_saber_arr[m] + cohort_executar[m]
excesso_onboarding   = m <= 3 ? max(0, total_novos_m − 5) : 0
fator_ineficiencia   = 1 + excesso_onboarding × 0,20   // +20% CSP por cliente acima do limiar

// Custos base
custo_csp       = max(14.600, fat_liq × 0,35) × fator_ineficiencia
custo_comercial = max( 6.000, fat_liq × 0,11)
custo_ga        = max( 9.000, fat_liq × 0,18)
ebitda_antes_broker = fat_liq − custo_csp − custo_comercial − custo_ga

// Broker — Fase 1 ou Fase 2
// Fase 1: ideal baseado na META do M12 (não na receita atual)
fat_liq_m12_target   = meta_fat_bruto × 0,69888
ideal_broker_fase1   = max(15.000, fat_liq_m12_target × 0,16)
ideal_broker_fase2   = max(15.000, fat_liq × 0,16)

if !break_even_reached:
  capital_restante = capital_disponivel + ebitda_acumulado
  custo_broker = max(15.000, min(ideal_broker_fase1, ebitda_antes_broker + capital_restante))
else:
  custo_broker = ideal_broker_fase2

// BDR — apenas quando broker está abaixo do ideal (Fase 1)
broker_constrangido = custo_broker < ideal_broker − 50
gap_clientes = broker_constrangido
  ? max(0, N_total_m12 × ramp − n_organic − custo_broker / custo_por_cliente_inbound)
  : 0
bdr_count = gap_clientes > 0 ? ceil((gap_clientes / 0,03) / 400) : 0
custo_bdr = bdr_count × 2.500

// EBITDA
ebitda = fat_liq − custo_csp − custo_comercial − custo_ga − custo_broker − custo_bdr
ebitda_acumulado += ebitda
if ebitda > 0 && !break_even_reached: break_even_reached = true
```

---

### 4.6 Step 5 — KPIs de Viabilidade

```typescript
// Break-even: primeiro mês com EBITDA > 0
breakeven_mes = projecao.find(p => p.ebitda > 0)?.mes ?? null

// Déficit acumulado (soma de EBITDAs negativos até break-even)
deficit_acumulado = Σ min(0, ebitda[m])  para todo m

// Capital mínimo operacional
capital_minimo         = R$100.000 (franquia) + |deficit_acumulado|
capital_total_investido = capital_minimo + R$150.000 (escritório ref.)

// Payback: mês em que EBITDA acumulado recupera capital_total_investido
saldo = −capital_total_investido
payback_mes = projecao.find(p => { saldo += p.ebitda; return saldo >= 0 })?.mes ?? null

// ROIC — M12 anualizado
roic = (ebitda_M12 × 12 / capital_total_investido) × 100

// Margem Bruta = (fat_liq − CSP) / fat_liq   (média M6–M12)
margem_bruta_m12 = média_M6_M12( (fat_liq − custo_csp) / fat_liq ) × 100

// Margem EBITDA = ebitda / fat_liq   (média M6–M12)
margem_ebitda_m12 = média_M6_M12( ebitda / fat_liq ) × 100

// ROAS (Return on Ad Spend) — M1–M12
roas = fat_aquisicao_acumulado_M12 / broker_acumulado_M12
```

---

### 4.7 Step 6 — Termômetro de Viabilidade

| Dimensão | Verde | Amarelo | Vermelho |
|----------|:-----:|:-------:|:--------:|
| Capital ratio | ≥ 1,5× | ≥ 1,0× | < 1,0× |
| Payback | ≤ 18m | ≤ 24m | > 24m ou null |

```typescript
capital_ratio = capital_disponivel / capital_minimo
```

**Score final:** nível mais crítico entre as 2 dimensões.

---

## 5. Acesso

Sem autenticação. Qualquer pessoa com a URL pode acessar. Dados não persistem — o `.pptx` é o registro permanente.

### Ambiente local

**URL:** http://localhost:3000

Para iniciar: `npm run dev` na raiz do projeto `simulador-forecast`.

---

## 6. Especificação de Telas

### 6.1 Tela de Input

**Rota:** `/`

**Campos numéricos (slider + input):**

| Campo | Min | Max | Step | Default |
|-------|----:|----:|-----:|--------:|
| Meta de fat. bruto M12 | R$ 60.000 | R$ 450.000 | R$ 5.000 | R$ 150.000 |
| Capital disponível | R$ 40.000 | R$ 700.000 | R$ 10.000 | R$ 400.000 |

**Perguntas de qualificação (múltipla escolha obrigatória):**

| Pergunta | Opções |
|----------|--------|
| Como você avalia sua rede de relacionamento com empresários? | Baixa / Média / Alta |
| Qual o porte predominante dos empresários da sua rede? | Tiny / Small / Medium+ |
| Qual sua experiência com marketing de performance e vendas? | Teórico / Sólida |

**Parâmetros de Imersão (v3.1 — editáveis, pré-preenchidos com benchmarks):**

Seção separada por divisor visual, com título "Parâmetros de Imersão" e subtítulo explicativo. Inputs do tipo texto com `inputMode` adequado (numeric para tickets, decimal para conversões). A borda fica vermelha no foco.

| Grupo | Campos | Tipo de input |
|-------|--------|:-------------:|
| $ Ticket Médio — Saber | Tiny / Small / Medium | R$ inteiro |
| $ Ticket Médio — Ter | Tiny / Small / Medium | R$ inteiro |
| $ Ticket Médio — Executar | Medium | R$ inteiro |
| % Conversão MQL → Venda | Tiny / Small / Medium | % decimal |

> **UX:** inputs de conversão usam estado interno de string para permitir digitação de decimais (ex: "10.5"). O valor só é convertido para número no `onBlur`, com clamp entre 0,1% e 100%.

---

### 6.2 Dashboard de Resultados

**Rota:** `/dashboard`

#### Bloco A — Cabeçalho
- Chip de horizonte (H1 / H2 / H3)
- Meta declarada e capital disponível
- Botão "Baixar Apresentação (.pptx)" (CTA primário)
- Link "Refazer simulação"

#### Alerta — Pace mínimo de horizonte (v3.1)

Exibido **imediatamente após o Bloco A** quando `meta_fat_bruto < R$150.000`. Banner em fundo `#FFF5F5` com borda `#C00000`.

```
⚠ Ambição abaixo do pace mínimo de avanço de horizonte
Uma unidade com 12 meses de operação precisa estar faturando no mínimo R$150.000/mês.
Seu forecast de R$[meta]/mês está abaixo deste patamar — revise sua meta ou reavalie o
plano de aquisição antes de avançar.
```

> Razão: qualquer unidade H2 (150K) é o patamar mínimo de maturidade operacional para avanço de horizonte. Metas H1 (≤ R$60K) são válidas para simulação mas sinalizam ambição abaixo do esperado.

#### Bloco B — Indicadores de Viabilidade (v3.3)
- **Sem banner central** — o card único VIÁVEL/ATENÇÃO/CRÍTICO foi removido.
- Dois cards coloridos lado a lado (verde / amarelo / vermelho):
  - **Capital disponível**: `capital_ratio ×` — Verde ≥ 1,5× / Amarelo ≥ 1,0× / Vermelho < 1,0×
  - **Horizonte M12**: chip H1/H2/H3 + sub-texto com a meta de faturamento — Verde para H2/H3, Amarelo para H1

#### Bloco C — KPIs Primários (4 cards coloridos) (v3.3)

Cada card tem fundo e borda na cor correspondente ao seu status:

| KPI | Fórmula | Verde | Amarelo | Vermelho |
|-----|---------|:-----:|:-------:|:--------:|
| Break-even | `breakeven_mes` | ≤ 6m | ≤ 12m | > 12m ou N/A |
| Payback | `payback_mes` | ≤ 18m | ≤ 24m | > 24m ou N/A |
| ROIC | `roic` % anualizado M12 | ≥ 30% | ≥ 15% | < 15% |
| Capital necessário | `capital_total_investido` | capital_ratio ≥ 1,5× | ≥ 1,0× | < 1,0× |

#### Bloco D — Gráfico: Composição do Faturamento + Broker (M1–M24)
- Tipo: Area chart (Recharts ComposedChart)
- Séries (v3.3 — legendas simplificadas): **Aquisição**, **Retenção**, **Expansão**, **Investimento Broker** (linha)
- Linha vertical tracejada em M12 ("Meta M12")

#### Bloco E — Gráfico: MQLs Mensais por Canal (M1–M24)
- Tipo: Stacked Bar Chart
- Barra inferior: MQLs inbound (broker) — `#F4CCCC` / stroke `#C00000`
- Barra superior: MQLs outbound BDR — `#D9EAD3` / stroke `#1A5C38`
- **Nota:** Pré break-even: MQLs outbound = BDRs acionados quando broker está abaixo do ideal. Pós break-even: outbound exibido como `mqls_inbound / 3` (visual — sem custo adicional), sinalizando que o time comercial deve complementar o inbound com prospecção ativa.

#### Bloco F — Cards de Margem e Retorno (4 cards)

| Card | Fórmula | Descrição |
|------|---------|-----------|
| **Margem Bruta** | média M6–M12 de (fat_liq − CSP) / fat_liq | Margem após custo de entrega |
| Margem EBITDA | média M6–M12 de ebitda / fat_liq | Margem após todos os custos |
| ROAS | fat_aquisicao_acum_M12 / broker_acum_M12 | Retorno sobre ad spend |
| ROIC | ebitda_M12 × 12 / capital_investido | Retorno sobre capital total |

> **Margem Operacional removida** (v3.0). O card principal de margem é **Margem Bruta** = (fat_liq − CSP) / fat_liq.

#### Bloco G — Gráfico: Lucratividade Acumulada (M1–M24)
- Tipo: Bar Chart vertical
- Barras positivas: `#D9EAD3` / stroke `#1A5C38`
- Barras negativas: `#F4CCCC` / stroke `#8B0000`
- ReferenceLine no zero e no mês de break-even / payback

#### Bloco H — Alocação de Recursos (Regime M12)
- Gráfico de barras horizontais
- Categorias (v3.1): **CSP / Comercial / G&A / BDRs (se > 0) / EBITDA**
- **Comercial inclui Broker** — `custo_comercial + custo_broker` consolidados em uma única barra. O racional: Broker é custo de aquisição gerido pelo time Comercial; separar as barras fragmentava a leitura. A soma corresponde a ~27% do fat_liq em regime pleno (11% + 16%).
- Valores absolutos (R$) e percentuais do fat_liq M12
- BDRs exibidos apenas quando `custo_bdr > 0` no M12

#### Bloco I — Esforço de Aquisição (Cards) (v3.3)
- Novos clientes Saber/mês (M12)
- MQLs inbound/mês (M12)
- Broker/mês e Broker/ano
- Equipe necessária (headcount por área)
- **Investimento Estimado** (substituiu "CAPEX Estimado"):
  - Franquia = R$ 100K
  - Fluxo de Caixa = `|deficit_acumulado| × 1,30` (prejuízo acumulado + 30% de gordura — valor apresentado sem detalhar a conta)
  - Escritório + Equipamentos = R$ 100K–200K (ou "postergar após break-even" se `capital_disponivel < R$350.000`)
- Card BDR — exibido quando `bdr_count > 0` no M12
- **Alerta de capital vs déficit** (v3.3 — substituiu alerta de broker ratio):
  - Fundo âmbar quando `|deficit_acumulado| / capital_disponivel ≥ 50%`: aviso de atenção, não alarmante
  - Fundo vermelho quando `≥ 80%`: aviso crítico — capital muito próximo do prejuízo, inviabilizando escritório e equipamentos

### 6.3 Painel de Parâmetros (`/params`)

Somente leitura. Exibe todos os valores de `src/config/params.ts` organizados por categoria. Banner no topo indicando modo leitura. Seções colapsáveis.

---

## 7. Exportação PowerPoint (.pptx)

Geração client-side via `pptxgenjs`. 5 slides, 16:9, identidade visual V4.

### Slide 1 — Capa
Fundo `#1A1A1A`, logo V4, título, horizonte, meta, data.

### Slide 2 — Termômetro + KPIs
Bloco colorido grande (VIÁVEL/ATENÇÃO/CRÍTICO) + 2 sub-indicadores + 4 KPI cards.
- Sub-indicadores (v3.3): **Capital disponível ×** e **Horizonte M12** (H1/H2/H3 + meta)

### Slide 3 — Esforço de Aquisição
Cards: broker/mês, MQLs/mês, equipe total, **Investimento Estimado** (v3.3 — Franquia / Fluxo de Caixa / Escritório + Equipamentos).
- Alerta condicional (v3.3): déficit acumulado vs capital disponível — âmbar ≥ 50%, vermelho ≥ 80% (substituiu broker ratio)

### Slide 4 — Projeção de Faturamento e Broker
Gráfico do Bloco D (PNG via html2canvas) + legenda.

### Slide 5 — Lucratividade e Estrutura de Custos
Gráfico do Bloco G (PNG) + tabela de alocação M12.

**Identidade visual:** paleta V4 exclusivamente (zero azul), fonte Arial, fundo slides `#F2F2F2`.

---

## 8. Sistema de Design

### Paleta de Cores

| Papel | Hex |
|-------|:---:|
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

Regra absoluta: **zero azul** em qualquer elemento de UI ou .pptx.

### Tipografia
Arial, Helvetica, sans-serif — Regular (400) e Bold (700). Zero itálico.

---

## 9. Critérios de Aceite

| ID | Critério |
|----|---------|
| CA-01 | Horizonte classificado por fat BRUTO (não receita líquida) |
| CA-02 | Inadimplência = 0% em M1-M3; 4% em M4+ |
| CA-03 | Ramp-up trimestral: Q1=15%, Q2=25%, Q3=28%, Q4=32% sobre volume anual; M10–M12 flat em 1,0 |
| CA-04 | Broker segue Fase 1 (capital) / Fase 2 (receita) — piso R$15.000 em ambas |
| CA-05 | BDRs acionados SOMENTE quando broker está abaixo do ideal (Fase 1 com restrição de capital) |
| CA-06 | Executar usa cohort-based churn: 85% renovam a cada 6 meses (15% churn); trava R$40k |
| CA-07 | Ter Pontual = zero em M1 e M2; começa em M3 |
| CA-08 | fat_bruto M12 ≈ meta declarada (erro < 3%) via calibração em 2 passadas |
| CA-09 | EBITDA regime pleno = 20% do fat_liq (CSP 35% + Broker 16% + Comercial 11% + G&A 18%) |
| CA-10 | Margem exibida = Margem Bruta (fat_liq − CSP) / fat_liq — sem "Margem Operacional" |
| CA-11 | Crescimento pós-M12 = 6%/mês composto sobre N_total_m12 |
| CA-12 | Headcount: H1=7, H2=16, H3=36 (BDRs somados separadamente) |
| CA-13 | Dashboard renderiza em < 1s após "Simular" |
| CA-14 | .pptx gerado em < 5s com identidade V4 |
| CA-15 | Simulação bloqueada para meta > R$450K (H4+) |
| CA-16 | Zero azul em qualquer elemento |
| CA-17 | Zero NaN/Infinity em 216 combinações de inputs |
| CA-18 | Guarda defensiva em `simular()`: blended.ticket_saber ≤ 0, blended.conversao ≤ 0 ou ticket_executar ≤ 0 retornam `emptyResult()` sem lançar exceção |

---

## 10. Cenários de Teste

### Cenário A — H1 Mínimo
- Input: `meta=R$60.000`, `capital=R$200.000`, rede Baixo/Tiny, experiência Teórico
- Verificar: horizonte H1, fat_bruto M12 ≈ R$60k, BDRs só em Fase 1

### Cenário B — H2 Equilibrado
- Input: `meta=R$150.000`, `capital=R$400.000`, rede Médio/Small, experiência Teórico
- Verificar: horizonte H2, break-even entre M3–M6, Ter Pontual zero em M1-M2

### Cenário C — H3 Ambicioso
- Input: `meta=R$450.000`, `capital=R$700.000`, rede Alto/Medium, experiência Sólida
- Verificar: horizonte H3, +10pp no upsell (Sólida), organic MQLs nos primeiros 6 meses

### Cenário D — Capital Apertado (Fase 1 Estendida)
- Input: `meta=R$200.000`, `capital=R$120.000`, rede Baixo/Tiny, experiência Teórico
- Verificar: BDRs aparecem nos meses pré-break-even, somem após break-even

### Cenário E — Capital Folgado (Fase 2 Imediata)
- Input: `meta=R$200.000`, `capital=R$600.000`, rede Médio/Small, experiência Teórico
- Verificar: break-even cedo (M2–M3), zero BDRs em todos os meses, EBITDA ≈ 20% em M12

### Cenário F — H4+ Bloqueado
- Input: `meta=R$500.000`
- Verificar: alerta de escopo, projeção vazia

### Cenário G — Churn Executar
- Input: `meta=R$200.000`, `capital=R$500.000`, rede Alto/Medium, experiência Sólida
- Verificar: trava R$40k atingida ~M4-M5, base_executar cresce mais devagar após trava

---

*SPEC v3.3 — Maio/2026. Mudanças v3.2 → v3.3 (apenas UI — motor de cálculo inalterado):*
- *Termômetro: removido banner central VIÁVEL/ATENÇÃO/CRÍTICO. Sub-indicadores agora são "Capital disponível ×" e "Horizonte M12" (H1/H2/H3 + meta). Payback migrado exclusivamente para os KPI cards*
- *KPI cards: escala de cores verde/amarelo/vermelho aplicada individualmente por card (break-even, payback, ROIC, capital necessário)*
- *Gráfico de faturamento: legendas simplificadas — "Aquisição / Retenção / Expansão / Investimento Broker" (removidos "Saber", "Ter" e "Executar" dos labels)*
- *Card CAPEX Estimado renomeado para "Investimento Estimado" com três linhas uniformes: Franquia / Fluxo de Caixa (déficit ×1,30) / Escritório + Equipamentos*
- *Alerta de broker ratio (> 25% do capital) removido. Substituído por alerta de déficit acumulado vs capital: âmbar ≥ 50%, vermelho ≥ 80%*

*SPEC v3.2 — Maio/2026. Mudanças v3.1 → v3.2:*
- *Broker Fase 1: `ideal_broker` agora calculado sobre `meta_fat_bruto × 0,69888 × 16%` (alvo do M12), não sobre a receita atual do mês. Garante que maior ambição exige maior comprometimento de broker desde M1, aumentando proporcionalmente o capital mínimo necessário*
- *Ineficiência de onboarding (M1–M3): novo mecanismo — quando `total_novos > 5 clientes/mês`, CSP sobe +20% por cliente excedente. Reflete retrabalho e menor eficiência do time inexperiente no modelo V4*
- *Churn Executar: `renovacao_executar` ajustado de 90% para 85% por renovação semestral (15% de churn). Projeções de retenção mais conservadoras: 72% a 12 meses, 61% a 18 meses*
- *MQLs outbound pós break-even: após o break-even, o gráfico de MQLs exibe outbound = `inbound / 3` (visual, sem custo). Sinaliza necessidade de prospecção ativa do time comercial para compensar a queda natural do inbound (broker financiado por receita menor que o broker da Fase 1)*

*SPEC v3.1 — Maio/2026. Mudanças v3.0 → v3.1:*
- *Parâmetros de Imersão: tickets (7 campos) e conversões MQL (3 campos) agora editáveis no formulário de input, com defaults = benchmarks V4*
- *Blended Ter: `blended_ticket_ter` (ponderado pelo mix do horizonte) substitui `ter_pontual` fixo de R$3.000 no cálculo da expansão*
- *`ticket_executar` dinâmico: substitui `PARAMS.tickets.executar.medium` em todas as ocorrências do loop P&L e da engenharia reversa*
- *Alocação de Recursos: Comercial + Broker consolidados em uma única barra ("Comercial"); BDRs permanecem condicionais*
- *Alerta de pace mínimo: exibido no dashboard quando `meta_fat_bruto < R$150.000`*
- *UX: inputs de conversão usam estado interno de string (sem trava de decimal ao digitar); inputs de ticket usam `type="text"` com `inputMode="numeric"`*
- *Motor: zero mudanças no racional ou estrutura de cálculo — ramp-up, 75/25, 80/20, calibração 2 passadas, churn, Fase 1/2 e BDRs preservados integralmente*

---

*SPEC v3.0 — Maio/2026. Principais mudanças v2.x → v3.0:*
- *Ramp-up reescrito: pesos trimestrais Q1/Q2/Q3/Q4 com interpolação linear*
- *Regra 75/25 + 80/20 em substituição à regra 70% Saber anterior*
- *Calibração em 2 passadas para fat_bruto M12 ≈ meta*
- *Executar: cohort-based churn (90%/6m) + trava R$40k em substituição ao sliding window*
- *Broker: Fase 1 (capital) / Fase 2 (receita) com piso R$15k (era R$10k)*
- *BDRs: acionados apenas na Fase 1 quando broker está abaixo do ideal*
- *Ter Pontual: início em M3 (era M1)*
- *Margem Bruta em substituição a Margem Operacional*
- *Headcount simplificado: totais por horizonte (H1=7, H2=16, H3=36)*
