'use client'

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { PLMensal } from '@/types'

interface Props {
  projecao: PLMensal[]
}

function fmtK(v: number): string {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `R$${(v / 1_000).toFixed(0)}K`
  return `R$${v}`
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const LABELS: Record<string, string> = {
  aquisicao:    'Aquisição',
  executar:     'Retenção',
  ter_expansao: 'Expansão',
  broker:       'Investimento Broker',
}

export function GraficoFaturamento({ projecao }: Props) {
  const data = projecao.map(p => ({
    mes:          `M${p.mes}`,
    aquisicao:    Math.round(p.receita_aquisicao),
    executar:     Math.round(p.receita_executar),
    ter_expansao: Math.round(p.receita_ter_expansao),
    broker:       Math.round(p.custo_broker),
  }))

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#3D3D3D' }}>
        Composição do Faturamento + Broker — M1 a M24
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7A7A7A' }} interval={2} />
          <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#7A7A7A' }} width={70} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [BRL.format(Number(value)), LABELS[name] ?? name]}
            contentStyle={{ fontSize: 12, border: '1px solid #F2F2F2' }}
          />
          <Legend
            formatter={(name: string) => LABELS[name] ?? name}
            wrapperStyle={{ fontSize: 11 }}
          />
          <ReferenceLine
            x="M12"
            stroke="#3D3D3D"
            strokeDasharray="4 3"
            label={{ value: 'Meta M12', fill: '#3D3D3D', fontSize: 11 }}
          />
          {/* Stacked areas — Saber (base), Executar, Ter Pontual */}
          <Area
            type="monotone"
            dataKey="aquisicao"
            stackId="fat"
            fill="#F4CCCC"
            fillOpacity={0.85}
            stroke="#C00000"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="executar"
            stackId="fat"
            fill="#D9EAD3"
            fillOpacity={0.85}
            stroke="#1A5C38"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="ter_expansao"
            stackId="fat"
            fill="#FFF3CD"
            fillOpacity={0.85}
            stroke="#D4900A"
            strokeWidth={1}
          />
          {/* Broker como linha separada */}
          <Line
            type="monotone"
            dataKey="broker"
            stroke="#7A7A7A"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 3, fill: '#3D3D3D' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
