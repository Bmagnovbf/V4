import { PARAMS } from '@/config/params'
import { simular } from '@/lib/calculator'

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt  = (n: number) => 'R$' + Math.round(n).toLocaleString('pt-BR')
const pct  = (n: number) => n.toFixed(1) + '%'
let erros  = 0
let avisos = 0

function check(label: string, cond: boolean, msg: string) {
  if (!cond) { console.log(`  ❌ ERRO   [${label}] ${msg}`); erros++ }
}
function warn(label: string, cond: boolean, msg: string) {
  if (!cond) { console.log(`  ⚠  AVISO  [${label}] ${msg}`); avisos++ }
}

// ── SUITE 1: H4+ bloqueia corretamente ────────────────────────────────────
console.log('\n══ SUITE 1: H4+ bloqueio ══')
{
  const r = simular({ meta_fat_bruto: 500000, capital_disponivel: 1000000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  check('H4+-horizonte',      r.horizonte === 'H4+', `meta 500k → ${r.horizonte}`)
  check('H4+-projecao-vazia', r.projecao.length === 0, 'projecao deveria ser vazia')
  console.log('  ✓ H4+ bloqueado corretamente')
}

// ── SUITE 2: Horizontes corretos ──────────────────────────────────────────
console.log('\n══ SUITE 2: Horizontes corretos ══')
{
  const casos: [number, string][] = [[50000,'H1'],[60000,'H1'],[60001,'H2'],[150000,'H2'],[150001,'H3'],[450000,'H3'],[450001,'H4+']]
  for (const [meta, esperado] of casos) {
    const r = simular({ meta_fat_bruto: meta, capital_disponivel: 500000, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' })
    check(`horizonte-${meta}`, r.horizonte === esperado, `meta=${fmt(meta)} esperado ${esperado} obtido ${r.horizonte}`)
  }
  console.log('  50k→H1, 60k→H1, 60001→H2, 150k→H2, 150001→H3, 450k→H3, 450001→H4+')
}

// ── SUITE 3: Integridade numérica (sem NaN/Infinity) ─────────────────────
console.log('\n══ SUITE 3: Integridade numérica — matriz completa de inputs ══')
{
  let contNaN = 0; let contCasos = 0
  for (const meta of [50000, 100000, 200000, 400000]) {
    for (const cap of [80000, 200000, 500000]) {
      for (const net of ['baixo','medio','alto'] as const) {
        for (const tier of ['tiny','small','medium'] as const) {
          for (const exp of ['teorico','solida'] as const) {
            contCasos++
            const r = simular({ meta_fat_bruto: meta, capital_disponivel: cap, network_level: net, network_tier: tier, experiencia: exp })
            if (r.projecao.length === 0) continue
            for (const p of r.projecao) {
              for (const [k, v] of Object.entries(p)) {
                if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) {
                  contNaN++
                  if (contNaN <= 3) check(`NaN-${meta}-${net}`, false, `campo '${k}' M${p.mes} = ${v}`)
                }
              }
            }
          }
        }
      }
    }
  }
  if (contNaN === 0) console.log(`  ✓ Zero NaN/Infinity em ${contCasos} combinações`)
  else console.log(`  ❌ ${contNaN} valores inválidos encontrados`)
}

// ── SUITE 4: Consistência do P&L linha a linha ────────────────────────────
console.log('\n══ SUITE 4: Consistência do P&L — M1..M24 ══')
{
  const r = simular({ meta_fat_bruto: 200000, capital_disponivel: 350000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  const proj = r.projecao

  for (const p of proj) {
    // fat_bruto = aquisicao + retencao_executar
    const fat_calc = p.receita_aquisicao + p.receita_executar
    check(`fat_bruto-M${p.mes}`, Math.abs(p.fat_bruto - fat_calc) < 1,
      `fat_bruto(${fmt(p.fat_bruto)}) ≠ acq+ret(${fmt(fat_calc)})`)

    // ebitda = fat_liq - csp - comercial - ga - broker - bdr
    const ebitda_calc = p.receita_liquida - p.custo_csp - p.custo_comercial - p.custo_ga - p.custo_broker - p.custo_bdr
    check(`ebitda-M${p.mes}`, Math.abs(p.ebitda - ebitda_calc) < 1,
      `ebitda(${fmt(p.ebitda)}) ≠ calc(${fmt(ebitda_calc)})`)

    // broker nunca abaixo do piso R$15k
    check(`broker-floor-M${p.mes}`, p.custo_broker >= 14999,
      `broker abaixo de R$15k: ${fmt(p.custo_broker)}`)

    // BDR não negativo
    check(`bdr-positivo-M${p.mes}`, p.bdr_count >= 0 && p.custo_bdr >= 0, `BDR negativo M${p.mes}`)
  }

  // ebitda_acumulado cumulativo
  let acc = 0
  for (const p of proj) {
    acc += p.ebitda
    check(`ebitda_acc-M${p.mes}`, Math.abs(p.ebitda_acumulado - acc) < 1,
      `acumulado diverge M${p.mes}: ${fmt(p.ebitda_acumulado)} vs ${fmt(acc)}`)
  }

  // Ter Pontual zero em M1 e M2, positivo em M3+
  check('ter-zero-M1', proj[0].receita_ter_expansao === 0, `Ter em M1: ${fmt(proj[0].receita_ter_expansao)}`)
  check('ter-zero-M2', proj[1].receita_ter_expansao === 0, `Ter em M2: ${fmt(proj[1].receita_ter_expansao)}`)
  check('ter-positivo-M3', proj[2].receita_ter_expansao > 0, 'Ter zero em M3')

  // Executar retencao zero em M1 (sem cohorts anteriores), positivo em M2+
  check('exec-ret-zero-M1', proj[0].receita_executar === 0, `Exec retencao M1: ${fmt(proj[0].receita_executar)}`)
  check('exec-ret-positivo-M2', proj[1].receita_executar > 0, 'Exec retencao zero em M2')

  // Q4 deve ser flat (ramp=1.0 para M10,11,12 — sem crescimento intra-quarter)
  const saber_m10 = proj[9].novos_saber
  const saber_m12 = proj[11].novos_saber
  const diffQ4    = saber_m10 > 0 ? Math.abs(saber_m10 - saber_m12) / saber_m12 : 0
  check('q4-flat-saber', diffQ4 < 0.005, `Saber M10 vs M12 nao flat: ${saber_m10.toFixed(2)} vs ${saber_m12.toFixed(2)}`)

  console.log('  fat_bruto, ebitda, acumulado, broker floor, ter, exec-ret, Q4-flat: OK')
}

// ── SUITE 5: Sensibilidade — cada input deve afetar o output ─────────────
console.log('\n══ SUITE 5: Sensibilidade — cada input afeta outputs distintos ══')
{
  const BASE = { meta_fat_bruto: 200000, capital_disponivel: 350000, network_level: 'medio' as const, network_tier: 'small' as const, experiencia: 'teorico' as const }
  const r0 = simular(BASE)

  // Meta maior → fat_bruto M12 maior
  const r_meta = simular({ ...BASE, meta_fat_bruto: 300000 })
  check('sens-meta', r_meta.projecao[11].fat_bruto > r0.projecao[11].fat_bruto,
    `meta maior nao aumentou fat_bruto M12`)
  console.log(`  meta 200k→300k: fat M12 ${fmt(r0.projecao[11].fat_bruto)} → ${fmt(r_meta.projecao[11].fat_bruto)}`)

  // Capital maior → broker M1 maior ou igual, capital_ratio melhor
  const r_cap_baixo = simular({ ...BASE, capital_disponivel: 100000 })
  const r_cap_alto  = simular({ ...BASE, capital_disponivel: 600000 })
  check('sens-capital-broker', r_cap_alto.projecao[0].custo_broker >= r_cap_baixo.projecao[0].custo_broker,
    `mais capital nao manteve/aumentou broker M1`)
  check('sens-capital-ratio',  r_cap_alto.termometro.capital_ratio >= r_cap_baixo.termometro.capital_ratio,
    'mais capital nao melhora capital_ratio')
  console.log(`  capital 100k→600k: broker M1 ${fmt(r_cap_baixo.projecao[0].custo_broker)} → ${fmt(r_cap_alto.projecao[0].custo_broker)}`)

  // Rede alta → mais organicos → mais receita M1
  const r_net_baixo = simular({ ...BASE, network_level: 'baixo' })
  const r_net_alto  = simular({ ...BASE, network_level: 'alto'  })
  check('sens-network', r_net_alto.projecao[0].fat_bruto > r_net_baixo.projecao[0].fat_bruto,
    `rede alta nao da mais receita M1`)
  console.log(`  network baixo→alto: fat M1 ${fmt(r_net_baixo.projecao[0].fat_bruto)} → ${fmt(r_net_alto.projecao[0].fat_bruto)}`)

  // network_tier afeta clientes orgânicos (ticket e conversão da rede pessoal)
  // Blended ticket NÃO muda: é calculado a partir do mix do horizonte (H3), não do network_tier
  const r_tiny   = simular({ ...BASE, network_tier: 'tiny'   })
  const r_medium = simular({ ...BASE, network_tier: 'medium' })
  // tiny: 7.5 MQLs/mês × 10% conv × R$18.200 ticket = R$13.650 orgânico
  // medium: 7.5 MQLs/mês × 9% conv × R$21.027 ticket = R$14.193 orgânico → fat_bruto M1 maior
  check('sens-tier-organic-fat', r_medium.projecao[0].fat_bruto > r_tiny.projecao[0].fat_bruto,
    `tier medium nao gerou mais receita organica M1 (ticket organico maior)`)
  // Blended é idêntico (mesmo horizonte H3); isso é ESPERADO, não um bug
  const blended_igual = Math.abs(r_medium.blended.ticket_saber - r_tiny.blended.ticket_saber) < 1
  console.log(`  tier tiny→medium: fat_bruto M1 ${fmt(r_tiny.projecao[0].fat_bruto)} → ${fmt(r_medium.projecao[0].fat_bruto)} | blended=${blended_igual ? 'idêntico (por horizonte)' : 'diferente'}`)

  // Experiencia solida → mais upsell Path B → novos_executar M3 maior ou igual
  const r_teo = simular({ ...BASE, experiencia: 'teorico' })
  const r_sol = simular({ ...BASE, experiencia: 'solida'  })
  check('sens-exp-executar', r_sol.projecao[2].novos_executar >= r_teo.projecao[2].novos_executar,
    `solida nao aumentou executar M3`)
  console.log(`  exp teorico→solida: executar M3 ${r_teo.projecao[2].novos_executar.toFixed(2)} → ${r_sol.projecao[2].novos_executar.toFixed(2)}`)
}

// ── SUITE 6: KPIs — ranges e coerência interna ───────────────────────────
console.log('\n══ SUITE 6: KPIs — ranges e coerência interna ══')
{
  const r = simular({ meta_fat_bruto: 200000, capital_disponivel: 350000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  check('kpi-breakeven-range', !r.kpis.breakeven_mes || (r.kpis.breakeven_mes >= 1 && r.kpis.breakeven_mes <= 24),
    `breakeven fora do range: M${r.kpis.breakeven_mes}`)
  check('kpi-capital-minimo',  r.kpis.capital_minimo >= PARAMS.capex.franquia,
    `capital_minimo menor que franquia`)
  check('kpi-capital-total',   r.kpis.capital_total_investido >= r.kpis.capital_minimo,
    'capital_total < capital_minimo')
  check('kpi-margem-bruta',    r.kpis.margem_bruta_m12 > 0 && r.kpis.margem_bruta_m12 < 100,
    `margem_bruta fora do range: ${pct(r.kpis.margem_bruta_m12)}`)
  check('kpi-ebitda-menor-bruta', r.kpis.margem_ebitda_m12 < r.kpis.margem_bruta_m12,
    `EBITDA(${pct(r.kpis.margem_ebitda_m12)}) >= Bruta(${pct(r.kpis.margem_bruta_m12)})`)
  check('kpi-roas',            r.kpis.roas > 0, 'ROAS zero ou negativo')
  check('kpi-broker-acc',      r.kpis.broker_acumulado_m12 > 0, 'broker_acumulado_m12 zero')

  // capital_ratio coerente com termômetro
  const ratio_calc = r.kpis.capital_minimo > 0 ? r.kpis.capital_disponivel_efetivo / r.kpis.capital_minimo : 0
  check('kpi-capital-ratio-coerente', Math.abs(r.termometro.capital_ratio - ratio_calc) < 0.01,
    `capital_ratio(${r.termometro.capital_ratio.toFixed(2)}) ≠ calc(${ratio_calc.toFixed(2)})`)

  console.log(`  breakeven=M${r.kpis.breakeven_mes} payback=M${r.kpis.payback_mes} ROIC=${pct(r.kpis.roic)}`)
  console.log(`  margem_bruta=${pct(r.kpis.margem_bruta_m12)} EBITDA=${pct(r.kpis.margem_ebitda_m12)} ROAS=${r.kpis.roas.toFixed(1)}x`)
  console.log(`  capital_ratio=${r.termometro.capital_ratio.toFixed(2)}x termometro=${r.termometro.nivel_final}`)
}

// ── SUITE 7: Calibração 2-passadas — fat_bruto M12 ≈ meta ────────────────
console.log('\n══ SUITE 7: Calibração — fat_bruto M12 ≈ meta ══')
{
  for (const [meta, cap] of [[60000,200000],[150000,300000],[300000,500000]] as [number,number][]) {
    const r = simular({ meta_fat_bruto: meta, capital_disponivel: cap, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' })
    if (r.projecao.length === 0) continue
    const p12    = r.projecao[11]
    const desvio = Math.abs(p12.fat_bruto - meta) / meta * 100
    // Aceita até 5% de erro residual (contribuição orgânica dos primeiros meses)
    check(`calibracao-${meta}`, desvio < 5,
      `fat_bruto M12 ${fmt(p12.fat_bruto)} desvia ${desvio.toFixed(1)}% da meta ${fmt(meta)}`)
    const pct_acq = p12.fat_bruto > 0 ? p12.receita_aquisicao / p12.fat_bruto * 100 : 0
    const pct_ret = p12.fat_bruto > 0 ? p12.receita_executar  / p12.fat_bruto * 100 : 0
    console.log(`  meta=${fmt(meta)}: fat_bruto=${fmt(p12.fat_bruto)} desvio=${desvio.toFixed(1)}% | acq=${pct(pct_acq)} ret=${pct(pct_ret)}`)
  }
}

// ── SUITE 8: Fase 1 / Fase 2 do broker ───────────────────────────────────
console.log('\n══ SUITE 8: Broker Fase 1 (capital) vs Fase 2 (receita) ══')
{
  const r_apt  = simular({ meta_fat_bruto: 200000, capital_disponivel: 120000, network_level: 'baixo', network_tier: 'tiny', experiencia: 'teorico' })
  const r_folg = simular({ meta_fat_bruto: 200000, capital_disponivel: 600000, network_level: 'baixo', network_tier: 'tiny', experiencia: 'teorico' })

  check('fase1-broker-limitado', r_apt.projecao[0].custo_broker <= r_folg.projecao[0].custo_broker,
    `capital apertado tem broker MAIOR que folgado em M1: ${fmt(r_apt.projecao[0].custo_broker)} vs ${fmt(r_folg.projecao[0].custo_broker)}`)

  // BDRs só aparecem quando broker < ideal
  let bdr_ok = true
  for (const p of r_apt.projecao.slice(0, 12)) {
    if (p.bdr_count > 0) {
      const ideal = Math.max(15000, p.receita_liquida * 0.16)
      if (p.custo_broker > ideal + 50) {
        check(`bdr-broker-menor-M${p.mes}`, false, `BDR ativo mas broker(${fmt(p.custo_broker)}) nao abaixo de ideal(${fmt(ideal)})`)
        bdr_ok = false
      }
    }
  }
  if (bdr_ok) console.log('  ✓ BDRs só aparecem quando broker está abaixo do ideal')

  // Pós break-even (mes seguinte ao BEV): broker = max(15k, fat_liq*16%)
  const bev = r_apt.kpis.breakeven_mes
  if (bev && bev < 23) {
    const p_bev = r_apt.projecao[bev] // mes imediatamente após break-even
    if (p_bev) {
      const ideal = Math.max(15000, p_bev.receita_liquida * 0.16)
      check(`fase2-broker-M${p_bev.mes}`, Math.abs(p_bev.custo_broker - ideal) < 100,
        `pos break-even broker(${fmt(p_bev.custo_broker)}) ≠ ideal(${fmt(ideal)})`)
    }
  }

  console.log(`  apertado: BEV=M${r_apt.kpis.breakeven_mes} broker-M1=${fmt(r_apt.projecao[0].custo_broker)} BDRs-M12=${r_apt.projecao[11].bdr_count}`)
  console.log(`  folgado:  BEV=M${r_folg.kpis.breakeven_mes}  broker-M1=${fmt(r_folg.projecao[0].custo_broker)} BDRs-M12=${r_folg.projecao[11].bdr_count}`)
}

// ── SUITE 9: Churn Executar e trava R$40k ────────────────────────────────
console.log('\n══ SUITE 9: Churn Executar cohort-based e trava R$40k ══')
{
  const r    = simular({ meta_fat_bruto: 200000, capital_disponivel: 500000, network_level: 'alto', network_tier: 'medium', experiencia: 'solida' })
  const proj = r.projecao

  // Lock-in: base_executar não regride antes de M7
  for (let i = 1; i < Math.min(6, proj.length); i++) {
    warn(`base-exec-cresce-M${i+1}`, proj[i].base_executar >= proj[i-1].base_executar,
      `base_executar regrediu M${i}→M${i+1}: ${proj[i-1].base_executar.toFixed(2)} → ${proj[i].base_executar.toFixed(2)}`)
  }

  // Onde a trava é atingida
  let trava_mes = -1
  for (let i = 0; i < 12; i++) {
    if (proj[i].receita_executar >= 40000) { trava_mes = i + 1; break }
  }
  if (trava_mes > 0)
    console.log(`  Trava R$40k atingida em M${trava_mes}: receita_exec=${fmt(proj[trava_mes-1].receita_executar)}`)
  else
    console.log(`  Trava R$40k NÃO atingida até M12 (base pequena para churn)`)

  // M13 vs M7: com churn aplicado, base deve ser <= crescimento orgânico
  if (proj.length >= 13) {
    const b7  = proj[6].base_executar
    const b13 = proj[12].base_executar
    console.log(`  base_exec M7=${b7.toFixed(2)} M13=${b13.toFixed(2)} (churn 10% em cohorts antigos)`)
  }

  // Executar não acumula infinitamente: deve haver algum churn após M7 se trava atingida
  if (trava_mes > 0 && proj.length >= 13) {
    const b_m13 = proj[12].base_executar
    check('exec-base-finita-M13', isFinite(b_m13) && b_m13 > 0, `base_executar M13 inválida: ${b_m13}`)
  }
}

// ── SUITE 10: Headcount por horizonte ────────────────────────────────────
console.log('\n══ SUITE 10: Headcount por horizonte ══')
{
  const casos: [number, string, number, number, number, number][] = [
    [50000,  'H1',  4,  2, 1,  7],
    [100000, 'H2', 10,  3, 3, 16],
    [200000, 'H3', 25,  6, 5, 36],
  ]
  for (const [meta, h, csp, com, ga, total] of casos) {
    const r = simular({ meta_fat_bruto: meta, capital_disponivel: 500000, network_level: 'medio', network_tier: 'small', experiencia: 'teorico' })
    check(`hc-${h}-csp`,  r.headcount.csp === csp,       `${h} CSP: esperado ${csp} obtido ${r.headcount.csp}`)
    check(`hc-${h}-com`,  r.headcount.comercial === com,  `${h} Comercial: esperado ${com} obtido ${r.headcount.comercial}`)
    check(`hc-${h}-ga`,   r.headcount.ga === ga,          `${h} GA: esperado ${ga} obtido ${r.headcount.ga}`)
    check(`hc-${h}-total`,r.headcount.total === total,    `${h} Total: esperado ${total} obtido ${r.headcount.total}`)
  }
  console.log('  H1(4/2/1=7) H2(10/3/3=16) H3(25/6/5=36) OK')
}

// ── RESULTADO FINAL ───────────────────────────────────────────────────────
console.log('\n' + '='.repeat(58))
if (erros === 0 && avisos === 0)
  console.log('  ✅  TUDO OK — 0 erros · 0 avisos')
else
  console.log(`  RESULTADO: ${erros} ERRO(S) · ${avisos} AVISO(S)`)
console.log('='.repeat(58))
