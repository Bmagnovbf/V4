export type Horizonte = 'H1' | 'H2' | 'H3' | 'H4+'

export type Tier = 'tiny' | 'small' | 'medium'

export type NetworkLevel = 'baixo' | 'medio' | 'alto'

export type Experiencia = 'teorico' | 'solida'

export type ViabilidadeNivel = 'verde' | 'amarelo' | 'vermelho'

export interface SimulacaoInput {
  meta_fat_bruto: number
  capital_disponivel: number
  network_level: NetworkLevel
  network_tier: Tier
  experiencia: Experiencia
  // Ponto 1: tickets editáveis (fallback para PARAMS quando ausente)
  ticket_saber_tiny?: number
  ticket_saber_small?: number
  ticket_saber_medium?: number
  ticket_ter_tiny?: number
  ticket_ter_small?: number
  ticket_ter_medium?: number
  ticket_executar_medium?: number
  // Ponto 2: conversão MQL→Venda editável (decimal, ex: 0.10 = 10%)
  conversao_mql_tiny?: number
  conversao_mql_small?: number
  conversao_mql_medium?: number
}

export interface MetricasBlended {
  ticket_saber: number
  ticket_ter: number
  conversao: number
  cpmql: number
}

export interface PLMensal {
  mes: number
  fat_bruto: number
  receita_aquisicao: number      // Saber + Executar novos (1ª mensalidade) + Ter expansion
  receita_executar: number       // MRR retido de Executar (cohorts anteriores)
  receita_ter_expansao: number   // Ter Pontual separado para gráfico (incluso em receita_aquisicao)
  receita_liquida: number
  novos_saber: number
  base_executar: number          // Contagem de clientes Executar em retenção (cohorts M1..M-1)
  novos_executar: number         // Novo cohort Executar neste mês (acq + upsell)
  mqls_inbound: number
  mqls_outbound: number
  custo_csp: number
  custo_comercial: number        // Equipe comercial base
  custo_ga: number
  custo_broker: number           // Investimento em broker
  custo_bdr: number              // Custo BDRs adicionais (outbound overflow)
  bdr_count: number              // Quantidade de BDRs necessários
  ebitda: number
  ebitda_acumulado: number
}

export interface EsforcoAquisicao {
  novos_clientes_saber_mes: number
  mqls_inbound_mes: number
  broker_mes: number
  broker_ano: number
  broker_ratio: number
  mqls_outbound_mes: number
  novos_executar_mes: number
  base_executar_regime: number
  receita_executar_regime: number
  receita_ter_expansao_regime: number
  show_outbound_card: boolean
  bdr_mes_m12: number            // BDRs necessários no M12
  custo_bdr_mes_m12: number      // Custo BDRs no M12
}

export interface KPIs {
  breakeven_mes: number | null
  payback_mes: number | null
  roic: number
  capital_minimo: number
  capital_total_investido: number
  deficit_acumulado: number
  capital_disponivel_efetivo: number
  postergar_escritorio: boolean
  margem_bruta_m12: number       // (fat_liq − CSP) / fat_liq, média M6–M12
  margem_ebitda_m12: number      // ebitda / fat_liq, média M6–M12
  roas: number
  broker_acumulado_m12: number
}

export interface Termometro {
  capital_ratio: number
  capital_nivel: ViabilidadeNivel
  payback_nivel: ViabilidadeNivel
  nivel_final: ViabilidadeNivel
}

export interface HeadcountHorizonte {
  csp: number
  comercial: number
  ga: number
  total: number
}

export interface AlocacaoM12 {
  custo_csp: number
  custo_comercial: number
  custo_ga: number
  custo_broker: number
  custo_bdr: number
  ebitda: number
  fat_liq: number
}

export interface SimulacaoResult {
  input: SimulacaoInput
  horizonte: Horizonte
  blended: MetricasBlended
  projecao: PLMensal[]
  esforco: EsforcoAquisicao
  kpis: KPIs
  termometro: Termometro
  headcount: HeadcountHorizonte
  alocacao_m12: AlocacaoM12
}
