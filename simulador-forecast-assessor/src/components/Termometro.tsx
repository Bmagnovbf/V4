'use client'

import type { Termometro, ViabilidadeNivel } from '@/types'

const CORES = {
  verde:    { bg: '#D9EAD3', fg: '#1A5C38', label: 'Viável' },
  amarelo:  { bg: '#FFF3CD', fg: '#D4900A', label: 'Atenção' },
  vermelho: { bg: '#F4CCCC', fg: '#8B0000', label: 'Inviável' },
} as const

function Item({ titulo, valor, nivel }: { titulo: string; valor: string; nivel: ViabilidadeNivel }) {
  const c = CORES[nivel]
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${c.fg}` }}>
      <p className="text-xs" style={{ color: '#7A7A7A' }}>{titulo}</p>
      <p className="text-base font-bold mt-0.5" style={{ color: c.fg }}>{valor}</p>
    </div>
  )
}

export function TermometroViabilidade({
  termometro, mesAutossuficiencia,
}: { termometro: Termometro; mesAutossuficiencia: number | null }) {
  const c = CORES[termometro.nivel_final]
  const ratio = termometro.reserva_ratio
  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: c.bg, border: `1px solid ${c.fg}` }}>
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: c.fg }}>
        Termômetro de Viabilidade
      </p>
      <p className="text-2xl font-bold mt-1" style={{ color: c.fg }}>{c.label}</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Item
          titulo="Reserva vs. retirada mínima"
          valor={
            Number.isFinite(ratio)
              ? `${ratio.toFixed(1)}×`
              : mesAutossuficiencia === 1 ? 'renda cobre desde M1' : 'renda cobre'
          }
          nivel={termometro.reserva_nivel}
        />
        <Item
          titulo="Remuneração vs. meta"
          valor={`${(termometro.meta_ratio * 100).toFixed(0)}%`}
          nivel={termometro.meta_nivel}
        />
      </div>
    </div>
  )
}
