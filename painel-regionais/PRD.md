# PRD — Painel de Resultado Financeiro das Regionais
**V4 Company | Versão 2.0 | Julho/2026**

---

## 1. Visão Geral

### O problema
Os Diretores Regionais não têm hoje uma visão consolidada, visual e autoexplicativa do resultado financeiro das unidades sob sua liderança. O dado existe — está numa base em Google Sheets com ~150 unidades reportando por mês — mas exige leitura de planilha, cruzamento manual de abas e conhecimento das fórmulas para virar decisão. Isso atrasa o diagnóstico e dilui a régua comum de performance entre regionais.

### A solução
Um **painel HTML único** que lê a base viva do Google Sheets e transforma os dados em **quatro telas** de leitura rápida: a **Home** (comparativo de engajamento entre regionais e multifranquias), **Engajamento** (diagnóstico por unidade), **Margens e Centros de Custo** (estrutura de resultado) e o **Termômetro Financeiro** (score gamificado de saúde por unidade). Filtros de Mês, Regional, Horizonte e Unidade recortam a informação sem exigir mexer na planilha. Tema claro/escuro alternável.

### Objetivo principal
Dar ao Diretor Regional — e à Matriz — **visibilidade imediata e comparável** do resultado das unidades, com uma régua única (o Termômetro Financeiro) que direciona a atenção para onde há risco de queima de caixa e oportunidade de eficiência.

### Princípio norteador
O painel **informa e direciona**, não substitui o relatório analítico mensal (skill `financial-report-regional`). Ele é a camada de *monitoramento contínuo*; o relatório é a camada de *narrativa e recomendação*. Os dois compartilham os mesmos indicadores e a mesma régua de benchmarks.

---

## 2. Personas

| Persona | Papel | Objetivo no painel |
|---------|-------|--------------------|
| **Diretor Regional** | Usuário principal | Ver o resultado das suas unidades, comparar com a rede e identificar unidades em alerta |
| **Matriz / Diretoria** | Visão macro | Comparar regionais entre si e acompanhar a saúde geral da rede |
| **Time Administrativo V4 (Bruno)** | Curador dos dados e do painel | Manter a base do Sheets consistente e regenerar/ajustar o painel |

> **Nota de acesso:** todos os perfis enxergam **todas as regionais**. O filtro de Regional é conveniência de navegação, não barreira de privacidade. Público interno de confiança.

---

## 3. Jornada do Usuário

```
1. ACESSO    → Diretor abre o arquivo HTML do painel (link/arquivo interno)
2. VISÃO GERAL → Aterrissa na Home; compara regionais e multis (engajamento, RPU, score, alertas)
3. ENGAJAMENTO → Filtra sua Regional e vê quais unidades estão engajadas / em revisão / desengajadas
4. DIAGNÓSTICO → Navega para "Margens e Centros de Custo" para entender o porquê dos números
5. PRIORIZAÇÃO → Abre "Termômetro Financeiro" para ver quais unidades pontuam mal e agir
```

---

## 4. Arquitetura da Solução

### 4.1 Formato
- **HTML único auto-contido** — um arquivo `.html` com CSS e JavaScript embutidos, gráficos via Chart.js e fonte IBM Plex Sans em CDN. Abre no navegador sem instalação nem build.
- Navegação entre as **4 telas** por **menu lateral fixo à esquerda** (Home · Engajamento · Margens · Termômetro).
- **Tema claro/escuro** alternável (botão no rodapé do menu; escolha salva em `localStorage`, respeita a preferência do SO na 1ª visita).

### 4.2 Origem dos dados — conexão viva com Google Sheets
Uma **base única consolidada** no Google Sheets (1 linha = unidade × mês), lida ao vivo pelo navegador via endpoint gviz/CSV:

- Cada linha traz `ID_TEMPO` + `Mês` (dimensão de tempo), `RAZÃO SOCIAL` (chave/identificador legal), **`NOME FRANQUIA`** (nome exibido no painel), `REGIONAL`, `HORIZONTE`, `STATUS` de engajamento, todos os indicadores, os 6 scores parciais, o `SCORE MÊS` e o `SCORE ANO`.
- **Nome exibido** = coluna `NOME FRANQUIA` (fallback para `RAZÃO SOCIAL` quando vazia/`#N/A`).
- O detalhamento de colunas, fórmulas e método de publicação/leitura fica no **SPEC.md**.
- **Modo de leitura (desde 22/08/2026):** o painel é publicado como Web App e **lê a base ao vivo**, com a planilha continuando privada — quem lê é o servidor, não o navegador de quem abre. O botão "Colar CSV" virou saída de contingência: só aparece fora do Web App ou se a leitura ao vivo falhar.

### 4.3 Atualização
A base é atualizada mensalmente no Sheets pelo time administrativo (~150 novas linhas/mês por planilha). O painel reflete automaticamente a base publicada — sem reconstrução manual do arquivo a cada ciclo.

**Última atualização (visível no banner):** o banner informa `dados até <mês>` + `🕒 Atualizado em dd/mm/aaaa hh:mm · há N dias`. O carimbo fica **âmbar após 21 dias** e **vermelho após 35** — passou um ciclo de fechamento sem atualizar, quem lê precisa saber antes de decidir.

Na fase de teste (arquivo local), o carimbo marca a carga do CSV e vale só para a sessão — **nada é gravado no navegador**. Na versão publicada, ele passa a vir do snapshot publicado, igual para todos os leitores.

**Requisitos da publicação (próximo passo):** dados **vinculados ao painel** (quem abrir vê os dados, em qualquer máquina, sem colar CSV) e **acesso restrito a perfis V4** (autenticação corporativa — o painel não pode ficar em URL pública aberta).

---

## 5. As Quatro Telas

### 🏠 Tela 1 — Home (comparativo da rede)

**Filtros:** apenas **Mês** *(as regionais e multis são fixas na tabela abaixo).*

**5 cards globais** (rede inteira, no mês):

| # | Card | Valor | Legenda menor |
|---|------|-------|---------------|
| 1 | **RPU** | `Σ Receita Líq ÷ nº unidades`, **só STATUS "sim"** (sem "com ressalva") | variação **% vs. mês anterior** |
| 2 | **Taxa de Engajamento** | `(engajadas+revisão) ÷ ativas` (%) | variação **p.p. vs. mês anterior** |
| 3 | **Unidades Desengajadas** | contagem (STATUS "não") | "▲/▼ N a mais/menos que o mês anterior" |
| 4 | **Score Médio** | `média(SCORE MÊS)` (3 casas) | "média da rede" |
| 5 | **Unidades em Alerta** | `nº com SCORE MÊS < 35` | "score < 35" |

**Tabela — comparativo por Grupo** (regionais **e** multis, ex.: M1-Colli, M2-Nunes, PR-Kuri):

`Grupo · Qtd. Unidades · Engajadas · Desengajadas · Tx. Engaj. · RPU · H1 · H2 · H3 · H4 · H5 · Score · Un. Alerta`

- **Engajadas** = STATUS "sim" + "sim, com ressalva"; **Desengajadas** = "não".
- **Exceção do RPU** (card e coluna): conta **só STATUS "sim"** — as "com ressalva" seguem contadas como engajadas, mas ficam fora do RPU porque seus números não entraram na análise financeira e não são comparáveis com a rede. Alinha a Home com a aba Margens.
- H1–H5 = contagem por horizonte do grupo. Colunas de métrica **ordenáveis** (asc/desc).

---

### 👥 Tela 2 — Engajamento (por unidade)

**Filtros:** Mês · Regional.

**5 cards** — todos com **comparação vs. mês anterior**:

| # | Card | Valor |
|---|------|-------|
| 1 | **Taxa de Engajamento** | (engajadas+revisão) ÷ ativas — legenda em **p.p.** |
| 2 | **Unidades Engajadas** | STATUS "sim" |
| 3 | **Unidades em Revisão** | STATUS "sim, com ressalva" |
| 4 | **Unidades Desengajadas** | STATUS "não" |
| 5 | **Dias s/ Conciliação** | média de DIAS CONC (exclui quem nunca conciliou) |

**Tabela — diagnóstico por unidade:** cada critério vira um **semáforo** (bolinha colorida + valor menor): EBITDA (banda), Conciliação, Deduções, Custos, Despesas, Coordenadores (R$) + coluna **Status** (pill Engajado/Parcial/Desengajado). Ordenável e filtrável por Status.

---

### 📊 Tela 3 — Margens e Centros de Custo

**Filtros:** Mês · Regional · **Horizonte** · **Unidade (busca por nome)**. Toda a tela agrega **apenas unidades com STATUS "sim"** (exclui parciais e não-engajadas).

**7 cards** com comparação **▲/▼ p.p. vs. mês anterior**: Margem Operacional · Margem de Contribuição · Margem EBITDA · Tributos · CSP · Comercial · G&A (= Administrativo + Gerais).

**Abaixo, 8 blocos** — os **6 gráficos vão de Jan/26 até o último mês da base** (2025 fica fora: dados sem confiabilidade auditada) e **não interagem com o filtro de Mês** (só Regional/Horizonte/Unidade); os cards e os dois rankings reagem ao mês:

| | Esquerda | Direita |
|---|---|---|
| Linha 1 | **Crescimento — Receita Líquida** (colunas, **somatória** + % MoM em cima) | **Geração de Caixa** (colunas, **somatória** + % MoM; total negativo → coluna vermelha) |
| Linha 2 | **Margens** (linha; Mg. Operacional em vermelho; valor % rotulado por ponto) | **Centros de Custo** (linha; CSP em vermelho; valor % rotulado) |
| Linha 3 | **RPU — Receita por Unidade** (colunas de RPU + linha com o nº de unidades no cálculo) | **Tributos** (linha, valor rotulado) |
| Linha 4 | **Top 5 EBITDA** (ranking nome + %, 👑 no 1º) | **Top 5 Lucratividade** (ranking nome + %, 👑 no 1º) |

> Os dois rankings reagem a **mês, regional e horizonte** (não ao filtro de Unidade).

---

### 🌡️ Tela 4 — Termômetro Financeiro

**Filtros:** Mês (≥ Mar/26, exceto o período "Atual") · Regional.

**6 cards** — **valor** do indicador (colorido pela escala do próprio valor) + **score** (3 casas) em fonte menor:

| # | Card | Valor | Peso no score |
|---|------|-------|:-------------:|
| 1 | **Margem EBITDA** | % | 25% |
| 2 | **Margem de Contribuição** | % | 20% |
| 3 | **Inadimplência** | % | 20% |
| 4 | **Produtividade** | # (Fat. Líq / Gasto Pessoas) | 10% |
| 5 | **Taxa de Crescimento** | % (MoM) | 10% |
| 6 | **Ger. de Caixa** (Lucratividade) | R$ | 15% |

**Tabelão por unidade:** cada célula de indicador com **bolinha (temperatura do score)** + score + valor. Colunas finais: **Score Mês** (pill colorida pela faixa) e **Score Ano (YTD)** — este é o **acumulado do ano**, exibido **neutro** (sem cor). Tabela ordenável por qualquer coluna (padrão: Score desc).

---

## 6. Indicadores — Definições de Negócio

Alinhadas à skill `financial-report-regional` e ao RFC do Termômetro Financeiro.

| Indicador | Definição |
|-----------|-----------|
| **Engajamento** | Unidade que lançou receitas/deduções/custos/despesas + conciliou nos últimos 7 dias + EBITDA na banda −50%/+50%. Já resolvido na coluna `STATUS` da base |
| **RPU** | Receita Líquida total ÷ nº de unidades consideradas |
| **Inadimplência** | % da receita não recebida no período |
| **Margem Operacional** | (Receita Líquida − CSP) / Receita Líquida |
| **Margem de Contribuição** | (Lucro Bruto − Comercial Variável) / Receita Líquida |
| **Margem EBITDA** | EBITDA / Receita Líquida |
| **CSP / Comercial / G&A** | % de cada centro de custo sobre a Receita Líquida (G&A = Administrativo + Gerais) |
| **Tributos** | % pago em tributos no período (coluna `TRIBUTOS`, já em %) |
| **Coordenadores** | Investimento em coordenadores no período (R$); >0 = tem coordenador, =0 = não tem |
| **Produtividade** | Faturamento Líquido ÷ Gasto com Pessoas |
| **Taxa de Crescimento** | Variação % da receita mês a mês (MoM) |
| **Ger. de Caixa (Lucratividade)** | Geração de caixa da unidade no período (R$) — a liquidez; capacidade real de transformar margem e recebimento em saldo positivo |
| **Score (Termômetro)** | Nota 0–100 por indicador (interpolação piso→meta), ponderada pelos pesos oficiais → Score final da unidade |

### Régua do Termômetro Financeiro (pisos e metas)

| Indicador | Peso | Piso (0 pts) | Meta (100 pts) | Tipo |
|-----------|:----:|:------------:|:--------------:|------|
| Margem EBITDA | 25% | 0% | 25% | maximização |
| Margem de Contribuição | 20% | 35% | 60% | maximização |
| Inadimplência | 20% | teto 10% | 3% | minimização |
| Ger. de Caixa (Lucratividade) | 15% | R$ 1 | R$ 200.000 | maximização |
| Produtividade | 10% | 1,1 | 3,0 | maximização |
| Taxa de Crescimento (MoM) | 10% | 0% | 20% | maximização |

> Fórmulas de cálculo detalhadas no SPEC.md.

### Escala de cor por indicador (verde=saudável · âmbar=atenção · vermelho=alerta)

| Indicador | Vermelho | Âmbar | Verde |
|-----------|----------|-------|-------|
| Taxa de Engajamento | <50% | 50–75% | ≥75% |
| Margem EBITDA | <0% | 0–10% | >10% |
| Margem Operacional | <40% | 40–65% · **>85%** (subdimensionamento) | 65–85% |
| Margem de Contribuição | <30% | 30–45% · **= Mg. Operacional** (sem variável comercial) | ≥45% |
| Inadimplência | ≥8% | 4–8% | <4% |
| Tributos | ≥11% | 7–11% | <7% |
| RPU | <150k | 150–250k | ≥250k |
| Produtividade | <1,0 | 1,0–2,0 | ≥2,0 |
| Ger. de Caixa | <0 | — | ≥0 |
| Taxa de Crescimento | <0% | 0–6% | >6% |
| Dias s/ Conciliação | >15 | 9–15 | <9 |
| **Score** (Mês, Médio, faixa) | <35 | 35–70 | >70 |

- **Semáforos de engajamento** (tabela da Tela 2): EBITDA \|v\|≤35 verde / ≤50 âmbar / >50 vermelho · Conciliação <8 verde / 8–9 âmbar / ≥9 vermelho · Deduções/Custos/Despesas/Coordenadores ≠0 verde / =0 vermelho.
- Cards de contagem (Desengajadas, Alerta) são vermelhos quando > 0.

---

## 7. Identidade Visual

Seguir o sistema de design V4 (skill `financial-viz`):

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

**Regra absoluta:** nunca usar azul ou cores fora da paleta. Fonte: IBM Plex Sans (fallback Arial). Tom: profissional, tecnológico, sem elementos decorativos. Verde = positivo/saudável, Vermelho = alerta/atenção, Âmbar = zona intermediária.

---

## 8. Critérios de Sucesso

- Diretor Regional chega ao diagnóstico da sua regional em **menos de 3 cliques** (abrir → filtrar mês → filtrar regional).
- Painel carrega e renderiza em **menos de 3 segundos** com a base viva.
- Os números do painel **batem** com os da planilha e com o relatório mensal da regional (validação de consistência).
- Diretor consegue identificar as **unidades em alerta** sem apoio técnico.
- Atualização mensal da base **não exige** reconstrução manual do painel.

---

## 9. Fora de Escopo (V1)

- Controle de acesso / login por perfil (todos veem tudo).
- Edição de dados pelo painel (é read-only; a fonte da verdade é o Sheets).
- Geração de PDF / exportação (avaliar em V2).
- Texto analítico automático (isso é papel da skill `financial-report-regional`).
- Integração direta com Conta Azul (a base do Sheets já é o produto dessa consolidação).
- Responsividade mobile refinada (uso primário em desktop; garantir apenas que não quebre).
- Drill-down por linha de conta individual (nível de detalhe do ERP).

---

## 10. Riscos e Pontos de Atenção

| Risco | Mitigação |
|-------|-----------|
| Cabeçalho da base renomeado quebra a leitura de uma coluna (ela vem vazia) | Parser mapeia por **nome de cabeçalho** normalizado (acento/maiúscula); coluna divergente é sinalizada e corrigida no mapeamento |
| Planilha publicada expõe a base sem controle de revisão | Definir no SPEC o método de publicação e a cadência de atualização controlada |
| Base bloqueada para leitura por IA (política do workspace) | Não impacta o navegador do usuário; impacta só a leitura automatizada por mim — validação de dados será feita com amostras fornecidas |
| Divergência entre score pré-calculado na planilha e score recalculado no painel | SPEC define a fonte única de verdade (ler da planilha vs. recalcular) |
| Limite de alerta ainda não definido | Bruno informa o valor de corte durante a construção |

---

## 11. Histórico da V2 (o que mudou desde a V1)

- **Indicador do Termômetro:** Ticket Médio → **Ger. de Caixa (Lucratividade)**; pesos recalibrados (RFC): EBITDA 25 · Contribuição 20 · Inadimplência 20 · Ger. Caixa 15 · Produtividade 10 · Crescimento 10.
- **Estrutura:** de 3 para **4 telas** — nova **Home comparativa** (por grupo) + a antiga "Home" virou **Engajamento**.
- **Margens:** reorganizada (Receita+Caixa / Margens+Custos / Tributos+Ranking Top 5 EBITDA); gráficos não interagem com o mês; agrega só STATUS "sim"; novos filtros de Horizonte e busca de Unidade.
- **Termômetro:** válido de **Março/26** em diante, exceto o período "Atual" (score só após mês fechado e auditado); nova coluna **Score Ano (YTD)**.
- **Dados:** nome exibido passa a ser `NOME FRANQUIA`; `TRIBUTOS` em %; `COORDENADORES` em R$; `CAIXA`/`CAIXA score` = Ger. de Caixa.
- **Visual:** fonte **IBM Plex Sans**; **tema claro/escuro**; escala de cor calibrada por indicador (§6); Score sempre com 3 casas decimais.

## 12. Publicação (22/08/2026)

O painel deixou de ser arquivo local e passou a ser **Web App do Apps Script**, com acesso restrito a perfis V4 pelo login do Workspace. Consequências para o produto:

- **Ninguém mais cola CSV.** A base é lida ao vivo, com a planilha continuando privada — quem lê é o servidor, com a permissão de quem publicou.
- **Todo mundo vê a mesma data.** O carimbo do banner passou a ser a data de edição da planilha, não a hora em que cada um abriu a página; é isso que faz o alerta de base defasada ter sentido.
- **A barra lateral mostra quem está logado**, vindo do próprio login.
- **O painel não pode escrever nada.** As permissões concedidas são somente leitura da planilha e metadados do Drive.

Base ampliada para **42 colunas** (visão de caixa desmembrada) — colunas lidas, apresentação ainda a definir (SPEC §5.5).

Detalhamento técnico completo no **SPEC.md**.
