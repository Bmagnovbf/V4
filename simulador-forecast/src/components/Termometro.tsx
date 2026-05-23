'use client'

import type { Termometro, Horizonte } from '@/types'
import { fmtMultiplier, fmt } from '@/lib/format'

const NIVEL_BG: Record<string, string> = {
  verde:    '#D9EAD3',
  amarelo:  '#FFF3CD',
  vermelho: '#F4CCCC',
}

const NIVEL_TEXT: Record<string, string> = {
  verde:    '#1A5C38',
  amarelo:  '#D4900A',
  vermelho: '#8B0000',
}

const NIVEL_BORDER: Record<string, string> = {
  verde:    '#1A5C38',
  amarelo:  '#D4900A',
  vermelho: '#8B0000',
}

interface Props {
  termometro: Termometro
  horizonte: Horizonte
  meta_fat_bruto: number
}

export function TermometroViabilidade({ termometro, horizonte, meta_fat_bruto }: Props) {
  const { capital_ratio, capital_nivel } = termometro

  const horizonteNivel = horizonte === 'H1' ? 'amarelo' : 'verde'

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Capital disponível */}
      <div
        className="rounded-lg p-3 text-center"
        style={{
          backgroundColor: NIVEL_BG[capital_nivel],
          border: `1px solid ${NIVEL_BORDER[capital_nivel]}`,
        }}
      >
        <div className="text-xs font-bold mb-1" style={{ color: NIVEL_TEXT[capital_nivel] }}>
          Capital disponível
        </div>
        <div className="text-lg font-bold" style={{ color: NIVEL_TEXT[capital_nivel] }}>
          {fmtMultiplier(capital_ratio)}
        </div>
        <div className="text-xs mt-1" style={{ color: NIVEL_TEXT[capital_nivel], opacity: 0.7 }}>
          ≥ 1,5× = verde
        </div>
      </div>

      {/* Horizonte M12 */}
      <div
        className="rounded-lg p-3 text-center"
        style={{
          backgroundColor: NIVEL_BG[horizonteNivel],
          border: `1px solid ${NIVEL_BORDER[horizonteNivel]}`,
        }}
      >
        <div className="text-xs font-bold mb-1" style={{ color: NIVEL_TEXT[horizonteNivel] }}>
          Horizonte M12
        </div>
        <div className="text-lg font-bold" style={{ color: NIVEL_TEXT[horizonteNivel] }}>
          {horizonte}
        </div>
        <div className="text-xs mt-1" style={{ color: NIVEL_TEXT[horizonteNivel], opacity: 0.7 }}>
          Meta {fmt(meta_fat_bruto)}/mês
        </div>
      </div>
    </div>
  )
}
