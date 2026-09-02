'use client'

import type { Termometro, KPIs, SimulacaoInput, ViabilidadeNivel } from '@/types'
import { fmt } from '@/lib/format'

const ESTILO = {
  verde:    { borda: '#1A5C38', texto: '#1A5C38', selo: 'Saudável', marca: '✓' },
  amarelo:  { borda: '#D4900A', texto: '#D4900A', selo: 'Atenção',  marca: '!' },
  vermelho: { borda: '#8B0000', texto: '#8B0000', selo: 'Crítico',  marca: '!' },
} as const

function Indicador({
  titulo, valor, nivel, leitura,
}: { titulo: string; valor: string; nivel: ViabilidadeNivel; leitura: string }) {
  const e = ESTILO[nivel]
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: `1px solid ${e.borda}` }}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>{titulo}</p>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
          style={{ backgroundColor: e.borda, color: '#FFFFFF' }}
        >
          {e.marca} {e.selo}
        </span>
      </div>
      <p className="text-2xl font-bold mt-2" style={{ color: e.texto }}>{valor}</p>
      <p className="text-xs mt-1" style={{ color: '#3D3D3D' }}>{leitura}</p>
    </div>
  )
}

export function TermometroViabilidade({
  termometro, kpis, input,
}: { termometro: Termometro; kpis: KPIs; input: SimulacaoInput }) {
  const semDeficit = kpis.deficit_retirada_total === 0
  const faltam = Math.max(0, kpis.deficit_retirada_total - input.reserva_capital)

  const leituraReserva = semDeficit
    ? 'A operação cobre sua retirada desde o primeiro mês.'
    : termometro.reserva_nivel === 'vermelho'
      ? `Faltam ${fmt(faltam)} para atravessar até o M${kpis.mes_autossuficiencia ?? 12}.`
      : termometro.reserva_nivel === 'amarelo'
        ? `Cobre os ${fmt(kpis.deficit_retirada_total)} do período de rampa, mas sem margem.`
        : `Cobre com folga os ${fmt(kpis.deficit_retirada_total)} do período de rampa.`

  const pct = (termometro.meta_ratio * 100).toFixed(0)
  const leituraMeta = termometro.meta_nivel === 'verde'
    ? `O projetado alcança sua meta de ${fmt(input.meta_faturamento)}/mês.`
    : termometro.meta_nivel === 'amarelo'
      ? `O projetado fica em ${pct}% da meta de ${fmt(input.meta_faturamento)}/mês.`
      : `O projetado fica bem abaixo da meta de ${fmt(input.meta_faturamento)}/mês.`

  const alertas = [termometro.reserva_nivel, termometro.meta_nivel].filter(n => n !== 'verde').length

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
          Leitura da simulação
        </p>
        <p className="text-xs" style={{ color: '#7A7A7A' }}>
          {alertas === 0
            ? 'Nenhum ponto de atenção'
            : `${alertas} de 2 indicadores ${alertas === 1 ? 'pede' : 'pedem'} atenção`}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Indicador
          titulo="Reserva vs. retirada mínima"
          valor={Number.isFinite(termometro.reserva_ratio) ? `${termometro.reserva_ratio.toFixed(1)}×` : '—'}
          nivel={termometro.reserva_nivel}
          leitura={leituraReserva}
        />
        <Indicador
          titulo="Faturamento vs. meta"
          valor={`${pct}%`}
          nivel={termometro.meta_nivel}
          leitura={leituraMeta}
        />
      </div>
    </div>
  )
}
