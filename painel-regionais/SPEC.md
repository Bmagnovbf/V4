# SPEC — Painel de Resultado Financeiro das Regionais
**V4 Company | Versão 2.0 | Julho/2026 | Complementa o `PRD.md`**

---

## 1. Arquitetura Técnica

| Item | Definição |
|------|-----------|
| **Formato** | Arquivo `.html` único, auto-contido (HTML + CSS + JS inline) |
| **Gráficos** | Chart.js via CDN (`<script src="https://cdn.jsdelivr.net/npm/chart.js@4">`) |
| **Fonte** | IBM Plex Sans via Google Fonts (`<link>`), fallback Arial |
| **Dados** | Base única do Google Sheets, lida **ao vivo pelo servidor do Apps Script** (API do Sheets, somente leitura) desde a publicação em 22/08/2026. Fora do Web App, "Colar CSV", que vale só para a sessão — nada é gravado no navegador (§10.1) |
| **Navegação** | Menu lateral fixo à esquerda, **4 telas** (SPA — troca de seção via JS, sem recarregar): Home · Engajamento · Margens · Termômetro |
| **Tema** | Claro/escuro via variáveis CSS de superfície + `data-theme`; toggle salvo em `localStorage`; respeita `prefers-color-scheme` na 1ª visita |
| **Sem backend** | Todo cálculo é client-side em JavaScript |

### 1.1 Leitura da base (conexão viva)
A planilha é publicada e lida via endpoint **gviz/CSV** (não exige API key):
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&gid={GID}
```
- Requer a planilha compartilhada como "qualquer pessoa com o link pode ver" (ou publicada na web).
- O navegador faz `fetch()`, recebe CSV, e um parser JS converte em array de objetos.
- **Fallback:** se o `fetch` falhar (permissão/rede), o painel exibe aviso e permite colar/subir um CSV manualmente.
- Definir no build: `SHEET_ID` e `GID` como constantes no topo do script.

---

## 2. Mapa de Colunas (base consolidada)

**Mapeamento é por NOME de cabeçalho** (normalizado, sem acento/maiúscula) — a ordem das colunas é irrelevante e colunas extras são ignoradas. Por isso a base pode crescer sem quebrar o painel (**42 colunas** desde ago/2026, com a visão de caixa desmembrada).

**Conferência de cabeçalho (ago/2026):** `COLS_USADAS` lista as colunas que o painel consome; a cada carga, `mapRows` compara com o header recebido e publica as ausentes em `COLS_FALTANDO` → aviso âmbar no banner + `console.warn`. Sem isso, uma coluna renomeada na planilha esvaziava o indicador **em silêncio** — o modo de falha mais perigoso deste painel.

| Coluna | Uso no painel |
|--------|---------------|
| ID_TEMPO | Ordenação temporal (ex: 202604). Chave de mês |
| Mês | Rótulo do filtro de mês ("Abr26"). Valor **"Atual"** = período em aberto (excluído do score) |
| RAZÃO SOCIAL | Identificador legal (chave); **não exibido** |
| **NOME FRANQUIA** | **Nome exibido** em todo o painel (fallback → RAZÃO SOCIAL se vazio/`#N/A`) |
| REGIONAL | Filtro Regional / agrupamento (regionais **e** multis) |
| HORIZONTE | Agrupar por prefixo H1–H5 (H0/Incubadora → H1); excluir Desligado/M&A. Sufixos variam ("H1 - Aceleração", "H2 - Coordenadora…") — só o prefixo importa |
| STATUS | Engajamento: "sim" = engajada · "sim, com ressalva" = em revisão/parcial · "não" = desengajada. Case-insensitive |
| EBITDA (%) | Margem EBITDA |
| MG OPERACIONAL | Margem Operacional |
| MG CONTRIBUIÇÃO | Margem de Contribuição |
| CSP / COMERCIAL | % CSP / % Comercial |
| ADMIN + GERAIS | Componentes de G&A |
| DEDUCOES / CUSTOS / DESPESAS | (R$) — semáforos de engajamento (≠0) |
| BROKER / GASTOS PESSOAIS | (R$) — **lidas** (`broker`, `gastosPess`) desde ago/2026; ainda não exibidas |
| DIAS CONC | Dias desde última conciliação (não-numérico = "nunca conciliou" → excluído da média) |
| RECEITA LIQ | Receita Líquida (base de RPU / séries) |
| **COORDENADORES** | **Investimento em coordenadores (R$)** — >0 verde / =0 vermelho |
| **TRIBUTOS** | **% de tributos (já em %)** — cards/gráfico Margens |
| PRODUTIVIDADE | Fat. Líq / Gastos Pessoais (ratio) — card Termômetro |
| TX CRESCIMENTO | Taxa de crescimento MoM (%) — card Termômetro |
| **LUCRATIVIDADE** | **% de lucratividade — `saldo (entrada − saída) ÷ entrada`, já em %**. Alimenta o ranking **Top 5 Lucratividade** (Margens) |
| INADIMPLÊNCIA | % inadimplência |
| **CAIXA ATIV OPERACIONAL** | **Caixa das atividades operacionais (R$)** → `cxOper` — lida, ainda não exibida |
| **CAIXA ATIV FINANCEIRAS** | **Caixa das atividades financeiras (R$)** → `cxFin` — lida, ainda não exibida |
| **CAIXA LUCRO LÍQUIDO** | **Caixa líquido do período (R$)** → `cxLiq` — lida, ainda não exibida |
| **SALDO CAIXA** | **Saldo de caixa resultante (R$)** → `saldoCx` — lida, ainda não exibida |
| **CAIXA** | **Geração de caixa (R$)** → `gerCaixa` — card/coluna Ger. de Caixa, gráfico L2 de Margens e `CAIXA score`. **Relação com as 4 colunas acima ainda não confirmada** (ver §5.5) |
| EBITDA / MG Contribuição / Inadimplência / Produtividade / Tx Crescimento / **CAIXA** score | Scores 0–100 (pré-calculados) |
| SCORE MÊS | Score final ponderado 0–100 |
| CLASS. MÊS | Ranking do mês |
| **SCORE ANO** | **Score acumulado do ano (somatória — pode passar de 100)**. Coluna "Score Ano (YTD)", exibida **neutra** |
| CLASS. ANO | Ranking do ano → `classAno` — lida, ainda não exibida |

> **Mapear por nome de cabeçalho, não por índice fixo** — o parser lê a linha de header e monta um dicionário `{nome: índice}`, tolerante a reordenação/colunas extras. Colunas sem rótulo são ignoradas.

---

## 3. Regras de Parsing e Normalização

Aplicar a cada célula na carga:

| Tipo | Regra |
|------|-------|
| **Percentual** | Remover `%`, trocar `,`→`.`, `parseFloat`. "62,98%" → `62.98`. Guardar como número em pontos percentuais (p.p.) |
| **Moeda** | Remover `R$`, espaços e `.` (milhar), trocar `,`→`.`. "-R$ 1.976,62" → `-1976.62`. "26176,92" → `26176.92` |
| **Ratio** | Trocar `,`→`.`. "0,682" → `0.682` |
| **Vazio / "#N/A" / "-"** | Tratar como `null` (não zero) |
| **NOME FRANQUIA** | Nome exibido = `NOME FRANQUIA`; se vazio ou `#N/A` → cai para `RAZÃO SOCIAL` |
| **COORDENADORES** | **Moeda** (vem como "R$ 0,00") — usar regra de moeda, não de número |
| **TRIBUTOS** | **Percentual** (vem como "7,00%") — usar regra de percentual direto. *(Fallback: se um dia vier em R$, calcular `TRIBUTOS ÷ RECEITA BRUTA`)* |
| **LUCRATIVIDADE** | **Percentual** (vem como "14,25%"), pode ser **negativa**. Lida direto da coluna — o painel **não recalcula** `saldo ÷ entrada`; se a coluna faltar, o ranking mostra "sem dados" em vez de estimar |
| **STATUS** | `trim().toLowerCase()`; engajada (`isEng`) se começa com "sim"; `sk`: começa com "sim," **ou** casa `/res+alv/` (tolera "ressalva", "resalva", com ou sem vírgula/parênteses) = **parcial** · "sim" = **eng** · resto = **des** |
| **HORIZONTE** | Prefixo via regex `/^H[0-5]/` (H0→H1); "Incubad" → H1; "Desligad" → marcar para exclusão |

---

## 4. Filtragem Global (aplicada antes de qualquer cálculo)

1. **Excluir** linhas com HORIZONTE contendo "Desligad" (Desligado, Desligamento / M&A).
2. **Excluir** linhas sem nome (NOME FRANQUIA e RAZÃO SOCIAL ambos vazios/`#N/A`) ou sem REGIONAL.
3. **Base de médias por tela** — três escopos distintos, todos já sem as Desligadas (regra 1):

| Tela | Escopo | Função |
|------|--------|--------|
| Home · Engajamento | engajadas: STATUS "sim" **+** "sim, com ressalva" (`isEng`) | `d.eng` |
| **Home — Score Médio, Un. em Alerta e as colunas Score/Un. Alerta da tabela** | **TODAS as ativas** (mesma régua do Termômetro — são indicadores de score) | `at` / `arr`, sem filtro de status |
| **Margens** (Tela 3) | **apenas STATUS "sim"** — exclui parciais e desengajadas | `d.sk==='eng'` |
| **Termômetro / score** (Tela 4) | **TODAS as unidades ativas** — "sim", "com ressalva" **e** "não" | `escopo()`, sem filtro de status |

> A abertura do Termômetro é **exclusiva do score** (decisão de Bruno, 29/07/2026): a régua de saúde mede a rede inteira, inclusive quem está desengajado. Nenhuma outra tela ou indicador muda de base por causa disso. A tabela de Engajamento continua listando todas as ativas.
4. **Score (Termômetro + cards Score/Alerta):** válido de **`ID_TEMPO >= 202603`** (Março/26) em diante **e** excluindo o período **"Atual"** (Mês = "Atual" = mês em aberto). Motivo: score só vale mês fechado e auditado. Nesses meses/visões o valor aparece como "—".
5. Horizontes por prefixo **H1–H5** (H0/Incubadora → **H1**); ignorar o sufixo textual.

### Filtros de UI por tela
| Tela | Filtros |
|------|---------|
| Home (comparativo) | **só Mês** (regionais/multis são fixas na tabela) |
| Engajamento | Mês, Regional |
| Margens e Centros de Custo | Mês, Regional, **Horizonte**, **Unidade (input com busca/datalist)** |
| Termômetro | Mês (≥ Mar/26, sem "Atual"), Regional |

- "Regional = (todas)" → agrega a rede inteira.
- **Margens — gráficos:** os 6 gráficos usam **todos os meses com dado** e **não reagem ao filtro de Mês** (só Regional/Horizonte/Unidade). Cards e Ranking Top 5 EBITDA reagem ao Mês; o **ranking também reage a Regional e Horizonte** (só o filtro de Unidade não se aplica a ele).

---

## 5. Especificação por Tela

Notação: `média(x)` = **média aritmética simples** sobre unidades engajadas do escopo (mês+regional filtrados). **Critério único: média simples para todos os indicadores** (margens, tributos, centros de custo e scores) — cada unidade conta igual, independente de tamanho, refletindo a leitura unitária da rede. Valores nominais (receita total) são somados.

### 🏠 5.1 Home (comparativo da rede)

Filtro: **só Mês**. Escopo = rede inteira no mês.

**Cards (5, globais)** — RPU e Taxa com variação vs. mês anterior:

| Card | Valor | Legenda menor |
|------|-------|------------------|
| **RPU** | `Σ RECEITA LIQ / nº unidades` sobre **só STATUS "sim"** (`sk==='eng'`) — ver §5.1.2 | variação **% relativa** vs. mês anterior |
| **Taxa de Engajamento** | `nº isEng / nº ativas × 100` | variação **p.p.** vs. mês anterior |
| **Unidades Desengajadas** | `nº STATUS "não"` | "▲/▼ N a mais/menos que o mês anterior" |
| **Score Médio** | `média(SCORE MÊS)`, **3 casas** | "média da rede" (só meses com score, §4.4) |
| **Unidades em Alerta** | `nº eng com SCORE MÊS < 35` | "score < 35" (só meses com score) |

**5.1.1 Tabela — comparativo por Grupo** (agrupa por `REGIONAL`; multis = grupos de 1 unidade):

Colunas: **Grupo · Qtd. Unidades · Engajadas** (isEng) **· Desengajadas** (não) **· Tx. Engaj.** (colorida por tEng) **· RPU** (só `sk==='eng'`, §5.1.2) **· H1 · H2 · H3 · H4 · H5** (contagem por prefixo de horizonte) **· Score** (média SCORE MÊS, 3 casas, colorida por faixa) **· Un. Alerta** (eng c/ score<35).
- Colunas de métrica **ordenáveis** (data-k); H1–H5 não. Default: **Tx. Engaj. desc**.

**5.1.2 Régua do RPU — exceção da tela** (decisão de 18/08/2026)

O RPU da Home (card **e** coluna da tabela, mês corrente e mês anterior) considera **apenas STATUS "sim"** (`d.sk==='eng'`) — **exclui "sim, com ressalva"**. É a **mesma régua da aba Margens (§5.3)**, portanto os dois números batem quando Margens está sem filtro de Regional/Horizonte/Unidade.

- **Por quê:** o RPU só é comparável entre unidades cujos números de fato entraram na análise financeira. A ressalva **não** indica falta de engajamento — indica que aquela unidade não é comparável com o resto da rede.
- **Escopo da exceção:** vale **só para o RPU**. **Taxa de Engajamento, Engajadas, Desengajadas, Score e Un. Alerta seguem inalterados** — continuam usando `isEng` (que inclui "com ressalva") e a régua do Termômetro para score/alerta.
- **Consequência de leitura:** a coluna **Engajadas** pode ser maior que o nº de unidades no RPU do mesmo grupo. O `title` do cabeçalho RPU explica isso no hover.

### 👥 5.2 Engajamento (por unidade)

Filtros: Mês, Regional.

**Cards (5)** — todos com **comparação vs. mês anterior** (mesmo escopo/regional):

| Card | Valor | Comparação |
|------|-------|------------|
| **Taxa de Engajamento** | `isEng / ativas` (%) | p.p. |
| **Unidades Engajadas** | `nº sk==='eng'` | contagem (↑ = verde) |
| **Unidades em Revisão** | `nº sk==='parcial'` | contagem (↑ = ruim/vermelho) |
| **Unidades Desengajadas** | `nº sk==='des'` | contagem (↑ = ruim) |
| **Dias s/ Conciliação** | `média(DIAS CONC)` (exclui null="nunca") | dias, diferença absoluta (↓ = verde) |

**5.2.1 Tabela — diagnóstico por unidade:** cada critério vira **semáforo** (bolinha + valor menor): EBITDA (§6), Conciliação (§6), Deduções/Custos/Despesas/Coordenadores(R$) (≠0 verde) + coluna **Status** (pill Engajado/Parcial/Desengajado). Ordenável; filtro de Status no header.

### 📊 5.3 Margens e Centros de Custo

Filtros: Mês, Regional, **Horizonte**, **Unidade (busca)**. Escopo = **apenas STATUS "sim"** (`sk==='eng'`; exclui parciais e não) — vale **sem exceção** para os 7 cards, os 5 gráficos (em todos os meses da série) e o Top 5 EBITDA.

> **Indicador de escopo (auditoria):** o subtítulo da tela mostra quantas unidades entraram no cálculo (`N unidade(s) com STATUS "sim"`) e quantas ficaram de fora (em revisão · desengajadas), no mês/filtros vigentes. O `console.table` detalha essa composição **mês a mês**, já que os gráficos varrem todo o período.

**Cards (7)** — valor % + comparativo **▲/▼ Δ p.p. vs. mês anterior**: Margem Operacional · Margem de Contribuição · Margem EBITDA (EBITDA %) · Tributos · CSP · Comercial · G&A (= ADMIN + GERAIS).
- Agregação: `média()` simples do escopo (ou valor da unidade se buscada). "vs. mês anterior" = mesmo escopo no `ID_TEMPO` anterior.

**Gráficos/blocos (abaixo)** — os **5 gráficos** usam **todos os meses com dado** e **não reagem ao Mês** (só Regional/Horizonte/Unidade); ordem em 3 linhas × 2:

**Regras comuns aos gráficos:**
- **Agregação:** `média()` para indicadores em **%** (margens, centros de custo, tributos); **`soma()`** para valores nominais em **R$** que representam volume da rede — **Receita Líquida** e **Geração de Caixa**. A leitura unitária da receita fica no gráfico de **RPU**, não no de volume.
- **Piso de Jan/26 (`CFG.GRAF_MIN = 202601`):** as séries dos gráficos começam em **Jan/26**. Os meses de **2025 não são plotados** — os dados do ano passado não têm confiabilidade auditada. Só os gráficos têm esse piso; cards, ranking e as demais telas continuam com o histórico completo. *(Se a base não tiver nenhum mês ≥ 202601, cai para todos os meses disponíveis, para não renderizar gráfico vazio.)*
- **Recorte do eixo (`recorta()`):** além do piso, cada gráfico descarta os meses **iniciais** em que **nenhuma** de suas séries tem dado. CAIXA e TRIBUTOS só existem a partir de Mar/26, então esses dois começam em Mar/26 enquanto os demais começam em Jan/26.
- **Variação MoM:** `(v − anterior) / |anterior| × 100`. O **módulo no denominador** é obrigatório: saindo de um mês negativo, uma recuperação (−R$ 250 → +R$ 3.800) tem que aparecer como **▲ verde**, não ▼ vermelho.
- **Cor da coluna** (gráficos de barra): valor **< 0 → `#C00000`**; caso contrário `#1A5C38`.
- **Eixo Y (R$):** `k` até R$ 1M, `M` acima disso; tooltip em BRL completo.

| | Esquerda | Direita |
|---|---|---|
| L1 | **Crescimento — Receita Líquida**: colunas (Fat. Líq., **SOMATÓRIA** das unidades "sim") + **% MoM** rotulado em cima de cada coluna (▲/▼) | **Geração de Caixa**: colunas (CAIXA, **SOMATÓRIA** das unidades "sim") + **% MoM** rotulado · **total negativo → coluna vermelha `#C00000`** |
| L2 | **Margens**: linha (Mg. Operacional **#C00000**, Contribuição âmbar, EBITDA verde) + **data-label % em cada ponto** | **Centros de Custo**: linha (CSP **#C00000**, Comercial âmbar, G&A cinza) + data-label % |
| L3 | **RPU — Receita por Unidade** — ver abaixo | **Tributos**: linha com valor % rotulado por mês |
| L4 | **Top 5 EBITDA**: ranking (NOME + % EBITDA colorida por `tEbitda`), 👑 no 1º | **Top 5 Lucratividade**: ranking (NOME + % LUCRATIVIDADE colorida por `tLucr`), 👑 no 1º |

**Rankings (L4):** ambos saem da mesma função `renderRank(elId, campo, tempFn, rótulo, inScope)`. Reagem a **Mês + Regional + Horizonte** (`inScope`); **não** usam o filtro de Unidade — um Top 5 restrito a uma unidade buscada não é ranking. Escopo de status = **só "sim"**, como o resto da tela. Unidades sem valor no indicador ficam fora (não entram como 0).

**RPU mês a mês (L4):** gráfico combinado, mesmo escopo da tela (STATUS "sim" + Regional/Horizonte/Unidade), série em todos os meses com dado.
- **Colunas (eixo esquerdo, R$):** `RPU = Σ RECEITA LIQ ÷ nº de unidades "sim" com receita no mês`.
- **Linha âmbar `#D4900A` (eixo direito, contagem):** **nº de unidades no cálculo** — é o **denominador exato** do RPU daquele mês, o que torna o gráfico autoexplicativo: uma queda de RPU acompanhada de alta na linha é diluição por entrada de unidades novas, não perda de receita.
- Rótulo em cada coluna (R$ k/M) e em cada ponto da linha (`N un.`). Eixo direito sem grid, `precision:0`.
- **Mesma régua do RPU da Home** desde 18/08/2026 (§5.1.2): ambos usam **só STATUS "sim"**. A única diferença remanescente é o escopo desta tela — aqui valem os filtros de **Regional/Horizonte/Unidade**, que a Home não tem. Sem filtros aplicados, os dois valores são idênticos.

### 🌡️ 5.4 Termômetro Financeiro

Filtros: Mês (≥ Mar/26, sem "Atual"), Regional.

**Cards (6)** — **destaque no SCORE** (3 casas + sufixo `pts`), colorido pela **faixa oficial do score** (§6: <35 · 35–70 · >70). O **valor do indicador** vai **abaixo, em menor evidência** (`Média da rede: X`), colorido pela escala do próprio valor (`t*`). A inversão é proposital: esta tela comunica **pontuação**, não o dado consolidado da rede — e como o escopo inclui as desengajadas, o valor bruto tende a ficar bem abaixo do que as outras telas mostram.

Fontes de cada card:

| Card | Destaque = score (fonte) | Linha menor = valor (fonte) | Cor do valor menor |
|------|--------------------------|-----------------------------|--------------------|
| Margem EBITDA | EBITDA score | EBITDA (%) | tEbitda |
| Margem de Contribuição | MG Contribuição score | MG CONTRIBUIÇÃO | tMgContrib(mc, média MG OPER) |
| Inadimplência | Inadimplência score | INADIMPLÊNCIA | tInad |
| Produtividade | Produtividade score | PRODUTIVIDADE (ratio) | tProdut |
| Taxa de Crescimento | Tx Crescimento score | TX CRESCIMENTO | tCresc |
| Ger. de Caixa | CAIXA score | CAIXA | tCaixa |

- Valor exibido = média das **unidades ativas** do escopo (§4.3 — inclui "não"); score = `média(<indicador> score)`. Células vazias (`null`) não entram na média; um zero na planilha **entra como zero**.
- O subtítulo da tela mostra a composição do cálculo: `N unidade(s) no cálculo — X engajada(s) · Y com ressalva · Z desengajada(s)`.

**5.4.1 Tabelão por unidade:** cada célula de indicador: **bolinha** (temperatura do score) + score + valor atingido embaixo. Colunas finais: **Score Mês** (pill colorida pela faixa) e **Score Ano (YTD)** — **acumulado do ano** (somatória, pode passar de 100), exibido **neutro** (sem cor). Tabela ordenável por qualquer coluna (padrão: Score desc).

### 💰 5.5 Visão de caixa desmembrada — apresentação a definir

A base passou a separar o caixa em **operacional** (`cxOper`), **financeiro** (`cxFin`), **líquido** (`cxLiq`) e **saldo** (`saldoCx`), no lugar de um saldo único. O objetivo declarado é **saber onde agir**: caixa apertado por operação é um problema; por atividade financeira (dívida, juros) é outro, e a ação é diferente.

**Status:** as quatro colunas são **lidas e estão em `BASE`**; nenhuma tela as exibe ainda. Nada no painel mudou de comportamento com a nova base.

**A definir antes de implementar:**
1. Relação entre a coluna **`CAIXA`** (que hoje alimenta o gráfico de Geração de Caixa, o card e o `CAIXA score`) e as quatro novas — se `CAIXA` é redundante com alguma delas, o gráfico L2 de Margens deve passar a apontar para a coluna certa.
2. Onde a visão entra: gráfico empilhado em Margens (operacional vs. financeiro compondo o líquido) e/ou colunas no tabelão do Termômetro.
3. Se o **score de caixa** passa a olhar o caixa operacional em vez do saldo — mudança de régua, exige decisão junto com quem definiu os pesos.

---

## 6. Régua do Termômetro (para validação e para colorir)

Scores já vêm na base; o painel os **lê**. Fórmulas abaixo para (a) validar consistência e (b) recomputar caso alguma célula de score venha vazia.

| Indicador | Peso | Piso (0 pts) | Meta (100 pts) | Tipo |
|-----------|:----:|:------------:|:--------------:|------|
| Margem EBITDA | 25% | 0% | 25% | maximização |
| Margem de Contribuição | 20% | 35% | 60% | maximização |
| Inadimplência | 20% | teto 10% | 3% | minimização |
| Ger. de Caixa (Lucratividade) | 15% | R$ 1 | R$ 200.000 | maximização |
| Produtividade | 10% | 1,1 | 3,0 | maximização |
| Taxa de Crescimento (MoM) | 10% | 0% | 20% | maximização |

```
maximização:  score = clamp( (real − piso) / (meta − piso) × 100, 0, 100 )
minimização:  score = clamp( (teto − real) / (teto − meta) × 100, 0, 100 )
SCORE FINAL   = Σ (score_i × peso_i)
```

**Faixas de cor do score** (escala oficial — aplicar a cards, tabelão e alertas):
| Faixa | Rótulo | Cor |
|-------|--------|-----|
| **> 70** | Safe | Verde `#1A5C38` |
| **35 – 70** | Care | Âmbar `#D4900A` |
| **< 35** | Alerta | Vermelho `#C00000` |

> Card **Alertas** conta unidades com `SCORE MÊS < 35`. `ALERTA_SCORE = 35` · `CARE = 70`.

### Escala de cor por VALOR do indicador (funções `t*`)

Aplicada aos cards/colunas que colorem pelo valor (não pelo score). `null` → neutro.

| Função | Indicador | Vermelho | Âmbar | Verde |
|--------|-----------|----------|-------|-------|
| `tEng` | Taxa de Engajamento | <50 | 50–75 | ≥75 |
| `tEbitda` | Margem EBITDA | <0 | 0–10 | >10 |
| `tMgOper` | Margem Operacional | <40 | 40–65 · **>85** | 65–85 |
| `tMgContrib(mc,mo)` | Margem de Contribuição | <30 | 30–45 · **mc≈mo** (=Mg.Oper) | ≥45 |
| `tInad` | Inadimplência | ≥8 | 4–8 | <4 |
| `tTrib` | Tributos | ≥11 | 7–11 | <7 |
| `tRPU` | RPU | <150000 | 150k–250k | ≥250000 |
| `tProdut` | Produtividade | <1 | 1–2 | ≥2 |
| `tCaixa` | Ger. de Caixa | <0 | — | ≥0 |
| `tCresc` | Taxa de Crescimento | <0 | 0–6 | >6 |
| `tLucr` | Lucratividade (%) | <0 | 0–10 | >10 |
| `tConcil` | Dias s/ Conciliação (card) | >15 | 9–15 | <9 |

**Semáforos de critério (tabela Engajamento, funções `crit*`):**
- `critEbitda`: \|v\|≤35 verde · ≤50 âmbar · >50 vermelho.
- `critConcil`: <8 verde · 8–9 âmbar · ≥9 vermelho.
- `critZero` (Deduções/Custos/Despesas/Coordenadores): ≠0 verde · =0/null vermelho.

**Cores como variáveis CSS** (`TCOR`/`TTINT` → `var(--verde)`, etc.) para reagirem ao tema claro/escuro sem re-render.

---

## 7. Identidade Visual (skill `financial-viz`)

Paleta obrigatória (nunca azul):

| Papel | Hex |
|-------|-----|
| Vermelho primário / alerta | `#8B0000` / `#C00000` |
| Vermelho suave | `#F4CCCC` |
| Verde / positivo | `#1A5C38` |
| Verde suave | `#D9EAD3` |
| Âmbar / atenção | `#D4900A` |
| Preto / cinza | `#1A1A1A` / `#3D3D3D` / `#7A7A7A` |
| Cinza claro (fundos) | `#F2F2F2` |

- Fonte: **IBM Plex Sans** via Google Fonts (`<link>`), fallback Arial. Sem elementos decorativos. Menu lateral em vermelho V4, conteúdo em fundo claro.
- Formatação BR: moeda `R$ 1.234,56`; percentual `12,3%`; usar `Intl.NumberFormat('pt-BR')`.

---

## 8. Estrutura do Arquivo HTML

```
<head>: <link> IBM Plex Sans · <script> Chart.js · <style> (vars claro/escuro, grid, cards, tabelas, sidebar)
<body>:
  <aside> menu: [Home] [Engajamento] [Margens] [Termômetro] + toggle de tema + card do usuário
  <main>:
    <section id="home">       filtro Mês + 5 cards + tabela por grupo
    <section id="engajamento"> filtros + 5 cards + tabela de critérios
    <section id="margens">     filtros + 7 cards + 6 blocos (5 gráficos + ranking)
    <section id="termometro">  filtros + 6 cards + tabelão (+ Score Ano)
<script>:
  CONFIG (ALERTA:35, CARE:70, MES_MIN:202603, GRAF_MIN:202601, SHEET_ID, GID)
  helpers de cor: TCOR/TTINT (var CSS), t* (por valor), crit* (semáforos), scoreClass
  parse: parseNum/toInt/parsePct/parseMoney/isVazio; loadCSV (mapeia por nome)
  rebuild(rows) → BASE, mesesAll, mesesTermo (exclui "Atual"), regionais, atualIdts, hasScore
  renderHome/renderEngaj/renderMargens/renderRankEbitda/renderTermo
  legMoM (% / p.p. / dias), legCount (contagem); buildGrowth/buildLines/buildTrib
  setTheme(); boot() → publicado: bootAppsScript() → getDados_painel(); local: fetch Sheets → amostra; Colar CSV
  setBanner(label,n,ts) + fmtDT/haQuanto → fonte, "dados até <mês>" e carimbo de última atualização (§10.1)
```

---

## 9. Validação de Consistência (antes de entregar)

1. Recalcular `SCORE MÊS` de 2–3 unidades pelas fórmulas da §6 (pesos vigentes: EBITDA 25% · Mg. Contrib. 20% · Inadimplência 20% · Ger. de Caixa 15% · Produtividade 10% · Tx. Crescimento 10%) e conferir contra a coluna da base (tolerância ± 1 pt por arredondamento). *Obs.: exemplos antigos (RDR/Mar26=74,8; Araujo/Abr26=96,9) foram calculados com a régua pré-RFC e não valem mais — usar valores atuais da base.*
2. Conferir Taxa de Engajamento e RPU de uma regional contra cálculo manual em amostra.
3. Conferir que unidades Desligadas não aparecem em nenhuma tela.
4. Conferir que Termômetro/Score não mostram meses < Abr/26.

---

## 10. Pendências / Status

**Resolvidas:** régua e pesos do RFC (Ger. de Caixa); escala de cor por indicador; 4 telas; Margens só "sim" + gráficos independentes do mês + filtros Horizonte/Unidade; Termômetro desde Mar/26 sem "Atual"; Score Ano (YTD, neutro); NOME FRANQUIA como nome exibido; TRIBUTOS em %; COORDENADORES em R$; tema claro/escuro; fonte IBM Plex Sans; Score com 3 casas.

**Config atual:** `SHEET_ID = 1xI8E5g_...`, `GID = 511003944`. A planilha é **privada** e assim permanece: quem lê é o **servidor** do Apps Script, com a permissão de quem publicou (§10.2). O `fetch` direto do navegador segue dando **HTTP 401** e por isso só vale como caminho local, junto do "Colar CSV".

### 10.1 Barra de fonte (banner) e "Última atualização"

Ordem de carga em `boot()`: **Sheets ao vivo → amostra**. O CSV colado vale **apenas para a sessão** — o painel **não grava dados no navegador** (decisão de 19/08/2026: dado de rede não fica em máquina de usuário; a única chave em `localStorage` é a preferência de tema).

- **Banner** mostra: fonte · nº de linhas · **dados até `<último mês da base>`** e, na 2ª linha, `🕒 Atualizado em dd/mm/aaaa hh:mm · há N dias` (`setBanner(label,n,ts)` + `fmtDT`/`haQuanto`).
- **Cor do carimbo** (o fechamento é mensal, então base parada é sinal de risco): cinza até 21 dias · **âmbar `#D4900A`** de 21 a 35 · **vermelho** acima de 35 dias.
- Rótulos de fonte: `Google Sheets (ao vivo)` · `CSV colado` · `amostra` (sem carimbo).
- **Botão "Colar CSV" (22/08/2026):** aparece **só quando é saída de verdade** — no arquivo local, ou publicado quando a leitura ao vivo falhou (`amostra`). Publicado e lendo a planilha, ele some: não tem função e um botão de importar dados à vista da rede inteira só convida a confusão.
- **Controles nativos no tema escuro (22/08/2026):** `color-scheme` declarado em `:root` (e `dark` no `[data-theme="dark"]`), mais `select option{background:var(--surface);color:var(--preto)}`. Sem isso a lista aberta do `<select>` herda o texto claro do tema sobre o fundo branco do sistema e fica ilegível.
- **Publicado, o carimbo é da PLANILHA, não da carga** (ago/2026): `getDados_painel()` devolve `atualizadoEm` = `modifiedTime` do arquivo, lido pela **API do Drive** (`fields=modifiedTime`), e todo mundo vê a mesma data independentemente de quem abriu. Sem isso o carimbo marcaria a hora do carregamento e diria "agora mesmo" com a base parada há meses — o alerta âmbar/vermelho **nunca** dispararia, que é exatamente o que ele existe para fazer. Ver §10.2.
- **`applyRows(rows,label,ts)` não tem default de `ts`** — cada origem informa o que sabe: Apps Script → data da planilha · CSV colado → hora da colagem (proxy da sessão) · sem informação → `null` e o banner **omite** o carimbo. Carimbo errado é pior que carimbo nenhum.

### 10.2 Publicação — Apps Script Web App (decidido em 19/08/2026)

Requisitos: **dados vinculados ao painel** (quem abrir vê os dados, sem colar CSV, em qualquer máquina) e **acesso restrito a perfis V4**. Solução: **Web App do Google Apps Script**, executando como o dono da planilha e liberado para "qualquer pessoa em V4 Company" — o script lê a base privada (fim do 401) e o login do Workspace é a barreira de acesso. Passo a passo em `apps-script/README-deploy.md`.

**O `index.html` é o mesmo arquivo nos dois modos** — não há versão "local" e versão "publicada":

| | Local (`file://`) | Publicado (Apps Script) |
|---|---|---|
| Detecção | `emAppsScript()` → false | `google.script.run` existe → true |
| Carga | `boot()`: fetch Sheets → amostra; dados por "Colar CSV" | `bootAppsScript()`: `google.script.run.getDados_painel()` |
| Dado | matriz do CSV colado | `{vals, atualizadoEm}` — API do Sheets (`FORMATTED_VALUE`, idêntico ao antigo `getDisplayValues()`) + data via API do Drive (`modifiedTime`) |
| Carimbo | hora da colagem (só a sessão) | `getLastUpdated()` da planilha, igual para todos |

**⚠️ Armadilha do Apps Script — `//` dentro de string (descoberta em 22/08/2026, na 1ª publicação):** o servidor passa um **removedor de comentários no JS embutido** antes de servir a página, e ele **não distingue `//` dentro de string de `//` de comentário**. Ao encontrar `` `https://…` `` ele apagou o resto da linha; a crase não fechou, o arquivo inteiro virou conteúdo de template literal e o navegador acusou `Uncaught SyntaxError: Unexpected end of input`. 

O sintoma é traiçoeiro: **HTML e CSS renderizam normalmente**, o Chart.js carrega, e **nenhuma linha de JavaScript executa** — sem `BASE`, sem handlers, banner vazio, cliques mudos. Nada no log de execuções do Apps Script indica problema, porque o servidor fez o trabalho dele.

Regra permanente: **nenhuma string do `index.html` pode conter `//` literal.** A URL do gviz monta as barras por escape `\u002F`. Antes de publicar, dá para simular o estrago localmente — remover todo comentário do script e rodar `node --check`; se sobreviver, a página sobrevive.

**`mapRows(rows,origem)`** é o ponto único de mapeamento: recebe matriz de texto e devolve os objetos do painel. `loadCSV(txt)` virou só o envelope que faz `parseCSV` → `mapRows`. Isso é o que permite as duas origens sem um segundo mapeamento para manter em sincronia — a API do Sheets com `valueRenderOption=FORMATTED_VALUE` entrega os valores exatamente como o CSV ("R$ 1.976,62", "62,98%", "#N/A"), então os mesmos parsers valem. Verificado: as duas origens produzem objetos idênticos para a mesma base.

**Servidor** (`apps-script/Code.gs`, 7 funções com sufixo `_painel`): `doGet()` serve o `index`; `getDados_painel()` devolve `{vals, atualizadoEm}` com cache de 5 min (`CacheService`); `valoresDaAba_painel()` lê a aba pela **API do Sheets** (localiza o título pelo GID, depois `values.get` com `FORMATTED_VALUE`); `ultimaAtualizacao_painel()` pega o `modifiedTime` pela **API do Drive**; `getUsuario_painel()` devolve quem abriu, para a barra lateral; `api_painel()` centraliza a chamada HTTP autenticada.

**Nada de `SpreadsheetApp`/`DriveApp` (22/08/2026):** os serviços nativos exigem escopos largos — `SpreadsheetApp.openById` pede `auth/spreadsheets`, que é **ler e escrever** todas as planilhas do usuário, e `DriveApp` pede "ver e **baixar** todos os arquivos". Pelas APIs REST o manifesto declara o mínimo: `spreadsheets.readonly` + `drive.metadata.readonly` + `script.external_request` + `userinfo.email`. O app fica tecnicamente **incapaz de escrever** em qualquer planilha. Exige habilitar as duas APIs no projeto Cloud (Serviços › + no editor) — sem isso, `HTTP 403`. Efeito colateral: a leitura caiu de **~19s para ~4s**.

**Acesso binário — decidido (19/08/2026):** quem é V4 vê **todas as regionais**, sem recorte por perfil. O painel expõe **margens (%) e valores agregados**, não o detalhamento de valores por unidade, então a leitura cruzada entre regionais não é sensível. Se um dia entrar detalhamento financeiro linha a linha, essa premissa cai e o recorte por perfil precisa ser reavaliado — o gancho seria filtrar no `getDados_painel()` por `Session.getActiveUser().getEmail()`.

**Atenção operacional:** o parser casa colunas por **nome de cabeçalho** — se um título for renomeado na planilha, aquela coluna vem vazia até o mapeamento ser ajustado.
