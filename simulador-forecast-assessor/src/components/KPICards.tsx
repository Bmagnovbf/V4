'use client'

import type { KPIs } from '@/types'
import { fmt, fmtInt } from '@/lib/format'

function Card({
  label, value, hint, destaque, alerta,
}: { label: string; value: string; hint?: string; destaque?: boolean; alerta?: boolean }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm"
      style={{ border: destaque ? '1px solid #1A5C38' : '1px solid #F2F2F2' }}
    >
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: destaque ? '#1A5C38' : '#7A7A7A' }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-1"
        style={{ color: destaque ? '#1A5C38' : alerta ? '#8B0000' : '#1A1A1A' }}
      >
        {value}
      </p>
      {hint && <p className="text-xs mt-1" style={{ color: '#7A7A7A' }}>{hint}</p>}
    </div>
  )
}

/**
 * Horas de entrega no mês de pico.
 *
 * O número grande é a carga do projeto — o que a operação exige naquele mês,
 * não importa quem entrega. A quebra logo abaixo é o ponto do card: mostra,
 * em corpo maior que as legendas dos outros cards, quanto ele consegue
 * absorver e quanto vai precisar terceirizar.
 */
function CardHoras({ kpis }: { kpis: KPIs }) {
  const terceiriza = kpis.horas_pico_terceirizadas >= 0.5

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>
        Horas no mês de pico
      </p>
      <p className="text-2xl font-bold mt-1" style={{ color: '#1A1A1A' }}>
        {fmtInt(kpis.horas_pico)}h
      </p>
      <p className="text-xs mt-1" style={{ color: '#7A7A7A' }}>
        carga do projeto no M{kpis.mes_pico}, o mês mais cheio do ano
      </p>

      <div className="flex gap-6 mt-3 pt-3" style={{ borderTop: '1px solid #F2F2F2' }}>
        <div>
          <p className="text-lg font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            {fmtInt(kpis.horas_pico_proprias)}h
          </p>
          <p className="text-xs font-bold" style={{ color: '#7A7A7A' }}>
            suas · {fmtInt(kpis.horas_pico_proprias / 4.3)}h por semana
          </p>
        </div>
        <div>
          <p className="text-lg font-bold leading-tight" style={{ color: terceiriza ? '#8B0000' : '#7A7A7A' }}>
            {fmtInt(kpis.horas_pico_terceirizadas)}h
          </p>
          <p className="text-xs font-bold" style={{ color: '#7A7A7A' }}>
            {terceiriza ? 'a terceirizar' : 'sem freelancer'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function KPICards({ kpis }: { kpis: KPIs }) {
  const reservaHint = kpis.deficit_retirada_total === 0
    ? 'a renda cobre a retirada desde o M1'
    : kpis.mes_autossuficiencia
      ? `renda cobre a retirada a partir do M${kpis.mes_autossuficiencia}`
      : 'a renda não alcança a retirada em 12 meses'

  // O card soma as duas fases da rampa: o que a operação consome antes de
  // bancar a retirada e o que gera depois. O hint nomeia a virada, senão o
  // número negativo do início da rampa parece resultado ruim, não fase.
  const caixaHint = kpis.geracao_caixa_periodo < 0
    ? 'os 12 meses somados ainda consomem caixa, já descontada sua retirada'
    : kpis.mes_autossuficiencia && kpis.mes_autossuficiencia > 1
      ? `consome até o M${kpis.mes_autossuficiencia}, gera depois · já descontada sua retirada`
      : 'nos 12 meses, já descontada sua retirada'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card label="Remuneração total"  value={fmt(kpis.remuneracao_regime)} destaque
            hint="CSP + resultado, por mês em regime" />
      <Card label="Geração de caixa no período" value={fmt(kpis.geracao_caixa_periodo)}
            alerta={kpis.geracao_caixa_periodo < 0} hint={caixaHint} />
      <CardHoras kpis={kpis} />
      <Card label="Projetos no M12"    value={fmtInt(kpis.projetos_ativos_m12)} hint="ativos simultâneos" />
      <Card label="Payback do investimento" value={kpis.payback_mes ? `Mês ${kpis.payback_mes}` : 'após o M12'} hint="quando o retorno cobre o que você investiu" />
      <Card label="Reserva necessária" value={fmt(kpis.deficit_retirada_total)} hint={reservaHint} />
    </div>
  )
}
