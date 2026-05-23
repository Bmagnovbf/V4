'use client'

import type { KPIs } from '@/types'
import { fmt, fmtPct } from '@/lib/format'

type Nivel = 'verde' | 'amarelo' | 'vermelho'

const NIVEL_BG: Record<Nivel, string> = {
  verde:    '#D9EAD3',
  amarelo:  '#FFF3CD',
  vermelho: '#F4CCCC',
}
const NIVEL_BORDER: Record<Nivel, string> = {
  verde:    '#1A5C38',
  amarelo:  '#D4900A',
  vermelho: '#8B0000',
}
const NIVEL_TEXT: Record<Nivel, string> = {
  verde:    '#1A5C38',
  amarelo:  '#D4900A',
  vermelho: '#8B0000',
}

function nivelBreakeven(mes: number | null): Nivel {
  if (!mes) return 'vermelho'
  if (mes <= 6)  return 'verde'
  if (mes <= 12) return 'amarelo'
  return 'vermelho'
}

function nivelPayback(mes: number | null): Nivel {
  if (!mes) return 'vermelho'
  if (mes <= 18) return 'verde'
  if (mes <= 24) return 'amarelo'
  return 'vermelho'
}

function nivelRoic(roic: number): Nivel {
  if (roic >= 30) return 'verde'
  if (roic >= 15) return 'amarelo'
  return 'vermelho'
}

function nivelCapital(ratio: number): Nivel {
  if (ratio >= 1.5) return 'verde'
  if (ratio >= 1.0) return 'amarelo'
  return 'vermelho'
}

interface Props {
  kpis: KPIs
}

interface Card {
  label: string
  value: string
  sub?: string
  nivel: Nivel
}

export function KPICards({ kpis }: Props) {
  const capitalRatio = kpis.capital_minimo > 0
    ? kpis.capital_disponivel_efetivo / kpis.capital_minimo
    : 0

  const cards: Card[] = [
    {
      label: 'Break-even',
      value: kpis.breakeven_mes ? `Mês ${kpis.breakeven_mes}` : 'N/A',
      sub: 'Primeiro mês com EBITDA positivo',
      nivel: nivelBreakeven(kpis.breakeven_mes),
    },
    {
      label: 'Payback',
      value: kpis.payback_mes ? `${kpis.payback_mes} meses` : '> 24m',
      sub: 'Retorno do capital investido',
      nivel: nivelPayback(kpis.payback_mes),
    },
    {
      label: 'ROIC',
      value: fmtPct(kpis.roic),
      sub: 'Retorno sobre capital (anualizado M12)',
      nivel: nivelRoic(kpis.roic),
    },
    {
      label: 'Capital Necessário',
      value: fmt(kpis.capital_total_investido),
      sub: 'Franquia + giro + escritório ref.',
      nivel: nivelCapital(capitalRatio),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(card => (
        <div
          key={card.label}
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundColor: NIVEL_BG[card.nivel],
            border: `1px solid ${NIVEL_BORDER[card.nivel]}`,
          }}
        >
          <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#7A7A7A' }}>
            {card.label}
          </div>
          <div className="text-2xl font-bold" style={{ color: NIVEL_TEXT[card.nivel] }}>
            {card.value}
          </div>
          {card.sub && (
            <div className="text-xs mt-1" style={{ color: '#7A7A7A' }}>
              {card.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
