'use client'

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { PLMensal } from '@/types'
import { fmt } from '@/lib/format'

export function GraficoReceita({ projecao }: { projecao: PLMensal[] }) {
  const data = projecao.map(l => ({
    mes: `M${l.mes}`,
    'Fonte 1 · Alocação':    Math.round(l.receita_saber_matriz + l.receita_executar_matriz),
    'Fonte 2 · Self-sourced': Math.round(l.receita_saber_self + l.receita_executar_self),
    'Fonte 3 · Originação':   Math.round(l.receita_originacao),
  }))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#3D3D3D' }}>
        Receita recebida por fonte
      </p>
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={280} minWidth={420}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7A7A7A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7A7A7A' }} tickFormatter={(v: number) => `${v / 1000}K`} />
            <Tooltip formatter={(value: unknown) => fmt(Number(value))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Fonte 1 · Alocação"     stackId="1" stroke="#7A7A7A" fill="#7A7A7A" />
            <Area type="monotone" dataKey="Fonte 2 · Self-sourced" stackId="1" stroke="#8B0000" fill="#8B0000" />
            <Area type="monotone" dataKey="Fonte 3 · Originação"   stackId="1" stroke="#D4900A" fill="#D4900A" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
