// src/config/params.ts
// Para atualizar: editar este arquivo → push para GitHub → Vercel faz deploy em ~1 minuto
// NÃO editar via UI — este arquivo é a fonte de verdade de todos os benchmarks

export const PARAMS = {

  // ─── Horizontes (fat. bruto máximo) ──────────────────────────────────────
  horizontes: {
    H1: 60_000,
    H2: 150_000,
    H3: 450_000,
  },

  // ─── Deduções sobre faturamento bruto ────────────────────────────────────
  deducoes: {
    royalties:     0.20,   // 20% sobre fat. bruto
    impostos:      0.072,  // 7,2% Simples Nacional sobre fat. bruto
    // coef_liq_base = 1 − 0,20 − 0,072 = 0,728
    inadimplencia: 0.04,   // 4% — aplicado a partir de M4
  },

  // ─── Mix de tiers por horizonte ──────────────────────────────────────────
  mix_tiers: {
    H1: { tiny: 0.60, small: 0.30, medium: 0.10 },
    H2: { tiny: 0.60, small: 0.25, medium: 0.15 },
    H3: { tiny: 0.55, small: 0.30, medium: 0.15 },
  },

  // ─── Tickets médios por produto e tier (R$) ──────────────────────────────
  tickets: {
    saber: {
      tiny:   18_200,
      small:  19_589,
      medium: 21_027,
    },
    ter: {
      tiny:   2_900,
      small:  3_500,
      medium: 6_000,
    },
    executar: {
      medium: 5_500,  // exclusivo Medium+
    },
    ter_pontual: 3_000,
  },

  // ─── Mix de aquisição (receita: 80% Saber / 20% Executar) ────────────────
  // Ter Pontual é expansão, não aquisição
  mix_aquisicao: {
    saber:    0.80,
    executar: 0.20,
  },

  // ─── Regra 75/25 no M12 ──────────────────────────────────────────────────
  // 75% da meta = aquisição (Saber + Executar novos + expansão Ter) naquele mês
  // 25% da meta = MRR retido de Executar acumulado
  mix_receita_m12: {
    aquisicao: 0.75,
    retencao:  0.25,
  },

  // ─── Upsell e recorrência ────────────────────────────────────────────────
  upsell: {
    upsell_rate_regime:       0.40,   // Path B: 40% dos Medium Saber → Executar no mês seguinte
    modifier_solida_pp:       0.10,   // +10 pp com experiência Prática Sólida
    pct_expansao_ter:         0.10,   // 10% da base ativa compra Ter Pontual/mês (a partir de M3)
    renovacao_executar:       0.85,   // 85% renovam a cada 6 meses (15% churn na renovação)
    threshold_churn_executar: 40_000, // Trava: churn só aplicado acima deste valor de receita Executar
  },

  // ─── Canais de aquisição ─────────────────────────────────────────────────
  canais: {
    inbound: {
      conversao: {
        tiny:   0.10,
        small:  0.13,
        medium: 0.09,
      },
      cpmql: {
        tiny:   567.67,
        small:  582.96,
        medium: 825.60,
      },
    },
    outbound: {
      conversao: 0.03,  // taxa de conversão lead → venda
    },
    bdr: {
      custo:        2_500,  // R$/mês por BDR contratado
      leads_por_bdr:  400,  // capacidade de leads outbound por BDR/mês
    },
    trigger_outbound_ratio: 0.25,
  },

  // ─── Curva de ramp-up mensal (índice 1 = M1 … índice 12 = M12) ──────────
  // Derivado dos pesos trimestrais: Q1=15% Q2=25% Q3=28% Q4=32% do volume anual
  // Interpolação linear dentro de cada trimestre; M12 = 1,0 (âncora)
  // Verificação: soma dos fatores ≈ 9,376 → M12 = 10,67% do volume anual ✓
  ramp_up: [
    0,      // índice 0 não utilizado
    0.350,  // M1  ┐
    0.469,  // M2  ├ Q1 — 15% do anual (avg 0,469)
    0.588,  // M3  ┘
    0.765,  // M4  ┐
    0.781,  // M5  ├ Q2 — 25% do anual (avg 0,781)
    0.797,  // M6  ┘
    0.813,  // M7  ┐
    0.875,  // M8  ├ Q3 — 28% do anual (avg 0,875)
    0.938,  // M9  ┘
    1.000,  // M10 ┐
    1.000,  // M11 ├ Q4 — 32% do anual (avg 1,000) — velocidade de cruzeiro
    1.000,  // M12 ┘
  ] as readonly number[],

  // ─── Crescimento pós-M12 ─────────────────────────────────────────────────
  crescimento_pos_m12: 0.06,  // 6% ao mês (composto)

  // ─── MQLs orgânicos por nível de rede ────────────────────────────────────
  network: {
    baixo: { total_mqls: 10, periodo_meses: 3 },
    medio: { total_mqls: 30, periodo_meses: 4 },
    alto:  { total_mqls: 50, periodo_meses: 6 },
  },

  // ─── Estrutura de custos — piso mínimo (R$/mês) ──────────────────────────
  // Custo efetivo = max(custo_minimo, fat_liq × proporcao)
  custos_minimos: {
    csp:              14_600,
    broker:           15_000,  // piso obrigatório (Fase 1 e Fase 2)
    comercial_equipe:  6_000,
    ga:                9_000,
  },

  // ─── Estrutura de custos — proporcional ao fat. líquido ──────────────────
  // Margem Bruta implícita em regime: 1 − 0,35 = 65%
  // Margem EBITDA implícita em regime: 1 − 0,35 − 0,11 − 0,18 − 0,16 = 20%
  proporcoes: {
    csp:              0.35,
    broker:           0.16,
    comercial_equipe: 0.11,
    ga:               0.18,
  },

  // ─── CAPEX e investimento inicial (R$) ───────────────────────────────────
  capex: {
    franquia:          100_000,
    escritorio_baixo:  100_000,
    escritorio_alto:   200_000,
    escritorio_ref:    150_000,
    limiar_postergar_escritorio: 350_000,
  },

  // ─── Headcount por horizonte (equipe base — BDRs são adicionados dinamicamente) ──
  headcount: {
    H1: { csp:  4, comercial: 2, ga: 1, total:  7 },
    H2: { csp: 10, comercial: 3, ga: 3, total: 16 },
    H3: { csp: 25, comercial: 6, ga: 5, total: 36 },
  },

  // ─── Ineficiência de onboarding M1–M3 ────────────────────────────────────
  // Time inexperiente no modelo V4: acima do limiar saudável de novos clientes/mês
  // o CSP sobe para refletir retrabalho, menor eficiência e suporte extra necessário.
  onboarding: {
    limiar_novos_clientes:     5,    // máximo saudável de novos clientes/mês sem penalidade
    penalidade_meses:          3,    // duração do período de ineficiência (M1, M2, M3)
    multiplicador_csp_excesso: 0.20, // +20% de custo CSP por cliente extra acima do limiar
  },

  // ─── Thresholds do Termômetro de Viabilidade ─────────────────────────────
  termometro: {
    capital_ratio: { verde: 1.5, amarelo: 1.0 },
    payback_meses: { verde: 18,  amarelo: 24  },
  },

} as const

export type ParamsType = typeof PARAMS
