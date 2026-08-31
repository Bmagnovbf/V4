// ─────────────────────────────────────────────────────────────────────────────
// Motor de cálculo — Simulador de Forecast · Assessor V4
//
// Reproduz a planilha "ASSESSOR V4 · DRE PROJETADO 12 MESES", trocando a rampa
// desenhada à mão por uma rampa generativa que responde ao perfil do candidato.
//
// Encadeamento:
//
//   matriz atribui um pace fixo de 1–2 clientes/mês (Fonte 1)
//   network + pct_comercial → o que ele origina por conta própria
//     → o que couber na capacidade livre ele opera (Fonte 2)
//     → o que exceder transborda para a Fonte 3 (CAC)
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
 * Converte um fluxo fracionário em contratos inteiros, guardando o resto para
 * os meses seguintes. Cliente não existe em decimal: 0,4 contrato/mês vira
 * 0, 1, 0, 0, 1 — e o total do ano é preservado.
 *
 * Arredonda em vez de truncar para não atrasar o primeiro contrato: com 70% de
 * mix de Saber, o cliente inicial da matriz deve nascer Saber (0,7 → 1), como
 * na planilha, e não Executar.
 */
function criarAcumulador() {
  let resto = 0
  return (valor: number): number => {
    resto += valor
    const inteiro = Math.max(0, Math.round(resto))
    resto -= inteiro
    return inteiro
  }
}

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
  return Math.round(base * fator)
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

/**
 * Teto de vendas/mês do Assessor, já rampado.
 *
 * Três fatores multiplicam: a agenda de calls (38 × 20% = 7,6/mês), o quanto do
 * perfil é comercial e o tamanho da rede. Sem rede não há a quem vender, por
 * mais comercial que seja o perfil — por isso o network entra como multiplicador
 * e não como parcela.
 */
function originacaoMaxMes(input: SimulacaoInput): number {
  const teto = PARAMS.comercial.calls_mes_max * PARAMS.comercial.conversao_call_venda
  return teto * input.pct_comercial * PARAMS.network[input.network_level].fator
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
  const { saber } = PARAMS.carteira.mix_produto
  const linhas: Carteira[] = []

  // Histórico de Executar novos, para calcular os ativos com churn de 6 meses.
  const execNovosMatriz: number[] = [0]
  const execNovosSelf: number[] = [0]

  // Contratos são inteiros. Cada acumulador guarda a fração de um mês para o
  // seguinte, para que o total do ano não se perca no arredondamento.
  const accOriginacao  = criarAcumulador()
  const accSaberMatriz = criarAcumulador()
  const accSaberSelf   = criarAcumulador()
  const accSaberOrig   = criarAcumulador()

  // Os primeiros contratos entram como Saber (premissa da planilha): um
  // Executar isolado no início não cobre o próprio CSP.
  let contratosAteAgora = 0

  for (let mes = 1; mes <= MESES; mes++) {
    // 1) A matriz atribui seu pace, independente do perfil. É o compromisso da
    //    rede — o Assessor não recusa cliente alocado.
    const daMatriz = PARAMS.carteira.matriz_pace[mes] ?? 0

    // 2) O que ele consegue originar por conta própria neste mês, em contratos
    //    inteiros (a fração fica guardada para os meses seguintes).
    const origPotencial = accOriginacao(originacaoMaxMes(input) * shapeComercial(mes))

    // 3) Espaço que sobra na carteira depois dos ativos vigentes e do que a
    //    matriz acabou de atribuir. O que couber ele opera (Fonte 2); o que
    //    exceder é repassado e ele fica só com o CAC (Fonte 3).
    const desdeAtivos = Math.max(1, mes - executarDuracao() + 1)
    let ativosVigentes = 0
    for (let m = desdeAtivos; m < mes; m++) {
      ativosVigentes += (execNovosMatriz[m] ?? 0) + (execNovosSelf[m] ?? 0)
    }
    const capacidadeLivre = Math.max(0, cap - ativosVigentes - daMatriz)

    const origOperada = Math.min(origPotencial, capacidadeLivre)
    const origTransbordo = origPotencial - origOperada

    // 4) Reparte cada bloco entre Saber e Executar. Enquanto a carteira não
    //    passa dos primeiros contratos, tudo é Saber. Depois, o Saber acumula
    //    a fração do mix e o Executar leva o resto, para a soma bater.
    const repartir = (bloco: number, acc: (v: number) => number): number => {
      const faltamSaber = Math.max(0, PARAMS.carteira.primeiros_saber - contratosAteAgora)
      const forcados = Math.min(bloco, faltamSaber)
      contratosAteAgora += bloco
      if (forcados >= bloco) return bloco
      return forcados + Math.min(bloco - forcados, acc((bloco - forcados) * saber))
    }

    const saber_novos_matriz    = repartir(daMatriz,       accSaberMatriz)
    const saber_novos_self      = repartir(origOperada,    accSaberSelf)
    const saber_originados      = repartir(origTransbordo, accSaberOrig)
    const executar_novos_matriz = daMatriz       - saber_novos_matriz
    const executar_novos_self   = origOperada    - saber_novos_self
    const executar_originados   = origTransbordo - saber_originados

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
      saber_originados,
      executar_originados,
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
  let caixa = -PARAMS.entrada.a_vista

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

    // O quanto a renda do mês fica abaixo do que ele precisa retirar para viver.
    // Independe da entrada — capital de giro e investimento são coisas distintas.
    const deficit_retirada = Math.max(0, input.retirada_minima - renda_liquida)

    const fluxo_caixa = renda_liquida
    caixa += fluxo_caixa

    linhas.push({
      mes, ...c,
      receita_saber_matriz, receita_saber_self,
      receita_executar_matriz, receita_executar_self,
      receita_originacao, receita_recebida,
      impostos, receita_liquida,
      csp_saber, csp_executar, overhead,
      renda_liquida, deficit_retirada,
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

  const investimento_total = PARAMS.entrada.a_vista

  const MESES_REGIME = 3
  const regime = projecao.slice(-MESES_REGIME)
  const renda_regime = regime.reduce((s, l) => s + l.renda_liquida, 0) / MESES_REGIME

  const deficit_retirada_total = projecao.reduce((s, l) => s + l.deficit_retirada, 0)
  const mes_autossuficiencia = projecao.find(l => l.deficit_retirada === 0)?.mes ?? null

  return {
    renda_regime,
    renda_liquida_m12: m12.renda_liquida,
    renda_liquida_ano1,
    renda_media_mes: renda_liquida_ano1 / MESES,
    receita_recebida_ano1,
    projetos_ativos_m12: m12.total_ativos,
    breakeven_mes: projecao.find(l => l.renda_liquida > 0)?.mes ?? null,
    payback_mes: projecao.find(l => l.caixa_acumulado >= 0)?.mes ?? null,
    pior_caixa,
    investimento_total,
    deficit_retirada_total,
    mes_autossuficiencia,
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
  // A reserva cobre o buraco de RETIRADA, não a entrada. A entrada é
  // investimento e já é medida pelo payback — somar as duas contaria o mesmo
  // dinheiro em dois eixos do termômetro.
  const exigido = kpis.deficit_retirada_total
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

  // Compara a meta com a renda em REGIME, não com o M12 isolado — senão o
  // veredito do termômetro depende de em qual mês caiu o último Saber.
  const meta_ratio = input.meta_renda_liquida > 0
    ? kpis.renda_regime / input.meta_renda_liquida
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
