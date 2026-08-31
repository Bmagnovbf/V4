'use client'

import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import type { PLMensal } from '@/types'
import { fmt } from '@/lib/format'

export function GraficoRenda({
  projecao, meta, retirada,
}: { projecao: PLMensal[]; meta: number; retirada: number }) {
  const data = projecao.map(l => ({
    mes: `M${l.mes}`,
    'Renda líquida': Math.round(l.renda_liquida),
    'Caixa acumulado': Math.round(l.caixa_acumulado),
  }))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#3D3D3D' }}>
        Renda líquida e caixa acumulado
      </p>
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={280} minWidth={420}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7A7A7A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7A7A7A' }} tickFormatter={(v: number) => `${v / 1000}K`} />
            <Tooltip formatter={(value: unknown) => fmt(Number(value))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#3D3D3D" />
            <ReferenceLine y={meta} stroke="#D4900A" strokeDasharray="4 4"
              label={{ value: 'meta', position: 'insideTopRight', fill: '#D4900A', fontSize: 11 }} />
            {retirada > 0 && (
              <ReferenceLine y={retirada} stroke="#8B0000" strokeDasharray="2 3"
                label={{ value: 'retirada mínima', position: 'insideBottomRight', fill: '#8B0000', fontSize: 11 }} />
            )}
            <Bar dataKey="Renda líquida" fill="#1A5C38" />
            <Line type="monotone" dataKey="Caixa acumulado" stroke="#8B0000" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
