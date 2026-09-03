'use client'

import type { KPIs } from '@/types'
import { fmt, fmtInt } from '@/lib/format'

const VERDE   = '#1A5C38'
const VERMELHO = '#8B0000'
const TINTA   = '#1A1A1A'
const CINZA   = '#7A7A7A'

/**
 * Todos os cards têm a mesma anatomia: rótulo em cima, número grande, legenda
 * colada na base. O `h-full` e o `mt-auto` da legenda são o que mantém a grade
 * harmônica — o card de horas é mais alto que os outros, e sem isso os vizinhos
 * ficavam com um vão morto embaixo do número.
 */
function Moldura({
  cor, children,
}: { cor?: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 h-full flex flex-col shadow-sm"
      style={{ border: `1px solid ${cor ?? '#F2F2F2'}` }}
    >
      {children}
    </div>
  )
}

function Rotulo({ children, cor }: { children: React.ReactNode; cor?: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: cor ?? CINZA }}>
      {children}
    </p>
  )
}

function Numero({ children, cor }: { children: React.ReactNode; cor?: string }) {
  return (
    <p className="text-3xl font-bold mt-2 leading-none" style={{ color: cor ?? TINTA }}>
      {children}
    </p>
  )
}

function Legenda({ children }: { children: React.ReactNode }) {
  return <p className="text-xs mt-auto pt-3" style={{ color: CINZA }}>{children}</p>
}

function Card({
  label, value, hint, tom,
}: {
  label: string; value: string; hint?: string
  /** `positivo` pinta de verde (borda inclusive); `negativo`, de vermelho. */
  tom?: 'positivo' | 'negativo'
}) {
  const cor = tom === 'positivo' ? VERDE : tom === 'negativo' ? VERMELHO : undefined
  return (
    <Moldura cor={tom === 'positivo' ? VERDE : undefined}>
      <Rotulo cor={cor}>{label}</Rotulo>
      <Numero cor={cor}>{value}</Numero>
      {hint && <Legenda>{hint}</Legenda>}
    </Moldura>
  )
}

/**
 * Horas de entrega no mês de pico.
 *
 * O número grande é a carga do projeto naquele mês — o total que a operação
 * exige, não importa quem entrega. A quebra na base é o ponto do card: mostra,
 * em corpo maior que as legendas dos outros cards, quanto ele absorve e quanto
 * vai precisar terceirizar.
 */
function CardHoras({ kpis }: { kpis: KPIs }) {
  const terceiriza = kpis.horas_pico_terceirizadas >= 0.5

  return (
    <Moldura>
      <Rotulo>Horas no mês de pico</Rotulo>
      <Numero>{fmtInt(kpis.horas_pico)}h</Numero>
      <p className="text-xs mt-2" style={{ color: CINZA }}>
        carga do projeto no M{kpis.mes_pico}, o mês mais cheio do ano
      </p>

      <div className="flex gap-8 mt-auto pt-3" style={{ borderTop: '1px solid #F2F2F2' }}>
        <div>
          <p className="text-xl font-bold leading-tight" style={{ color: TINTA }}>
            {fmtInt(kpis.horas_pico_proprias)}h
          </p>
          <p className="text-xs font-bold" style={{ color: CINZA }}>suas</p>
          <p className="text-xs" style={{ color: CINZA }}>
            {fmtInt(kpis.horas_pico_proprias / 4.3)}h por semana
          </p>
        </div>
        <div>
          <p className="text-xl font-bold leading-tight" style={{ color: terceiriza ? VERMELHO : CINZA }}>
            {fmtInt(kpis.horas_pico_terceirizadas)}h
          </p>
          <p className="text-xs font-bold" style={{ color: CINZA }}>a terceirizar</p>
          <p className="text-xs" style={{ color: CINZA }}>
            {terceiriza ? 'com freelancer' : 'cabe na sua agenda'}
          </p>
        </div>
      </div>
    </Moldura>
  )
}

export function KPICards({ kpis }: { kpis: KPIs }) {
  const reservaHint = kpis.deficit_retirada_total === 0
    ? 'a renda cobre a retirada desde o M1'
    : kpis.mes_autossuficiencia
      ? `renda cobre a retirada a partir do M${kpis.mes_autossuficiencia}`
      : 'a renda não alcança a retirada em 12 meses'

  // O card soma as duas fases da rampa: o que a operação consome antes de
  // bancar a retirada e o que gera depois. A legenda nomeia a virada, senão o
  // número negativo do início da rampa parece resultado ruim, não fase.
  const caixaHint = kpis.geracao_caixa_periodo < 0
    ? 'os 12 meses somados ainda consomem caixa, já descontada sua retirada'
    : kpis.mes_autossuficiencia && kpis.mes_autossuficiencia > 1
      ? `consome até o M${kpis.mes_autossuficiencia}, gera depois · já descontada sua retirada`
      : 'nos 12 meses, já descontada sua retirada'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card label="Remuneração total em regime" value={fmt(kpis.remuneracao_regime)} tom="positivo"
            hint="CSP + resultado · média dos meses 10 a 12" />
      <Card label="Geração de caixa no período" value={fmt(kpis.geracao_caixa_periodo)}
            tom={kpis.geracao_caixa_periodo < 0 ? 'negativo' : 'positivo'} hint={caixaHint} />
      <CardHoras kpis={kpis} />
      <Card label="Projetos no M12" value={fmtInt(kpis.projetos_ativos_m12)} hint="ativos simultâneos" />
      <Card label="Payback do investimento" value={kpis.payback_mes ? `Mês ${kpis.payback_mes}` : 'após o M12'}
            hint="quando o retorno cobre o que você investiu" />
      <Card label="Reserva necessária" value={fmt(kpis.deficit_retirada_total)} hint={reservaHint} />
    </div>
  )
}
