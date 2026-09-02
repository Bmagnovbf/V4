'use client'

import type { KPIs } from '@/types'
import { fmt, fmtInt, fmtPct } from '@/lib/format'

function Card({
  label, value, hint, destaque,
}: { label: string; value: string; hint?: string; destaque?: boolean }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm"
      style={{ border: destaque ? '1px solid #1A5C38' : '1px solid #F2F2F2' }}
    >
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: destaque ? '#1A5C38' : '#7A7A7A' }}>
        {label}
      </p>
      <p className="text-2xl font-bold mt-1" style={{ color: destaque ? '#1A5C38' : '#1A1A1A' }}>{value}</p>
      {hint && <p className="text-xs mt-1" style={{ color: '#7A7A7A' }}>{hint}</p>}
    </div>
  )
}

export function KPICards({ kpis }: { kpis: KPIs }) {
  const reservaHint = kpis.deficit_retirada_total === 0
    ? 'a renda cobre a retirada desde o M1'
    : kpis.mes_autossuficiencia
      ? `renda cobre a retirada a partir do M${kpis.mes_autossuficiencia}`
      : 'a renda não alcança a retirada em 12 meses'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card label="Faturamento em regime" value={fmt(kpis.faturamento_regime)}
            hint="receita recebida por mês, antes de impostos" />
      <Card label="Remuneração total"  value={fmt(kpis.remuneracao_regime)} destaque
            hint="CSP + resultado, por mês em regime" />
      <Card label="Resultado do negócio" value={fmt(kpis.renda_regime)} hint="margem depois de remunerar suas horas" />
      <Card label="Suas horas de entrega" value={`${fmtInt(kpis.horas_proprias_regime)}h`}
            hint={
              kpis.horas_terceirizadas_regime >= 0.5
                ? `por mês · mais ${fmtInt(kpis.horas_terceirizadas_regime)}h entregues por freelancer`
                : `por mês · ${fmtInt(kpis.horas_proprias_regime / 4.3)}h por semana`
            } />
      <Card label="Projetos no M12"    value={fmtInt(kpis.projetos_ativos_m12)} hint="ativos simultâneos" />
      <Card label="Payback do investimento" value={kpis.payback_mes ? `Mês ${kpis.payback_mes}` : 'após o M12'} hint="quando o retorno cobre o que você investiu" />
      <Card label="Reserva necessária" value={fmt(kpis.deficit_retirada_total)} hint={reservaHint} />
    </div>
  )
}
