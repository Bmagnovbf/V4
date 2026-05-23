'use client'

import type { SimulacaoResult } from '@/types'
import { fmt, fmtPct, fmtInt } from '@/lib/format'

const COLORS = {
  red_primary:  '8B0000',
  red_medium:   'C00000',
  red_soft:     'F4CCCC',
  green_primary:'1A5C38',
  green_soft:   'D9EAD3',
  amber:        'D4900A',
  black:        '1A1A1A',
  gray_dark:    '3D3D3D',
  gray_mid:     '7A7A7A',
  gray_light:   'F2F2F2',
  white:        'FFFFFF',
}

const NIVEL_LABEL: Record<string, string> = {
  verde:    'VIÁVEL',
  amarelo:  'ATENÇÃO',
  vermelho: 'CRÍTICO',
}

const NIVEL_COLOR: Record<string, string> = {
  verde:    'D9EAD3',
  amarelo:  'FFF3CD',
  vermelho: 'F4CCCC',
}

const NIVEL_TEXT: Record<string, string> = {
  verde:    '1A5C38',
  amarelo:  'D4900A',
  vermelho: '8B0000',
}

export async function gerarPPTX(resultado: SimulacaoResult): Promise<void> {
  const pptxgen = (await import('pptxgenjs')).default
  const prs = new pptxgen()
  prs.layout = 'LAYOUT_WIDE'

  const { input, horizonte, kpis, esforco, termometro, headcount, alocacao_m12, projecao } = resultado
  const hoje = new Date().toLocaleDateString('pt-BR')

  // ─── Slide 1 — Capa ─────────────────────────────────────────────────────
  const s1 = prs.addSlide()
  s1.background = { color: COLORS.black }

  s1.addText('V4 Company', {
    x: 0.4, y: 0.3, w: 4, h: 0.5,
    fontSize: 14, bold: true,
    color: COLORS.red_medium,
    fontFace: 'Arial',
  })

  s1.addText('Resumo Executivo do\nBusiness Plan', {
    x: 0.4, y: 1.8, w: 8.8, h: 1.5,
    fontSize: 36, bold: true,
    color: COLORS.white,
    fontFace: 'Arial',
    align: 'center',
  })

  s1.addText(`Horizonte ${horizonte}  ·  Meta ${fmt(input.meta_fat_bruto)}/mês`, {
    x: 0.4, y: 3.5, w: 8.8, h: 0.6,
    fontSize: 18,
    color: COLORS.gray_light,
    fontFace: 'Arial',
    align: 'center',
  })

  s1.addText(hoje, {
    x: 7.5, y: 5.1, w: 2, h: 0.4,
    fontSize: 10,
    color: COLORS.gray_mid,
    fontFace: 'Arial',
    align: 'right',
  })

  // ─── Slide 2 — Termômetro + KPIs ────────────────────────────────────────
  const s2 = prs.addSlide()
  s2.background = { color: COLORS.gray_light }

  s2.addText('Termômetro de Viabilidade', {
    x: 0.3, y: 0.2, w: 9, h: 0.5,
    fontSize: 20, bold: true,
    color: COLORS.red_primary,
    fontFace: 'Arial',
  })

  // Bloco principal do termômetro
  s2.addShape(prs.ShapeType.rect, {
    x: 0.3, y: 0.8, w: 9, h: 1.2,
    fill: { color: NIVEL_COLOR[termometro.nivel_final] },
    line: { color: NIVEL_TEXT[termometro.nivel_final], width: 2 },
  })
  s2.addText(NIVEL_LABEL[termometro.nivel_final], {
    x: 0.3, y: 0.8, w: 9, h: 1.2,
    fontSize: 36, bold: true,
    color: NIVEL_TEXT[termometro.nivel_final],
    fontFace: 'Arial',
    align: 'center',
    valign: 'middle',
  })

  // Sub-indicadores (2 itens centralizados no slide de 10")
  const subItems = [
    { label: 'Capital disponível', value: `${termometro.capital_ratio.toFixed(1)}×`, nivel: termometro.capital_nivel },
    { label: 'Horizonte M12', value: horizonte, nivel: horizonte === 'H1' ? 'amarelo' as const : 'verde' as const },
  ]

  subItems.forEach((item, i) => {
    const x = 2.0 + i * 3.2
    s2.addShape(prs.ShapeType.rect, {
      x, y: 2.2, w: 2.8, h: 0.9,
      fill: { color: NIVEL_COLOR[item.nivel] },
      line: { color: NIVEL_TEXT[item.nivel], width: 1 },
    })
    s2.addText(`${item.label}\n${item.value}`, {
      x, y: 2.2, w: 2.8, h: 0.9,
      fontSize: 12, bold: true,
      color: NIVEL_TEXT[item.nivel],
      fontFace: 'Arial',
      align: 'center',
      valign: 'middle',
    })
  })

  // KPIs
  s2.addText('KPIs Primários', {
    x: 0.3, y: 3.3, w: 9, h: 0.4,
    fontSize: 16, bold: true,
    color: COLORS.gray_dark,
    fontFace: 'Arial',
  })

  const kpiItems = [
    { label: 'Margem EBITDA M12', value: fmtPct(kpis.margem_ebitda_m12) },
    { label: 'Break-even', value: kpis.breakeven_mes ? `Mês ${kpis.breakeven_mes}` : 'N/A' },
    { label: 'Payback', value: kpis.payback_mes ? `${kpis.payback_mes} meses` : '>24m' },
    { label: 'ROIC', value: fmtPct(kpis.roic) },
  ]

  kpiItems.forEach((kpi, i) => {
    const x = 0.3 + i * 2.3
    s2.addShape(prs.ShapeType.rect, {
      x, y: 3.8, w: 2.1, h: 1.3,
      fill: { color: COLORS.white },
      line: { color: COLORS.gray_mid, width: 1 },
    })
    s2.addText(`${kpi.value}\n${kpi.label}`, {
      x, y: 3.8, w: 2.1, h: 1.3,
      fontSize: 14, bold: true,
      color: COLORS.black,
      fontFace: 'Arial',
      align: 'center',
      valign: 'middle',
    })
  })

  // ─── Slide 3 — Esforço de Aquisição e Equipe ────────────────────────────
  const s3 = prs.addSlide()
  s3.background = { color: COLORS.gray_light }

  s3.addText('Esforço de Aquisição e Equipe', {
    x: 0.3, y: 0.2, w: 9, h: 0.5,
    fontSize: 20, bold: true,
    color: COLORS.red_primary,
    fontFace: 'Arial',
  })

  const cardDefs = [
    { title: 'Investimento em Broker', main: `${fmt(esforco.broker_mes)}/mês`, sub: `${fmt(esforco.broker_ano)}/ano` },
    { title: 'MQLs Necessários (Inbound)', main: `${fmtInt(esforco.mqls_inbound_mes)}/mês`, sub: `Conv. ${fmtPct(resultado.blended.conversao * 100)}` },
    { title: 'Equipe Necessária', main: `${headcount.total} investidores`, sub: `CSP ${headcount.csp} · Com. ${headcount.comercial} · G&A ${headcount.ga}` },
    { title: 'Investimento Estimado', main: 'Franquia: R$ 100K', sub: `Fluxo de Caixa: ${fmt(Math.abs(kpis.deficit_acumulado) * 1.30)} · Escritório: ${kpis.postergar_escritorio ? 'após break-even' : 'R$ 100K–200K'}` },
  ]

  cardDefs.forEach((card, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.3 + col * 4.7
    const y = 0.9 + row * 1.8

    s3.addShape(prs.ShapeType.rect, {
      x, y, w: 4.4, h: 1.5,
      fill: { color: COLORS.white },
      line: { color: COLORS.gray_mid, width: 1 },
    })
    s3.addText(card.title, {
      x: x + 0.15, y: y + 0.1, w: 4.1, h: 0.35,
      fontSize: 10, bold: true,
      color: COLORS.red_primary,
      fontFace: 'Arial',
    })
    s3.addText(card.main, {
      x: x + 0.15, y: y + 0.45, w: 4.1, h: 0.55,
      fontSize: 20, bold: true,
      color: COLORS.black,
      fontFace: 'Arial',
    })
    s3.addText(card.sub, {
      x: x + 0.15, y: y + 1.0, w: 4.1, h: 0.35,
      fontSize: 10,
      color: COLORS.gray_dark,
      fontFace: 'Arial',
    })
  })

  // Alerta: déficit acumulado vs capital disponível
  const absDeficit = Math.abs(kpis.deficit_acumulado)
  const deficitRatio = kpis.capital_disponivel_efetivo > 0
    ? absDeficit / kpis.capital_disponivel_efetivo
    : 0
  if (deficitRatio >= 0.5) {
    const isCritico = deficitRatio >= 0.8
    s3.addText(
      isCritico
        ? '⚠ Capital muito próximo do prejuízo acumulado'
        : '⚠ Atenção: prejuízo acumulado acima de 50% do capital',
      {
        x: 0.3, y: 4.5, w: 9, h: 0.4,
        fontSize: 12, bold: true,
        color: isCritico ? COLORS.red_primary : COLORS.amber,
        fontFace: 'Arial',
      }
    )
    s3.addText(
      isCritico
        ? 'O capital disponível está muito próximo do prejuízo acumulado nos primeiros meses, podendo inviabilizar o investimento em escritório e equipamentos.'
        : 'O prejuízo acumulado nos primeiros meses representa mais de 50% do capital disponível. Considere esse ponto ao planejar o investimento em escritório e equipamentos.',
      {
        x: 0.3, y: 4.9, w: 9, h: 0.35,
        fontSize: 11,
        color: COLORS.gray_dark,
        fontFace: 'Arial',
      }
    )
  }

  // ─── Slide 4 — Projeção de Faturamento (gráfico como tabela resumida) ──
  const s4 = prs.addSlide()
  s4.background = { color: COLORS.gray_light }

  s4.addText('Projeção de Faturamento — M1 a M24', {
    x: 0.3, y: 0.2, w: 9, h: 0.5,
    fontSize: 20, bold: true,
    color: COLORS.red_primary,
    fontFace: 'Arial',
  })

  // Tabela de marcos
  const marcos = [1, 3, 6, 9, 12, 18, 24].map(m => {
    const p = projecao[m - 1]
    return [
      `M${m}`,
      fmt(p.fat_bruto),
      fmt(p.receita_liquida),
      fmt(p.ebitda),
    ]
  })

  s4.addTable(
    [
      [
        { text: 'Mês', options: { bold: true, fill: { color: COLORS.red_primary }, color: COLORS.white } },
        { text: 'Fat. Bruto', options: { bold: true, fill: { color: COLORS.red_primary }, color: COLORS.white } },
        { text: 'Receita Líq.', options: { bold: true, fill: { color: COLORS.red_primary }, color: COLORS.white } },
        { text: 'EBITDA', options: { bold: true, fill: { color: COLORS.red_primary }, color: COLORS.white } },
      ],
      ...marcos.map(row =>
        row.map((cell, ci) => ({
          text: cell,
          options: {
            fill: { color: ci === 0 ? COLORS.gray_light : COLORS.white },
            color: COLORS.black,
            bold: ci === 0,
          },
        }))
      ),
    ],
    {
      x: 0.3, y: 0.9, w: 9, h: 4.2,
      fontSize: 12,
      fontFace: 'Arial',
      border: { type: 'solid', color: COLORS.gray_mid, pt: 0.5 },
      align: 'center',
    }
  )

  // ─── Slide 5 — Lucratividade e Estrutura de Custos ──────────────────────
  const s5 = prs.addSlide()
  s5.background = { color: COLORS.gray_light }

  s5.addText('Estrutura de Custos — Horizonte ' + horizonte, {
    x: 0.3, y: 0.2, w: 9, h: 0.5,
    fontSize: 20, bold: true,
    color: COLORS.red_primary,
    fontFace: 'Arial',
  })

  const pct = (val: number) => alocacao_m12.fat_liq > 0
    ? fmtPct((val / alocacao_m12.fat_liq) * 100)
    : '—'
  const custosRows = [
    ['CSP',       pct(alocacao_m12.custo_csp)],
    ['Comercial', pct(alocacao_m12.custo_comercial)],
    ['G&A',       pct(alocacao_m12.custo_ga)],
    ['Broker',    pct(alocacao_m12.custo_broker)],
    ['EBITDA',    pct(alocacao_m12.ebitda)],
  ]

  s5.addTable(
    [
      [
        { text: 'Centro de Custo', options: { bold: true, fill: { color: COLORS.red_primary }, color: COLORS.white } },
        { text: '% Receita Líquida', options: { bold: true, fill: { color: COLORS.red_primary }, color: COLORS.white } },
      ],
      ...custosRows.map(([label, val]) => [
        { text: label, options: { color: COLORS.black, fill: { color: COLORS.white } } },
        { text: val, options: { color: label === 'EBITDA' ? COLORS.green_primary : COLORS.black, bold: label === 'EBITDA', fill: { color: label === 'EBITDA' ? COLORS.green_soft : COLORS.white } } },
      ]),
    ],
    {
      x: 0.3, y: 0.9, w: 5, h: 2.4,
      fontSize: 13,
      fontFace: 'Arial',
      border: { type: 'solid', color: COLORS.gray_mid, pt: 0.5 },
      align: 'center',
    }
  )

  // Dados EBITDA acumulado M1-M12
  const ebitdaRows = projecao.slice(0, 12).map(p => [
    `M${p.mes}`,
    fmt(p.ebitda),
    fmt(p.ebitda_acumulado),
  ])

  s5.addText('EBITDA Mensal e Acumulado (M1–M12)', {
    x: 5.5, y: 0.9, w: 4, h: 0.4,
    fontSize: 12, bold: true,
    color: COLORS.gray_dark,
    fontFace: 'Arial',
  })

  s5.addTable(
    [
      [
        { text: 'Mês', options: { bold: true, fill: { color: COLORS.gray_dark }, color: COLORS.white } },
        { text: 'EBITDA', options: { bold: true, fill: { color: COLORS.gray_dark }, color: COLORS.white } },
        { text: 'Acumulado', options: { bold: true, fill: { color: COLORS.gray_dark }, color: COLORS.white } },
      ],
      ...ebitdaRows.map(row =>
        row.map(cell => ({
          text: cell,
          options: { color: COLORS.black, fill: { color: COLORS.white }, fontSize: 9 },
        }))
      ),
    ],
    {
      x: 5.5, y: 1.35, w: 4, h: 3.7,
      fontSize: 9,
      fontFace: 'Arial',
      border: { type: 'solid', color: COLORS.gray_mid, pt: 0.5 },
      align: 'center',
    }
  )

  s5.addText(
    'Simulação baseada em benchmarks da rede V4. Valores projetados, não garantidos.',
    {
      x: 0.3, y: 5.2, w: 9, h: 0.3,
      fontSize: 8,
      color: COLORS.gray_mid,
      fontFace: 'Arial',
      align: 'center',
      italic: true,
    }
  )

  await prs.writeFile({ fileName: `BP_V4_Forecast_${horizonte}_${hoje.replace(/\//g, '-')}.pptx` })
}
