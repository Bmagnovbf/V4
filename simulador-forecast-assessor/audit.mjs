// Auditoria do espaço de inputs. Roda com: npx tsc -p tsconfig.test.json && node audit.mjs
import Module from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const raiz = path.dirname(fileURLToPath(import.meta.url))
const orig = Module._resolveFilename
Module._resolveFilename = function (r, ...rest) {
  if (r.startsWith('@/')) r = path.join(raiz, '.test_out', r.slice(2))
  return orig.call(this, r, ...rest)
}
const req = Module.createRequire(import.meta.url)
const { simular } = req('./.test_out/lib/calculator.js')
const { PARAMS } = req('./.test_out/config/params.js')
const brl = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
const ordem = { verde:0, amarelo:1, vermelho:2 }
let falhas = 0
const ok = (cond, nome, det='') => {
  console.log(`  ${cond ? '✓' : '✗'} ${nome}${det ? ' — ' + det : ''}`)
  if (!cond) falhas++
}

const NET = ['baixo','medio','alto']
const PCT = Array.from({length:21}, (_,i)=>i*0.05)

console.log('── Estrutura e identidades contábeis ──')
let naoFinito = 0, fracionario = 0, identidade = 0, capEstouro = 0
let maiorCarteira = 0
for (const net of NET) for (const pc of PCT)
for (const meta of [5000,20000,40000]) for (const ret of [2000,8000,15000]) for (const res of [0,25000,150000]) {
  const r = simular({ meta_faturamento: meta, retirada_minima: ret, reserva_capital: res,
    pct_comercial: pc, network_level: net })
  for (const v of Object.values(r.kpis)) if (typeof v === 'number' && !Number.isFinite(v)) naoFinito++
  for (const l of r.projecao) {
    for (const c of ['saber_novos_matriz','saber_novos_self','executar_novos_matriz','executar_novos_self',
                     'saber_originados','executar_originados','executar_ativos_matriz','executar_ativos_self','total_ativos'])
      if (!Number.isInteger(l[c]) || l[c] < 0) fracionario++
    const somaF = l.receita_saber_matriz + l.receita_saber_self + l.receita_executar_matriz
                + l.receita_executar_self + l.receita_originacao
    if (Math.abs(somaF - l.receita_recebida) > 0.5) identidade++
    if (Math.abs((l.csp_proprio + l.csp_terceirizado) - l.csp_total) > 0.5) identidade++
    if (Math.abs((l.overhead + l.csp_terceirizado) - l.freelas_total) > 0.5) identidade++
    if (Math.abs((l.renda_liquida + l.csp_proprio) - l.remuneracao_total) > 0.5) identidade++
    if (l.total_ativos > maiorCarteira) maiorCarteira = l.total_ativos
    if (l.total_ativos > Math.floor(PARAMS.carteira.cap_ativos * PARAMS.carteira.tolerancia_self)) capEstouro++
  }
}
ok(naoFinito === 0, 'todos os KPIs são números finitos')
ok(fracionario === 0, 'nenhum contrato fracionário ou negativo')
ok(identidade === 0, 'identidades contábeis fecham')
ok(capEstouro === 0, 'carteira nunca passa do teto próprio', `maior observada: ${maiorCarteira}`)

console.log('\n── Coerência narrativa ──')
const run = o => simular({ meta_faturamento: 20000, retirada_minima: 8000, reserva_capital: 25000,
  pct_comercial: 0.35, network_level: 'medio', ...o })

let q = 0
for (const pc of PCT) {
  const v = NET.map(n => run({ network_level: n, pct_comercial: pc }).kpis.remuneracao_total_ano)
  if (v[1] < v[0] || v[2] < v[1]) q++
}
ok(q === 0, 'rede maior nunca rende menos')

q = 0
for (const net of NET) for (const ret of [2000,8000,15000]) {
  let ant = null
  for (const res of [0,25000,50000,100000,150000]) {
    const t = run({ network_level: net, retirada_minima: ret, reserva_capital: res }).termometro
    if (ant !== null && ordem[t.reserva_nivel] > ordem[ant]) q++
    ant = t.reserva_nivel
  }
}
ok(q === 0, 'mais reserva nunca piora o termômetro')

q = 0
for (const net of NET) {
  let ant = -1
  for (const ret of [2000,5000,8000,12000,15000]) {
    const k = run({ network_level: net, retirada_minima: ret }).kpis
    if (k.deficit_retirada_total < ant) q++
    ant = k.deficit_retirada_total
  }
}
ok(q === 0, 'retirada maior nunca reduz a reserva necessária')

q = 0
for (const net of NET) for (const pc of PCT) {
  const r = run({ network_level: net, pct_comercial: pc })
  for (let i = 1; i < 12; i++) {
    const a = r.projecao[i-1], b = r.projecao[i]
    const tA = a.saber_novos_self + a.executar_novos_self + a.saber_originados + a.executar_originados
    const tB = b.saber_novos_self + b.executar_novos_self + b.saber_originados + b.executar_originados
    if (tB < tA - 1) q++
  }
}
ok(q === 0, 'vendas próprias nunca recuam')

q = 0
for (const net of NET) for (const res of [0,150000]) for (const m of [5000,40000]) for (const ret of [2000,15000]) {
  const t = run({ network_level: net, reserva_capital: res, meta_faturamento: m, retirada_minima: ret }).termometro
  const p = [t.reserva_nivel, t.meta_nivel].reduce((a,b)=> ordem[b]>ordem[a]?b:a)
  if (t.nivel_final !== p) q++
}
ok(q === 0, 'nível final do termômetro = pior dos dois eixos')

// O primeiro passo (0 → 5%) é descontinuidade legítima: a 0% ele não vende
// nada, e qualquer valor acima já produz contratos. Medimos a partir de 5%.
let maxSalto = 0, ondeSalto = '', saltoInicial = 0
for (const net of NET) {
  const z = run({ network_level: net, pct_comercial: 0 }).kpis.remuneracao_regime
  const p5 = run({ network_level: net, pct_comercial: 0.05 }).kpis.remuneracao_regime
  saltoInicial = Math.max(saltoInicial, z > 0 ? (p5 - z)/z : 0)
  for (let pc = 0.05; pc < 1.0; pc += 0.05) {
    const a = run({ network_level: net, pct_comercial: pc }).kpis.remuneracao_regime
    const b = run({ network_level: net, pct_comercial: pc + 0.05 }).kpis.remuneracao_regime
    const d = a > 0 ? Math.abs(b-a)/a : 0
    if (d > maxSalto) { maxSalto = d; ondeSalto = `${net} ${(pc*100).toFixed(0)}%→${((pc+0.05)*100).toFixed(0)}%` }
  }
}
ok(maxSalto < 0.5, 'sem saltos acima de 50% do 5% em diante', `maior: ${(maxSalto*100).toFixed(0)}% em ${ondeSalto}`)
console.log(`  · salto 0%→5% (esperado, sai do zero): até ${(saltoInicial*100).toFixed(0)}%`)

// O payback deve melhorar com mais venda própria
q = 0
for (const net of NET) {
  const pb0 = run({ network_level: net, pct_comercial: 0 }).kpis.payback_mes ?? 99
  const pb7 = run({ network_level: net, pct_comercial: 0.7 }).kpis.payback_mes ?? 99
  if (pb7 > pb0) q++
}
ok(q === 0, 'quem vende mais nunca demora mais para pagar o investimento')

q = 0
for (const net of NET) {
  const k = run({ network_level: net, pct_comercial: 0 }).kpis
  if (k.payback_mes === null) q++
}
ok(q === 0, 'o perfil 0% comercial paga a entrada dentro de 12 meses')

// o payback mede retorno do investimento, então não depende da retirada
q = 0
for (const net of NET) for (const pc of [0, 0.35, 0.7]) {
  const pbs = [2000, 5000, 8000, 12000, 15000].map(ret =>
    run({ network_level: net, pct_comercial: pc, retirada_minima: ret }).kpis.payback_mes)
  if (new Set(pbs).size > 1) q++
}
ok(q === 0, 'payback independe da retirada mínima')

console.log(falhas === 0 ? '\n✓ Auditoria limpa' : `\n✗ ${falhas} verificações falharam`)
process.exit(falhas === 0 ? 0 : 1)
