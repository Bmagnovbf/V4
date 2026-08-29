'use client'

import type { KPIs } from '@/types'
import { fmt, fmtInt } from '@/lib/format'

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: '#1A1A1A' }}>{value}</p>
      {hint && <p className="text-xs mt-1" style={{ color: '#7A7A7A' }}>{hint}</p>}
    </div>
  )
}

export function KPICards({ kpis }: { kpis: KPIs }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Renda no M12"     value={fmt(kpis.renda_liquida_m12)} hint="pró-labore mensal em regime" />
      <Card label="Líquido ano 1"    value={fmt(kpis.renda_liquida_ano1)} hint={`média de ${fmt(kpis.renda_media_mes)}/mês`} />
      <Card label="Payback"          value={kpis.payback_mes ? `Mês ${kpis.payback_mes}` : '—'} hint={`entrada de ${fmt(kpis.investimento_total)}`} />
      <Card label="Projetos no M12"  value={fmtInt(kpis.projetos_ativos_m12)} hint="ativos simultâneos" />
    </div>
  )
}
