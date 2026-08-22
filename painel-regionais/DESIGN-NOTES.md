# Aprendizados de Design & Layout — V4
**Semente da futura skill `v4-design`.** Cada feedback do Bruno vira um princípio reutilizável.

Formato de cada entrada:
> **Princípio** — regra em uma linha.
> *Contexto:* onde surgiu · *Aplicação:* como implementar · *Antes → Depois:* o que mudou.

---

## 1. Fundamentos já estabelecidos (do PRD/SPEC / skill financial-viz)

- **Paleta fixa V4** (nunca azul): vermelho `#8B0000`/`#C00000`, verde `#1A5C38`, âmbar `#D4900A`, cinzas, fundo claro `#F2F2F2`.
- **Semântica de cor:** verde = positivo/safe · âmbar = atenção/care · vermelho = alerta.
- **Escala de score:** `<35` alerta · `35–70` care · `>70` safe.
- **Fonte:** IBM Plex Sans (via Google Fonts; fallback Arial). Tom profissional, tecnológico, sem elementos decorativos.
- **Formatação BR:** `R$ 1.234,56` · `12,3%` (`Intl.NumberFormat('pt-BR')`).

---

## 2. Princípios capturados nesta iteração

### P1 — A cor do NÚMERO carrega a temperatura do indicador
*Contexto:* cards (geral, todas as telas). *Refs:* Image #1, #2.
O valor principal do card é colorido conforme sua saúde: **verde (bom) / âmbar (atenção) / vermelho (ruim)**. Não deixar o número sempre preto. Ex.: "Unidades em alerta = 6" em vermelho; delta "▼80%" em vermelho; um número saudável em verde.

### P2 — Bolinha de status ao lado do label, na mesma cor do número
*Contexto:* cards. *Refs:* Image #1 (• CLIENTES verde, • CHURN vermelho).
Antes do rótulo (UPPERCASE, cinza) vai um **dot colorido** com a mesma cor semântica do valor. Dot + número compartilham a temperatura → leitura instantânea.

### P3 — Anatomia do card V4
*Ref:* Image #1. Estrutura:
`[ícone em quadrado de fundo tint suave] · • LABEL (uppercase, cinza) · NÚMERO grande colorido + unidade menor ("no mês") · [delta ▲/▼ colorido à direita] · subtexto de apoio (cinza)`.
Quadrado do ícone usa **tint pálido** da cor semântica (verde-suave / vermelho-suave). Card: branco, cantos ~14px, borda cinza-clara + sombra leve.

### P4 — Menu lateral: identidade V4 (duas direções válidas)
*Contexto:* sidebar. *Refs:* Image #3 e #4. **Off-brand a evitar:** vermelho chapado sólido (o do protótipo atual).
- **Direção A — "Premium escura":** sidebar largo com **gradiente vinho/marrom** (topo bordô → base quase preto), logo V4 + título/subtítulo, itens com ícone outline, item ativo com realce arredondado mais claro, rodapé "LOGADO COMO / nome / email + badge de papel".
- **Direção B — "Rail slim":** trilho estreito **branco**, só ícones monocromáticos cinza, logo V4 vermelho no topo, ícone ativo em vermelho com tint rosa, divisórias, marca no rodapé.
> **DECISÃO (Bruno): Direção A — Premium escura (gradiente vinho→preto).** Padrão oficial do menu lateral V4. Sidebar largo, logo+título "Painel Regionais", itens com ícone, ativo destacado, rodapé "LOGADO COMO / Bruno Magno / email + badge de papel (VISUALIZADOR)".

### P5 — Filtros como pills, não `<select>` quadrados
*Contexto:* barra de filtros. *Refs:* Image #5, #6. **Evitar:** selects retangulares "grosseiros".
- Controles em **pill arredondada**, branco, borda sutil, com **ícone + label + chevron** ("▤ Horizonte ⌄").
- Filtro de mês vira **stepper**: `[‹] Junho De 2026 [›]` (setas prev/next ao redor do mês centralizado).
- Prefixo "⧩ Filtros:" opcional, leve, inline.

### P6 — Tabela = diagnóstico por critério, não planilha de valores
*Contexto:* tabela da Home. *Ref:* descrição do Bruno.
Quando a tabela serve para explicar um *status* (ex.: por que a unidade está desengajada), cada coluna vira um **semáforo**: **bolinha colorida (verde/âmbar/vermelho)** indicando se o critério passou, e o **valor em cinza claro, menor, secundário** abaixo. O olho lê o diagnóstico pela cor, não pelo número.
Critérios de engajamento aplicados na Home:
- **EBITDA:** |v| ≤ 35% verde · ≤ 50% âmbar · > 50% vermelho.
- **Deduções / Custos / Despesas / Coordenadores:** ≠ 0 verde · = 0 vermelho.
- **Conciliação:** < 9 dias verde · ≥ 9 dias vermelho.

### P7 — Status/classificação como pill colorida suave
*Contexto:* coluna Status. *Ref:* Image #7 (pills "Saudável" verde / "Em risco" vermelho).
Rótulo em **pill arredondada** com fundo tint pálido + texto na cor cheia da categoria. No painel: Engajado (verde) · Parcial (âmbar) · Desengajado (vermelho).

### P8 — Ícone acompanha, número protagoniza
*Contexto:* cards. Todos os cards têm ícone em quadradinho tint (P3), mas **a cor semântica vive no número e na bolinha** (P1/P2) — o ícone é apoio, não rouba a leitura. Ícone tint usa a mesma temperatura do valor.

### P9 — Ícones: linha, monocromáticos, discretos
*Contexto:* geral (cards, menu). *Ref:* feedback do Bruno.
Nunca emoji/multicolor. Usar **ícones de linha (SVG) monocromáticos** com `stroke: currentColor` — assim herdam a cor da temperatura (P1) automaticamente e ficam coerentes com o tema. `stroke-width` ~1.8, cantos arredondados. **Tamanho contido:** nos cards o ícone é apoio (~17px num quadradinho de ~34px), menor que o número. Cada seção/indicador ganha um ícone **específico e reconhecível** (casa, barras, termômetro, relógio, alvo/percentual, etc.), não genérico.

### P10 — Delta (variação) no rodapé do card, alinhado à direita
*Contexto:* cards com comparativo (Margens). *Ref:* feedback Bruno.
O triângulo ▲/▼ + variação fica na **base do card, à direita** (não flutuando no topo). Card vira coluna flex e o rodapé cola embaixo (`margin-top:auto`). Mesma fonte do restante (~12px).

### P11 — Rótulos curtos para caber a densidade
*Contexto:* linha com muitos cards. Abreviar rótulos quando necessário para caber tudo na horizontal: "Margem" → **"Mg."** (Mg. Operacional / Mg. Contribuição / Mg. EBITDA). Uma fileira de KPIs correlatos deve caber numa **única linha horizontal** (aqui, 7 cards) — compactar padding/ícone/fonte em vez de quebrar linha.

### P12 — Nome curto no menu, nome completo no título
*Contexto:* navegação. O item do **menu lateral** usa rótulo curto ("Margens"); o **H1 da página** usa o nome completo ("Margens e Centros de Custo"). Menu = navegação rápida; título = contexto pleno.

### P13 — Séries temporais: todos os meses, só engajadas
*Contexto:* gráficos de evolução. Sempre plotar **todos os meses disponíveis com valores** (nunca fixar "últimos N"). Médias de margem/custo consideram **apenas unidades engajadas** — dado de Conta Azul de desengajada não é confiável (margens, custos e despesas saem de lá).

### P14 — Escolha do tipo de gráfico por intenção
*Contexto:* gráficos. *Ref:* Bruno.
- **Evolução de indicadores %** (margens, centros de custo) → **linha**.
- **Volume + variação** (crescimento) → **colunas** do volume (Fat. Líquido) com **rótulo da variação MoM ▲/▼% em cima de cada coluna** (verde/vermelho por sinal).
- Quando o valor exato importa mês a mês (tributos) → **linha com data-label** em cada ponto.
- Data-labels via **plugin inline** (`afterDatasetsDraw`) — sem dependência extra.

### P15 — Ênfase no indicador-chave; o resto é suave
*Contexto:* tabela do Termômetro. *Ref:* Image #8 + descrição do Bruno.
Quando a tabela tem um indicador **protagonista** (aqui, o Score), a cor vive nele. Nas colunas de apoio: **bolinha à esquerda** (promotor=verde / detrator=vermelho, pela temperatura do indicador) + **número maior = o score daquele indicador** (cor neutra/escura) + **valor atingido embaixo, menor, cinza**. Evitar muitas pills preenchidas "pesadas" (fica grosseiro). O indicador-chave usa **pill suave** — fundo tint pastel + texto na cor cheia (tonalidade "Saudável/Em risco" da Image #8).

### P16 — Toda tabela: ordenável e filtrável por coluna
*Contexto:* tabelas (Home + Termômetro). *Ref:* Bruno.
Cabeçalho **clicável ordena** a coluna (alterna asc/desc, com seta ▴/▾ na coluna ativa). Colunas categóricas (ex.: Status) ganham **dropdown de filtro** no próprio header (Todos / Engajado / Parcial / Desengajado). Ranking do score (cima→baixo / baixo→cima) é só um clique.

> **Thresholds de temperatura dos cards (defaults ajustáveis):** Engajamento ≥80 verde/≥50 âmbar · Inadimplência ≤3 verde/≤10 âmbar · EBITDA >10 verde/≥0 âmbar · **Lucratividade: mesma régua da EBITDA — <0 vermelho · 0–10 âmbar · >10 verde (confirmada por Bruno em 29/07/2026)** · Score usa escala oficial (<35/35-70/>70). RPU/Receita sem cor (número neutro). — demais itens a confirmar com Bruno.
