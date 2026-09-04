'use client'

import type { KPIs, SimulacaoInput } from '@/types'
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
    <Moldura cor={cor}>
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

export function KPICards({ kpis, input }: { kpis: KPIs; input: SimulacaoInput }) {
  const reservaHint = kpis.deficit_retirada_total === 0
    ? 'a renda cobre a retirada desde o M1'
    : kpis.mes_autossuficiencia
      ? `renda cobre a retirada a partir do M${kpis.mes_autossuficiencia}`
      : 'a renda não alcança a retirada em 12 meses'

  // Verde quando a reserva declarada cobre o mínimo exigido, vermelho quando
  // não cobre. É binário de propósito: o meio-termo — cobre, mas raspando — é
  // o que o eixo de reserva do termômetro marca em amarelo, com o quanto falta
  // ou sobra. Aqui a pergunta é só "dá ou não dá".
  const reservaCobre = kpis.deficit_retirada_total <= input.reserva_capital

  // O card soma as duas fases da rampa: o que a operação consome antes de
  // bancar a retirada e o que gera depois. A legenda nomeia a virada, senão o
  // número negativo do início da rampa parece resultado ruim, não fase.
  const caixaHint = kpis.geracao_caixa_periodo < 0
    ? 'os 12 meses somados ainda consomem caixa, já descontada sua retirada'
    : kpis.mes_autossuficiencia && kpis.mes_autossuficiencia > 1
      ? `consome até o M${kpis.mes_autossuficiencia}, gera depois · já descontada sua retirada`
      : 'nos 12 meses, já descontada sua retirada'

  // Quatro cards de tamanho padrão num bloco 2×2 à esquerda, e o de horas —
  // o único fora do padrão — ocupando as duas linhas da terceira coluna, de
  // modo que sua base alinhe com a base da segunda linha. No mobile a grade
  // cai para duas colunas e o de horas vai inteiro para o fim.
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card label="Remuneração total em regime" value={fmt(kpis.remuneracao_regime)} tom="positivo"
            hint="CSP + resultado · média dos meses 10 a 12" />
      <Card label="Geração de caixa no período" value={fmt(kpis.geracao_caixa_periodo)}
            tom={kpis.geracao_caixa_periodo < 0 ? 'negativo' : 'positivo'} hint={caixaHint} />
      <Card label="Payback do investimento" value={kpis.payback_mes ? `Mês ${kpis.payback_mes}` : 'após o M12'}
            hint="quando o retorno cobre o que você investiu" />
      <Card label="Reserva mínima necessária" value={fmt(kpis.deficit_retirada_total)}
            tom={reservaCobre ? 'positivo' : 'negativo'} hint={reservaHint} />
      <div className="col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2">
        <CardHoras kpis={kpis} />
      </div>
    </div>
  )
}
