'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { fmt, fmtPct } from '@/lib/format'
import type { AlocacaoM12 } from '@/types'

interface Props {
  alocacao: AlocacaoM12
}

export function AlocacaoRecursos({ alocacao }: Props) {
  // Comercial + Broker consolidados em uma barra; BDRs exibidos apenas se > 0
  const comercialTotal = alocacao.custo_comercial + alocacao.custo_broker
  const baseItems = [
    { label: 'CSP',       valor: alocacao.custo_csp, color: '#C00000' },
    { label: 'Comercial', valor: comercialTotal,      color: '#D4900A' },
    { label: 'G&A',       valor: alocacao.custo_ga,  color: '#7A7A7A' },
    ...(alocacao.custo_bdr > 0
      ? [{ label: 'BDRs', valor: alocacao.custo_bdr, color: '#A0522D' }]
      : []),
    { label: 'EBITDA',    valor: alocacao.ebitda,    color: '#1A5C38' },
  ]

  const data = baseItems.map(item => {
    const pct = alocacao.fat_liq > 0 ? (item.valor / alocacao.fat_liq) * 100 : 0
    return { name: item.label, valor: Math.round(item.valor), pct, color: item.color }
  })

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#3D3D3D' }}>
        Alocação de Recursos — Regime M12
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 70, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#3D3D3D' }} width={80} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, props: any) => [
              `${fmt(Number(value))}  (${fmtPct(props.payload?.pct ?? 0)})`,
              'Valor',
            ]}
            contentStyle={{ fontSize: 12, border: '1px solid #F2F2F2' }}
          />
          <Bar
            dataKey="valor"
            radius={[0, 4, 4, 0]}
            label={{ position: 'right', formatter: (v: unknown) => fmt(Number(v)), fontSize: 11, fill: '#3D3D3D' }}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-6">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span style={{ color: '#3D3D3D' }}>{item.name}</span>
            <span className="ml-auto font-bold" style={{ color: '#1A1A1A' }}>
              {fmtPct(item.pct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
