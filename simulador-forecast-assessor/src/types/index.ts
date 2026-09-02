// ─────────────────────────────────────────────────────────────────────────────
// Domínio do Simulador de Forecast — Assessor V4
//
// O Assessor não é franqueado: sem unidade, sem equipe, sem horizontes H1–H5.
// É um PJ credenciado que monetiza dois produtos por três fontes.
//
//   Produtos       Saber (R$ 12K one-time) · Executar (R$ 3,5K/mês, 6 meses)
//
//   Fonte 1 — ALOCAÇÃO      a matriz fecha o cliente e envia para ele operar
//                           Saber 30% · Executar 35%
//   Fonte 2 — SELF-SOURCED  ele traz o cliente e ele mesmo opera
//                           80% (paga 20% de royalty)
//   Fonte 3 — ORIGINAÇÃO    ele traz o cliente, outro da rede opera
//                           CAC one-time, sem CSP
//
// Mapeamento código ↔ negócio:
//   sufixo `_matriz`      → Fonte 1 · Alocação
//   sufixo `_self`        → Fonte 2 · Self-sourced
//   sufixo `_originados`  → Fonte 3 · Originação
//
// "Vendas próprias" (no calculator) é a capacidade de trazer cliente, que
// alimenta as Fontes 2 e 3 — não confundir com a Fonte 3, cujo nome é
// Originação.
//
// O teto de projetos (`carteira.cap_ativos_integral`) trava a Fonte 1: a matriz
// para de alocar quando a carteira chega lá. Ele pode passar disso vendendo por
// conta própria.
// ─────────────────────────────────────────────────────────────────────────────

export type Dedicacao = 'integral' | 'parcial'

export type NetworkLevel = 'baixo' | 'medio' | 'alto'

export type ViabilidadeNivel = 'verde' | 'amarelo' | 'vermelho'

export interface SimulacaoInput {
  /** Meta de faturamento mensal (receita recebida, antes de impostos) no M12. */
  meta_faturamento: number
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
  /** CSP de todas as horas de entrega do mês, próprias e terceirizadas. */
  csp_total: number
  /** Parte do CSP que remunera as horas dele — entra na Remuneração Total. */
  csp_proprio: number
  /** Parte do CSP acima do limite de horas — vira desembolso com freelancer. */
  csp_terceirizado: number
  /** Overhead fixo do mês (ferramentas e apoio genérico). */
  overhead: number
  /** Freelas + ferramentas: overhead fixo mais o CSP terceirizado. */
  freelas_total: number
  /** Horas de entrega estimadas no mês. */
  horas_alocadas: number
  /** Horas acima do limite que ele consegue entregar sozinho. */
  horas_terceirizadas: number
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
  /** Receita recebida em regime — média dos 3 últimos meses. */
  faturamento_regime: number
  remuneracao_total_ano: number
  /** Horas de entrega em regime — média dos 3 últimos meses. */
  horas_regime: number
  /** Ocupação do limite de horas próprias, em regime. */
  ocupacao_horas: number
  /** CSP que foi para freelancer no ano, por estouro de horas. */
  csp_terceirizado_ano: number
  renda_liquida_m12: number
  renda_liquida_ano1: number
  renda_media_mes: number
  receita_recebida_ano1: number
  projetos_ativos_m12: number
  breakeven_mes: number | null
  payback_mes: number | null
  /**
   * Pior retorno acumulado: a entrada, amortizada pela remuneração de cada mês.
   * Base do payback. Não desconta a retirada mínima — essa é fluxo de caixa
   * pessoal, medida à parte pelo `deficit_retirada_total`.
   */
  pior_caixa: number
  investimento_total: number
  /** Soma do que falta para bancar a retirada mínima. NÃO inclui a entrada. */
  deficit_retirada_total: number
  /** Primeiro mês em que a renda líquida cobre a retirada mínima. */
  mes_autossuficiencia: number | null
}

/**
 * Termômetro de viabilidade — dois eixos.
 *
 * O payback ficou de fora de propósito: com a entrada baixa, ele cai entre M4 e
 * M6 em todo o espaço de inputs e não separa cenário bom de ruim. Segue exibido
 * como KPI, mas como informação de apoio, não como critério.
 */
export interface Termometro {
  /** Reserva declarada ÷ o que falta para bancar a retirada mínima. */
  reserva_ratio: number
  reserva_nivel: ViabilidadeNivel
  /** Faturamento em regime ÷ meta declarada. */
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
