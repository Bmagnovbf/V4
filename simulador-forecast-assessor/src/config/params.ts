// src/config/params.ts — Simulador de Forecast · Assessor V4
//
// Fonte de verdade de todos os benchmarks. Para atualizar: editar este arquivo
// → push para o GitHub → Vercel faz deploy em ~1 minuto. NÃO editar via UI.
//
// Origem dos números: planilha "ASSESSOR V4 · DRE PROJETADO 12 MESES".
// Onde a planilha e o doc/deck divergiam, vale a planilha (decisão de ago/2026).
//
// Legenda:
//   ✅ DRE       — valor lido direto da planilha
//   🟡 DECIDIDO  — decisão tomada fora da planilha
//   🔴 CALIBRADO — constante que não existe na planilha; ajustada para o motor
//                  generativo reproduzir os cenários Base e Upside

export const PARAMS = {

  // ─── Entrada na rede ─────────────────────────────────────────────────────
  entrada: {
    a_vista:          20_000,  // ✅ vira crédito integral no upgrade para franquia
    parcela_valor:     1_700,  // 🟡 deck: "de R$ 25.000 · 12x R$ 1.700"
    parcelas:             12,  // 🟡
  },

  // ─── Produtos ────────────────────────────────────────────────────────────
  // Ter e Potencializar ficam fora do escopo do Assessor (decisão de ago/2026).
  produtos: {
    saber: {
      ticket:        12_000,  // ✅ ticket do Assessor (contas pequenas/médias)
      split_matriz:    0.30,  // ✅ Fonte 1 — R$ 3.600 por projeto
      split_self:      0.80,  // ✅ Fonte 2 — R$ 9.600 por projeto
      csp_onetime:    1_500,  // ✅ Custo de Serviço Prestado, no mês da entrega
    },
    executar: {
      ticket:         3_500,  // ✅ MRR
      split_matriz:    0.35,  // ✅ Fonte 1 — R$ 1.225/mês
      split_self:      0.80,  // ✅ Fonte 2 — R$ 2.800/mês
      csp_mes:        1_000,  // ✅ por projeto ativo, por mês
      duracao_meses:      6,  // ✅ contrato médio; depois sai (churn)
    },
  },

  // ─── Fonte 3 — originação sem operação ───────────────────────────────────
  // O Assessor vende um cliente que ele não vai operar e recebe o CAC daquele
  // cliente. O CAC É definido como 15% do deal no Saber e 2× o MRR no Executar
  // — não são duas alternativas, é a mesma regra. Pagamento one-time, no mês
  // da originação. Não gera CSP, porque ele não entrega.
  originacao: {
    saber_pct_ticket:   0.15,  // ✅ 15% × R$ 12.000 = R$ 1.800, no mês da venda
    executar_mult_mrr:     2,  // ✅ 2 × R$ 3.500 = R$ 7.000
    // O CAC do Executar sai em duas parcelas, acompanhando o pagamento do
    // cliente: 1 MRR no mês da venda e 1 MRR no mês seguinte.
    executar_parcelas:     2,  // ✅
  },

  // ─── Impostos ────────────────────────────────────────────────────────────
  impostos: {
    simples: 0.06,  // ✅ sobre a receita recebida
  },

  // ─── Freelancers + ferramentas (overhead adicional ao CSP) ───────────────
  overhead: [
    { ate_mes:  4, valor: 1_000 },  // ✅ M1–M4
    { ate_mes:  8, valor: 1_500 },  // ✅ M5–M8
    { ate_mes: 99, valor: 2_000 },  // ✅ M9 em diante
  ] as readonly { ate_mes: number; valor: number }[],

  // ─── Carteira ────────────────────────────────────────────────────────────
  carteira: {
    // Teto de projetos ativos simultâneos com dedicação integral.
    cap_ativos_integral: 15,     // ✅ carteira do M12 nos dois cenários
    cap_ativos_parcial:   8,     // 🔴 dedicação parcial
    // Abaixo deste % operacional a capacidade de operar cai proporcionalmente:
    //   cap = cap_base × min(1, pct_operacional ÷ pct_operacional_ref)
    // Os dois cenários do DRE ficam em 63% e 55% operacional, então ambos
    // seguem com capacidade cheia. Um perfil 70/30 comercial cai para ~8
    // projetos, e o que ele originar acima disso vira Fonte 3.
    pct_operacional_ref: 0.55,   // 🔴
    // Rampa de contratos NOVOS por mês — extraída do cenário Base da planilha
    // (soma matriz + self de Saber e Executar). Índice 1 = M1 … 12 = M12.
    ramp_novos: [0, 1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 6, 7] as readonly number[],  // ✅
    // Mix de produto nos contratos novos. Base do DRE: 34 Saber / 15 Executar.
    mix_produto: { saber: 0.70, executar: 0.30 },  // ✅ ≈ 69/31 na planilha
  },

  // ─── Originação própria do Assessor ──────────────────────────────────────
  comercial: {
    // Mês em que ele passa a originar. Antes disso está na Trilha (Imersão +
    // Vivência + Banca) e ainda não tem selo — 100% da carteira vem da matriz.
    inicio_originacao_mes: 4,   // ✅ Base começa self no M5, Upside no M4
    // Teto de vendas de um Assessor 100% comercial, já rampado (M12).
    // Premissa da operação: um closer no talo toca 35–40 calls novas/mês e
    // converte 20% de reunião realizada em venda → 7–8 vendas/mês.
    // O comercial não tem teto operacional; quem tem é o operador (cap_ativos).
    calls_mes_max:          38,   // 🟡 capacidade de calls novas/mês
    conversao_call_venda: 0.20,   // 🟡 reunião realizada → venda
  },

  // ─── Thresholds do Termômetro ────────────────────────────────────────────
  // O breakeven operacional é M1 nos dois cenários — a viabilidade do Assessor
  // não é margem, é fôlego: ele precisa atravessar M1–M4 com renda baixa.
  termometro: {
    reserva_ratio:  { verde: 1.5, amarelo: 1.0 },  // 🔴 reserva ÷ pior caixa acumulado
    payback_meses:  { verde: 6,   amarelo: 9   },  // 🔴 Base = M6, Upside = M5
    meta_ratio:     { verde: 1.0, amarelo: 0.7 },  // 🔴 renda projetada ÷ meta declarada
  },

} as const

export type ParamsType = typeof PARAMS
