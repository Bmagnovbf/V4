import { PARAMS } from '@/config/params'
import type {
  Horizonte,
  MetricasBlended,
  PLMensal,
  EsforcoAquisicao,
  KPIs,
  Termometro,
  ViabilidadeNivel,
  SimulacaoResult,
  SimulacaoInput,
  HeadcountHorizonte,
  NetworkLevel,
  Experiencia,
  AlocacaoM12,
} from '@/types'

// ─── Step 1: Identifica horizonte (pelo fat. BRUTO) ───────────────────────────

export function identificaHorizonte(meta_fat_bruto: number): Horizonte {
  if (meta_fat_bruto <= 60_000)  return 'H1'
  if (meta_fat_bruto <= 150_000) return 'H2'
  if (meta_fat_bruto <= 450_000) return 'H3'
  return 'H4+'
}

// ─── Headcount base por horizonte ─────────────────────────────────────────────
// H1/H2 têm valor único; H3 é subdividido por faixa de faturamento bruto.

export function resolveHeadcount(
  horizonte: Exclude<Horizonte, 'H4+'>,
  meta_fat_bruto: number,
): HeadcountHorizonte {
  if (horizonte === 'H3') {
    const bandas = PARAMS.headcount.H3
    const banda = bandas.find(b => meta_fat_bruto <= b.ate) ?? bandas[bandas.length - 1]
    return { csp: banda.csp, comercial: banda.comercial, ga: banda.ga, total: banda.total }
  }
  const hc = PARAMS.headcount[horizonte]
  return { csp: hc.csp, comercial: hc.comercial, ga: hc.ga, total: hc.total }
}

// ─── Step 2: Métricas blended por horizonte ───────────────────────────────────

export function calculaBlended(
  horizonte: Exclude<Horizonte, 'H4+'>,
  input: Pick<SimulacaoInput,
    | 'ticket_saber_tiny' | 'ticket_saber_small' | 'ticket_saber_medium'
    | 'ticket_ter_tiny'   | 'ticket_ter_small'   | 'ticket_ter_medium'
    | 'conversao_mql_tiny' | 'conversao_mql_small' | 'conversao_mql_medium'
  > = {},
): MetricasBlended {
  const mix = PARAMS.mix_tiers[horizonte]
  const { tiny, small, medium } = mix

  const ticket_saber =
    tiny   * (input.ticket_saber_tiny   ?? PARAMS.tickets.saber.tiny) +
    small  * (input.ticket_saber_small  ?? PARAMS.tickets.saber.small) +
    medium * (input.ticket_saber_medium ?? PARAMS.tickets.saber.medium)

  const ticket_ter =
    tiny   * (input.ticket_ter_tiny   ?? PARAMS.tickets.ter.tiny) +
    small  * (input.ticket_ter_small  ?? PARAMS.tickets.ter.small) +
    medium * (input.ticket_ter_medium ?? PARAMS.tickets.ter.medium)

  const conversao =
    tiny   * (input.conversao_mql_tiny   ?? PARAMS.canais.inbound.conversao.tiny) +
    small  * (input.conversao_mql_small  ?? PARAMS.canais.inbound.conversao.small) +
    medium * (input.conversao_mql_medium ?? PARAMS.canais.inbound.conversao.medium)

  const cpmql =
    tiny * PARAMS.canais.inbound.cpmql.tiny +
    small * PARAMS.canais.inbound.cpmql.small +
    medium * PARAMS.canais.inbound.cpmql.medium

  return { ticket_saber, ticket_ter, conversao, cpmql }
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function rampFactor(mes: number): number {
  if (mes >= 1 && mes <= 12) return PARAMS.ramp_up[mes]
  return 1.0
}

function growthFactor(mes: number): number {
  return mes <= 12 ? 1.0 : Math.pow(1 + PARAMS.crescimento_pos_m12, mes - 12)
}

// Taxa de upsell Path B (Saber Medium → Executar)
function taxaUpsell(n: number, experiencia: Experiencia): number {
  const base = n <= 0 ? 0 : n <= 2.5 ? Math.min(1.0, 1.0 / n) : PARAMS.upsell.upsell_rate_regime
  return experiencia === 'solida' ? Math.min(1.0, base + PARAMS.upsell.modifier_solida_pp) : base
}

function buildOrganicMqlsSchedule(network_level: NetworkLevel): number[] {
  const schedule = new Array(24).fill(0)
  const cfg = PARAMS.network[network_level]
  const per_month = cfg.total_mqls / cfg.periodo_meses
  for (let m = 0; m < cfg.periodo_meses; m++) schedule[m] = per_month
  return schedule
}

// Fator de churn para um cohort criado em m_prime ao ser avaliado no mês m
// 0% churn nos primeiros 6 meses; 10% de churn a cada renovação (a cada 6 meses)
function churnFactor(m_prime: number, m: number): number {
  const age = m - m_prime  // meses de vida do contrato (0 = mês de criação)
  return Math.pow(PARAMS.upsell.renovacao_executar, Math.floor(age / 6))
}

// ─── Núcleo da projeção ───────────────────────────────────────────────────────

function calcularProjecaoCore(
  input: SimulacaoInput,
  horizonte: Exclude<Horizonte, 'H4+'>,
  blended: MetricasBlended,
  n_scale: number = 1.0,
): PLMensal[] {
  const { meta_fat_bruto, capital_disponivel, network_level, network_tier, experiencia } = input
  const mix = PARAMS.mix_tiers[horizonte]
  const ticket_executar = input.ticket_executar_medium ?? PARAMS.tickets.executar.medium

  // ── Engenharia reversa pelo M12 (regra 75/25 + mix 80/20) ────────────────
  // 75% da meta = receita de aquisição naquele mês
  // Dessa fatia: 80% por receita Saber, 20% por receita Executar novos
  // n_scale é o fator de calibração (calculado na 1ª passada) para garantir fat_bruto_M12 ≈ meta
  const meta_aquisicao_m12 = meta_fat_bruto * PARAMS.mix_receita_m12.aquisicao
  const N_saber_m12_base   = (meta_aquisicao_m12 * PARAMS.mix_aquisicao.saber)    / blended.ticket_saber
  const N_executar_m12_base = (meta_aquisicao_m12 * PARAMS.mix_aquisicao.executar) / ticket_executar
  const N_total_m12        = (N_saber_m12_base + N_executar_m12_base) * n_scale

  // Frações de Saber e Executar dentro do total de novos contratos (invariantes à escala)
  const N_total_base = N_saber_m12_base + N_executar_m12_base
  const frac_saber    = N_total_base > 0 ? N_saber_m12_base    / N_total_base : 0.8
  const frac_executar = N_total_base > 0 ? N_executar_m12_base / N_total_base : 0.2

  // Orgânicos da rede de relacionamento
  const organic_mqls      = buildOrganicMqlsSchedule(network_level)
  const conv_overrides    = {
    tiny:   input.conversao_mql_tiny   ?? PARAMS.canais.inbound.conversao.tiny,
    small:  input.conversao_mql_small  ?? PARAMS.canais.inbound.conversao.small,
    medium: input.conversao_mql_medium ?? PARAMS.canais.inbound.conversao.medium,
  }
  const organic_conversao = conv_overrides[network_tier]
  const saber_overrides   = {
    tiny:   input.ticket_saber_tiny   ?? PARAMS.tickets.saber.tiny,
    small:  input.ticket_saber_small  ?? PARAMS.tickets.saber.small,
    medium: input.ticket_saber_medium ?? PARAMS.tickets.saber.medium,
  }
  const organic_ticket    = saber_overrides[network_tier]

  // Custo por cliente inbound (para cálculo de capacidade de broker)
  const cost_per_inbound_client = blended.conversao > 0 ? blended.cpmql / blended.conversao : Infinity

  // ── Pré-compute: cohorts Executar (aquisição + upsell Path B) ────────────
  // cohort_executar[m] = total de novos clientes Executar que ENTRAM em m
  const n_saber_arr        = new Array(25).fill(0)
  const n_medium_saber_arr = new Array(25).fill(0)
  const cohort_executar    = new Array(25).fill(0)

  for (let m = 1; m <= 24; m++) {
    const ramp   = rampFactor(m) * growthFactor(m)
    const n_inbound_total  = N_total_m12 * ramp
    const n_inbound_saber  = n_inbound_total * frac_saber
    const n_inbound_exec   = n_inbound_total * frac_executar

    // Orgânicos entram todos como Saber
    const n_organic = organic_mqls[m - 1] * organic_conversao
    n_saber_arr[m]  = n_inbound_saber + n_organic

    // Medium Saber (para Path B no próximo mês)
    const n_med_inbound = n_inbound_saber * mix.medium
    const n_med_organic = network_tier === 'medium' ? n_organic : 0
    n_medium_saber_arr[m] = n_med_inbound + n_med_organic

    // Path B: upsell de Medium Saber do mês anterior → Executar neste mês
    const n_prev_med = m > 1 ? n_medium_saber_arr[m - 1] : 0
    const path_b = n_prev_med * taxaUpsell(n_prev_med, experiencia)

    cohort_executar[m] = n_inbound_exec + path_b
  }

  // ── P&L mês a mês ─────────────────────────────────────────────────────────
  let ebitda_acumulado    = 0
  let break_even_reached  = false
  const projecao: PLMensal[] = []

  for (let m = 1; m <= 24; m++) {
    // ── Receita Saber (aquisição) ─────────────────────────────────────────
    const ramp            = rampFactor(m) * growthFactor(m)
    const n_inbound_saber = N_total_m12 * ramp * frac_saber
    const n_organic       = organic_mqls[m - 1] * organic_conversao
    const receita_saber   = n_inbound_saber * blended.ticket_saber + n_organic * organic_ticket

    // ── Receita Executar novos (1ª mensalidade — aquisição) ──────────────
    const receita_executar_acq = cohort_executar[m] * ticket_executar

    // ── Base de retenção Executar (cohorts M1..M-1) ───────────────────────
    // 1) Calcula base sem churn para verificar trava
    let base_sem_churn = 0
    for (let mp = 1; mp < m; mp++) base_sem_churn += cohort_executar[mp]

    const apply_churn = base_sem_churn * ticket_executar >= PARAMS.upsell.threshold_churn_executar

    let base_executar = 0
    for (let mp = 1; mp < m; mp++) {
      const factor = apply_churn ? churnFactor(mp, m) : 1.0
      base_executar += cohort_executar[mp] * factor
    }
    const receita_executar_retencao = base_executar * ticket_executar

    // ── Ter Pontual (expansão — apenas a partir de M3) ────────────────────
    const n_prev_saber = m > 1 ? n_saber_arr[m - 1] : 0
    const base_ativa   = n_saber_arr[m] + n_prev_saber + base_executar + cohort_executar[m]
    const receita_ter  = m >= 3
      ? base_ativa * PARAMS.upsell.pct_expansao_ter * blended.ticket_ter
      : 0

    // ── Totais ────────────────────────────────────────────────────────────
    const receita_aquisicao = receita_saber + receita_executar_acq + receita_ter
    const fat_bruto  = receita_aquisicao + receita_executar_retencao
    const coef_liq   = (1 - PARAMS.deducoes.royalties - PARAMS.deducoes.impostos) *
                       (m <= 3 ? 1.0 : 1 - PARAMS.deducoes.inadimplencia)
    const fat_liq    = fat_bruto * coef_liq

    // ── Custos base (exceto broker e BDR) ────────────────────────────────
    // Ineficiência de onboarding: nos primeiros meses, time sem experiência V4 tem
    // capacidade limitada. Acima de 5 novos clientes/mês, o CSP sobe para refletir
    // retrabalho, menor eficiência e necessidade de suporte extra não planejado.
    const total_novos_m = n_saber_arr[m] + cohort_executar[m]
    const excesso_onboarding = m <= PARAMS.onboarding.penalidade_meses
      ? Math.max(0, total_novos_m - PARAMS.onboarding.limiar_novos_clientes)
      : 0
    const fator_ineficiencia_csp = 1 + excesso_onboarding * PARAMS.onboarding.multiplicador_csp_excesso

    const custo_csp       = Math.max(PARAMS.custos_minimos.csp,              fat_liq * PARAMS.proporcoes.csp)              * fator_ineficiencia_csp
    const custo_comercial = Math.max(PARAMS.custos_minimos.comercial_equipe, fat_liq * PARAMS.proporcoes.comercial_equipe)
    const custo_ga        = Math.max(PARAMS.custos_minimos.ga,               fat_liq * PARAMS.proporcoes.ga)

    const ebitda_antes_broker = fat_liq - custo_csp - custo_comercial - custo_ga

    // ── Broker: Fase 1 (pré break-even) vs Fase 2 (pós break-even) ───────
    // Fase 1: ideal calculado sobre o ALVO do M12 escalonado pelo ramp.
    // Garante que maior ambição exige comprometimento proporcional de broker desde M1,
    // em vez de derivar da receita atual (que seria subestimada nos meses iniciais).
    const coef_liq_regime    = (1 - PARAMS.deducoes.royalties - PARAMS.deducoes.impostos)
                              * (1 - PARAMS.deducoes.inadimplencia)
    const fat_liq_m12_target = meta_fat_bruto * coef_liq_regime
    const ideal_broker_fase1 = Math.max(
      PARAMS.custos_minimos.broker,
      fat_liq_m12_target * PARAMS.proporcoes.broker,
    )
    // Fase 2: broker sobre a receita real (padrão — sem alteração)
    const ideal_broker_fase2 = Math.max(PARAMS.custos_minimos.broker, fat_liq * PARAMS.proporcoes.broker)

    let custo_broker: number
    if (!break_even_reached) {
      // Fase 1: broker pago pelo capital de giro
      const capital_restante = capital_disponivel + ebitda_acumulado
      const max_broker_por_caixa = ebitda_antes_broker + capital_restante
      custo_broker = Math.max(
        PARAMS.custos_minimos.broker,
        Math.min(ideal_broker_fase1, max_broker_por_caixa),
      )
    } else {
      // Fase 2: broker financiado pela receita
      custo_broker = ideal_broker_fase2
    }
    const ideal_broker = !break_even_reached ? ideal_broker_fase1 : ideal_broker_fase2

    // ── Outbound overflow e BDRs ──────────────────────────────────────────
    // BDRs só fazem sentido quando o broker está abaixo do ideal por restrição de capital (Fase 1).
    // Na Fase 2, o broker já está no nível ótimo (16% fat_liq); qualquer gap residual vem da
    // calibração n_scale e não deve ser interpretado como necessidade de BDR adicional.
    const broker_constrangido = custo_broker < ideal_broker - 50  // tolerância R$50 de arredondamento
    const inbound_clients_from_broker = cost_per_inbound_client > 0
      ? custo_broker / cost_per_inbound_client
      : 0
    const n_inbound_target = N_total_m12 * ramp
    const gap_inbound = broker_constrangido
      ? Math.max(0, n_inbound_target - n_organic - inbound_clients_from_broker)
      : 0

    let bdr_count = 0
    if (gap_inbound > 0) {
      const leads_outbound = gap_inbound / PARAMS.canais.outbound.conversao
      bdr_count = Math.ceil(leads_outbound / PARAMS.canais.bdr.leads_por_bdr)
    }
    const custo_bdr = bdr_count * PARAMS.canais.bdr.custo

    // ── EBITDA ────────────────────────────────────────────────────────────
    const ebitda = fat_liq - custo_csp - custo_comercial - custo_ga - custo_broker - custo_bdr
    ebitda_acumulado += ebitda

    if (ebitda > 0 && !break_even_reached) break_even_reached = true

    // MQLs (informativo para gráficos)
    const mqls_inbound  = blended.cpmql > 0 ? custo_broker / blended.cpmql : 0
    // Pós break-even: broker cai para 16% da receita real, reduzindo inbound.
    // O outbound repõe 1/3 do inbound como estimativa de esforço comercial ativo.
    // Pré break-even: outbound vem dos BDRs calculados (já afeta custos).
    const mqls_outbound = break_even_reached
      ? mqls_inbound / 3
      : bdr_count * PARAMS.canais.bdr.leads_por_bdr

    projecao.push({
      mes: m,
      fat_bruto,
      receita_aquisicao,
      receita_executar:       receita_executar_retencao,
      receita_ter_expansao:   receita_ter,
      receita_liquida:        fat_liq,
      novos_saber:            n_saber_arr[m],
      base_executar,
      novos_executar:         cohort_executar[m],
      mqls_inbound,
      mqls_outbound,
      custo_csp,
      custo_comercial,
      custo_ga,
      custo_broker,
      custo_bdr,
      bdr_count,
      ebitda,
      ebitda_acumulado,
    })
  }

  return projecao
}

// ─── Step 6: KPIs de viabilidade ──────────────────────────────────────────────

function calculaKPIs(capital_disponivel: number, projecao: PLMensal[]): KPIs {
  const p12       = projecao[11]
  const ebitda_m12 = p12.ebitda

  const breakeven_mes     = projecao.find(p => p.ebitda > 0)?.mes ?? null
  const deficit_acumulado = projecao.reduce((acc, p) => acc + Math.min(0, p.ebitda), 0)

  const capital_minimo          = PARAMS.capex.franquia + Math.abs(deficit_acumulado)
  const capital_total_investido = capital_minimo + PARAMS.capex.escritorio_ref

  let saldo = -capital_total_investido
  let payback_mes: number | null = null
  for (const p of projecao) {
    saldo += p.ebitda
    if (saldo >= 0 && payback_mes === null) payback_mes = p.mes
  }

  const roic = capital_total_investido > 0
    ? (ebitda_m12 * 12 / capital_total_investido) * 100
    : 0

  // Margens — média de M6–M12
  const slice = projecao.slice(5, 12)

  // Margem Bruta = (fat_liq − CSP) / fat_liq
  const margem_bruta_m12 = slice.length > 0
    ? slice.reduce((sum, p) => {
        const bruta = p.receita_liquida - p.custo_csp
        return sum + (p.receita_liquida > 0 ? bruta / p.receita_liquida : 0)
      }, 0) / slice.length * 100
    : 0

  // Margem EBITDA = ebitda / fat_liq (ebitda já desconta CSP, G&A, Comercial, Broker, BDR)
  const margem_ebitda_m12 = slice.length > 0
    ? slice.reduce((sum, p) =>
        sum + (p.receita_liquida > 0 ? p.ebitda / p.receita_liquida : 0), 0
      ) / slice.length * 100
    : 0

  // ROAS M1–M12
  const fat_aquisicao_m12    = projecao.slice(0, 12).reduce((s, p) => s + p.receita_aquisicao, 0)
  const broker_acumulado_m12 = projecao.slice(0, 12).reduce((s, p) => s + p.custo_broker, 0)
  const roas = broker_acumulado_m12 > 0 ? fat_aquisicao_m12 / broker_acumulado_m12 : 0

  return {
    breakeven_mes,
    payback_mes,
    roic,
    capital_minimo,
    capital_total_investido,
    deficit_acumulado,
    capital_disponivel_efetivo: capital_disponivel,
    postergar_escritorio: capital_disponivel < PARAMS.capex.limiar_postergar_escritorio,
    margem_bruta_m12,
    margem_ebitda_m12,
    roas,
    broker_acumulado_m12,
  }
}

// ─── Step 7: Termômetro de viabilidade ────────────────────────────────────────

function nivelCapital(ratio: number): ViabilidadeNivel {
  if (ratio >= PARAMS.termometro.capital_ratio.verde)   return 'verde'
  if (ratio >= PARAMS.termometro.capital_ratio.amarelo) return 'amarelo'
  return 'vermelho'
}

function nivelPayback(mes: number | null): ViabilidadeNivel {
  if (!mes) return 'vermelho'
  if (mes <= PARAMS.termometro.payback_meses.verde)   return 'verde'
  if (mes <= PARAMS.termometro.payback_meses.amarelo) return 'amarelo'
  return 'vermelho'
}

const PRIORIDADE: Record<ViabilidadeNivel, number> = { verde: 0, amarelo: 1, vermelho: 2 }

function maisCritico(...ns: ViabilidadeNivel[]): ViabilidadeNivel {
  return ns.reduce((a, b) => (PRIORIDADE[b] > PRIORIDADE[a] ? b : a))
}

// ─── Ponto de entrada principal ───────────────────────────────────────────────

export function simular(input: SimulacaoInput): SimulacaoResult {
  const { meta_fat_bruto, capital_disponivel } = input
  const horizonte = identificaHorizonte(meta_fat_bruto)

  const emptyResult = (): SimulacaoResult => ({
    input,
    horizonte: 'H4+',
    blended: { ticket_saber: 0, ticket_ter: 0, conversao: 0, cpmql: 0 },
    projecao: [],
    esforco: {
      novos_clientes_saber_mes: 0, mqls_inbound_mes: 0,
      broker_mes: 0, broker_ano: 0, broker_ratio: 0,
      mqls_outbound_mes: 0, novos_executar_mes: 0,
      base_executar_regime: 0, receita_executar_regime: 0,
      receita_ter_expansao_regime: 0, show_outbound_card: false,
      bdr_mes_m12: 0, custo_bdr_mes_m12: 0,
    },
    kpis: {
      breakeven_mes: null, payback_mes: null, roic: 0,
      capital_minimo: 0, capital_total_investido: 0, deficit_acumulado: 0,
      capital_disponivel_efetivo: capital_disponivel,
      postergar_escritorio: false, margem_bruta_m12: 0,
      margem_ebitda_m12: 0, roas: 0, broker_acumulado_m12: 0,
    },
    termometro: {
      capital_ratio: 0, capital_nivel: 'vermelho',
      payback_nivel: 'vermelho', nivel_final: 'vermelho',
    },
    headcount: { csp: 0, comercial: 0, ga: 0, total: 0 },
    alocacao_m12: { custo_csp: 0, custo_comercial: 0, custo_ga: 0, custo_broker: 0, custo_bdr: 0, ebitda: 0, fat_liq: 0 },
  })

  if (horizonte === 'H4+') return emptyResult()

  const h       = horizonte as Exclude<Horizonte, 'H4+'>
  const blended = calculaBlended(h, input)

  // Guarda defensiva: garante que tickets e conversão são positivos antes de calcular.
  // O formulário já bloqueia zeros, mas protege contra injeção via devtools ou API direta.
  const ticket_exec_check = input.ticket_executar_medium ?? PARAMS.tickets.executar.medium
  if (blended.ticket_saber <= 0 || blended.conversao <= 0 || ticket_exec_check <= 0) {
    return emptyResult()
  }

  // ── Calibração em 2 passadas: garante fat_bruto_M12 ≈ meta ───────────────
  // Passada 1: n_scale neutro → mede o desvio causado pelo MRR acumulado
  const projecao_raw = calcularProjecaoCore(input, h, blended, 1.0)
  const fat_m12_raw  = projecao_raw[11]?.fat_bruto ?? meta_fat_bruto
  // Passada 2: aplica fator de correção → fat_bruto_M12 ≈ meta (erro residual < 1%)
  const n_scale  = fat_m12_raw > 0 ? meta_fat_bruto / fat_m12_raw : 1.0
  const projecao = calcularProjecaoCore(input, h, blended, n_scale)

  const kpis    = calculaKPIs(capital_disponivel, projecao)

  // Esforço derivado do M12 (regime)
  const p12        = projecao[11]
  const broker_ano = projecao.slice(0, 12).reduce((s, p) => s + p.custo_broker, 0)
  const broker_ratio = capital_disponivel > 0 ? broker_ano / capital_disponivel : 0

  const esforco: EsforcoAquisicao = {
    novos_clientes_saber_mes:    p12.novos_saber,
    mqls_inbound_mes:            p12.mqls_inbound,
    broker_mes:                  p12.custo_broker,
    broker_ano,
    broker_ratio,
    mqls_outbound_mes:           p12.mqls_outbound,
    novos_executar_mes:          p12.novos_executar,
    base_executar_regime:        p12.base_executar,
    receita_executar_regime:     p12.receita_executar,
    receita_ter_expansao_regime: p12.receita_ter_expansao,
    show_outbound_card:          broker_ratio >= PARAMS.canais.trigger_outbound_ratio || p12.bdr_count > 0,
    bdr_mes_m12:                 p12.bdr_count,
    custo_bdr_mes_m12:           p12.custo_bdr,
  }

  const capital_ratio = kpis.capital_minimo > 0 ? capital_disponivel / kpis.capital_minimo : 0
  const termometro: Termometro = {
    capital_ratio,
    capital_nivel: nivelCapital(capital_ratio),
    payback_nivel: nivelPayback(kpis.payback_mes),
    nivel_final:   maisCritico(nivelCapital(capital_ratio), nivelPayback(kpis.payback_mes)),
  }

  const headcount: HeadcountHorizonte = resolveHeadcount(h, meta_fat_bruto)

  const alocacao_m12: AlocacaoM12 = {
    custo_csp:       p12.custo_csp,
    custo_comercial: p12.custo_comercial,
    custo_ga:        p12.custo_ga,
    custo_broker:    p12.custo_broker,
    custo_bdr:       p12.custo_bdr,
    ebitda:          p12.ebitda,
    fat_liq:         p12.receita_liquida,
  }

  return { input, horizonte: h, blended, projecao, esforco, kpis, termometro, headcount, alocacao_m12 }
}
