---
name: financial-viz
description: >
  Use this skill para gerar todas as tabelas formatadas e gráficos do relatório financeiro mensal da rede de franquias V4 Company.
  É acionada pela skill financial-report como parte do fluxo de construção do relatório.
  Recebe o payload de dados já calculados e entrega imagens de gráficos (.png) prontas para inserção no .docx,
  além de todos os objetos de tabela formatados.
  Acione também quando o usuário pedir: "gerar tabelas", "gerar gráficos", "montar visualizações do relatório".
---

# Skill: Visualizações do Relatório Financeiro

## Filosofia de design

Tom **profissional, atual e tecnológico**. Sem azul em nenhuma ocasião.

As visualizações devem comunicar clareza e autoridade — cada elemento visual tem função, nenhum é decorativo.
Gráficos limpos, tipografia precisa, hierarquia visual bem definida.

---

## Paleta de cores

| Papel | Hex | Uso |
|-------|-----|-----|
| Vermelho primário | `#8B0000` | Receita, barras positivas, destaque principal |
| Vermelho médio | `#C00000` | Valores negativos, alertas, quedas |
| Vermelho suave | `#F4CCCC` | Fundo de linhas negativas em tabela |
| Verde primário | `#1A5C38` | Resultados positivos, EBITDA saudável |
| Verde suave | `#D9EAD3` | Fundo de linhas positivas em tabela |
| Amarelo âmbar | `#D4900A` | Série Comercial / Contribuição — atenção |
| Amarelo suave | `#FFF2CC` | Fundo de linhas de atenção em tabela |
| Preto | `#1A1A1A` | Cabeçalhos, títulos, texto principal |
| Cinza escuro | `#3D3D3D` | Série Administrativa, textos secundários |
| Cinza médio | `#7A7A7A` | Série Gerais, legendas, labels suaves |
| Cinza claro | `#F2F2F2` | Alternância de linhas em tabela |
| Branco | `#FFFFFF` | Fundo padrão, texto em fundos escuros |

**Nunca usar:** qualquer tom de azul, roxo ou cores não listadas acima.

---

## Tipografia

- **Fonte do documento:** Arial (fiel ao relatório original)
- **Fonte nos gráficos matplotlib:** `DejaVu Sans` (equivalente disponível no sistema)
- Configurar globalmente: `plt.rcParams['font.family'] = 'DejaVu Sans'`
- Hierarquia em gráficos: título 11pt negrito → labels de eixo 9pt → anotações de valor 8–9pt negrito → legenda 8pt

---

## Configuração do ambiente

```bash
pip install matplotlib --break-system-packages
mkdir -p /tmp/financial-viz
```

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.spines.left': False,
    'axes.grid': True,
    'grid.color': '#E8E8E8',
    'grid.linewidth': 0.6,
    'axes.axisbelow': True,
    'figure.facecolor': 'white',
    'axes.facecolor': 'white',
})
```

---

## Parte 1 — Tabelas

Construídas via `docx-js`. Consultar `/mnt/skills/public/docx/SKILL.md` para referência técnica.
Usar `ShadingType.CLEAR` em todas as células. Nunca `WidthType.PERCENTAGE`.

### Regras gerais de estilo para todas as tabelas

- **Cabeçalho:** fundo `#1A1A1A`, texto branco, negrito, 10pt, padding 100/160
- **Linhas de resultado/total:** negrito; fundo verde suave se positivo, vermelho suave se negativo
- **Alternância:** branco / `#F2F2F2`
- **Bordas:** `BorderStyle.SINGLE`, size 1, cor `#D0D0D0`
- **Padding de célula:** `{ top: 80, bottom: 80, left: 120, right: 120 }`
- **Alinhamento numérico:** direita; alinhamento de rótulo: esquerda

---

### T1 — Tabela de Índices Consolidados

**Posição:** Seção 2 — Consolidado Rede  
**Colunas:** `Índice | Mês-3 | Mês-2 | Mês-1 | Mês Atual`

| Linha | Fundo | Estilo |
|-------|-------|--------|
| Cabeçalho | `#1A1A1A` | branco, negrito |
| $ Receita Líquida | `#F2F2F2` | negrito |
| % Mg. Operacional | branco | normal |
| % Mg. Contribuição | `#F2F2F2` | normal |
| % EBITDA | `#D9EAD3` | negrito, verde `#1A5C38` |
| % CSP | branco | normal |
| % Comercial | `#F2F2F2` | normal |
| % Administrativo | branco | normal |
| % Gerais | `#F2F2F2` | normal |
| Engajamento | branco | normal |

Legenda abaixo (itálico 9pt, cinza `#7A7A7A`): *"Comparação das margens ao longo dos meses"*

---

### T2 — DRE Resumo (consolidado + por horizonte)

**Instâncias:** 5 (consolidado + H1/H2 + H3 + H4 + H5)  
**Colunas:** `Índice | Mês-3 | Mês-2 | Mês-1 | Mês Atual`

| Linha | Fundo | Estilo |
|-------|-------|--------|
| Cabeçalho | `#1A1A1A` | branco, negrito |
| $ Receita Líquida | `#F2F2F2` | negrito |
| (-) CSP | branco | normal |
| (=) Lucro Bruto | `#D9EAD3` | negrito |
| (-) SG&A | `#F2F2F2` | normal |
| (=) EBITDA | `#D9EAD3` se positivo / `#F4CCCC` se negativo | negrito |

Legenda (itálico 9pt): *"[Nome] DRE Resumo"*

---

### T3 — Centros de Custo por Horizonte

**Instâncias:** 4  
**Colunas:** `Índice | Mês-3 | Mês-2 | Mês-1 | Mês Atual`

Linhas: % Mg. Operacional, % Mg. Contribuição, % EBITDA, % CSP, % Comercial, % Administrativo, % Gerais, # Unidades

- Alternância branco / `#F2F2F2`
- Linha `% EBITDA`: fundo `#D9EAD3` se positivo, `#F4CCCC` se negativo; negrito
- Linha `# Unidades`: fundo `#F2F2F2`, negrito, separada das demais por borda superior mais escura `#A0A0A0`

---

### T4 — Análise por Regional

**Colunas:** `Regional | $ Rec. Líquida | % Mg. Op | % Mg. Contrib | % EBITDA | % CSP | % Comercial | % Adm | % Gerais | # Un | H1/H2 | H3 | H4 | H5`

- Ordenar por % EBITDA decrescente
- EBITDA negativo: texto `#C00000`, negrito
- Top 1 EBITDA: fundo `#D9EAD3` na linha inteira
- Flop 1 EBITDA: fundo `#F4CCCC` na linha inteira
- Demais: alternância branco / `#F2F2F2`

---

### T5 — DFC por Horizonte

**Colunas:** `Horizonte | Caixa | Mês-4 | Mês-3 | Mês-2 | Mês-1 | Mês Atual`

Grupos por horizonte: Consolidado → H1/H2 → H3 → H4 → H5

- Linha `(+) Entrada`: branco, normal
- Linha `(-) Saída`: `#F2F2F2`, normal
- Linha `(=) Saldo`: negrito; `#D9EAD3` se positivo, `#F4CCCC` se negativo

Separação visual entre grupos: borda superior `#1A1A1A` size 4 na primeira linha de cada horizonte.

---

## Parte 2 — Gráficos

Todos salvos em `/tmp/financial-viz/` com `dpi=150`, `bbox_inches='tight'`, fundo branco.  
Formato de valores monetários: `R$ X.XXX.XXX` (ponto separador de milhar, sem centavos).  
Formato de percentuais: `XX,XX%` (vírgula decimal).

---

### G1 — Waterfall EBITDA (Composição)

**Arquivo:** `grafico_waterfall_[sufixo].png`  
**Posição:** Seção 2f — Rentabilidade e Eficiência  
**Tipo:** Cascata vertical descendente

**Barras:**
1. ($) Receita Total Líquida — `#8B0000`
2. (-) CSP — `#3D3D3D`
3. (-) Comercial — `#3D3D3D`
4. (-) Administrativa — `#3D3D3D`
5. (-) Gerais — `#3D3D3D`
6. ($) EBITDA — `#8B0000` se positivo, `#C00000` se negativo

**Estilo:**
- Valor em R$ acima de cada barra; cor `#8B0000` para receita/EBITDA, `#3D3D3D` para deduções
- Linha tracejada `#AAAAAA` conectando topo de cada barra à base da próxima
- Sem eixo Y; gridlines horizontais `#E8E8E8`
- Labels eixo X: 9pt, negrito para Receita e EBITDA
- Tamanho: 22 × 12 cm

```python
def gerar_waterfall(receita, csp, comercial, administrativo, gerais, output_path):
    ebitda = receita - csp - comercial - administrativo - gerais
    categorias = ['($) Receita\nTotal Líquida', '(-) CSP', '(-) Comercial',
                  '(-)\nAdministrativa', '(-) Gerais', '($) EBITDA']
    valores_abs = [receita, csp, comercial, administrativo, gerais, ebitda]
    cores = ['#8B0000', '#3D3D3D', '#3D3D3D', '#3D3D3D', '#3D3D3D',
             '#8B0000' if ebitda >= 0 else '#C00000']

    # calcular bases para cascata
    bases = [0, receita - csp, receita - csp - comercial,
             receita - csp - comercial - administrativo,
             receita - csp - comercial - administrativo - gerais, 0]

    fig, ax = plt.subplots(figsize=(22/2.54, 12/2.54))
    for i, (cat, val, base, cor) in enumerate(zip(categorias, valores_abs, bases, cores)):
        height = val if i == 0 or i == 5 else -val
        bottom = base if i == 0 or i == 5 else base
        ax.bar(i, abs(height), bottom=min(base, base + (val if i in [0,5] else -val)),
               color=cor, width=0.55, zorder=3)
        # anotação de valor
        topo = base + (val if i in [0, 5] else 0) if i == 0 else bases[i] + (ebitda if i == 5 else 0)
        y_label = (base + val) if i == 0 else (ebitda if i == 5 else base - val)
        prefixo = 'R$ ' if i in [0, 5] else '-R$ '
        label = f"{prefixo}{abs(val):,.0f}".replace(',', '.')
        ax.text(i, y_label + receita * 0.015, label, ha='center', va='bottom',
                fontsize=8.5, fontweight='bold',
                color='#8B0000' if i in [0, 5] else '#3D3D3D')
        # linha tracejada
        if i < 5:
            y_conector = base + val if i == 0 else base - val
            ax.plot([i + 0.28, i + 0.72], [y_conector, y_conector],
                    color='#BBBBBB', linestyle='--', linewidth=0.9, zorder=4)

    ax.set_xticks(range(len(categorias)))
    ax.set_xticklabels(categorias, fontsize=9)
    ax.set_yticks([])
    ax.spines['left'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
```

---

### G2 — Evolução das Margens

**Arquivo:** `grafico_margens_[sufixo].png`  
**Posição:** Seção 2g (consolidado) + subseção de cada horizonte  
**Instâncias:** 5 (consolidado + H1/H2 + H3 + H4 + H5)  
**Tipo:** Linhas com marcadores circulares, valores anotados em cada ponto

**Séries:**
- % Mg. Operacional → `#8B0000`
- % Mg. Contribuição → `#D4900A`
- % EBITDA → `#3D3D3D`

**Estilo:**
- Marcador: círculo, tamanho 7, preenchido com a cor da série
- Valor anotado acima do ponto: `XX,XX%`, 8pt, negrito, cor da série
- Eixo X: labels dos meses, 9pt, negrito
- Sem eixo Y; gridlines horizontais sutis
- Legenda: canto superior esquerdo, sem borda, 8pt
- Tamanho: 18 × 8 cm

```python
def gerar_linhas_margens(meses, mg_op, mg_contrib, mg_ebitda, output_path):
    fig, ax = plt.subplots(figsize=(18/2.54, 8/2.54))
    series = [
        (mg_op,     '#8B0000', '% Mg. Operacional'),
        (mg_contrib,'#D4900A', '% Mg. Contribuição'),
        (mg_ebitda, '#3D3D3D', '% EBITIDA'),
    ]
    for valores, cor, label in series:
        xs = range(len(meses))
        ax.plot(xs, valores, color=cor, marker='o', markersize=7,
                linewidth=1.8, label=label, zorder=3)
        for x, y in zip(xs, valores):
            ax.annotate(f"{y:.2f}%".replace('.', ','), (x, y),
                        textcoords='offset points', xytext=(0, 9),
                        ha='center', fontsize=8, fontweight='bold', color=cor)
    ax.set_xticks(range(len(meses)))
    ax.set_xticklabels(meses, fontsize=9, fontweight='bold')
    ax.set_yticks([])
    ax.legend(loc='upper left', fontsize=8, frameon=False)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
```

---

### G3 — Evolução dos Centros de Custo

**Arquivo:** `grafico_centros_[sufixo].png`  
**Posição:** Seção 2h (consolidado) + subseção de cada horizonte  
**Instâncias:** 5  
**Tipo:** Mesmo padrão do G2, com 4 séries

**Séries:**
- % CSP → `#8B0000`
- % Comercial → `#D4900A`
- % Administrativo → `#3D3D3D`
- % Gerais → `#7A7A7A`

Tamanho: 20 × 9 cm (mais largo pela quantidade de séries e valores).

---

### G4 — Saldo DFC por Horizonte (série temporal)

**Arquivos:** `grafico_dfc_h12.png`, `grafico_dfc_h3.png`, `grafico_dfc_h4.png`, `grafico_dfc_h5.png`  
**Posição:** Seção 5, uma por horizonte  
**Tipo:** Barras verticais mensais

**Estilo:**
- Barras positivas: `#8B0000`, valor em branco dentro da barra (se altura suficiente) ou vermelho escuro acima
- Barras negativas: `#8B0000`, crescem para baixo; valor em `#C00000` negrito fora da barra (abaixo)
- Linha zero: preta `#1A1A1A`, linewidth 1
- Título no canto superior esquerdo: nome do horizonte, 11pt, cinza `#7A7A7A`, negrito
- Eixo Y visível com gridlines `#E8E8E8`; formatação de milhar sem centavos
- Labels eixo X: nomes dos meses, 9pt, negrito
- Tamanho: 14 × 9 cm

```python
def gerar_dfc_horizonte(meses, saldos, titulo, output_path):
    fig, ax = plt.subplots(figsize=(14/2.54, 9/2.54))
    max_abs = max(abs(s) for s in saldos) if saldos else 1
    for i, (mes, saldo) in enumerate(zip(meses, saldos)):
        ax.bar(i, saldo, color='#8B0000', width=0.5, zorder=3)
        val_str = f"{saldo:,.0f}".replace(',', '.')
        if saldo >= 0:
            # valor dentro se barra grande, fora se pequena
            if saldo > max_abs * 0.15:
                ax.text(i, saldo / 2, val_str, ha='center', va='center',
                        fontsize=8.5, fontweight='bold', color='white')
            else:
                ax.text(i, saldo + max_abs * 0.03, val_str, ha='center', va='bottom',
                        fontsize=8.5, fontweight='bold', color='#8B0000')
        else:
            ax.text(i, saldo - max_abs * 0.05, val_str, ha='center', va='top',
                    fontsize=8.5, fontweight='bold', color='#C00000')
    ax.axhline(0, color='#1A1A1A', linewidth=1, zorder=4)
    ax.set_xticks(range(len(meses)))
    ax.set_xticklabels(meses, fontsize=9, fontweight='bold')
    ax.set_title(titulo, loc='left', fontsize=11, color='#7A7A7A', fontweight='bold', pad=8)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{x:,.0f}".replace(',', '.')))
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
```

---

### G5 — DFC Consolidado por Horizonte

**Arquivo:** `grafico_dfc_consolidado.png`  
**Posição:** Seção 5 — Conclusão  
**Tipo:** Barras verticais, um por horizonte + Total Geral

**Eixo X:** H1/H2 | H3 | H4 | H5 | Total Geral  
**Estilo:**
- Positivos: `#8B0000`, valor em branco dentro
- Negativos: `#8B0000`, valor em `#C00000` fora
- Barra "Total Geral": mesma cor, porém com borda superior `#1A1A1A` linewidth 1.5 para destacar
- Linha zero preta
- Tamanho: 16 × 10 cm

---

## Arsenal completo de visualizações disponíveis

Além dos gráficos padrão do relatório, esta skill domina os seguintes tipos e deve aplicá-los quando o contexto exigir maior clareza ou impacto:

### Gráficos de composição e estrutura
- **Stacked bar (barras empilhadas):** composição percentual de centros de custo mês a mês
- **100% stacked bar:** distribuição Aquisição / Renovação / Expansão na receita
- **Donut / pie minimalista:** composição da receita no mês atual (sem legenda interna, com anotações externas)

### Gráficos de comparação
- **Bar chart horizontal:** ranking de regionais por EBITDA — ideal para muitas categorias
- **Lollipop chart:** variação de indicadores vs mês anterior — mais limpo que barras para deltas
- **Diverging bar:** comparativo positivo/negativo (ex: regionais acima/abaixo da média)

### Gráficos de evolução
- **Area chart (área preenchida):** receita acumulada ao longo do ano — transmite crescimento
- **Slope chart:** comparação direta de dois períodos em múltiplas unidades/horizontes

### Indicadores visuais (KPI cards)
- **Scorecard textual:** valor grande + variação p.p. + seta direcional (↑↓) — inserido como imagem no .docx
- Usar quando quiser destacar 3–5 KPIs no topo de uma seção antes das tabelas

### Regras de escolha

| Objetivo | Tipo recomendado |
|----------|-----------------|
| Mostrar evolução no tempo | Linha com marcadores (G2/G3) |
| Mostrar composição de resultado | Waterfall (G1) |
| Comparar horizontes/regionais | Bar horizontal ou Diverging bar |
| Mostrar distribuição de receita | Donut ou 100% stacked |
| Destacar variação vs período anterior | Lollipop ou Slope chart |
| Resumir KPIs na abertura de seção | Scorecard textual |
| Mostrar saldo de caixa histórico | Bar vertical com zero explícito (G4/G5) |

---

## Entrega para a skill financial-report

Ao concluir, retornar o mapa de assets com caminhos absolutos dos `.png` e objetos de tabela docx:

```python
assets = {
    # Tabelas
    "tabela_indices": ...,
    "tabela_dre_consolidado": ...,
    "tabela_dre_h12": ..., "tabela_dre_h3": ..., "tabela_dre_h4": ..., "tabela_dre_h5": ...,
    "tabela_centros_h12": ..., "tabela_centros_h3": ..., "tabela_centros_h4": ..., "tabela_centros_h5": ...,
    "tabela_regional": ...,
    "tabela_dfc": ...,

    # Gráficos
    "grafico_waterfall":              "/tmp/financial-viz/grafico_waterfall.png",
    "grafico_margens_consolidado":    "/tmp/financial-viz/grafico_margens_consolidado.png",
    "grafico_margens_h12":            "/tmp/financial-viz/grafico_margens_h12.png",
    "grafico_margens_h3":             "/tmp/financial-viz/grafico_margens_h3.png",
    "grafico_margens_h4":             "/tmp/financial-viz/grafico_margens_h4.png",
    "grafico_margens_h5":             "/tmp/financial-viz/grafico_margens_h5.png",
    "grafico_centros_consolidado":    "/tmp/financial-viz/grafico_centros_consolidado.png",
    "grafico_centros_h12":            "/tmp/financial-viz/grafico_centros_h12.png",
    "grafico_centros_h3":             "/tmp/financial-viz/grafico_centros_h3.png",
    "grafico_centros_h4":             "/tmp/financial-viz/grafico_centros_h4.png",
    "grafico_centros_h5":             "/tmp/financial-viz/grafico_centros_h5.png",
    "grafico_dfc_h12":                "/tmp/financial-viz/grafico_dfc_h12.png",
    "grafico_dfc_h3":                 "/tmp/financial-viz/grafico_dfc_h3.png",
    "grafico_dfc_h4":                 "/tmp/financial-viz/grafico_dfc_h4.png",
    "grafico_dfc_h5":                 "/tmp/financial-viz/grafico_dfc_h5.png",
    "grafico_dfc_consolidado":        "/tmp/financial-viz/grafico_dfc_consolidado.png",
}
```

---

## Notas de qualidade

- **Nunca usar azul** em nenhum elemento — verificar antes de salvar
- **EBITDA negativo no waterfall:** barra vermelha média `#C00000`, label em vermelho
- **Horizonte com menos de 2 meses de dados:** omitir gráfico, registrar aviso
- **Saldo DFC todo zero:** omitir gráfico desse horizonte
- **Valores muito próximos em linhas:** aumentar `xytext` das anotações para evitar sobreposição
- **Tabela regional com mais de 13 linhas:** reduzir fonte para 9pt para caber na página
- **Formatação BR consistente:** ponto para milhar (`1.000.000`), vírgula para decimal (`14,68%`)
