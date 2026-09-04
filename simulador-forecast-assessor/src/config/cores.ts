// ─────────────────────────────────────────────────────────────────────────────
// Cor de cada fonte de receita.
//
// Um único lugar porque a cor é a ligação entre dois blocos da tela: o título
// do card e a faixa dela no gráfico de área. Se as duas definições morassem em
// arquivos diferentes, uma mudança em uma delas quebraria a leitura sem quebrar
// nada no build.
//
// Os tons são mais fechados do que um vermelho/amarelo/laranja puros porque o
// mesmo valor precisa servir a dois usos com exigências opostas. No card a cor
// é FUNDO de selo, com o texto em branco por cima — e fundo de texto branco
// precisa ser escuro. No gráfico é área grande, e o `fillOpacity` clareia o tom
// de volta para a cor nomeada (o amarelo, por exemplo, vira `#B69B54`).
//
// Os contrastes abaixo são do branco sobre a cor, que é como ela aparece no
// selo. Todos passam em AA para texto pequeno.
// ─────────────────────────────────────────────────────────────────────────────

export const COR_FONTE = {
  /** Fonte 1 · Alocação — vermelho. Branco sobre ela: 6,5:1. */
  alocacao:     '#C00000',
  /** Fonte 2 · Self-sourced — amarelo. Branco sobre ela: 4,6:1. */
  self_sourced: '#96700A',
  /** Fonte 3 · Originação — laranja. Branco sobre ela: 4,6:1. */
  originacao:   '#C0560A',
} as const

/** Opacidade das faixas empilhadas: clareia o tom sem apagar a diferença. */
export const AREA_OPACIDADE = 0.7
