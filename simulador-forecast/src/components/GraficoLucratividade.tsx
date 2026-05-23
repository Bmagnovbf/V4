'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { PLMensal } from '@/types'

interface Props {
  projecao: PLMensal[]
  breakeven_mes: number | null
  payback_mes: number | null
}

function fmtK(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000)     return `R$${(v / 1_000).toFixed(0)}K`
  return `R$${v}`
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function GraficoLucratividade({ projecao, breakeven_mes, payback_mes }: Props) {
  const data = projecao.map(p => ({
    mes:              `M${p.mes}`,
    ebitda_acumulado: Math.round(p.ebitda_acumulado),
  }))

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#3D3D3D' }}>
        EBITDA Acumulado — M1 a M24
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7A7A7A' }} interval={2} />
          <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#7A7A7A' }} width={70} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [BRL.format(Number(value)), 'EBITDA Acumulado']}
            contentStyle={{ fontSize: 12, border: '1px solid #F2F2F2' }}
          />
          <ReferenceLine y={0} stroke="#3D3D3D" strokeWidth={1.5} />
          {breakeven_mes && (
            <ReferenceLine
              x={`M${breakeven_mes}`}
              stroke="#1A5C38"
              strokeWidth={1.5}
              label={{ value: 'Break-even', fill: '#1A5C38', fontSize: 11 }}
            />
          )}
          {payback_mes && (
            <ReferenceLine
              x={`M${payback_mes}`}
              stroke="#1A5C38"
              strokeDasharray="4 3"
              label={{ value: 'Payback', fill: '#1A5C38', fontSize: 11 }}
            />
          )}
          <Bar dataKey="ebitda_acumulado" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.ebitda_acumulado >= 0 ? '#D9EAD3' : '#F4CCCC'}
                stroke={entry.ebitda_acumulado >= 0 ? '#1A5C38' : '#8B0000'}
                strokeWidth={0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
