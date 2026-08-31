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

export type FormaPagamento = 'a_vista' | 'parcelado'

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
  forma_pagamento: FormaPagamento
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
  overhead: number
  /** Pró-labore do mês. */
  renda_liquida: number
  /** Quanto falta da renda para bancar a retirada mínima (0 quando cobre). */
  deficit_retirada: number
  /** Parcela da entrada, quando parcelada (não entra na renda líquida). */
  parcela_entrada: number
  fluxo_caixa: number
  caixa_acumulado: number
}

export interface KPIs {
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
