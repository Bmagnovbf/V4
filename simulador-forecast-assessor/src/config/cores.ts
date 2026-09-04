// ─────────────────────────────────────────────────────────────────────────────
// Cor de cada fonte de receita.
//
// Um único lugar porque a cor é a ligação entre dois blocos da tela: o título
// do card e a faixa dela no gráfico de área. Se as duas definições morassem em
// arquivos diferentes, uma mudança em uma delas quebraria a leitura sem quebrar
// nada no build.
//
// Os tons são mais fechados do que um vermelho/amarelo/laranja puros porque o
// mesmo valor precisa servir a dois usos com exigências opostas: no gráfico é
// área grande (onde o `fillOpacity` clareia e a cor volta a ler como a cor
// nomeada) e no card é texto pequeno em negrito sobre branco, que a versão
// vívida deixaria ilegível — um amarelo puro fica em 1,7:1 de contraste.
// ─────────────────────────────────────────────────────────────────────────────

export const COR_FONTE = {
  /** Fonte 1 · Alocação — vermelho. Contraste 6,5:1 sobre branco. */
  alocacao:     '#C00000',
  /** Fonte 2 · Self-sourced — amarelo. Contraste 3,8:1. */
  self_sourced: '#A67C00',
  /** Fonte 3 · Originação — laranja. Contraste 4,6:1. */
  originacao:   '#C0560A',
} as const

/** Opacidade das faixas empilhadas: clareia o tom sem apagar a diferença. */
export const AREA_OPACIDADE = 0.7
