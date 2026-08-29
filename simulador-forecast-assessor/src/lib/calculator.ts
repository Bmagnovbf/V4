// ─────────────────────────────────────────────────────────────────────────────
// Motor de cálculo — Simulador de Forecast · Assessor V4
//
// Reproduz a planilha "ASSESSOR V4 · DRE PROJETADO 12 MESES", trocando a rampa
// desenhada à mão por uma rampa generativa que responde ao perfil do candidato.
//
// Encadeamento:
//
//   pct_comercial + dedicação
//     → capacidade de OPERAR (cap de projetos) e de ORIGINAR (teto de vendas)
//     → contratos novos/mês, repartidos entre matriz e self
//     → originação acima da capacidade transborda para a Fonte 3 (CAC)
//     → receita por produto × split da fonte
//     → (−) Simples, CSP Saber, CSP Executar, overhead
//     → renda líquida → caixa acumulado → breakeven e payback
//
// Validação: `test_dre.mjs` compara a saída com o cenário Base da planilha
// (perfil de 45% comercial). O Upside é reportado como informativo — não é
// alcançável sob a premissa do closer. Ver SPEC.md § 7.
// ─────────────────────────────────────────────────────────────────────────────

import { PARAMS } from '@/config/params'
import type {
  SimulacaoInput, SimulacaoResult, PLMensal, Carteira, KPIs, Termometro,
  MixFontesM12, ViabilidadeNivel,
} from '@/types'

const MESES = 12

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Capacidade de operar projetos simultâneos.
 *
 * Depende da dedicação (integral/parcial) e do quanto do perfil é operacional.
 * Acima do perfil de referência a capacidade é cheia; abaixo dele cai
 * proporcionalmente. É o que faz um Assessor de veia comercial operar pouco e
 * repassar o excedente da própria originação para a Fonte 3.
 */
function capAtivos(input: SimulacaoInput): number {
  const base = input.dedicacao === 'integral'
    ? PARAMS.carteira.cap_ativos_integral
    : PARAMS.carteira.cap_ativos_parcial
  const pct_operacional = 1 - input.pct_comercial
  const fator = Math.min(1, pct_operacional / PARAMS.carteira.pct_operacional_ref)
  return base * fator
}

/** Rampa de contratos novos no mês, escalada pela capacidade do Assessor. */
function novosSlots(mes: number, cap: number): number {
  const base = PARAMS.carteira.ramp_novos[mes] ?? 0
  return base * (cap / PARAMS.carteira.cap_ativos_integral)
}

/** Evita divisão por zero na ocupação quando o perfil é 100% comercial. */
function ocupacao(ativos: number, cap: number): number {
  return cap > 0 ? ativos / cap : 0
}

/**
 * Curva de maturação comercial: 0 até o selo sair, subindo linearmente até 1
 * no M12. Antes do `inicio_originacao_mes` ele está na Trilha e não origina.
 */
function shapeComercial(mes: number): number {
  const inicio = PARAMS.comercial.inicio_originacao_mes
  if (mes < inicio) return 0
  return (mes - inicio + 1) / (MESES - inicio + 1)
}

/** Teto de vendas/mês de um perfil 100% comercial, já rampado. */
function originacaoMaxMes(): number {
  return PARAMS.comercial.calls_mes_max * PARAMS.comercial.conversao_call_venda
}

function overheadDoMes(mes: number): number {
  for (const faixa of PARAMS.overhead) {
    if (mes <= faixa.ate_mes) return faixa.valor
  }
  return PARAMS.overhead[PARAMS.overhead.length - 1].valor
}

// ─── Carteira mês a mês ──────────────────────────────────────────────────────

function montarCarteira(input: SimulacaoInput): Carteira[] {
  const cap = capAtivos(input)
  const { saber, executar } = PARAMS.carteira.mix_produto
  const linhas: Carteira[] = []

  // Histórico de Executar novos, para calcular os ativos com churn de 6 meses.
  const execNovosMatriz: number[] = [0]
  const execNovosSelf: number[] = [0]

  for (let mes = 1; mes <= MESES; mes++) {
    const slots = novosSlots(mes, cap)

    // O que ele consegue originar neste mês.
    const origPotencial =
      originacaoMaxMes() * input.pct_comercial * shapeComercial(mes)

    // Cabe na carteira que ele opera → Fonte 2. O excedente vira Fonte 3.
    const origOperada = Math.min(origPotencial, slots)
    const origTransbordo = origPotencial - origOperada
    const daMatriz = slots - origOperada

    const saber_novos_matriz     = daMatriz * saber
    const saber_novos_self       = origOperada * saber
    const executar_novos_matriz  = daMatriz * executar
    const executar_novos_self    = origOperada * executar

    execNovosMatriz[mes] = executar_novos_matriz
    execNovosSelf[mes]   = executar_novos_self

    // Executar ativos = cohorts dos últimos `duracao_meses` meses.
    const desde = Math.max(1, mes - executarDuracao() + 1)
    let executar_ativos_matriz = 0
    let executar_ativos_self = 0
    for (let m = desde; m <= mes; m++) {
      executar_ativos_matriz += execNovosMatriz[m] ?? 0
      executar_ativos_self   += execNovosSelf[m] ?? 0
    }

    // Saber conta como ativo só no mês da entrega (one-time).
    const total_ativos =
      saber_novos_matriz + saber_novos_self + executar_ativos_matriz + executar_ativos_self

    linhas.push({
      saber_novos_matriz, saber_novos_self,
      executar_novos_matriz, executar_novos_self,
      executar_ativos_matriz, executar_ativos_self,
      saber_originados:    origTransbordo * saber,
      executar_originados: origTransbordo * executar,
      total_ativos,
      ocupacao: ocupacao(total_ativos, cap),
    })
  }

  return linhas
}

function executarDuracao(): number {
  return PARAMS.produtos.executar.duracao_meses
}

// ─── DRE mensal ──────────────────────────────────────────────────────────────

function projetar(input: SimulacaoInput): PLMensal[] {
  const carteira = montarCarteira(input)
  const S = PARAMS.produtos.saber
  const E = PARAMS.produtos.executar

  const cac_saber = S.ticket * PARAMS.originacao.saber_pct_ticket
  // O CAC do Executar é pago em parcelas, uma por mês, a partir do mês da venda.
  const parcelas_exec = PARAMS.originacao.executar_parcelas
  const cac_executar_parcela = (E.ticket * PARAMS.originacao.executar_mult_mrr) / parcelas_exec

  const linhas: PLMensal[] = []
  let caixa = input.forma_pagamento === 'a_vista' ? -PARAMS.entrada.a_vista : 0

  for (let i = 0; i < MESES; i++) {
    const mes = i + 1
    const c = carteira[i]

    const receita_saber_matriz    = c.saber_novos_matriz     * S.ticket * S.split_matriz
    const receita_saber_self      = c.saber_novos_self       * S.ticket * S.split_self
    const receita_executar_matriz = c.executar_ativos_matriz * E.ticket * E.split_matriz
    const receita_executar_self   = c.executar_ativos_self   * E.ticket * E.split_self
    // Saber cai no mês da venda; Executar entra em parcelas dos meses anteriores.
    let receita_originacao = c.saber_originados * cac_saber
    for (let k = 0; k < parcelas_exec; k++) {
      const anterior = carteira[i - k]
      if (anterior) receita_originacao += anterior.executar_originados * cac_executar_parcela
    }

    const receita_recebida =
      receita_saber_matriz + receita_saber_self +
      receita_executar_matriz + receita_executar_self +
      receita_originacao

    const impostos        = receita_recebida * PARAMS.impostos.simples
    const receita_liquida = receita_recebida - impostos

    const csp_saber    = (c.saber_novos_matriz + c.saber_novos_self) * S.csp_onetime
    const csp_executar = (c.executar_ativos_matriz + c.executar_ativos_self) * E.csp_mes
    const overhead     = overheadDoMes(mes)

    const renda_liquida = receita_liquida - csp_saber - csp_executar - overhead

    const parcela_entrada =
      input.forma_pagamento === 'parcelado' && mes <= PARAMS.entrada.parcelas
        ? PARAMS.entrada.parcela_valor
        : 0

    const fluxo_caixa = renda_liquida - parcela_entrada
    caixa += fluxo_caixa

    linhas.push({
      mes, ...c,
      receita_saber_matriz, receita_saber_self,
      receita_executar_matriz, receita_executar_self,
      receita_originacao, receita_recebida,
      impostos, receita_liquida,
      csp_saber, csp_executar, overhead,
      renda_liquida, parcela_entrada,
      fluxo_caixa, caixa_acumulado: caixa,
    })
  }

  return linhas
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

function calculaKPIs(input: SimulacaoInput, projecao: PLMensal[]): KPIs {
  const m12 = projecao[MESES - 1]

  const renda_liquida_ano1     = projecao.reduce((s, l) => s + l.renda_liquida, 0)
  const receita_recebida_ano1  = projecao.reduce((s, l) => s + l.receita_recebida, 0)
  const pior_caixa             = Math.min(...projecao.map(l => l.caixa_acumulado))

  const investimento_total = input.forma_pagamento === 'a_vista'
    ? PARAMS.entrada.a_vista
    : PARAMS.entrada.parcela_valor * PARAMS.entrada.parcelas

  return {
    renda_liquida_m12: m12.renda_liquida,
    renda_liquida_ano1,
    renda_media_mes: renda_liquida_ano1 / MESES,
    receita_recebida_ano1,
    projetos_ativos_m12: m12.total_ativos,
    breakeven_mes: projecao.find(l => l.renda_liquida > 0)?.mes ?? null,
    payback_mes: projecao.find(l => l.caixa_acumulado >= 0)?.mes ?? null,
    pior_caixa,
    investimento_total,
  }
}

// ─── Termômetro ──────────────────────────────────────────────────────────────

function nivelMaior(v: number, verde: number, amarelo: number): ViabilidadeNivel {
  return v >= verde ? 'verde' : v >= amarelo ? 'amarelo' : 'vermelho'
}

function nivelMenor(v: number | null, verde: number, amarelo: number): ViabilidadeNivel {
  if (v === null) return 'vermelho'
  return v <= verde ? 'verde' : v <= amarelo ? 'amarelo' : 'vermelho'
}

const PRIORIDADE: Record<ViabilidadeNivel, number> = { verde: 0, amarelo: 1, vermelho: 2 }

function calculaTermometro(input: SimulacaoInput, kpis: KPIs): Termometro {
  const exigido = Math.max(0, -kpis.pior_caixa)
  const reserva_ratio = exigido > 0 ? input.reserva_capital / exigido : Infinity
  const reserva_nivel = nivelMaior(
    reserva_ratio,
    PARAMS.termometro.reserva_ratio.verde,
    PARAMS.termometro.reserva_ratio.amarelo,
  )

  const payback_nivel = nivelMenor(
    kpis.payback_mes,
    PARAMS.termometro.payback_meses.verde,
    PARAMS.termometro.payback_meses.amarelo,
  )

  const meta_ratio = input.meta_renda_liquida > 0
    ? kpis.renda_liquida_m12 / input.meta_renda_liquida
    : 0
  const meta_nivel = nivelMaior(
    meta_ratio,
    PARAMS.termometro.meta_ratio.verde,
    PARAMS.termometro.meta_ratio.amarelo,
  )

  const nivel_final = [reserva_nivel, payback_nivel, meta_nivel]
    .reduce((pior, n) => (PRIORIDADE[n] > PRIORIDADE[pior] ? n : pior), 'verde' as ViabilidadeNivel)

  return { reserva_ratio, reserva_nivel, payback_nivel, meta_ratio, meta_nivel, nivel_final }
}

// ─── Ponto de entrada ────────────────────────────────────────────────────────

export function simular(input: SimulacaoInput): SimulacaoResult {
  const projecao = projetar(input)
  const kpis = calculaKPIs(input, projecao)
  const termometro = calculaTermometro(input, kpis)

  const m12 = projecao[MESES - 1]
  const alocacao     = m12.receita_saber_matriz + m12.receita_executar_matriz
  const self_sourced = m12.receita_saber_self   + m12.receita_executar_self
  const total = m12.receita_recebida || 1

  const mix_m12: MixFontesM12 = {
    alocacao:     alocacao / total,
    self_sourced: self_sourced / total,
    originacao:   m12.receita_originacao / total,
  }

  return { input, projecao, kpis, termometro, mix_m12 }
}
