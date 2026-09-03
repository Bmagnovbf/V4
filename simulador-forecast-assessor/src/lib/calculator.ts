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
//     → resultado · remuneração → caixa acumulado → breakeven e payback
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

/** Ver `SimulacaoResult.schema`. Suba a cada KPI ou campo novo na projeção. */
export const SIMULACAO_SCHEMA = 2

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converte um fluxo fracionário em contratos inteiros, guardando o resto para
 * os meses seguintes. Cliente não existe em decimal: 0,4 contrato/mês vira
 * 0, 0, 1, 0, 0, 1 — e nada se perde no caminho.
 *
 * Trunca em vez de arredondar. Arredondar deixaria o resto ir a negativo e a
 * série passaria a oscilar: com um fluxo que só cresce (0,9 · 1,3 · 1,8 · 2,2),
 * `round` emite 1, 2, 1, 3 — uma queda no M7 que não existe no fluxo real.
 * Truncando, a série nunca recua: 1, 1, 2, 2.
 *
 * O primeiro contrato não fica preso pelo truncamento porque
 * `carteira.primeiros_saber` já força os primeiros a nascerem Saber.
 */
function criarAcumulador() {
  let resto = 0
  return (valor: number): number => {
    resto += valor
    const inteiro = Math.floor(resto + 1e-9)
    resto -= inteiro
    return inteiro
  }
}

/**
 * Capacidade de operar projetos simultâneos.
 *
 * A dedicação é integral em todos os cenários — a COF obriga exclusividade —,
 * então o que move a capacidade é só o quanto do perfil é operacional. Acima do
 * perfil de referência a capacidade é cheia; abaixo dele cai proporcionalmente.
 * É o que faz um Assessor de veia comercial operar pouco e repassar o excedente
 * da própria originação para a Fonte 3.
 */
function capAtivos(input: SimulacaoInput): number {
  const base = PARAMS.carteira.cap_ativos
  const pct_operacional = 1 - input.pct_comercial
  const fator = Math.min(1, pct_operacional / PARAMS.carteira.pct_operacional_ref)
  return Math.round(base * fator)
}

/** Evita divisão por zero na ocupação quando o perfil é 100% comercial. */
function ocupacao(ativos: number, cap: number): number {
  return cap > 0 ? ativos / cap : 0
}

/**
 * Curva de maturação comercial: 0 até o selo sair, subindo até 1 no M12.
 * Antes do `inicio_vendas_mes` ele está na Trilha e não vende.
 *
 * A curva é côncava, não linear: quem sai da Banca já tem a rede aquecida por
 * três meses de imersão. Com a curva linear a venda própria só ficava relevante
 * depois do M8, e o payback acabava idêntico entre um Assessor que vende e um
 * que depende só da alocação.
 *
 * O expoente 0,8 é o ponto onde a curva já diferencia os perfis sem afastar os
 * cenários da planilha além da tolerância — 17% no primeiro mês de venda, 42%
 * na metade do ano.
 */
function shapeComercial(mes: number): number {
  const inicio = PARAMS.comercial.inicio_vendas_mes
  if (mes < inicio) return 0
  const t = (mes - inicio + 1) / (MESES - inicio + 1)
  return Math.pow(t, PARAMS.comercial.expoente_maturacao)
}

/**
 * Teto de vendas próprias/mês do Assessor, já rampado.
 *
 * Três fatores multiplicam: a agenda de calls (38 × 20% = 7,6/mês), o quanto do
 * perfil é comercial e o tamanho da rede. Sem rede não há a quem vender, por
 * mais comercial que seja o perfil — por isso o network entra como multiplicador
 * e não como parcela.
 *
 * Estas vendas alimentam DUAS fontes: viram Self-sourced (Fonte 2) quando ele
 * opera, e Originação (Fonte 3) quando repassa. Por isso o nome é "vendas
 * próprias" e não "originação" — Originação é o nome da Fonte 3.
 */
function vendasPropriasMes(input: SimulacaoInput): number {
  const teto = PARAMS.comercial.calls_mes_max * PARAMS.comercial.conversao_call_venda
  return teto * input.pct_comercial * PARAMS.network[input.network_level].fator
}

/** Horas que ele mesmo consegue entregar por mês, em dedicação integral. */
function limiteHorasProprias(): number {
  return PARAMS.horas.limite_proprio
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
  const mixAloc = PARAMS.carteira.mix_alocacao.saber
  const mixSelf = PARAMS.carteira.mix_self.saber
  const linhas: Carteira[] = []

  // Histórico de Executar novos, para calcular os ativos com churn de 6 meses.
  const execNovosMatriz: number[] = [0]
  const execNovosSelf: number[] = [0]

  // Contratos são inteiros. Cada acumulador guarda a fração de um mês para o
  // seguinte, para que o total do ano não se perca no arredondamento.
  const accVendas      = criarAcumulador()
  const accSaberMatriz = criarAcumulador()
  const accSaberSelf   = criarAcumulador()
  const accSaberOrig   = criarAcumulador()

  // Os primeiros contratos entram como Saber (premissa da planilha): um
  // Executar isolado no início não cobre o próprio CSP.
  let contratosAteAgora = 0

  for (let mes = 1; mes <= MESES; mes++) {
    // 1) Carteira vigente antes das entradas deste mês.
    const desdeAtivos = Math.max(1, mes - executarDuracao() + 1)
    let ativosVigentes = 0
    for (let m = desdeAtivos; m < mes; m++) {
      ativosVigentes += (execNovosMatriz[m] ?? 0) + (execNovosSelf[m] ?? 0)
    }

    // 2) A matriz aloca seu pace, até encher o cap. O teto vale para a carteira
    //    inteira do mês — Saber entregue e Executar vigente contam igual, porque
    //    os dois consomem agenda.
    const espacoNoCap = Math.max(0, cap - ativosVigentes)
    const daMatriz = Math.min(PARAMS.carteira.matriz_pace[mes] ?? 0, espacoNoCap)

    // 3) O que ele consegue vender por conta própria neste mês, em contratos
    //    inteiros (a fração fica guardada para os meses seguintes).
    const vendasPotencial = accVendas(vendasPropriasMes(input) * shapeComercial(mes))

    // 4) Ele pode romper o cap por conta própria, até a tolerância — é decisão
    //    dele, assumindo o risco de qualidade e o custo do freela. O que passar
    //    disso é repassado e ele fica só com o CAC (Fonte 3).
    const tetoProprio = Math.floor(cap * PARAMS.carteira.tolerancia_self)
    const capacidadeLivre = Math.max(0, tetoProprio - ativosVigentes - daMatriz)

    // O que ele opera vira Self-sourced (Fonte 2); o que repassa, Originação (Fonte 3).
    const vendasOperadas  = Math.min(vendasPotencial, capacidadeLivre)
    const vendasRepassadas = vendasPotencial - vendasOperadas

    // 4) Reparte cada bloco entre Saber e Executar. Enquanto a carteira não
    //    passa dos primeiros contratos, tudo é Saber. Depois, o Saber acumula
    //    a fração do mix e o Executar leva o resto, para a soma bater.
    const repartir = (bloco: number, mix: number, acc: (v: number) => number): number => {
      const faltamSaber = Math.max(0, PARAMS.carteira.primeiros_saber - contratosAteAgora)
      const forcados = Math.min(bloco, faltamSaber)
      contratosAteAgora += bloco
      if (forcados >= bloco) return bloco
      return forcados + Math.min(bloco - forcados, acc((bloco - forcados) * mix))
    }

    const saber_novos_matriz    = repartir(daMatriz,         mixAloc, accSaberMatriz)
    const saber_novos_self      = repartir(vendasOperadas,   mixSelf, accSaberSelf)
    const saber_originados      = repartir(vendasRepassadas, mixSelf, accSaberOrig)
    const executar_novos_matriz = daMatriz          - saber_novos_matriz
    const executar_novos_self   = vendasOperadas    - saber_novos_self
    const executar_originados   = vendasRepassadas  - saber_originados

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

    const saberEntregues   = c.saber_novos_matriz + c.saber_novos_self
    const executarVigentes = c.executar_ativos_matriz + c.executar_ativos_self

    const csp_saber    = saberEntregues * S.csp_onetime
    const csp_executar = executarVigentes * E.csp_mes
    const csp_total    = csp_saber + csp_executar
    const overhead     = overheadDoMes(mes)

    const horas_alocadas =
      saberEntregues * PARAMS.horas.saber_onetime + executarVigentes * PARAMS.horas.executar_mes

    // Até o limite de horas ele entrega sozinho e o CSP é remuneração dele.
    // Acima disso precisa de freelancer: o CSP das horas excedentes deixa de
    // ficar com ele e vira desembolso, na linha de freelas + ferramentas.
    const horas_terceirizadas = Math.max(0, horas_alocadas - limiteHorasProprias())
    const csp_terceirizado = horas_alocadas > 0
      ? csp_total * (horas_terceirizadas / horas_alocadas)
      : 0
    const csp_proprio = csp_total - csp_terceirizado
    const freelas_total = overhead + csp_terceirizado

    const renda_liquida = receita_liquida - csp_total - overhead

    // O que fica com o Assessor: o CSP das horas que ele mesmo entregou, mais
    // o resultado do negócio.
    const remuneracao_total = renda_liquida + csp_proprio

    // O quanto falta para bancar a retirada mínima. Compara com a remuneração
    // total, não com o resultado — senão exigiria reserva para cobrir um custo
    // que ele não desembolsa.
    const deficit_retirada = Math.max(0, input.retirada_minima - remuneracao_total)

    // Retorno do investimento: acumula o que o negócio devolve ao Assessor
    // (remuneração total) contra a entrada. A retirada mínima NÃO entra aqui —
    // ela é fluxo de caixa pessoal dele, não custo do investimento, e já é
    // medida pelo eixo de reserva do termômetro.
    const fluxo_caixa = remuneracao_total
    caixa += fluxo_caixa

    linhas.push({
      mes, ...c,
      receita_saber_matriz, receita_saber_self,
      receita_executar_matriz, receita_executar_self,
      receita_originacao, receita_recebida,
      impostos, receita_liquida,
      csp_saber, csp_executar, csp_total, csp_proprio, csp_terceirizado,
      overhead, freelas_total, horas_alocadas, horas_terceirizadas,
      renda_liquida, remuneracao_total, deficit_retirada,
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
  const remuneracao_regime = regime.reduce((s, l) => s + l.remuneracao_total, 0) / MESES_REGIME
  const horas_regime = regime.reduce((s, l) => s + l.horas_alocadas, 0) / MESES_REGIME
  const faturamento_regime = regime.reduce((s, l) => s + l.receita_recebida, 0) / MESES_REGIME
  const horas_terceirizadas_regime =
    regime.reduce((s, l) => s + l.horas_terceirizadas, 0) / MESES_REGIME
  const horas_proprias_regime = horas_regime - horas_terceirizadas_regime

  // Mês de maior carga. `>` e não `>=` para que um platô no fim do ano reporte
  // o mês em que a carga chegou lá, não o M12 por acidente de ordenação.
  const pico = projecao.reduce((a, l) => (l.horas_alocadas > a.horas_alocadas ? l : a), projecao[0])

  const deficit_retirada_total = projecao.reduce((s, l) => s + l.deficit_retirada, 0)

  // Caixa do Assessor no período: cada mês entrega a remuneração total (o CSP
  // das horas dele mais o resultado) e consome a retirada mínima. Enquanto a
  // operação não alcança a retirada, a parcela é negativa e come a reserva;
  // depois vira positiva. A soma dos 12 meses diz onde o ano fecha.
  const geracao_caixa_periodo =
    projecao.reduce((s, l) => s + l.remuneracao_total, 0) - input.retirada_minima * MESES
  const mes_autossuficiencia = projecao.find(l => l.deficit_retirada === 0)?.mes ?? null

  return {
    renda_regime,
    remuneracao_regime,
    faturamento_regime,
    remuneracao_total_ano: projecao.reduce((s, l) => s + l.remuneracao_total, 0),
    horas_regime,
    horas_proprias_regime,
    horas_terceirizadas_regime,
    ocupacao_horas: horas_regime / limiteHorasProprias(),
    mes_pico: pico.mes,
    horas_pico: pico.horas_alocadas,
    horas_pico_proprias: pico.horas_alocadas - pico.horas_terceirizadas,
    horas_pico_terceirizadas: pico.horas_terceirizadas,
    csp_terceirizado_ano: projecao.reduce((s, l) => s + l.csp_terceirizado, 0),
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
    geracao_caixa_periodo,
    mes_autossuficiencia,
  }
}

// ─── Termômetro ──────────────────────────────────────────────────────────────

function nivelMaior(v: number, verde: number, amarelo: number): ViabilidadeNivel {
  return v >= verde ? 'verde' : v >= amarelo ? 'amarelo' : 'vermelho'
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

  // Compara a meta com o faturamento em REGIME, não com o M12 isolado — senão o
  // veredito do termômetro depende de em qual mês caiu o último Saber.
  const meta_ratio = input.meta_faturamento > 0
    ? kpis.faturamento_regime / input.meta_faturamento
    : 0
  const meta_nivel = nivelMaior(
    meta_ratio,
    PARAMS.termometro.meta_ratio.verde,
    PARAMS.termometro.meta_ratio.amarelo,
  )

  const nivel_final = [reserva_nivel, meta_nivel]
    .reduce((pior, n) => (PRIORIDADE[n] > PRIORIDADE[pior] ? n : pior), 'verde' as ViabilidadeNivel)

  return { reserva_ratio, reserva_nivel, meta_ratio, meta_nivel, nivel_final }
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

  return { schema: SIMULACAO_SCHEMA, input, projecao, kpis, termometro, mix_m12 }
}
