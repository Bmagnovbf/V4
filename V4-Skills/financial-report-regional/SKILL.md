---
name: financial-report-regional
description: >
  Use this skill para gerar relatórios financeiros mensais de uma regional específica da rede V4 Company.
  Acione sempre que o usuário mencionar: "relatório da regional", "relatório do regional", "fechamento da regional",
  "resultado da regional", "relatório do [nome do diretor/regional]", "análise da regional [código]",
  ou quando enviar planilha/CSV com dados financeiros de unidades de uma única regional.
  O output é sempre um documento inserido no Google Docs com a análise completa da regional:
  performance das unidades, DRE por unidade e consolidado da regional, análise por horizonte interno,
  fluxo de caixa e recomendações ao Diretor Regional e aos franqueados.
---

# Skill: Relatório Financeiro Mensal — Regional

## Escopo e diferença em relação ao relatório consolidado

Este relatório cobre **uma regional específica** — o conjunto de unidades sob a liderança de um Diretor Regional (ou Multi Franqueado). Ele é complementar ao relatório consolidado da rede: enquanto o consolidado apresenta a visão macro para a Matriz, este relatório aprofunda o desempenho de cada unidade da regional e gera recomendações diretas ao Diretor e aos franqueados.

**A estrutura de tópicos, sequência de seções e visibilidades específicas estão definidas na seção [Estrutura do Relatório] abaixo.**

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

Cada indicador deve ser lido em conjunto com os demais — nunca de forma isolada.

#### Faturamento Líquido
Quanto maior, melhor. Analisar sempre em conjunto com a variação vs mês anterior e vs benchmark de referência do horizonte. Crescimento de receita com melhora de margens = cenário ideal. Crescimento com piora de margens = sinal de que a estrutura de custos não acompanhou o ritmo.

#### % CSP — guard-rail de qualidade
O CSP não é apenas um custo — é o indicador proxy da qualidade da entrega ao cliente.

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
- **Regional** = agrupamento de unidades sob a liderança de um Diretor Regional ou Multi Franqueado.
- **Franqueado** = sócio proprietário de uma ou mais unidades da regional. Neste relatório, o franqueado é parte da audiência — o tom deve ser informativo e transparente, sem ser condescendente.

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
| Tier | Faturamento Anual | Modal GTM | CSP Máx. |
|------|-------------------|-----------|----------|
| Tiny | Até R$ 1M | Low-Touch | 30% |
| Small | R$ 1M – R$ 5M | Low-Touch | 30% |
| Medium | R$ 5M – R$ 50M | Mid-Touch | 35% |
| Large | R$ 50M – R$ 500M | High-Touch | 40% |
| Enterprise | R$ 500M+ | High-Touch | 45% |

### Canais de aquisição (Comercial)
- **Lead Broker (Leadbroker):** plataforma de compra de leads (MQLs) da V4. Principal canal de aquisição da rede. Pode ser adquirido por MQL individual ou por **Blackbox** (antigo "pack") — lote de MQLs sortidos por tier.
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
| **Hit-rate** | Taxa de conversão MQL → Venda | Indicador de eficiência comercial |
| **CAC** | Custo de Aquisição de Cliente | Total investido em Comercial ÷ nº de novos Hosts adquiridos no período |
| **LTV** | Lifetime Value | Valor total gerado por um Host ao longo de sua relação com a unidade |
| **ARR** | Annual Recurring Revenue | Receita recorrente anualizada de um Host |
| **TCV** | Total Contract Value | Valor total do contrato firmado com o Host |
| **GTM** | Go-to-Market | Estratégia e processo de como a unidade vai ao mercado para adquirir e reter Hosts |
| **CR1–CR7** | Conversion Rates | Taxas de conversão em cada etapa do funil: CR1 = Lead→MQL; CR2 = MQL→RM; CR3 = RM→RA; CR4 = RA→Venda |
| **PE&G** | Projetos, Execução e Gestão | Área técnica de entrega — o "CSP" humano da unidade |
| **EMPS** | Estrutura, Modelo, Processos, Sistemas | Framework operacional padrão da rede V4 |
| **CHAMP** | Consumers, Hosts, Annual Revenue, Milestone IPO, Perpetuity | Modelo estratégico que guia a ambição da companhia |
| **Blackbox** | (antigo "pack") | Modalidade de compra no Lead Broker: lote de MQLs sortidos por tier com quantidade mínima definida |

### Contexto estratégico para o texto analítico
- A V4 está em fase de **maturidade de rede e padronização** — o foco é crescimento sustentável com margens saudáveis, não crescimento a qualquer custo.
- O **NRR é o throughput principal** da companhia — qualquer análise que toque em renovação, expansão ou churn deve ser lida sob essa lente.
- A **qualidade da entrega ao Host** é inegociável — CSP abaixo de 30% é alerta mesmo que o EBITDA esteja alto.

---

## Estrutura do Relatório (ordem obrigatória)

```
Título: Relatório da Regional [Código] — [Nome] — [Mês/Ano]

Abrangência e Compliance de Dados

1. Análise da Regional Consolidada
   — Tabela: todas as regionais + todos os indicadores (receita líquida, CSP,
     Mg. Operacional, Comercial, G&A, Mg. Contribuição, EBITDA%)
   1.1 Análise Comparativa
       O que levou esta regional a este resultado — identificar e explicar o
       principal indicador responsável pelo posicionamento no comparativo.
   1.2 Highlights Positivos e Alertas
       ✅ Positivos e ⚠️ Alertas desta regional frente às demais, ainda no nível
       consolidado — sem entrar por unidade.

2. Análise das Margens
   — Tabela: todas as unidades consideradas da regional + todos os indicadores,
     ordenadas por receita líquida decrescente
   2.1 Receita Líquida
       Comportamento da receita total da regional (cresceu/caiu vs mês anterior)
       + RPU da regional.
   2.2 Margem Operacional
       Unidades em destaque positivo e negativo, correlacionando com o CSP.
   2.3 Margem de Contribuição
       Unidades em destaque positivo e negativo, correlacionando com o
       investimento comercial (broker, comissionamento).
       ⚠️ Alerta obrigatório: identificar e nomear as unidades onde
       Mg. Contribuição = Mg. Operacional ou diferença < 1 p.p. — significa que não
       houve despesa variável comercial no período (broker, comissão, eventos).
       NÃO sugerir verificação de lançamento. Interpretar como ausência de aquisição
       ativa de clientes no ciclo e sinalizar o risco: redução de pipeline nos
       próximos meses.
   — Gráfico: ranking das unidades da regional por % EBITDA (melhor → pior)
   2.4 Margem EBITDA
       Análise do resultado final, correlacionando os centros de custo que mais
       impactaram o EBITDA das unidades de destaque positivo e negativo.

3. Fluxo de Caixa
   — Tabela: DFC por regional — entradas, saídas, saldo — visão comparativa
   — Mensagem introdutória: posicionamento desta regional em geração de caixa
     frente às demais
   — Gráfico já inserido no documento: Ranking % Lucro Líquido por unidade
     (saldo DFC / total de entradas) — sem valores nominais expostos
   Conclusão
       2–3 frases: síntese do ciclo + principal alavanca recomendada ao
       Diretor Regional.
```

---

## Passo 0 — Verificar arquivo de dados do mês

Ao receber o comando de construção de um novo relatório mensal de regional, **antes de qualquer outra ação**, perguntar:

> "Já temos o arquivo com os dados do mês de análise para a Regional [código/nome]?"

**Se sim:** confirmar qual regional e o período de referência, depois prosseguir para o Passo 1.

**Se não:** perguntar:

> "Gostaria de criar a aba do mês no documento da regional no Google Docs?"

- Se sim: acionar a skill `gdocs_create_tab` para o documento da regional correspondente, criando a aba com o nome do mês/ano de referência. Após confirmação da criação, aguardar o usuário inserir as tabelas e gráficos e retornar.
- Se não: solicitar que o usuário indique de onde virão os dados antes de continuar.

---

## Passo 1 — Receber os dados do relatório

O formato padrão de entrada é um **documento com tabelas e gráficos já inseridos pelo usuário**. A skill não coleta dados brutos — ela lê os visuais e extrai os valores necessários para construir o texto analítico.

### Ao receber o documento:
1. Ler o arquivo de `/mnt/user-data/uploads/`
2. Identificar todas as tabelas e gráficos presentes, mapeando:
   - Tabela comparativa de regionais (seção 1 e seção 3): todos os indicadores por regional
   - Tabela de unidades da regional (seção 2): receita líquida, CSP, SG&A, EBITDA por unidade
   - DFC (seção 3): **gráfico de Ranking % Lucro Líquido por unidade já inserido no documento pelo usuário** (saldo / total de entradas). Este é o **único formato de dado de caixa disponível por unidade** — a skill não solicita valores nominais de DFC ao usuário, não tenta calcular a partir de outra fonte e não exibe valores absolutos. A visão de caixa das unidades é apresentada exclusivamente em percentual para preservar privacidade entre franqueados que leem o mesmo documento
   - Gráfico de ranking EBITDA por unidade
   - Janela histórica disponível (confirmar com o usuário se necessário)
3. Confirmar o período de análise, a janela histórica e a lista de unidades da regional antes de avançar

**Nota:** todos os dados (comparativo de regionais, unidades e DFC) chegam em um único documento Google Docs, na aba do mês de referência. As tabelas e gráficos já estão inseridos — a skill apenas lê os visuais e preenche os espaços de análise.

---

## Passo 2 — Calcular indicadores

Calcular para cada nível (consolidado da regional, por horizonte interno, por unidade):

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
| % Lucro Líquido DFC | Saldo DFC / Total de Entradas × 100 — **métrica exclusiva do relatório regional**; não usa Receita Líquida como denominador. Representa quanto do caixa efetivamente recebido ficou no saldo. Apresentar apenas em ranking %, sem valores nominais, para preservar privacidade entre unidades |

### *Linhas que compõem o Comercial Variável (Margem de Contribuição)

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
| 1 | **Abrangência** | Sempre redigido e inserido pelo usuário — **ler para contexto, não redigir nem inserir** |
| 2 | **Regional Consolidada** | 1.1 Análise Comparativa + 1.2 Pontos a Destacar |
| 3 | **Análise das Margens** | 2.1 Receita Líquida + 2.2 Mg. Operacional + 2.3 Mg. Contribuição + 2.4 Mg. EBITDA |
| 4 | **Fluxo de Caixa + Conclusão** | Intro geração de caixa + Ranking por unidade + Conclusão |

> **Nota bloco 4 (DFC):** os dados de DFC chegam após a conciliação de caixa, geralmente com dias de defasagem. Só iniciar o bloco 4 quando o usuário confirmar que os dados de DFC estão disponíveis. Até lá, o relatório pode ser entregue com os blocos 1–3.

### Conteúdo de cada bloco

**Bloco 1 — Abrangência:**
> ⚠️ Este bloco é **sempre redigido e inserido pelo usuário** antes de acionar a skill. Não redigir, não inserir. Apenas **ler o texto já presente no documento** para extrair:
- Quantas unidades foram consideradas da regional e qual é o total
- Se alguma unidade foi excluída: qual e por qual critério
Usar essas informações como contexto para todos os blocos seguintes. Iniciar pelo Bloco 2.

**Bloco 2 — Regional Consolidada:**
- **1.1 Análise Comparativa:** foco no **consolidado da regional** — identificar o principal indicador que explica o posicionamento desta regional no comparativo e o raciocínio encadeado que leva ao EBITDA. Citar uma unidade específica apenas se ela for literalmente o fator determinante do resultado regional (ex: outlier que responde por mais de 30% da receita com comportamento atípico). Não listar todos os indicadores — focar no fator determinante e nos 1–2 indicadores que mais contribuíram para o resultado. Mencionar o mix de horizontes quando for relevante: um EBITDA abaixo da média pode ser estrutural (maioria em H1/H2) ou operacional (unidades maduras com resultado fraco) — essa distinção muda completamente o diagnóstico.
- **1.2 Highlights Positivos e Alertas:** 2–4 bullets objetivos com ✅ para positivos e ⚠️ para alertas, sempre com valor e variação. Ex: "✅ Margem de Contribuição de X,X% — melhor da rede no mês" / "⚠️ G&A em X,X% — +Y p.p. acima da média das regionais". Ainda no nível consolidado — sem entrar por unidade, salvo quando o highlight for intrinsecamente sobre uma unidade específica que define o caráter da regional.

**Bloco 3 — Análise das Margens:**
- **Princípio de agrupamento:** não analisar cada unidade individualmente. Agrupar unidades com comportamento semelhante em uma única observação (ex: "X, Y e Z apresentaram CSP acima de 40%, todas em H2, com capacity subutilizado"). Citar unidades individualmente apenas quando o comportamento for único ou relevante o suficiente para não poder ser agrupado.
- **2.1 Receita Líquida:** valor total da regional + variação % vs mês anterior + RPU (receita ÷ nº de unidades). Se houver entrada ou saída de unidade no mês, contextualizar o impacto no RPU.
- **2.2 Margem Operacional:** destacar os grupos de comportamento — grupo de alto desempenho (nomear), grupo de baixo desempenho (nomear). Correlacionar com o CSP — margem operacional alta com CSP saudável é positivo; CSP abaixo de 30% acende alerta de qualidade de entrega.
- **2.3 Margem de Contribuição:** destacar os grupos. Cruzar com o investimento comercial de cada grupo. Alerta obrigatório para unidades onde Mg. Contribuição ≈ Mg. Operacional (diff < 1 p.p.): explicar que não houve despesa variável comercial no período — sem broker, comissão ou eventos — o que indica ausência de aquisição ativa de clientes e gera risco de redução de pipeline nos próximos ciclos. NÃO sugerir revisão de lançamento.
- **2.4 Margem EBITDA:** análise do resultado final por grupo — nomear os grupos que puxaram o resultado para cima e para baixo, correlacionando com o centro de custo determinante de cada grupo.
- **Flags de outlier (aplicar em 2.2, 2.3 e 2.4):** identificar e nomear unidades cujo resultado se distancia significativamente das demais. Um outlier positivo pode mascarar que o restante está fraco; um negativo pode subestimar o avanço real das demais. Contextualizar antes de apresentar a média consolidada.

**Bloco 4 — Fluxo de Caixa + Conclusão:**
- **Gráfico já no documento:** o gráfico de Ranking % Lucro Líquido (saldo / total de entradas) já está inserido no documento — **não solicitar print ou screenshot ao usuário**. Lê-lo diretamente, como qualquer outra tabela ou gráfico do documento.
- **Intro (parágrafo antes do gráfico):** framing rápido — quantas unidades fecharam no azul vs. no vermelho + destaque do caso mais relevante (outlier positivo ou negativo que define o caráter do bloco). Ex: "X das Y unidades da regional encerram o ciclo com saldo positivo, mas o quadro é dominado por [caso]."
- **Análise após o gráfico — princípio de agrupamento:** não analisar cada unidade individualmente. Agrupar por comportamento:
  - Grupo positivo consistente (DFC próximo do EBITDA — mencionar nomes)
  - Grupo com divergência positiva (DFC > EBITDA — DRE positivo, DFC negativo): diagnosticar com base nas causas abaixo
  - Grupo com divergência negativa (DFC < EBITDA — DRE negativo, DFC positivo): diagnosticar com base nas causas abaixo
  - Grupo negativo em ambos (DRE e DFC negativos — diagnóstico direto)
  - Outliers com divergência > 20 p.p.: explicar a hipótese mais provável com base nas causas contextualizadas abaixo

**Causas de inversão DRE/DFC no contexto V4 — usar para direcionar o diagnóstico:**

*DRE positivo / DFC negativo* — o resultado operacional existe, mas o caixa não se materializou:
1. **Saber/Ter parcelado:** projetos one-time reconhecidos integralmente na competência, mas recebidos em parcelas. DRE captura a receita cheia; DFC recebe só a parcela do mês. Quanto maior a proporção de Saber/Ter na carteira, mais comum essa divergência. Solução: avaliar antecipação de recebíveis enquanto o DRE está positivo e há margem para negociar.
2. **Inadimplência:** competência reconhece a receita, mas o pagamento não entrou. Divergência direta entre o que foi faturado e o que foi recebido.
3. **Quitação de passivos acumulados:** meses anteriores com DRE negativo geram obrigações em aberto (fornecedores, tributos, folha atrasada). Quando o resultado melhora, o caixa gerado vai para quitar essas pendências em vez de ficar no saldo. Sinal de que a recuperação operacional ainda não se traduziu em saúde financeira real.

*DRE negativo / DFC positivo* — o caixa está positivo, mas a operação está consumindo mais do que gera:
1. **Recebíveis de exercícios anteriores:** a competência da receita era o mês anterior, mas o recebimento ocorreu neste ciclo. Fôlego de curto prazo que não altera o diagnóstico operacional.
2. **Antecipação de recebíveis de projetos Executar:** Executar é recorrente (contratos de 6–12 meses com entrega mensal). Quando o cliente opta por pagar o compromisso total no cartão parcelado, a unidade pode antecipar esses recebíveis. Apesar de gerar respiro imediato, cria um risco bola de neve: nos meses seguintes há custo de servir mensal (CSP) sem entrada correspondente, pois o caixa do cliente já foi antecipado. Atenção redobrada quando DRE já está negativo.
3. **Parcelamento de despesas:** despesa como broker é reconhecida integralmente na competência (impacta DRE), mas pode ser paga parcelada — caixa sai em parcelas enquanto o DRE já absorveu o custo cheio.
- **Conclusão:** 2–3 frases — síntese do ciclo (DRE + DFC) + principal risco ou alavanca identificada + recomendação específica e acionável ao Diretor Regional.

### Fluxo por bloco

```
1. Gerar o texto completo do bloco
2. Exibir no chat — o usuário lê, aprova ou solicita ajustes
3. Se ajuste: editar e re-exibir; repetir até aprovação
4. Quando aprovado: inserir no Google Docs via batchUpdate (deleteContentRange + insertText)
5. Confirmar inserção e avançar para o próximo bloco
```

### Tom e diretrizes de escrita

**Tom:** consultivo, profissional e informativo. O relatório é destinado às **lideranças da Matriz, ao Diretor Regional e aos sócios franqueados das unidades da regional**. O tom deve ser claro e transparente para todos os perfis — sem jargões internos inexplicados, sem analogias, sem condescendência. Escrever para quem precisa entender o resultado e tomar decisão.

**Tom consultivo e não-determinístico:** apresentar cenários e hipóteses, não vereditos definitivos. O relatório informa e recomenda — não condena.

**Vocabulário proibido (dramático/definitivo):**
- ❌ destruir, corroer, deteriorar, inviabilizar, impossível, colapso, crítico
- ✅ substituir por: reduzindo, dificultando, comprimindo, dissolvendo, pressionando, limitando

**Sem analogias:** não usar comparações metafóricas ("como um motor que engasga", "queimando o fundo do poço"). Fatos e números falam por si.

Diretrizes práticas:
- Reconheça conquistas antes de apontar problemas
- Use linguagem de parceria ("observamos", "identificamos", "recomendamos atenção" — nunca "falhou" ou "errou")
- Sempre que houver queda expressiva, contextualize a causa antes de apresentar o número
- Evitar frases genéricas — sempre incluir o valor absoluto, a variação em p.p. ou % e a causa principal
- Quando mencionar uma unidade individualmente, usar o formato `[Código da unidade] — [Nome do franqueado]`
- Não usar negritos em nomes de unidades dentro de bullets de highlights

**Sobre a janela histórica:**
Usar a mesma janela histórica disponível no documento do usuário, seguindo o mesmo padrão do relatório consolidado (4 meses de DRE, 5 meses de DFC).

---

## Passo 4 — Acionar a skill de visualização para revisão

Os gráficos e tabelas **já foram fornecidos pelo usuário** no documento de entrada. Acionar a skill `financial-viz` para **analisar, ajustar e melhorar os visuais existentes**.

### O que passar para a skill de visualização
```
- Os gráficos e tabelas originais extraídos do documento (Passo 1)
- Os dados calculados no Passo 2 (para validação de consistência)
- O período e janela histórica confirmados
- Eventuais inconsistências ou lacunas identificadas na leitura dos visuais
```

### Após receber os assets revisados
Montar o `.docx` seguindo a skill `docx`, intercalando os textos analíticos (Passo 3) com os visuais revisados, na ordem definida na estrutura do relatório.

**Formatação do documento:**
- Fonte: Arial, corpo 11pt
- Página: A4, margens 2,5cm
- Título principal: 20pt, negrito, centralizado
- Heading 1 (seções principais): 16pt, negrito
- Heading 2 (subseções): 14pt, negrito
- Heading 3 (análises): 12pt, negrito
- Rodapé: nome do relatório + regional + data de geração + número de página

---

## Passo 5 — Validar e encerrar

Após todos os blocos aprovados e inseridos no Google Docs:

1. Confirmar que todos os placeholders `[análise aqui]`, `[inserir valor]`, `[x%]` foram substituídos
2. Confirmar que o bloco de DFC foi inserido, ou registrar que está pendente aguardando dados de conciliação
3. Informar ao usuário o resumo de entrega:
   - EBITDA consolidado da regional + margem + variação vs mês anterior
   - Melhor e pior unidade em EBITDA%
   - Saldo consolidado de caixa (se DFC disponível)
   - Blocos entregues vs pendentes

---

## Passo 6 — Gerar resumo de highlights e criar rascunho de e-mail

Após confirmação de encerramento, oferecer:

> "Relatório da regional [nome] de [Mês/Ano] concluído. Gostaria que eu gerasse o resumo de highlights e já criasse o rascunho de e-mail para envio ao Diretor Regional e aos franqueados?"

Se o usuário confirmar, redigir o corpo do e-mail e criar o rascunho via Gmail (`mcp__claude_ai_Gmail__create_draft`), com:
- **Para:** b.magnofernandes@gmail.com (rascunho — destinatários finais adicionados pelo usuário)
- **Assunto:** `Fechamento Financeiro — Regional [Nome/Código] — [Mês]/[Ano]`
- **Corpo:** formato HTML

### Formato obrigatório do e-mail

```
Boa tarde,

Segue o resumo do fechamento financeiro da Regional [Nome] referente a [Mês/Ano].
O relatório completo está disponível no link ao final deste e-mail.

📊 Posição da Regional — [Headline de 1 linha]
[1 parágrafo: EBITDA% da regional + posição no ranking de regionais
+ variação vs mês anterior + fator principal]

📈 Receita — [Headline de 1 linha]
[1 parágrafo: receita total + variação % vs mês anterior + RPU da regional]

🏆 Unidade destaque — [Headline de 1 linha]
[1 parágrafo: unidade(s) de melhor performance + indicador que se destacou
+ contexto resumido]

⚠️ Ponto de atenção — [Headline de 1 linha]
[1 parágrafo: unidade(s) que merecem atenção + indicador + recomendação direta]

🏦 Fluxo de Caixa — [Headline de 1 linha]
[1 parágrafo: posição da regional no comparativo de caixa
+ unidade destaque positivo ou negativo]

📄 Relatório completo: [link para o Google Docs — aba do mês]

Abraço,
Bruno Magno
Diretor Administrativo | V4 Company
```

### Diretrizes de escrita do e-mail

- **Cada seção = 1 parágrafo curto** — máximo 3 frases. O e-mail é um índice, não o relatório.
- **Headline é o veredicto** — deve comunicar o resultado em ≤ 6 palavras ("EBITDA acima da média, CSP saudável"; "Receita cresce, caixa pressiona").
- **Não repetir números entre seções** — se o EBITDA apareceu em 📊, não repetir em 🏆.
- **Nomear as unidades** — usar sempre `[Código] — [Nome do franqueado]` para manter clareza para todos os leitores.
- **Tom:** direto, informativo e respeitoso com todos os perfis da audiência (Matriz, Diretor Regional e franqueados).

---

## Arquivos de referência

| Arquivo | Propósito | Quando usar |
|---------|-----------|-------------|
| `references/estrutura-relatorio-regional.md` | Template em Markdown com a estrutura completa e todos os placeholders `[análise aqui]` | Usar como esqueleto para montar o relatório — garante que nenhuma seção seja omitida e que a hierarquia de títulos esteja correta |
| `references/modelo-referencia-[mes][ano].md` | Relatório completo de referência com dados reais e textos aprovados (um arquivo por ciclo concluído) | Usar como referência de tom, profundidade e forma de escrita — calibrar cada seção para que o nível de detalhe e a narrativa sejam equivalentes ao ciclo mais recente |

**Regra de uso:**
- Consultar **todas as referências disponíveis** antes de redigir qualquer bloco — cada ciclo concluído adiciona contexto histórico, nuances de tom e lições aprendidas que o modelo anterior não tinha. O primeiro ciclo é tão importante quanto o mais recente para entender a evolução da narrativa da regional.
- Usar a `estrutura-relatorio-regional.md` para confirmar que todas as seções e placeholders estão presentes antes de finalizar cada bloco.
- **Ciclo de aprendizado:** ao final de cada relatório aprovado, salvar o documento final como `references/modelo-referencia-[mes][ano].md`. Esse arquivo passa a ser referência obrigatória para todos os ciclos seguintes. A skill deve reconhecer automaticamente todos os arquivos `modelo-referencia-*.md` presentes na pasta `references/` e consultá-los antes de redigir.

---

## Operação no Google Docs — Workflow Técnico

O relatório é inserido no Google Doc `1M7JHS-1iDV4achYYsZnujvF1NPK9Gf6xOI5mkFTzKYY` via API REST. Cada regional tem uma aba filha (child tab) dentro do grupo "Mai26 - DRE / DFC" (ou equivalente do mês).

### Estrutura de tabs
As abas das regionais são **child tabs** aninhadas sob a tab pai do mês. Para acessar:
```powershell
$doc = Invoke-RestMethod -Uri "https://docs.googleapis.com/v1/documents/$docId`?includeTabsContent=true" -Headers $headers
$tab = $doc.tabs[0].childTabs | Where-Object { $_.tabProperties.tabId -eq $tabId }
$content = $tab.documentTab.body.content
```
Nunca usar `$doc.tabs` diretamente para regionais — elas são child tabs.

### Auth OAuth2 (padrão para todos os requests)
```powershell
$creds = Get-Content 'C:\Users\bruno.magno_v4compan\.config\mcp-gdrive\.gdrive-server-credentials.json' | ConvertFrom-Json
$keys  = Get-Content 'C:\Users\bruno.magno_v4compan\.config\mcp-gdrive\gcp-oauth.keys.json' | ConvertFrom-Json
$refreshBody = "client_id=$($keys.installed.client_id)&client_secret=$($keys.installed.client_secret)&refresh_token=$($creds.refresh_token)&grant_type=refresh_token"
$token = (Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method POST -Body $refreshBody -ContentType "application/x-www-form-urlencoded").access_token
$headers = @{ 'Authorization' = "Bearer $token"; 'Content-Type' = 'application/json; charset=utf-8' }
```

### Workflow de inserção por bloco

**Ordem de construção obrigatória dentro de cada batchUpdate:** inserções e deleções sempre do índice mais alto para o mais baixo — múltiplas operações no mesmo request não deslocam os índices umas das outras se processadas em ordem reversa.

**Bloco 2 — inserção simples:**
1. Fetch do tab para mapear os índices dos placeholders `[análise aqui]` em 1.1 e 1.2
2. batchUpdate com dois `insertText` — primeiro o de maior índice (1.2), depois o de menor (1.1)

**Bloco 3 — inserção após gráfico EBITDA:**
1. Fetch atualizado (índices mudaram após Bloco 2)
2. Localizar o `inlineObjectElement` (gráfico de ranking EBITDA) para determinar onde inserir o texto de 2.4
3. batchUpdate com os 4 insertText de 2.1, 2.2, 2.3, 2.4 — em ordem reversa de índice

**Bloco 4 — intro antes do gráfico DFC, análise+conclusão após:**
1. Fetch atualizado
2. Localizar o `inlineObjectElement` do gráfico DFC para separar intro (antes) de análise (depois)
3. batchUpdate: primeiro insert da análise+conclusão (índice após gráfico), depois insert da intro (índice antes do gráfico)

**Correção de texto já inserido:**
```powershell
# Padrão: deleteContentRange + insertText no mesmo batchUpdate, em ordem reversa
$body = @{
    requests = @(
        @{ deleteContentRange = @{ range = @{ startIndex = $highStart; endIndex = $highEnd; tabId = $tabId } } },
        @{ insertText = @{ location = @{ index = $highStart; tabId = $tabId }; text = $newHighText } },
        @{ deleteContentRange = @{ range = @{ startIndex = $lowStart; endIndex = $lowEnd; tabId = $tabId } } },
        @{ insertText = @{ location = @{ index = $lowStart; tabId = $tabId }; text = $newLowText } }
    )
} | ConvertTo-Json -Depth 10
```

### IDs de tabs — ciclo Mai/26
| Tab ID | Regional |
|--------|----------|
| `t.aovivymda13c` | MG1 - Saman |
| `t.bd4ttpu1v2q` | MG2 - Lisboa |
| `t.wneuztypoxr9` | MG3 - Aguiar |
| `t.liqo7yroui2q` | NNE - Telles |
| `t.zapja9v8vet2` | RJ - Alfradique |
| `t.tc4hummw4ws` | RS - Peretto |
| `t.3k6skpr4bf37` | SC - Kloh |
| `t.x48ir2979shh` | SP1 - Camargo |
| `t.d8fda1wsiee5` | SP2 - Joandre |
| `t.wf5nyy8w1p8n` | SP3 - Bilinski |

---

## Notas e edge cases

- **Unidade sem dados no mês:** incluir linha com zero e nota explicativa no texto; não expurgar silenciosamente
- **Unidade com EBITDA fora da banda -50%/+50%:** mencionar na seção de abrangência que foi expurgada e por quê
- **Regional com apenas 1 unidade em determinado horizonte:** não fazer média RPU — apenas apresentar o valor absoluto da unidade
- **Dado de broker faltante em alguma unidade:** incluir flag explícita no texto de análise daquela unidade
- **Janela histórica incompleta para uma unidade nova:** usar o que estiver disponível, células em branco com nota de "unidade em primeiro ciclo"
- **Sem dados de DFC:** gerar relatório sem a seção de fluxo de caixa e informar o usuário
- **Unidade com EBITDA negativo:** destacar na análise e, se for recorrente (2+ meses), mencionar como ponto de atenção prioritário para o Diretor Regional
