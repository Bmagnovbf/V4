// Valida o motor contra a planilha "ASSESSOR V4 · DRE PROJETADO 12 MESES".
// Uso: npx tsc -p tsconfig.test.json && node test_dre.mjs
//
// O tsc não reescreve o alias "@/" no emit, então mapeamos na mão.

import Module from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const original = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) {
    request = path.join(raiz, '.test_out', request.slice(2))
  }
  return original.call(this, request, ...rest)
}

const { simular } = Module.createRequire(import.meta.url)('./.test_out/lib/calculator.js')

// ─── Referência: planilha ────────────────────────────────────────────────────
//
// Perfil e rede de cada cenário NÃO são o mix de contratos da planilha — são a
// combinação que, sob as premissas do motor (pace da matriz de 1–2 clientes/mês,
// teto de 38 calls × 20%, fator de rede), reproduz o resultado daquele cenário.
const DRE = {
  base: {
    label: 'Base (70/30)',
    pct_comercial: 0.35,
    network: 'alto',
    receita_recebida_ano1: 292_875,
    renda_liquida_ano1:    149_303,
    renda_media_mes:        12_442,
    renda_liquida_m12:      28_846,
    projetos_ativos_m12:        15,
    payback_mes:                 6,
    breakeven_mes:               1,
  },
  upside: {
    label: 'Upside (50/50)',
    pct_comercial: 0.50,
    network: 'alto',
    receita_recebida_ano1: 367_925,
    renda_liquida_ano1:    207_350,
    renda_media_mes:        17_279,
    renda_liquida_m12:      31_777,
    projetos_ativos_m12:        15,
    payback_mes:                 5,
    breakeven_mes:               1,
  },
}

const brl = n => Math.round(n).toLocaleString('pt-BR')
const TOL = 0.15  // 15% — o motor é generativo, a planilha é desenhada à mão

let falhas = 0

for (const cenario of Object.values(DRE)) {
  const r = simular({
    meta_renda_liquida: 25_000,
    retirada_minima:     8_000,
    reserva_capital:    30_000,
    pct_comercial:      cenario.pct_comercial,
    dedicacao:          'integral',
    network_level:      cenario.network ?? 'medio',
  })

  console.log(`\n── ${cenario.label} · ${(cenario.pct_comercial * 100).toFixed(0)}% comercial · rede ${cenario.network}`)
  console.log('  indicador              planilha        motor      delta')

  // Valores em R$ toleram desvio percentual; meses toleram ±1 (a planilha usa
  // uma rampa desenhada à mão, o motor usa uma rampa generativa).
  const checa = (nome, esperado, obtido, modo = 'moeda') => {
    const delta = esperado === 0 ? 0 : (obtido - esperado) / esperado
    const ok = modo === 'mes'
      ? Math.abs(obtido - esperado) <= 1
      : Math.abs(delta) <= TOL
    if (!ok && !cenario.informativo) falhas++
    const f = modo === 'moeda' ? brl : (v => String(Math.round(v * 10) / 10))
    console.log(
      `  ${ok ? '✓' : '✗'} ${nome.padEnd(20)} ${f(esperado).padStart(10)} ${f(obtido).padStart(12)}` +
      `  ${(delta * 100 >= 0 ? '+' : '')}${(delta * 100).toFixed(1)}%`
    )
  }

  checa('Receita ano 1',    cenario.receita_recebida_ano1, r.kpis.receita_recebida_ano1)
  checa('Líquido ano 1',    cenario.renda_liquida_ano1,    r.kpis.renda_liquida_ano1)
  checa('Líquido médio/mês',cenario.renda_media_mes,       r.kpis.renda_media_mes)
  checa('Líquido no M12',   cenario.renda_liquida_m12,     r.kpis.renda_liquida_m12)
  checa('Ativos no M12',    cenario.projetos_ativos_m12,   r.kpis.projetos_ativos_m12, 'qtd')
  checa('Payback (mês)',    cenario.payback_mes,           r.kpis.payback_mes ?? 99,    'mes')
  checa('Breakeven (mês)',  cenario.breakeven_mes,         r.kpis.breakeven_mes ?? 99,  'mes')

  const mix = r.mix_m12
  console.log(`  mix M12: alocação ${(mix.alocacao * 100).toFixed(0)}% · ` +
              `self ${(mix.self_sourced * 100).toFixed(0)}% · ` +
              `originação ${(mix.originacao * 100).toFixed(0)}%`)
}

// ─── Efeito da rede sobre o mix das fontes ───────────────────────────────────
console.log('\n── Efeito da rede (35% comercial)')
for (const n of ['baixo', 'medio', 'alto']) {
  const r = simular({
    meta_renda_liquida: 25_000, retirada_minima: 8_000, reserva_capital: 30_000,
    pct_comercial: 0.35, dedicacao: 'integral', network_level: n,
  })
  console.log(
    `  rede ${n.padEnd(6)} → self ${(r.mix_m12.self_sourced * 100).toFixed(0).padStart(3)}% · ` +
    `matriz ${(r.mix_m12.alocacao * 100).toFixed(0).padStart(3)}% · ` +
    `renda M12 R$ ${brl(r.projecao[11].renda_liquida).padStart(6)} · ` +
    `líq ano 1 R$ ${brl(r.kpis.renda_liquida_ano1).padStart(7)}`
  )
}

// ─── Fonte 3 só deve aparecer com perfil muito comercial ─────────────────────
console.log('\n── Fonte 3 (transbordo de originação)')
for (const pct of [0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0]) {
  const r = simular({
    meta_renda_liquida: 25_000, retirada_minima: 8_000, reserva_capital: 30_000,
    pct_comercial: pct, dedicacao: 'integral', network_level: 'medio',
  })
  const m12 = r.projecao[11]
  console.log(
    `  ${(pct * 100).toString().padStart(3)}% comercial → ` +
    `cap ${(Math.round(m12.total_ativos * 10) / 10).toString().padStart(4)} ativos · ` +
    `Fonte 3 R$ ${brl(m12.receita_originacao).padStart(6)} ` +
    `(${(r.mix_m12.originacao * 100).toFixed(0).padStart(3)}%) · ` +
    `renda M12 R$ ${brl(m12.renda_liquida).padStart(6)} · ` +
    `líq ano 1 R$ ${brl(r.kpis.renda_liquida_ano1).padStart(7)}`
  )
}

console.log(falhas === 0 ? '\n✓ Todos os checks dentro da tolerância' : `\n✗ ${falhas} check(s) fora da tolerância`)
process.exit(falhas === 0 ? 0 : 1)
