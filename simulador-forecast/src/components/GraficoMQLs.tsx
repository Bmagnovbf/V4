'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PLMensal } from '@/types'

interface Props {
  projecao: PLMensal[]
}

function fmtN(v: number): string {
  return Math.round(v).toLocaleString('pt-BR')
}

export function GraficoMQLs({ projecao }: Props) {
  const data = projecao.map(p => ({
    mes:      `M${p.mes}`,
    inbound:  Math.round(p.mqls_inbound),
    outbound: Math.round(p.mqls_outbound),
  }))

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#3D3D3D' }}>
        MQLs Mensais por Canal — M1 a M24
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7A7A7A' }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: '#7A7A7A' }} width={55} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              fmtN(Number(value)),
              name === 'inbound' ? 'MQLs Inbound' : 'MQLs Outbound (equiv.)',
            ]}
            contentStyle={{ fontSize: 12, border: '1px solid #F2F2F2' }}
          />
          <Legend
            formatter={name => name === 'inbound' ? 'Inbound (broker)' : 'Outbound (equiv.)'}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar
            dataKey="inbound"
            stackId="a"
            fill="#F4CCCC"
            stroke="#C00000"
            strokeWidth={0.5}
          />
          <Bar
            dataKey="outbound"
            stackId="a"
            fill="#D9EAD3"
            stroke="#1A5C38"
            strokeWidth={0.5}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
