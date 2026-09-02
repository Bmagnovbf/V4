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
  // A forma de pagamento (à vista ou 12x) não altera a projeção: a matriz
  // atribui clientes no mesmo pace de qualquer jeito. Por isso não é input.
  entrada: {
    a_vista:          20_000,  // ✅ vira crédito integral no upgrade para franquia
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

  // ─── Fonte 3 · Originação — ele traz o cliente, outro da rede opera ───────
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

  // ─── Carga horária de entrega ────────────────────────────────────────────
  // O CSP é o pagamento pelas horas que o próprio Assessor entrega. Estas são
  // as horas por trás dele.
  horas: {
    saber_onetime:  42,   // ✅ horas para entregar um Saber, no mês da entrega
    executar_mes:   12,   // ✅ horas/mês por Executar ativo, enquanto vigente
    // Acima deste limite ele não dá conta sozinho: o CSP das horas excedentes
    // deixa de ser remuneração dele e vira desembolso com freelancer.
    limite_proprio: 190,  // ✅
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
    cap_ativos_integral: 13,     // ✅ teto para a matriz repassar
    cap_ativos_parcial:   6,     // 🔴 dedicação parcial
    // Meia dedicação também vende menos: menos agenda para prospectar.
    fator_vendas_parcial: 0.5,   // 🔴
    // Abaixo deste % operacional a capacidade de operar cai proporcionalmente:
    //   cap = cap_base × min(1, pct_operacional ÷ pct_operacional_ref)
    // Os dois cenários do DRE ficam em 63% e 55% operacional, então ambos
    // seguem com capacidade cheia. Um perfil 70/30 comercial cai para ~8
    // projetos, e o que ele originar acima disso vira Fonte 3.
    pct_operacional_ref: 0.55,   // 🔴
    // A matriz PARA de atribuir quando a carteira atinge o cap. O Assessor
    // pode continuar vendendo por conta própria e romper o limite — até esta
    // tolerância, assumindo o risco de qualidade. Acima dela, repassa (Fonte 3).
    tolerancia_self: 1.2,        // 🔴 15 → opera até 18 por conta própria
    // Pace de atribuição da matriz — clientes que a rede entrega ao Assessor
    // para operar (Fonte 1). Independe da forma de pagamento e do perfil: é o
    // compromisso da rede. Sobe de 1 para 2 quando ele já provou entrega.
    matriz_pace: [0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3] as readonly number[],  // ✅
    // Mix de produto nos contratos novos. Base do DRE: 34 Saber / 15 Executar.
    // Mix de produto. São decisões de agentes diferentes: a matriz escolhe o
    // que aloca, o Assessor escolhe o que vende.
    //   Alocação — 40/60, pesando no Executar: ele rende 19% mais por hora,
    //   empilha e entrega mais remuneração ao Assessor puramente operacional.
    //   Não vamos a 30/70 porque ali a carteira encosta em 186h, sem folga
    //   antes das 190h em que passa a exigir freelancer.
    //   Vendas próprias — 70/30, como na planilha.
    mix_alocacao: { saber: 0.40, executar: 0.60 },  // 🟡
    mix_self:     { saber: 0.70, executar: 0.30 },  // ✅ ≈ 69/31 na planilha
    // Premissa da planilha: "os 5 primeiros Saber, o 6º Executar". Faz sentido
    // operacional — um Executar isolado no início não cobre o próprio CSP.
    primeiros_saber: 5,  // ✅
  },

  // ─── Rede de relacionamento do Assessor ──────────────────────────────────
  // Mesma pergunta do simulador da franquia. Multiplica a capacidade de venda
  // própria: sem rede não há a quem vender, por mais comercial que seja o
  // perfil. Essas vendas alimentam a Fonte 2 (quando ele opera) e a Fonte 3
  // (quando repassa).
  network: {
    baixo: { fator: 0.5, empresas: 10 },  // 🔴
    medio: { fator: 1.0, empresas: 30 },  // 🔴
    alto:  { fator: 1.5, empresas: 50 },  // 🔴
  },

  // ─── Vendas próprias do Assessor ─────────────────────────────────────────
  comercial: {
    // Mês em que ele passa a vender. Antes disso está na Trilha (Imersão +
    // Vivência + Banca) e ainda não tem selo — 100% da carteira vem da matriz.
    inicio_vendas_mes: 4,       // ✅ Base começa self no M5, Upside no M4
    // Forma da rampa comercial. Abaixo de 1 a curva é côncava: ele sai da Banca
    // com a rede já aquecida e não começa do zero absoluto.
    expoente_maturacao: 0.8,    // 🔴
    // Teto de vendas de um Assessor 100% comercial, já rampado (M12).
    // Premissa da operação: um closer no talo toca 35–40 calls novas/mês e
    // converte 20% de reunião realizada em venda → 7–8 vendas/mês.
    // O comercial não tem teto operacional; quem tem é o operador (cap_ativos).
    calls_mes_max:          38,   // 🟡 capacidade de calls novas/mês
    conversao_call_venda: 0.20,   // 🟡 reunião realizada → venda
  },

  // ─── Thresholds do Termômetro ────────────────────────────────────────────
  // O breakeven operacional é M1 em todos os cenários — a viabilidade do
  // Assessor não é margem, é fôlego para atravessar os primeiros meses.
  //
  // O payback não entra: com a entrada baixa ele cai entre M4 e M6 em todo o
  // espaço de inputs e não separa cenário bom de ruim. Segue como KPI de apoio.
  termometro: {
    reserva_ratio: { verde: 1.5, amarelo: 1.0 },  // 🔴 reserva ÷ déficit de retirada
    meta_ratio:    { verde: 1.0, amarelo: 0.7 },  // 🔴 remuneração em regime ÷ meta
  },

} as const

export type ParamsType = typeof PARAMS
