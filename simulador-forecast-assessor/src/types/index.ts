// ─────────────────────────────────────────────────────────────────────────────
// Domínio do Simulador de Forecast — Assessor V4
//
// O Assessor não é franqueado: sem unidade, sem equipe, sem horizontes H1–H5.
// É um PJ credenciado que monetiza dois produtos por três fontes.
//
//   Produtos       Saber (R$ 12K one-time) · Executar (R$ 3,5K/mês, 6 meses)
//
//   Fonte 1 — ALOCAÇÃO      matriz origina, ele opera    Saber 30% · Executar 35%
//   Fonte 2 — SELF-SOURCED  ele origina e opera          80% (20% royalty)
//   Fonte 3 — ORIGINAÇÃO    ele origina, outro opera     CAC one-time
//
// Mecânica da Fonte 3: o que ele origina ALÉM da própria capacidade de operar
// transborda — recebe o CAC sem tocar a entrega.
// ─────────────────────────────────────────────────────────────────────────────

export type Dedicacao = 'integral' | 'parcial'

export type NetworkLevel = 'baixo' | 'medio' | 'alto'

export type ViabilidadeNivel = 'verde' | 'amarelo' | 'vermelho'

export interface SimulacaoInput {
  /** Meta de renda líquida mensal (pró-labore) no mês 12. */
  meta_renda_liquida: number
  /** Quanto ele precisa retirar por mês enquanto não atinge o objetivo. */
  retirada_minima: number
  /** Reserva de capital de giro para cobrir a retirada até a renda alcançá-la. */
  reserva_capital: number
  /** Perfil: 0 = 100% operacional, 1 = 100% comercial. */
  pct_comercial: number
  dedicacao: Dedicacao
  /** Tamanho da rede de relacionamento — multiplica a originação própria. */
  network_level: NetworkLevel
}

/** Contagem de contratos movimentados no mês. */
export interface Carteira {
  saber_novos_matriz: number
  saber_novos_self: number
  executar_novos_matriz: number
  executar_novos_self: number
  executar_ativos_matriz: number
  executar_ativos_self: number
  /** Contratos originados que ele NÃO opera (Fonte 3). */
  saber_originados: number
  executar_originados: number
  /** Projetos ativos no mês = Saber entregues + Executar vigentes. */
  total_ativos: number
  /** Ocupação da capacidade operacional (0–1+). */
  ocupacao: number
}

export interface PLMensal extends Carteira {
  mes: number
  receita_saber_matriz: number
  receita_saber_self: number
  receita_executar_matriz: number
  receita_executar_self: number
  receita_originacao: number
  /** Total das 3 fontes, já líquido do split/royalty. */
  receita_recebida: number
  impostos: number
  receita_liquida: number
  csp_saber: number
  csp_executar: number
  /** Custo de Serviço Prestado (CSP) — soma das duas linhas acima. */
  csp_total: number
  overhead: number
  /** Horas de entrega estimadas no mês. */
  horas_alocadas: number
  /** Resultado do negócio, depois de remunerar as horas de entrega. */
  renda_liquida: number
  /**
   * Remuneração total do Assessor no mês: o CSP (pagamento das horas que ele
   * mesmo entrega) somado ao resultado do negócio. É o que de fato fica com
   * ele — o CSP não é desembolso, é trabalho próprio.
   */
  remuneracao_total: number
  /** Quanto falta da remuneração total para bancar a retirada mínima. */
  deficit_retirada: number
  fluxo_caixa: number
  caixa_acumulado: number
}

export interface KPIs {
  /**
   * Renda em regime — média dos 3 últimos meses.
   *
   * O M12 isolado não serve como indicador: com contratos inteiros, um Saber
   * de R$ 9.600 caindo ou não naquele mês muda o número em quase 50%. A média
   * dos M10–M12 alisa esse serrilhado sem esconder a tendência.
   */
  renda_regime: number
  /** Remuneração total em regime — média dos 3 últimos meses. */
  remuneracao_regime: number
  remuneracao_total_ano: number
  /** Horas de entrega em regime — média dos 3 últimos meses. */
  horas_regime: number
  /** Ocupação da jornada de referência em regime. */
  ocupacao_horas: number
  renda_liquida_m12: number
  renda_liquida_ano1: number
  renda_media_mes: number
  receita_recebida_ano1: number
  projetos_ativos_m12: number
  breakeven_mes: number | null
  payback_mes: number | null
  /** Pior caixa acumulado, já contando a entrada — base do payback. */
  pior_caixa: number
  investimento_total: number
  /** Soma do que falta para bancar a retirada mínima. NÃO inclui a entrada. */
  deficit_retirada_total: number
  /** Primeiro mês em que a renda líquida cobre a retirada mínima. */
  mes_autossuficiencia: number | null
}

export interface Termometro {
  reserva_ratio: number
  reserva_nivel: ViabilidadeNivel
  payback_nivel: ViabilidadeNivel
  meta_ratio: number
  meta_nivel: ViabilidadeNivel
  nivel_final: ViabilidadeNivel
}

export interface MixFontesM12 {
  alocacao: number
  self_sourced: number
  originacao: number
}

export interface SimulacaoResult {
  input: SimulacaoInput
  projecao: PLMensal[]
  kpis: KPIs
  termometro: Termometro
  mix_m12: MixFontesM12
}
