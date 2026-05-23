# PRD — Simulador de Forecast para Franqueados
**V4 Company | Versão 1.0 | Abril/2026**

---

## 1. Visão Geral

### O problema
O processo de expansão da rede usa a planilha de planejamento real da rede (DRE completo, análise SWOT, minúcias operacionais). A complexidade técnica cria barreira para candidatos em fase inicial: excesso de informação gera paralisia antes do "Aha! Moment".

### A solução
Aplicação interna que transforma dois inputs do candidato em um dashboard visual de alto nível. Motor de engenharia reversa: parte da **meta de faturamento** e calcula o esforço necessário para chegar lá.

### Objetivo principal
Validar, de forma rápida e visual, se o modelo de negócio da V4 é compatível com a **ambição e o capital** do candidato.

---

## 2. Personas

| Persona | Papel | Objetivo no app |
|---------|-------|-----------------|
| **Candidato a franqueado** | Usuário final (acesso temporário) | Ver se o negócio é viável para sua realidade |
| **Consultor V4** | Operador durante o workshop | Guiar o preenchimento e conduzir a conversa |
| **Admin V4** | Configurador dos parâmetros de benchmark | Manter os dados da rede atualizados |

---

## 3. Jornada do Usuário

```
1. ACESSO      → Candidato recebe link temporário durante o workshop
2. INPUT       → Consultor guia: meta faturamento mês 12 + capital disponível
3. SIMULAÇÃO   → Dashboard gerado instantaneamente
4. DISCUSSÃO   → Consultor usa os resultados como guia de conversa
5. CTA         → Candidato exporta PDF de 2 páginas ("Resumo Executivo do BP")
```

---

## 4. Features

### 4.1 Tela de Input (Candidato)
- Campo: **Meta de faturamento bruto no mês 12** (slider ou input numérico)
- Campo: **Capital disponível total** (CAPEX + capital de giro)
- Botão: "Simular"
- UX minimalista — apenas esses dois campos visíveis

### 4.2 Motor de Cálculo (Engenharia Reversa)
Fluxo de cálculo encadeado:

```
Ambição (faturamento mês 12)
  → Identifica Horizonte alvo (H1/H2/H3/H4/H5)
  → Projeta ramp-up mensal (meses 1–11 até chegar ao mês 12)
  → Vendas necessárias por mês (faturamento / ticket médio)
  → MQLs necessários (vendas / taxa de conversão)
  → Investimento em broker (MQLs × custo por MQL)
  → Headcount necessário (baseado no volume de entrega)
  → Estrutura de custos (% por centro de custo do horizonte)
  → Resultado líquido (EBITDA) por mês
```

### 4.3 Dashboard de Resultados (Output)

| Componente | Descrição |
|------------|-----------|
| **KPIs Primários** | Margem de Lucro, Break-even (mês), Payback Estimado (meses), ROIC |
| **Termômetro de Viabilidade** | Alerta visual se o pace projetado viola a regra de horizontes |
| **Gráfico de Linha** | Evolução mensal do faturamento bruto (projeção 12–24 meses) |
| **Gráfico de Colunas** | Lucratividade acumulada ao longo do período |
| **Cards de Esforço** | Investimento em broker, Qtd. MQLs outbound, Equipe necessária, Divisão CAPEX/OPEX |
| **Alocação de Recurso** | Separação de custos: CSP, Comercial, G&A |

### 4.4 Termômetro de Viabilidade (Regra de Pace)
Alerta visual em 3 níveis (verde / amarelo / vermelho) baseado nos horizontes históricos da rede:

| Horizonte | Faixa | Prazo máximo |
|-----------|-------|-------------|
| H1 | Até R$ 60K | Sair em até 4 meses |
| H2 | Até R$ 150K | Sair em até 8 meses após H1 |
| H3 | Até R$ 450K | Sair em até 12 meses após H2 |

### 4.5 Exportação PDF
- "Resumo Executivo do Business Plan" — 2 páginas
- Candidato leva consigo os principais KPIs do seu futuro negócio
- Identidade visual V4 (paleta da rede, sem azul)

### 4.6 Painel Admin (Configuração de Benchmarks)
Acessível apenas por administradores V4. Permite editar:
- Taxas de conversão (MQL → Venda)
- Ticket médio por categoria (Saber, Ter, Executar) e por Tier
- Custo por MQL e CAC estimado
- Percentual de custos por faixa de faturamento
- Headcount por volume de entrega
- Carga tributária e Royalties

---

## 5. Recursos Disponíveis (Reutilizar)

### 5.1 Skills V4 — Benchmarks já mapeados

A `financial-report` skill contém os **benchmarks reais da rede por horizonte**:

| Indicador | H1 | H2 | H3 | H4 | H5 |
|-----------|:--:|:--:|:--:|:--:|:--:|
| Fat. Líquido referência | R$ 43.680 | R$ 109.200 | R$ 326.726 | R$ 679.770 | R$ 1.014.832 |
| % CSP | 41,0% | 38,6% | 43,6% | 23,4% | 36,0% |
| % Mg. Operacional | 59,0% | 61,4% | 56,4% | 76,6% | 64,0% |
| % Comercial | 36,9% | 39,2% | 32,3% | 28,1% | 29,5% |
| % G&A | 20,6% | 20,4% | 18,9% | 14,0% | 13,5% |
| % EBITDA | 1,6% | 1,8% | 5,3% | 34,5% | 21,0% |

> Fonte: `V4-Skills/financial-report/SKILL.md` — benchmarks da rede, calculados a partir da precificação e estrutura organizacional padrão.

### 5.2 Sistema de Design V4 — `financial-viz` skill

Paleta de cores já definida (usar exatamente esta):

| Papel | Hex |
|-------|-----|
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

**Regra absoluta:** nunca usar azul ou cores fora desta paleta.

Fonte: Arial. Tom: profissional, tecnológico, sem elementos decorativos.

Tipos de gráfico disponíveis na skill (reusar lógica): Waterfall, Linha com marcadores, Barras verticais, Area chart, KPI Scorecards.

### 5.3 Glossário e Contexto de Negócio
- **Investidores** = colaboradores das unidades (nunca "funcionários")
- **Hosts** = clientes das unidades
- **Horizontes H1–H5** = faixas de maturidade por faturamento líquido
- **Produtos**: Saber, Ter, Executar, Potencializar
- **Tiers**: Tiny / Small / Medium / Large / Enterprise
- **Canais**: Lead Broker, Deal Broker, Meet Broker, V4 Fund, CSC, ISAAS

---

## 6. Lacunas — O que precisa ser validado com a V4 antes do SPEC

Os itens abaixo são **obrigatórios** para escrever a `SPEC.md`. Não é possível implementar o motor de cálculo sem eles.

### 6.1 Parâmetros de conversão e CAC
- [ ] **Taxa de conversão MQL → Venda**: qual o % médio atual da rede?
- [ ] **Custo por MQL no Lead Broker**: valor médio por lead comprado
- [ ] **CAC médio estimado** por horizonte: quanto custa adquirir um Host?

### 6.2 Ticket médio por produto e tier
- [ ] Ticket médio do produto **Saber** por tier (Tiny, Small, Medium, Large, Enterprise)
- [ ] Ticket médio do produto **Ter** por tier
- [ ] Ticket médio do produto **Executar** por tier
- [ ] Mix esperado de produtos/tiers para uma unidade nova (início em H1)

### 6.3 Headcount e estrutura de equipe
- [ ] Quantos **Coordenadores de PE&G** são necessários por faixa de faturamento?
  - Ex: "1 Coord para cada X projetos ativos" ou "1 Coord a cada R$ Y de receita"
- [ ] Quando entra o **Coordenador de Receita** (vendas)?
- [ ] Quando entra o **Coordenador ADM**?
- [ ] Grid salarial resumido: remuneração média por cargo para estimar CSP

### 6.4 Financeiro e tributação
- [ ] **Royalties**: percentual cobrado sobre faturamento bruto
- [ ] **Carga tributária**: % sobre faturamento bruto (Simples Nacional ou regime aplicável)
- [ ] **CAPEX médio inicial**: qual o investimento inicial típico para abrir uma unidade?
  - Inclui: setup, tecnologia, primeiros meses de operação?

### 6.5 Ramp-up de faturamento
- [ ] Qual a **curva de ramp-up histórica** dos primeiros 12 meses?
  - Ex: Mês 1 = 20% da meta, Mês 3 = 40%, Mês 6 = 65%, Mês 12 = 100%
  - Ou a V4 tem dados de crescimento médio mês a mês para novas unidades?

### 6.6 Regras de acesso temporário
- [ ] Como funciona o acesso do candidato? Token por e-mail? Link com expiração?
- [ ] O consultor cria o acesso ou é gerado automaticamente?
- [ ] O candidato pode acessar depois do workshop?

---

## 7. Considerações Técnicas (Para Definir no SPEC)

### 7.1 Tipo de aplicação
- Web app (mais provável) — acesso via browser, sem instalação
- Responsive ou apenas desktop? (workshops provavelmente usam notebook)

### 7.2 Backend
- Os cálculos podem ser 100% client-side (JavaScript) se os benchmarks forem fixos no build
- Se benchmarks precisam ser editados em tempo real por admins → precisa de backend + banco de dados

### 7.3 Geração de PDF
- Opções: Puppeteer (headless Chrome), react-pdf, jsPDF
- Deve manter identidade visual V4 no PDF

### 7.4 Autenticação
- Admin: login com senha (simples, interno)
- Candidato: acesso temporário via link/token — definir expiração

### 7.5 Deploy
- Onde será hospedado? (Vercel, VPS, servidor interno V4?)
- Precisa de domínio próprio?

---

## 8. Fora do Escopo (V1)

- DRE completo e detalhado (é exatamente o que queremos evitar)
- Análise SWOT
- Comparativo com outras unidades da rede
- Integração com Conta Azul ou sistemas internos
- Multi-idioma

---

## 9. Critérios de Sucesso

- Candidato consegue chegar ao dashboard com no máximo 2 inputs
- Dashboard carrega em menos de 3 segundos
- PDF gerado em menos de 10 segundos
- Consultor consegue conduzir a sessão sem depender de suporte técnico
- Parâmetros admin editáveis sem necessidade de deploy

---

## 10. Próximo Passo

Coletar as respostas para as **6.1 a 6.6** com a equipe V4.
Com esses dados em mãos, escrever o `SPEC.md` com as regras de cálculo precisas.
