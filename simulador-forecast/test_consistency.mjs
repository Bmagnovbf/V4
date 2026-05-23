import { execSync } from 'child_process'
import { existsSync } from 'fs'

// Compila usando tsconfig.test.json (resolve path aliases @/)
console.log('Compilando TypeScript...')
execSync(
  'npx tsc -p tsconfig.test.json',
  { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }
)

const { PARAMS }  = await import('./.test_out/config/params.js')
const { simular } = await import('./.test_out/lib/calculator.js')

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => 'R$' + Math.round(n).toLocaleString('pt-BR')
const pct = (n) => n.toFixed(1) + '%'
let erros = 0
let avisos = 0

function check(label, cond, msg) {
  if (!cond) { console.log(`  ❌ ERRO   [${label}] ${msg}`); erros++ }
}
function warn(label, cond, msg) {
  if (!cond) { console.log(`  ⚠  AVISO  [${label}] ${msg}`); avisos++ }
}

// ── SUITE 1: H4+ bloqueia corretamente ─────────────────────────────────────
console.log('\n══ SUITE 1: H4+ bloqueio ══')
{
  const r = simular({ meta_fat_bruto: 500000, capital_disponivel: 1000000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  check('H4+-horizonte', r.horizonte === 'H4+', `meta 500k deveria retornar H4+, retornou ${r.horizonte}`)
  check('H4+-projecao-vazia', r.projecao.length === 0, 'projecao deveria ser vazia')
}

// ── SUITE 2: Horizontes corretos ─────────────────────────────────────────
console.log('\n══ SUITE 2: Horizontes corretos ══')
{
  const casos = [[50000,'H1'],[60000,'H1'],[60001,'H2'],[150000,'H2'],[150001,'H3'],[450000,'H3'],[450001,'H4+']]
  for (const [meta, esperado] of casos) {
    const r = simular({ meta_fat_bruto: meta, capital_disponivel: 500000, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' })
    check(`horizonte-${meta}`, r.horizonte === esperado, `meta=${fmt(meta)} esperado ${esperado}, obtido ${r.horizonte}`)
  }
  console.log('  Casos testados: 50k→H1, 60k→H1, 60001→H2, 150k→H2, 150001→H3, 450k→H3, 450001→H4+')
}

// ── SUITE 3: Integridade numerica (sem NaN/Infinity) ─────────────────────
console.log('\n══ SUITE 3: Integridade numérica (sem NaN/Infinity) ══')
{
  let contNaN = 0
  let contCasos = 0
  for (const meta of [50000, 100000, 200000, 400000]) {
    for (const cap of [80000, 200000, 500000]) {
      for (const net of ['baixo', 'medio', 'alto']) {
        for (const tier of ['tiny', 'small', 'medium']) {
          for (const exp of ['teorico', 'solida']) {
            contCasos++
            const r = simular({ meta_fat_bruto: meta, capital_disponivel: cap, network_level: net, network_tier: tier, experiencia: exp })
            if (r.projecao.length === 0) continue
            for (const p of r.projecao) {
              for (const [k, v] of Object.entries(p)) {
                if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) {
                  contNaN++
                  if (contNaN <= 5) check(`NaN-${meta}-${net}-${tier}-${exp}`, false, `campo ${k} em M${p.mes} = ${v}`)
                }
              }
            }
          }
        }
      }
    }
  }
  if (contNaN === 0) console.log(`  ✓ Zero NaN/Infinity em ${contCasos} combinacoes de inputs`)
  else console.log(`  ❌ ${contNaN} valores inválidos encontrados`)
}

// ── SUITE 4: Consistência do P&L ─────────────────────────────────────────
console.log('\n══ SUITE 4: Consistência do P&L (H3, meta 200k, cap 350k) ══')
{
  const r = simular({ meta_fat_bruto: 200000, capital_disponivel: 350000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  const proj = r.projecao

  for (const p of proj) {
    // fat_bruto = aquisicao + retencao
    const fat_calc = p.receita_aquisicao + p.receita_executar
    check(`fat_bruto-M${p.mes}`, Math.abs(p.fat_bruto - fat_calc) < 1,
      `fat_bruto(${fmt(p.fat_bruto)}) != aquisicao+executar(${fmt(fat_calc)})`)

    // EBITDA = fat_liq - csp - comercial - ga - broker - bdr
    const ebitda_calc = p.receita_liquida - p.custo_csp - p.custo_comercial - p.custo_ga - p.custo_broker - p.custo_bdr
    check(`ebitda-M${p.mes}`, Math.abs(p.ebitda - ebitda_calc) < 1,
      `ebitda(${fmt(p.ebitda)}) != calc(${fmt(ebitda_calc)})`)

    // Broker nunca abaixo do piso
    check(`broker-floor-M${p.mes}`, p.custo_broker >= 14999,
      `broker abaixo do piso R$15k: ${fmt(p.custo_broker)}`)

    // BDR nunca negativo
    check(`bdr-positivo-M${p.mes}`, p.bdr_count >= 0 && p.custo_bdr >= 0, `BDR negativo M${p.mes}`)
  }

  // EBITDA acumulado cumulativo
  let acc = 0
  for (const p of proj) {
    acc += p.ebitda
    check(`ebitda_acc-M${p.mes}`, Math.abs(p.ebitda_acumulado - acc) < 1,
      `ebitda_acumulado(${fmt(p.ebitda_acumulado)}) != soma(${fmt(acc)})`)
  }

  // Ter Pontual zero em M1-M2, positivo em M3+
  check('ter-zero-M1', proj[0].receita_ter_expansao === 0, `Ter em M1: ${fmt(proj[0].receita_ter_expansao)}`)
  check('ter-zero-M2', proj[1].receita_ter_expansao === 0, `Ter em M2: ${fmt(proj[1].receita_ter_expansao)}`)
  check('ter-positivo-M3', proj[2].receita_ter_expansao > 0, 'Ter zero em M3')

  // Executar retencao zero em M1 (sem cohorts anteriores), positivo em M2+
  check('exec-retencao-zero-M1', proj[0].receita_executar === 0, `Exec retencao em M1: ${fmt(proj[0].receita_executar)}`)
  check('exec-retencao-positivo-M2', proj[1].receita_executar > 0, 'Exec retencao zero em M2')

  // Q4 deve ser flat (ramp=1.0 para M10,11,12)
  const diffQ4 = Math.abs(proj[9].novos_saber - proj[11].novos_saber) / proj[11].novos_saber
  check('q4-flat', diffQ4 < 0.005, `Saber M10 vs M12 nao e flat: ${proj[9].novos_saber.toFixed(2)} vs ${proj[11].novos_saber.toFixed(2)}`)

  console.log('  P&L M1..M24 verificado: fat_bruto, ebitda, acumulado, ter, exec, q4-flat')
}

// ── SUITE 5: Sensibilidade a cada input ──────────────────────────────────
console.log('\n══ SUITE 5: Sensibilidade — cada input deve afetar o output ══')
{
  const BASE = { meta_fat_bruto: 200000, capital_disponivel: 350000, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' }
  const r0 = simular(BASE)

  // meta_fat_bruto maior → fat_bruto M12 maior
  {
    const r1 = simular({ ...BASE, meta_fat_bruto: 300000 })
    check('sens-meta-fat_bruto', r1.projecao[11].fat_bruto > r0.projecao[11].fat_bruto,
      `meta maior nao aumentou fat_bruto M12`)
  }

  // capital maior → broker nao restrito em Fase 1 → broker M1 maior ou igual
  {
    const r1 = simular({ ...BASE, capital_disponivel: 100000 })
    const r2 = simular({ ...BASE, capital_disponivel: 600000 })
    check('sens-capital-broker', r2.projecao[0].custo_broker >= r1.projecao[0].custo_broker,
      `mais capital nao mantem/aumenta broker M1: ${fmt(r1.projecao[0].custo_broker)} vs ${fmt(r2.projecao[0].custo_broker)}`)
    check('sens-capital-ratio', r2.termometro.capital_ratio >= r1.termometro.capital_ratio,
      `mais capital nao melhora capital_ratio`)
  }

  // network_level alto → mais organicos → mais receita M1 vs baixo
  {
    const r_baixo = simular({ ...BASE, network_level: 'baixo' })
    const r_alto  = simular({ ...BASE, network_level: 'alto'  })
    check('sens-network-receita', r_alto.projecao[0].fat_bruto > r_baixo.projecao[0].fat_bruto,
      `rede alta nao da mais receita M1: baixo=${fmt(r_baixo.projecao[0].fat_bruto)} alto=${fmt(r_alto.projecao[0].fat_bruto)}`)
  }

  // network_tier medium vs tiny: blended ticket diferente, CPMQL diferente
  {
    const r_tiny   = simular({ ...BASE, network_tier: 'tiny'   })
    const r_medium = simular({ ...BASE, network_tier: 'medium' })
    check('sens-tier-ticket', r_medium.blended.ticket_saber !== r_tiny.blended.ticket_saber,
      'tier nao afeta blended ticket')
    check('sens-tier-cpmql', r_medium.blended.cpmql > r_tiny.blended.cpmql,
      'medium nao tem CPMQL maior que tiny')
  }

  // experiencia solida → mais upsell path B → mais novos_executar em M3
  {
    const r_teo = simular({ ...BASE, experiencia: 'teorico' })
    const r_sol = simular({ ...BASE, experiencia: 'solida'  })
    check('sens-exp-executar', r_sol.projecao[2].novos_executar >= r_teo.projecao[2].novos_executar,
      `solida nao aumentou executar M3: teo=${r_teo.projecao[2].novos_executar.toFixed(2)} sol=${r_sol.projecao[2].novos_executar.toFixed(2)}`)
  }

  console.log('  meta, capital, network_level, network_tier, experiencia: todos afetam outputs distintos')
}

// ── SUITE 6: KPIs de viabilidade ─────────────────────────────────────────
console.log('\n══ SUITE 6: KPIs — valores dentro de ranges válidos ══')
{
  const r = simular({ meta_fat_bruto: 200000, capital_disponivel: 350000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  check('kpi-breakeven-range', !r.kpis.breakeven_mes || (r.kpis.breakeven_mes >= 1 && r.kpis.breakeven_mes <= 24),
    `breakeven_mes fora do range: ${r.kpis.breakeven_mes}`)
  check('kpi-capital-minimo', r.kpis.capital_minimo >= PARAMS.capex.franquia,
    `capital_minimo menor que franquia: ${fmt(r.kpis.capital_minimo)}`)
  check('kpi-capital-total', r.kpis.capital_total_investido >= r.kpis.capital_minimo, 'capital_total < capital_minimo')
  check('kpi-margem-bruta', r.kpis.margem_bruta_m12 > 0 && r.kpis.margem_bruta_m12 < 100,
    `margem_bruta fora do range: ${pct(r.kpis.margem_bruta_m12)}`)
  check('kpi-ebitda-menor-bruta', r.kpis.margem_ebitda_m12 < r.kpis.margem_bruta_m12,
    `EBITDA(${pct(r.kpis.margem_ebitda_m12)}) >= Bruta(${pct(r.kpis.margem_bruta_m12)})`)
  check('kpi-roas', r.kpis.roas > 0, 'ROAS zero ou negativo')
  check('kpi-broker-acc', r.kpis.broker_acumulado_m12 > 0, 'broker_acumulado_m12 zero')

  // capital_ratio conferido contra termometro
  const ratio_calc = r.kpis.capital_minimo > 0 ? r.kpis.capital_disponivel_efetivo / r.kpis.capital_minimo : 0
  check('kpi-capital-ratio-coerente', Math.abs(r.termometro.capital_ratio - ratio_calc) < 0.01,
    `capital_ratio(${r.termometro.capital_ratio.toFixed(2)}) != calc(${ratio_calc.toFixed(2)})`)

  console.log(`  breakeven=M${r.kpis.breakeven_mes} payback=M${r.kpis.payback_mes} ROIC=${pct(r.kpis.roic)}`)
  console.log(`  margem_bruta=${pct(r.kpis.margem_bruta_m12)} EBITDA=${pct(r.kpis.margem_ebitda_m12)} ROAS=${r.kpis.roas.toFixed(1)}x`)
}

// ── SUITE 7: Aderência 75/25 em M12 ──────────────────────────────────────
console.log('\n══ SUITE 7: Aderência à regra 75/25 em M12 ══')
{
  for (const [meta, cap] of [[60000,200000],[150000,300000],[300000,500000]]) {
    const r = simular({ meta_fat_bruto: meta, capital_disponivel: cap, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' })
    if (r.projecao.length === 0) continue
    const p12 = r.projecao[11]
    const pct_acq = p12.fat_bruto > 0 ? p12.receita_aquisicao / p12.fat_bruto * 100 : 0
    const pct_ret = p12.fat_bruto > 0 ? p12.receita_executar  / p12.fat_bruto * 100 : 0
    console.log(`  meta=${fmt(meta)}: aquisicao=${pct(pct_acq)} retencao=${pct(pct_ret)} (meta 75/25)`)
    warn(`75/25-${meta}`, Math.abs(pct_acq - 75) < 35,
      `M12 aquisicao=${pct(pct_acq)} muito longe de 75%`)
  }
}

// ── SUITE 8: Fase 1 vs Fase 2 do broker ──────────────────────────────────
console.log('\n══ SUITE 8: Fase 1/2 do broker ══')
{
  const r_apertado = simular({ meta_fat_bruto: 200000, capital_disponivel: 120000, network_level: 'baixo', network_tier: 'tiny', experiencia: 'teorico' })
  const r_folgado  = simular({ meta_fat_bruto: 200000, capital_disponivel: 600000, network_level: 'baixo', network_tier: 'tiny', experiencia: 'teorico' })

  check('fase1-broker-limitado', r_apertado.projecao[0].custo_broker <= r_folgado.projecao[0].custo_broker,
    'capital apertado tem broker MAIOR que folgado em M1')

  // BDRs so aparecem quando broker < ideal
  for (const p of r_apertado.projecao.slice(0, 12)) {
    if (p.bdr_count > 0) {
      const ideal = Math.max(15000, p.receita_liquida * 0.16)
      check(`bdr-broker-menor-M${p.mes}`, p.custo_broker < ideal + 10,
        `BDR ativo mas broker nao esta abaixo do ideal: broker=${fmt(p.custo_broker)} ideal=${fmt(ideal)}`)
    }
  }

  // Pos break-even: broker deve ser max(15k, fat_liq*16%)
  const bev = r_apertado.kpis.breakeven_mes
  if (bev && bev < 23) {
    const p_bev = r_apertado.projecao[bev] // mes seguinte ao break-even
    if (p_bev) {
      const ideal = Math.max(15000, p_bev.receita_liquida * 0.16)
      check(`fase2-broker-ideal-M${p_bev.mes}`, Math.abs(p_bev.custo_broker - ideal) < 100,
        `pos break-even broker(${fmt(p_bev.custo_broker)}) != ideal(${fmt(ideal)})`)
    }
  }
  console.log(`  Capital apertado: break-even=M${r_apertado.kpis.breakeven_mes} BDRs M12=${r_apertado.projecao[11].bdr_count}`)
  console.log(`  Capital folgado:  break-even=M${r_folgado.kpis.breakeven_mes}  BDRs M12=${r_folgado.projecao[11].bdr_count}`)
}

// ── SUITE 9: Churn cohort e trava R$40k ──────────────────────────────────
console.log('\n══ SUITE 9: Churn Executar e trava R$40k ══')
{
  const r = simular({ meta_fat_bruto: 200000, capital_disponivel: 500000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  const proj = r.projecao

  // base_executar nao deve regredir antes de M7 (lock-in 6 meses, sem churn abaixo de R$40k)
  for (let i = 1; i < Math.min(6, proj.length); i++) {
    warn(`base-exec-cresce-M${i+1}`, proj[i].base_executar >= proj[i-1].base_executar,
      `base_executar regrediu M${i}(${proj[i-1].base_executar.toFixed(2)}) para M${i+1}(${proj[i].base_executar.toFixed(2)})`)
  }

  // Mostra quando a trava de churn e atingida
  for (let i = 0; i < 12; i++) {
    if (proj[i].receita_executar >= 40000) {
      console.log(`  Trava churn atingida em M${i+1}: receita_exec=${fmt(proj[i].receita_executar)}`)
      break
    }
  }

  // Churn a partir de M7: base deve ser MENOR com mais meses (primeiros cohorts perderam 10%)
  if (proj.length >= 13) {
    const ratio_m7_m13 = proj[12].base_executar / proj[6].base_executar
    console.log(`  base_executar M7=${proj[6].base_executar.toFixed(2)} M13=${proj[12].base_executar.toFixed(2)} (ratio=${ratio_m7_m13.toFixed(2)})`)
  }
}

// ── SUITE 10: Headcount por horizonte ────────────────────────────────────
console.log('\n══ SUITE 10: Headcount por horizonte ══')
{
  const casos = [[50000,'H1',4,2,1,7],[100000,'H2',10,3,3,16],[200000,'H3',25,6,5,36]]
  for (const [meta, h, csp, com, ga, total] of casos) {
    const r = simular({ meta_fat_bruto: meta, capital_disponivel: 500000, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' })
    check(`hc-${h}-csp`, r.headcount.csp === csp, `${h} CSP: esperado ${csp} obtido ${r.headcount.csp}`)
    check(`hc-${h}-com`, r.headcount.comercial === com, `${h} Comercial: esperado ${com} obtido ${r.headcount.comercial}`)
    check(`hc-${h}-ga`,  r.headcount.ga === ga, `${h} GA: esperado ${ga} obtido ${r.headcount.ga}`)
    check(`hc-${h}-tot`, r.headcount.total === total, `${h} Total: esperado ${total} obtido ${r.headcount.total}`)
  }
  console.log('  H1(4/2/1=7) H2(10/3/3=16) H3(25/6/5=36) validados')
}

// ── RESULTADO FINAL ───────────────────────────────────────────────────────
console.log('\n' + '='.repeat(55))
console.log(`  RESULTADO: ${erros} ERRO(S) · ${avisos} AVISO(S)`)
console.log('='.repeat(55))

// Limpa temporarios
execSync('rmdir /s /q .test_out', { shell: 'cmd.exe', stdio: 'ignore' })
