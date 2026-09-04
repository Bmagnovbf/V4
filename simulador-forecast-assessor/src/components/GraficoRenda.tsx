'use client'

import {
  ResponsiveContainer, ComposedChart, Bar, Cell, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import type { PLMensal } from '@/types'
import { fmt } from '@/lib/format'

const VERDE = '#1A5C38'
const VERMELHO = '#8B0000'

/**
 * As duas leituras do mês, no mesmo eixo.
 *
 * A **coluna** é o caixa acumulado pelo mesmo racional do card de geração de
 * caixa: parte de zero e acumula a remuneração total menos a retirada mínima.
 * Negativa enquanto a operação não banca a retirada — e é essa virada de
 * vermelho para verde que a coluna mostra melhor que qualquer número.
 *
 * A **linha** é a remuneração total do mês: o resultado do negócio mais o CSP
 * das horas que ele mesmo entrega. Não é a linha `renda_liquida` do DRE, que é
 * só o resultado — a linha aqui responde "quanto entra no meu bolso neste mês",
 * que é o que a tracejada da retirada mínima quer comparar.
 */
export function GraficoRenda({
  projecao, retirada,
}: { projecao: PLMensal[]; retirada: number }) {
  const data = projecao.map(l => ({
    mes: `M${l.mes}`,
    'Caixa acumulado': Math.round(l.geracao_caixa_acumulada),
    'Remuneração total': Math.round(l.remuneracao_total),
  }))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
        Remuneração do mês e caixa acumulado
      </p>
      <p className="text-xs mb-4 mt-1" style={{ color: '#7A7A7A' }}>
        O caixa acumulado já desconta sua retirada mínima, mês a mês — é a mesma conta do card
        de geração de caixa, e a entrada não entra nela.
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
            {retirada > 0 && (
              <ReferenceLine y={retirada} stroke="#7A7A7A" strokeDasharray="2 3"
                label={{ value: 'retirada mínima', position: 'insideBottomRight', fill: '#7A7A7A', fontSize: 11 }} />
            )}
            {/* Vermelho enquanto consome a reserva, verde depois que passa a somar. */}
            <Bar dataKey="Caixa acumulado" fillOpacity={0.85}>
              {data.map(d => (
                <Cell key={d.mes} fill={d['Caixa acumulado'] < 0 ? VERMELHO : VERDE} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="Remuneração total"
                  stroke="#1A1A1A" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
