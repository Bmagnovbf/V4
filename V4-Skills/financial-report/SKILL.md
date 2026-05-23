---
name: financial-report
description: >
  Use this skill para gerar relatórios financeiros mensais consolidados de rede de franquias (modelo V4 Company).
  Acione sempre que o usuário mencionar: "relatório financeiro", "relatório mensal", "DRE", "fechamento do mês",
  "resultado das unidades", "análise por horizonte", "análise por regional", "fluxo de caixa da rede",
  ou quando enviar planilha/CSV com dados financeiros de unidades.
  O output é sempre um .docx com: sumário executivo consolidado, DRE resumo, análise de margens,
  análise por horizonte (H1/H2, H3, H4, H5), análise por regional, fluxo de caixa (DFC) e conclusão.
---

# Skill: Relatório Financeiro Mensal — Rede de Franquias

## Estrutura do Relatório (ordem obrigatória)

```
1. Capa / Título
2. Consolidado Rede
   2a. Sumário executivo (texto)
   2b. Tabela de índices históricos (4 meses)
   2c. Abrangência e Compliance de Dados
   2d. Performance de Receita (composição: Aquisição / Renovação / Expansão)
   2e. DRE Resumo — tabela consolidada (4 meses)
   2f. Rentabilidade e Eficiência — EBITDA
   2g. Análise de Margens (Operacional, Contribuição, EBITDA)
   2h. Análise dos Centros de Custo (CSP, Comercial, G&A)
3. Análise por Horizonte
   — Tabela-resumo comparativa (todos os horizontes)
   — Seção individual para cada horizonte: H1/H2, H3, H4, H5
     • RPU
     • DRE do horizonte (4 meses)
     • Performance de Receita
     • Rentabilidade e Eficiência (EBITDA)
     • Centros de Custo (tabela histórica)
     • Análise: Margens / CSP / Comercial / G&A
4. Análise por Regional
   — Tabela consolidada com todos os indicadores por regional
   — Top 3 EBITDA (texto analítico)
   — Flop 3 EBITDA (texto analítico)
5. Fluxo de Caixa (DFC)
   — Análise Horizontal (texto)
   — Tabela DFC por horizonte (5 meses históricos)
   — Análise por Horizonte (texto + cada horizonte individualmente)
   — Conclusão geral
```

---

## Benchmarks por Horizonte

Referências calculadas a partir da precificação e estrutura organizacional padrão da rede. Representam uma operação **equilibrada com investimento de médio a agressivo no comercial**, orientada ao crescimento sustentável.

### Contexto essencial para interpretar os benchmarks

- **Grid salarial:** o bench utiliza o grid salarial padronizado da rede. A maioria das unidades pratica faixas abaixo desse padrão, o que naturalmente gera CSP e G&A reais menores que o bench — isso é positivo, não um desvio problemático.
- **Ticket médio em alta:** a rede está num processo de aumento de ticket médio acima do bench, o que tende a melhorar a margem bruta e reduzir o % de CSP progressivamente.
- **H4 como zona de maior eficiência:** historicamente o H4 apresenta a melhor margem operacional da rede. A eficiência superior é estrutural — capacity bem aproveitado, sem o overhead dos Gerentes de PE&G que surgem no H5.
- **H5 e o overhead de gestão:** unidades em H5 precisam contratar Gerentes de PE&G para gerir a quantidade de Coordenadores. Esses gerentes são overhead necessário para manter o leverage, mas não tocam diretamente o cliente — o que comprime a eficiência operacional em relação ao H4. Além disso, a maioria das unidades em H5 está no início do horizonte, com Gerentes ainda abaixo da capacidade ideal de gestão (até 8 coordenadores cada).
- **Nomenclatura:** os colaboradores das unidades são chamados de **investidores** — manter esse padrão em todo o texto analítico do relatório.
- **Outliers:** sempre verificar a quantidade de unidades em cada horizonte e identificar se há outliers que distorcem a média antes de comparar com o bench.

### Benchmarks por indicador

| Indicador | H1 | H2 | H3 | H4 | H5 |
|-----------|:--:|:--:|:--:|:--:|:--:|
| Fat. Líquido de referência | R$ 43.680 | R$ 109.200 | R$ 326.726 | R$ 679.770 | R$ 1.014.832 |
| **% CSP** | 41,0% | 38,6% | 43,6% | 23,4% | 36,0% |
| **% Mg. Operacional** | 59,0% | 61,4% | 56,4% | 76,6% | 64,0% |
| **% Comercial** | 36,9% | 39,2% | 32,3% | 28,1% | 29,5% |
| **% G&A** | 20,6% | 20,4% | 18,9% | 14,0% | 13,5% |
| **% EBITDA** | 1,6% | 1,8% | 5,3% | 34,5% | 21,0% |

> **Nota H1:** EBITDA próximo de zero é esperado — o horizonte está em fase de estruturação. O foco analítico para H1 deve ser controle de G&A e crescimento de receita, não rentabilidade.
> **Nota H4:** o bench pode estar subavaliando a eficiência real desse horizonte. Aguardar mais insumos históricos antes de revisar.

### Regra de alerta no texto analítico

Desvio ≥ 5 p.p. em relação ao benchmark dispara menção explícita no texto. Abaixo disso, contextualizar apenas se relevante para a narrativa do período.

---

### Lógica interpretativa por indicador

Cada indicador deve ser lido em conjunto com os demais — nunca de forma isolada. A skill deve aplicar as regras abaixo ao redigir qualquer análise de horizonte, regional ou consolidado.

#### Faturamento Líquido
Quanto maior, melhor. Analisar sempre em conjunto com a variação vs mês anterior e vs benchmark de referência do horizonte. Crescimento de receita com melhora de margens = cenário ideal. Crescimento com piora de margens = sinal de que a estrutura de custos não acompanhou o ritmo.

#### % CSP — guard-rail de qualidade
O CSP não é apenas um custo — é o indicador proxy da qualidade da entrega ao cliente. Interpretar sempre dentro da faixa:

| Faixa | Leitura | Ação no texto |
|-------|---------|---------------|
| < 30% | ⚠️ Alerta: possível baixa senioridade dos investidores ou excesso de projetos por investidor, comprometendo qualidade da entrega | Sinalizar e questionar a relação capacity/qualidade |
| 30% – 40% | ✅ Zona saudável | Confirmar positivamente se dentro do bench |
| > 40% | ⚠️ Alerta: possível slots vazios na equipe, baixa eficiência de capacity ou ticket médio abaixo do ideal — comprime diretamente o EBITDA | Sinalizar e cruzar com RPU e número de projetos ativos |

Desvio ≥ 5 p.p. do benchmark do horizonte = mencionar no texto com causa provável.

#### % Mg. Operacional (= Mg. Bruta)
Faturamento Líquido − CSP / Faturamento Líquido. Segue as mesmas considerações do CSP — são o espelho um do outro.
- Quanto maior, melhor — reflete eficiência operacional
- **Acima de 73%:** atenção à qualidade da entrega. Uma margem muito alta pode indicar subinvestimento na equipe operacional (CSP < 30%), com risco real para a satisfação e retenção de clientes
- Cruzar sempre com o CSP antes de celebrar uma margem operacional elevada

#### % Comercial — combustível do crescimento
O Comercial deve ser lido como **investimento**, não despesa.

| Situação | Leitura |
|----------|---------|
| % acima do bench | Investimento agressivo — verificar se está gerando retorno (crescimento de receita e/ou melhora do hit-rate) |
| % dentro do bench | Equilíbrio saudável |
| % muito abaixo do bench | Risco de estagnação — priorizando resultado de curto prazo em detrimento do crescimento de longo prazo |

Sempre cruzar com a Margem de Contribuição: se o comercial está alto e a Mg. Contribuição está melhorando, significa maior eficiência comercial — cenário positivo. Se está alto e a Mg. Contribuição piorou, o retorno sobre o investimento comercial está abaixo do esperado.

#### % G&A (Administrativo + Gerais — analisar somados)
Despesa sem relação direta com o cliente final. Tudo que se conseguir reduzir nessa taxa é positivo. Analisar Administrativo e Gerais somados, a menos que haja desvio expressivo (≥ 5 p.p.) em apenas uma das linhas — nesse caso, detalhar qual está fora do padrão e por quê.

#### % Margem de Contribuição
Quanto maior, melhor — **desde que haja investimento ativo no Comercial**. A leitura combinada é:

| Situação | Leitura |
|----------|---------|
| Mg. Contrib alta + Comercial investido | ✅ Eficiência comercial elevada — broker gerando retorno acima do esperado |
| Mg. Contrib alta + Comercial baixo | ⚠️ Resultado de curto prazo, risco de estagnação — questionar estratégia de aquisição |
| Mg. Contrib baixa + Comercial alto | Retorno sobre investimento comercial abaixo do esperado — monitorar hit-rate e qualidade dos leads |
| Mg. Contrib baixa + Comercial baixo | Compressão estrutural — investigar CSP e ticket médio |

#### % EBITDA
Síntese de tudo. Uma vez analisados CSP, Comercial, G&A e Margem de Contribuição, o EBITDA é o resultado líquido dessas escolhas. Quanto maior, melhor — mas sempre contextualizado: um EBITDA alto com CSP < 30% é sinal de alerta, não de excelência. O EBITDA saudável é aquele que resulta de um equilíbrio real entre os centros de custo, não de subinvestimento em algum deles.

---

## Glossário e Contexto de Negócio V4 Company

### Sobre a V4 Company
Rede de franquias de marketing B2B com ambição de se tornar a maior empresa B2B de serviços do Brasil. Opera com ~169 unidades ativas, organizadas em regionais e horizontes de faturamento. A estratégia da companhia é guiada pelo modelo **CHAMP** (Consumers, Hosts, Annual Revenue, Milestone IPO, Perpetuity). O throughput principal da companhia é o **NRR**.

### Nomenclatura padrão
- **Investidores** = colaboradores/funcionários das unidades franqueadas. Usar sempre "investidores" no relatório, nunca "funcionários" ou "colaboradores".
- **Hosts** = clientes das unidades franqueadas (empresas que contratam os serviços da V4).
- **Unidades** = franquias da rede. Cada unidade pertence a um franqueado.
- **Regional** = agrupamento de unidades sob a liderança de um Diretor Master ou Multi Franqueado.

### Horizontes de faturamento
Cada unidade é classificada em um horizonte conforme sua Receita Líquida mensal. O horizonte define a maturidade operacional da unidade e o benchmark de referência aplicável.

| Horizonte | Faixa de Receita Líquida | Característica principal |
|-----------|--------------------------|--------------------------|
| **H1** | Até R$ 60K | Estruturação inicial — EBITDA negativo esperado |
| **H2** | R$ 60K – R$ 150K | Consolidação do tripé PE&G + Adm + Receita |
| **H3** | R$ 150K – R$ 450K | Gerência emergente — primeiros Coordenadores de PE&G |
| **H4** | R$ 450K – R$ 900K | Zona de maior eficiência operacional da rede |
| **H5** | Acima de R$ 900K | Maturidade — overhead de Gerentes de PE&G reduz eficiência vs H4 |

O critério de enquadramento usa o valor **efetivamente recebido no caixa** (regime de caixa), não competência. Para avançar de horizonte, a unidade precisa sustentar o faturamento mínimo por pelo menos 2 meses consecutivos.

### Estrutura organizacional das unidades
- **PE&G** (Projetos, Execução e Gestão): área técnica responsável pela entrega ao Host. Composta por Coordenadores de PE&G (e Gerentes em H4/H5). Cada Coordenador suporta até ~8 projetos simultaneamente. Um Gerente de PE&G gerencia até 8 Coordenadores — é overhead necessário para manter leverage em H5, mas não aumenta capacity diretamente.
- **Receita**: área comercial responsável por aquisição (novos Hosts) e monetização (expansão e renovação de contratos existentes). Composta por Coordenador de Receita, Pré-Vendas, Closer e Líder de Monetização.
- **ADM**: área administrativa — Coordenador Administrativo, Financeiro, P&P, HRBP, CS (Sucesso do Cliente).

### Produtos da V4
| Produto | Perfil de uso |
|---------|---------------|
| **Saber** | Diagnóstico e estratégia de marketing — qualquer tier |
| **Ter** | Implementação de ativos digitais — qualquer tier |
| **Executar** | Operação de marketing recorrente — tiers Medium a Large |
| **Potencializar** | Aceleração avançada — tiers Large e Enterprise |

### Tiers de clientes (Hosts)
Classificação pelo faturamento anual do Host, define o modal GTM e o CSP máximo admissível:

| Tier | Faturamento Anual | Modal GTM | CSP Máx. |
|------|-------------------|-----------|----------|
| Tiny | Até R$ 1M | Low-Touch | 30% |
| Small | R$ 1M – R$ 5M | Low-Touch | 30% |
| Medium | R$ 5M – R$ 50M | Mid-Touch | 35% |
| Large | R$ 50M – R$ 500M | High-Touch | 40% |
| Enterprise | R$ 500M+ | High-Touch | 45% |

O mix de tiers da unidade impacta diretamente o CSP médio — unidades com maior proporção de tiers Low-Touch tendem a ter CSP mais baixo.

### Canais de aquisição (Comercial)
- **Lead Broker (Leadbroker):** plataforma de compra de leads (MQLs) da V4. Principal canal de aquisição da rede. Pode ser adquirido por MQL individual ou por **Blackbox** (antigo "pack") — lote de MQLs sortidos por tier, com quantidade mínima definida.
- **Deal Broker:** canal de negociação de oportunidades em estágio mais avançado do funil.
- **Meet Broker:** canal de agendamento de reuniões qualificadas.
- **V4 Fund:** fundo de investimento em marketing — canal complementar de aquisição.
- **CAC de Atribuição / Indicação:** custos de aquisição via canais orgânicos e indicações.
- **CSC (Centro de Serviço Compartilhado):** estrutura centralizada de vendas que algumas unidades utilizam para terceirizar parte do processo comercial.
- **ISAAS (Inside Sales as a Service):** operação de vendas internas terceirizada — fixo + variável.

### Métricas-chave de negócio

| Sigla | Nome completo | Definição |
|-------|---------------|-----------|
| **RPU** | Receita Média por Unidade | Faturamento Líquido total do horizonte ÷ nº de unidades consideradas naquele horizonte |
| **NRR** | Net Revenue Retention | Mede o crescimento da receita a partir da base existente de Hosts, incluindo expansão e descontando churn. NRR > 100% = base crescendo; NRR < 100% = base encolhendo |
| **GRR** | Gross Revenue Retention | Receita retida da base existente, sem contar expansão — mede só o churn puro |
| **MQL** | Marketing Qualified Lead | Lead que atingiu critérios mínimos de qualificação para ser trabalhado pelo time comercial |
| **Hit-rate** | Taxa de conversão MQL → Venda | Indicador de eficiência comercial. Queda no hit-rate explica compressão da Margem de Contribuição mesmo com alto investimento em broker |
| **CAC** | Custo de Aquisição de Cliente | Total investido em Comercial ÷ nº de novos Hosts adquiridos no período |
| **LTV** | Lifetime Value | Valor total gerado por um Host ao longo de sua relação com a unidade |
| **ARR** | Annual Recurring Revenue | Receita recorrente anualizada de um Host |
| **TCV** | Total Contract Value | Valor total do contrato firmado com o Host |
| **GTM** | Go-to-Market | Estratégia e processo de como a unidade vai ao mercado para adquirir e reter Hosts |
| **CR1–CR7** | Conversion Rates | Taxas de conversão em cada etapa do funil: CR1 = Lead→MQL; CR2 = MQL→RM; CR3 = RM→RA; CR4 = RA→Venda |
| **PE&G** | Projetos, Execução e Gestão | Área técnica de entrega — o "CSP" humano da unidade |
| **EMPS** | Estrutura, Modelo, Processos, Sistemas | Framework operacional padrão da rede V4 |
| **CHAMP** | Consumers, Hosts, Annual Revenue, Milestone IPO, Perpetuity | Modelo estratégico que guia a ambição da companhia |
| **Blackbox** | (antigo "pack") | Modalidade de compra no Lead Broker: lote de MQLs sortidos por tier com quantidade mínima definida — sem controle individual sobre qual tier de lead será entregue |

### Contexto estratégico para o texto analítico
- A V4 está em fase de **maturidade de rede e padronização** — o foco é crescimento sustentável com margens saudáveis, não crescimento a qualquer custo.
- O **NRR é o throughput principal** da companhia — qualquer análise que toque em renovação, expansão ou churn deve ser lida sob essa lente.
- Unidades que avançam de horizonte trazem consigo o faturamento mínimo do novo horizonte, o que **dilui o RPU médio** do horizonte de destino — fenômeno esperado e deve ser contextualizado sempre que houver queda de RPU associada a entrada de novas unidades.
- A **qualidade da entrega ao Host** é inegociável — CSP abaixo de 30% é alerta mesmo que o EBITDA esteja alto.

---

## Passo 0 — Verificar arquivo de dados do mês

Ao receber o comando de construção de um novo relatório mensal de fechamento da V4 Company, **antes de qualquer outra ação**, perguntar:

> "Já temos o arquivo com os dados do mês de análise?"

**Se sim:** prosseguir para o Passo 1.

**Se não:** perguntar:

> "Gostaria de criar a aba do mês no documento *Relatório Financeiro Unidades 2026*?"

- Se sim: acionar a skill de criação de aba no Google Docs (`gdocs_create_tab`) para o documento **Relatório Financeiro Unidades 2026**, criando a aba com o nome do mês/ano de referência. Após confirmação da criação, aguardar o usuário preencher os dados e retornar.
- Se não: solicitar que o usuário indique de onde virão os dados antes de continuar.

---

## Passo 1 — Receber os dados do relatório

O formato padrão de entrada é um **documento com tabelas e gráficos já inseridos pelo usuário** (ex.: arquivo enviado via upload ou compartilhado). A skill não coleta dados brutos — ela lê os visuais e extrai os valores necessários para construir o texto analítico.

### Ao receber o documento:
1. Ler o arquivo de `/mnt/user-data/uploads/`
2. Identificar todas as tabelas e gráficos presentes, mapeando:
   - Unidades, horizonte, regional, período de referência
   - Receita líquida, CSP, SG&A (Comercial, Administrativo, Gerais)
   - Entradas e saídas de caixa (DFC)
   - Janela histórica disponível (confirmar com o usuário se necessário)
3. Confirmar o período de análise e a janela histórica antes de avançar

### Se os dados não estiverem em documento:
Solicitar por bloco (consolidado → por horizonte → por regional → DFC), confirmando cada bloco antes de avançar.

---

## Passo 2 — Calcular indicadores

Calcular para cada nível (consolidado, por horizonte, por regional):

| Indicador | Fórmula |
|-----------|---------|
| % Mg. Operacional | (Receita Líquida − CSP) / Receita Líquida × 100 |
| % Mg. Contribuição | (Lucro Bruto − Comercial Variável*) / Receita Líquida × 100 |
| % EBITDA | EBITDA / Receita Líquida × 100 |
| % CSP | CSP / Receita Líquida × 100 |
| % Comercial | Total Despesas Comerciais (4.1) / Receita Líquida × 100 |
| % Administrativo | Total Despesas Administrativas (4.2) / Receita Líquida × 100 |
| % Gerais | Total Despesas Gerais (4.3) / Receita Líquida × 100 |
| Variação vs mês anterior | (Valor Atual − Valor Anterior) / Valor Anterior × 100 |
| RPU | Receita Líquida / Nº de Unidades |
| Saldo DFC | Entradas − Saídas |

### *Linhas que compõem o Comercial Variável (Margem de Contribuição)

Conforme plano de contas padrão da rede, as seguintes linhas do grupo 4.1 são consideradas variáveis:

| Código | Descrição |
|--------|-----------|
| 4.1.03 | Comissão/Variável - Coordenador de Receita |
| 4.1.04 | Comissão/Variável - Time Comercial Aquisição |
| 4.1.06 | Lead Broker |
| 4.1.07 | Deal Broker |
| 4.1.08 | Meet Broker |
| 4.1.09 | V4 Fund |
| 4.1.10 | Visita a Clientes (Aquisição) |
| 4.1.11 | CAC de Atribuição |
| 4.1.12 | CAC de Indicação |
| 4.1.13 | Eventos (Aquisição) |
| 4.1.16 | Centro de Serviço Compartilhado - CSC (Aquisição) |
| 4.1.18 | Eventos (Renovação / Expansão) |
| 4.1.22 | Comissão - Renovação / Expansão |

As demais linhas do grupo 4.1 (remunerações fixas e encargos: 4.1.01, 4.1.02, 4.1.05, 4.1.14, 4.1.15, 4.1.17, 4.1.19–4.1.21, 4.1.23) são fixas e **não entram** no Comercial Variável para fins da Margem de Contribuição — mas integram o total do centro de custo Comercial (% Comercial).

---

## Passo 3 — Redigir e inserir análises por bloco

O relatório é construído **bloco a bloco**: gerar o texto do bloco → exibir no chat para revisão → aguardar aprovação do usuário → inserir no Google Docs → avançar para o próximo bloco.

### Blocos e ordem de construção

| # | Bloco | Seções cobertas |
|---|-------|-----------------|
| 1 | **Consolidado** | Sumário executivo, índice histórico, Performance de Receita, DRE, Rentabilidade, Margens, Centros de Custo |
| 2 | **Horizontes H1/H2 e H3** | Tabela-resumo comparativa + seções individuais H1/H2 e H3 |
| 3 | **Horizontes H4 e H5** | Seções individuais H4 e H5 |
| 4 | **Regional** | Tabela consolidada + Top 3 + Flop 3 |
| 5 | **DFC + Conclusão** | Tabela DFC, análise por horizonte, conclusão geral |

> **Nota bloco 5 (DFC):** os dados de DFC chegam após a conciliação de caixa, geralmente com dias de defasagem em relação ao fechamento do DRE. Só iniciar o bloco 5 quando o usuário confirmar que os dados de DFC estão disponíveis. Até lá, o relatório pode ser entregue com os blocos 1–4.

### Fluxo por bloco

```
1. Gerar o texto completo do bloco (com base nos dados e na lógica abaixo)
2. Exibir no chat — o usuário lê, aprova ou solicita ajustes
3. Se ajuste: editar e re-exibir; repetir até aprovação
4. Quando aprovado: inserir no Google Docs via batchUpdate (deleteContentRange + insertText)
5. Confirmar inserção e avançar para o próximo bloco
```

### Conteúdo de cada bloco

**Bloco 1 — Consolidado:**
- Performance de Receita: valor absoluto + variação % vs mês anterior, composição % Aquisição/Renovação/Expansão, destaque de produtos/linhas que impulsionaram
- Rentabilidade — EBITDA: valor absoluto + variação % + margem % + variação p.p. + causa principal
- Análise de Margens (a/b/c para cada margem): comportamento (valor atual, variação p.p.) + causa + ponto de atenção (se houver)

**Blocos 2 e 3 — Por Horizonte:**
- RPU com variação % — contextualizar diluição se houver entrada de novas unidades
- Performance de Receita: valor + variação + causa
- EBITDA: valor + margem + variação
- Cada centro de custo: comportamento + causa, cruzando com a lógica interpretativa da seção de benchmarks
- Flags: unidades com EBITDA negativo, anomalias, outliers que distorcem a média
- **Bloco de recomendações ao final de cada horizonte** (ver formato abaixo)

**Formato obrigatório do bloco de recomendações por horizonte:**

```
📍 Próximo ciclo — [Nome do Horizonte]

O que monitorar:
• [Indicador 1]: [por quê merece atenção e o que observar]
• [Indicador 2]: [por quê merece atenção e o que observar]

Alavanca prioritária:
• [Ação concreta recomendada para Diretores Regionais e liderança da Matriz]
```

Diretrizes para o bloco:
- Máximo 3 itens no "O que monitorar" — priorizar o que realmente importa
- A "Alavanca prioritária" deve ser específica e acionável, não genérica ("monitorar o CSP" não é alavanca — "verificar a relação de projetos ativos por investidor nas unidades com CSP acima de 40%" é)
- Tom consultivo — parceria, não auditoria

**Bloco 4 — Regional — Top 3 / Flop 3 EBITDA:**
- Multi-franquias (ex: M2, M1) **não entram** na análise Top/Flop — constam na tabela apenas como referência
- Nomear regional + franqueado
- Explicar o diferencial ou problema principal com indicadores específicos que justificam a posição
- Mencionar mix de horizontes da regional quando relevante para contextualizar o resultado

**Bloco 5 — DFC:**
- Saldo consolidado + variação vs mês anterior
- Qual horizonte impulsionou / pressionou
- Análise individual por horizonte
- Conclusão: síntese macro (2–3 frases) + desafios persistentes + foco estratégico recomendado

### Tom e diretrizes de escrita

**Tom:** consultivo, confiante e empático. O relatório é destinado às **principais lideranças da Matriz e aos Diretores Regionais** — não às unidades individualmente. Escrever para quem toma decisões estratégicas sobre a rede, não para quem opera o dia a dia de cada franquia. Diretrizes práticas:
- Reconheça conquistas antes de apontar problemas ("O H4 manteve a melhor eficiência operacional da rede, mesmo sob pressão do comercial.")
- Use linguagem de parceria, não de auditoria ("observamos", "identificamos", "recomendamos atenção" — nunca "falhou" ou "errou")
- Sempre que houver queda expressiva, contextualize a causa antes de apresentar o número
- Evitar frases genéricas como "o período apresentou resultados" — sempre incluir o valor absoluto, a variação em p.p. ou % e a causa principal

**Sobre a janela histórica:**
O relatório exibe 4 meses de dados. Os dois primeiros meses de relatório consolidado da rede foram Janeiro/26 e Fevereiro/26. Indicadores anteriores (a partir de Set/25) estão disponíveis como histórico nas tabelas — usar para contextualizar tendências, mas sem tratar como relatórios completos anteriores.

---

## Passo 4 — Acionar a skill de visualização para revisão

Os gráficos e tabelas **já foram fornecidos pelo usuário** no documento de entrada. A responsabilidade desta etapa é acionar a skill `financial-viz` para **analisar, ajustar e melhorar os visuais existentes**, não para criá-los do zero.

### O que passar para a skill de visualização

Ao acionar a `financial-viz`, entregar:

```
- Os gráficos e tabelas originais extraídos do documento do usuário (Passo 1)
- Os dados calculados no Passo 2 (para validação de consistência)
- O período e janela histórica confirmados
- Eventuais inconsistências ou lacunas identificadas na leitura dos visuais
```

### O que a skill de visualização faz

- Valida se os visuais estão consistentes com os dados calculados
- Ajusta formatação, escalas ou legendas quando necessário
- Melhora a legibilidade visual se identificar oportunidade
- Entrega os visuais revisados prontos para inserção no `.docx`

### Após receber os assets revisados da skill de visualização

Montar o `.docx` seguindo a skill `docx` (ver `/mnt/skills/public/docx/SKILL.md`), intercalando os textos analíticos (Passo 3) com os visuais revisados, na ordem definida na estrutura do relatório (Seção 1 deste documento).

**Formatação do documento:**
- Fonte: Arial, corpo 11pt
- Página: A4, margens 2,5cm
- Título principal: 20pt, negrito, centralizado
- Heading 1 (seções principais): 16pt, negrito
- Heading 2 (subseções): 14pt, negrito
- Heading 3 (análises a/b/c): 12pt, negrito
- Rodapé: nome do relatório + data de geração + número de página

---

## Passo 5 — Validar e encerrar

A entrega acontece bloco a bloco (ver Passo 3). Após todos os blocos aprovados e inseridos no Google Docs, fazer uma checagem final:

1. Confirmar que todos os placeholders `[análise aqui]`, `[inserir valor]`, `[x%]` e `[regional N]` foram substituídos — se sobrar algum, identificar e preencher
2. Confirmar que o bloco 5 (DFC + Conclusão) foi inserido, ou registrar explicitamente que está pendente aguardando dados de DFC
3. Informar ao usuário o resumo de entrega:
   - EBITDA consolidado + margem + variação vs mês anterior
   - Melhor e pior horizonte em EBITDA%
   - Saldo consolidado de caixa + variação (se DFC disponível)
   - Blocos entregues vs pendentes

---

## Arquivos de referência

A pasta `references/` contém dois documentos de apoio que devem ser consultados ao construir cada relatório:

| Arquivo | Propósito | Quando usar |
|---------|-----------|-------------|
| `references/estrutura-relatorio.md` | Template em Markdown com a estrutura completa e todos os placeholders `[análise aqui]` | Usar como esqueleto para montar o relatório — garante que nenhuma seção seja omitida e que a hierarquia de títulos esteja correta |
| `references/modelo-referencia-fev26.md` | Relatório completo de Fevereiro/2026 com dados reais e textos analíticos redigidos | Usar como referência de tom, profundidade e forma de escrita — calibrar cada seção para que o nível de detalhe e a narrativa sejam equivalentes |
| `references/modelo-referencia-mar26.md` | Relatório completo de Março/2026 (versão final aprovada) com dados reais, textos analíticos e correções aplicadas | Referência de tom, profundidade e lições aprendidas do ciclo mais recente |

**Regra de uso:**
- Consultar **todas as referências disponíveis** antes de redigir — cada mês adiciona contexto histórico e nuances de tom que o modelo anterior não tinha. Janeiro e Fevereiro são tão importantes quanto Março para entender a evolução da narrativa da rede
- Usar a `estrutura-relatorio.md` para confirmar que todas as seções e subseções estão presentes antes de finalizar cada bloco

---

## Passo 6 — Gerar resumo de highlights e criar rascunho de e-mail

Após a confirmação de inserção do último bloco no Google Docs, sinalizar o encerramento do relatório e oferecer a criação do rascunho de e-mail:

> "Relatório de [Mês/Ano] concluído. Gostaria que eu gerasse o resumo de highlights para o corpo do e-mail de divulgação e já criasse o rascunho no Gmail?"

Se o usuário confirmar, redigir o corpo do e-mail no formato abaixo e criar o rascunho via Gmail (`mcp__claude_ai_Gmail__create_draft`), com:
- **Para:** b.magnofernandes@gmail.com (rascunho — destinatários finais adicionados pelo usuário)
- **Assunto:** `Fechamento Financeiro da Rede — [Mês]/[Ano]`
- **Corpo:** formato HTML, seguindo o template abaixo

### Formato obrigatório do e-mail

```
Boa tarde a todos,

Segue o resumo dos principais highlights do fechamento financeiro da rede referente a [Mês/Ano].
O relatório completo está disponível no link ao final deste e-mail.

📈 Receita — [Headline de 1 linha]
[1 parágrafo: valor absoluto + variação % vs mês anterior + principal driver + RPU]

💰 EBITDA — [Headline de 1 linha]
[1 parágrafo: valor absoluto + variação % + margem + variação p.p. + driver central]

🏆 Destaque do mês — [Headline de 1 linha]
[1 parágrafo: o fato mais positivo do ciclo — horizonte, regional ou métrica que se destacou]

⚠️ Ponto de atenção — [Headline de 1 linha]
[1 parágrafo: o principal risco ou alerta do ciclo — concreto e específico]

🗺️ Regionais — [Headline de 1 linha]
Top 3 EBITDA:
- [Regional 1] (X,XX%)
- [Regional 2] (X,XX%)
- [Regional 3] (X,XX%)

Flop 3 EBITDA:
- [Regional 1] (X,XX%)
- [Regional 2] (X,XX%)
- [Regional 3] (X,XX%)

[1 frase explicando o padrão dos Top 3 e dos Flop 3]

🏦 Fluxo de Caixa — [Headline de 1 linha]
[1 parágrafo: saldo consolidado + variação vs mês anterior + horizonte destaque + CPU Médio]

📊 Engajamento — [X unidades, Y% da rede]

📄 Relatório completo: Relatório Financeiro Unidades [Ano] — [Mês/Ano]

Abraço,
Bruno Magno
Diretor Administrativo | V4 Company
```

### Diretrizes de escrita do e-mail

- **Cada seção = 1 parágrafo curto** — máximo 3 frases. O e-mail é um índice, não o relatório.
- **Não repetir números entre seções** — se o EBITDA já apareceu na seção 💰, não repeti-lo na 🏆.
- **Headline é o gancho** — deve comunicar o veredicto em ≤ 6 palavras ("RPU recorde, receita por efeito de perímetro"; "Receita cai, EBITDA cresce").
- **Regionais:** usar sempre o formato `Código-Franqueado (X,XX%)`. Multi-franquias excluídas.
- **Tom:** direto e informativo — o leitor já conhece o negócio.

---

## Notas e edge cases

- **Horizonte sem unidades no mês:** incluir linha com zero e nota explicativa no texto
- **Unidade com EBITDA fora da banda -50%/+50%:** mencionar na seção de Compliance que foi expurgada
- **Dado de broker faltante em alguma unidade do H5:** incluir flag explícita no texto de análise
- **Janela histórica incompleta:** usar o que estiver disponível, células em branco com nota
- **Sem dados de DFC:** gerar relatório sem a seção 5 e informar o usuário
- **Regional com EBITDA negativo:** destacar em vermelho na tabela e incluir no Flop 3 obrigatoriamente
- **Unidades com EBITDA negativo no H5:** listar nominalmente na análise como ponto de atenção
