'use client'

/**
 * Rótulo de uma `ReferenceLine`, desenhado à mão sobre ela.
 *
 * Meta e retirada mínima não entram na legenda — não são séries —, então o
 * valor precisa estar na própria linha, senão o tracejado é um traço sem
 * significado. Fica acima dela e encostado à esquerda, onde as duas séries
 * ainda estão baixas nos primeiros meses.
 *
 * O `position` nomeado do recharts não serve aqui: ele encostava o texto na
 * direita, em cima da área cheia, onde o rótulo sumia. Passando um elemento em
 * `label`, o recharts o clona injetando o `viewBox` da linha (`x` na borda
 * esquerda do plot, `y` na altura dela), e a posição vira aritmética.
 *
 * O contorno branco (`paintOrder="stroke"`) garante a leitura quando a linha
 * cai baixo e cruza barra ou área colorida já no começo do ano.
 */
export function RotuloLinha({
  viewBox, texto, cor = '#3D3D3D',
}: { viewBox?: { x?: number; y?: number }; texto: string; cor?: string }) {
  const x = viewBox?.x ?? 0
  const y = viewBox?.y ?? 0
  return (
    <text
      x={x + 8} y={y - 7} fontSize={11} fontWeight="bold" fill={cor}
      stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke"
    >
      {texto}
    </text>
  )
}
