'use client'

import type { KPIs } from '@/types'
import { fmtPct } from '@/lib/format'

interface Props {
  kpis: KPIs
}

interface Card {
  label: string
  value: string
  sub: string
  raw: number
}

export function CardsMargemRetorno({ kpis }: Props) {
  const cards: Card[] = [
    {
      label: 'Margem Bruta',
      value: fmtPct(kpis.margem_bruta_m12),
      sub: 'Média M6–M12 · (fat. líq. − CSP) / fat. líq.',
      raw: kpis.margem_bruta_m12,
    },
    {
      label: 'Margem EBITDA',
      value: fmtPct(kpis.margem_ebitda_m12),
      sub: 'Média M6–M12 · após CSP, G&A, Comercial e Broker',
      raw: kpis.margem_ebitda_m12,
    },
    {
      label: 'ROAS',
      value: `${kpis.roas.toFixed(1)}×`,
      sub: 'Receita aquisição / broker M1–M12',
      raw: kpis.roas,
    },
    {
      label: 'ROIC',
      value: fmtPct(kpis.roic),
      sub: 'EBITDA M12 anualizado / capital total',
      raw: kpis.roic,
    },
  ]

  const positiveColor = '#1A5C38'
  const negativeColor = '#8B0000'

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
        Margens e Retorno
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 shadow-sm"
            style={{ border: '1px solid #F2F2F2' }}
          >
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#7A7A7A' }}>
              {card.label}
            </div>
            <div className="text-2xl font-bold" style={{ color: card.raw >= 0 ? positiveColor : negativeColor }}>
              {card.value}
            </div>
            <div className="text-xs mt-1" style={{ color: '#7A7A7A' }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
