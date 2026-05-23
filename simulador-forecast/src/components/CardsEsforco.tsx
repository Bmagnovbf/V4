'use client'

import type { EsforcoAquisicao, KPIs, HeadcountHorizonte } from '@/types'
import { fmt, fmtInt, fmtPct } from '@/lib/format'

interface Props {
  esforco: EsforcoAquisicao
  kpis: KPIs
  headcount: HeadcountHorizonte
  blended_conversao: number
}

function fmtK(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `R$ ${Math.round(v / 1_000)}K`
  return `R$ ${Math.round(v)}`
}

function Card({ title, main, sub, accent }: { title: string; main: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm"
      style={{ border: `1px solid ${accent ? '#C00000' : '#F2F2F2'}` }}
    >
      <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#8B0000' }}>
        {title}
      </div>
      <div className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
        {main}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ color: '#7A7A7A' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export function CardsEsforco({ esforco, kpis, headcount, blended_conversao }: Props) {
  const hasBdr = esforco.bdr_mes_m12 > 0
  const totalEquipe = headcount.total + esforco.bdr_mes_m12

  const absDeficit = Math.abs(kpis.deficit_acumulado)
  const fluxoCaixa = absDeficit * 1.30
  const deficitRatio = kpis.capital_disponivel_efetivo > 0
    ? absDeficit / kpis.capital_disponivel_efetivo
    : 0
  const isCritico = deficitRatio >= 0.8
  const showDeficitAlert = deficitRatio >= 0.5

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
        Esforço Operacional (Regime M12)
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Card
          title="Investimento em Broker"
          main={`${fmt(esforco.broker_mes)}/mês`}
          sub={`${fmt(esforco.broker_ano)}/ano`}
        />
        <Card
          title="MQLs Inbound Necessários"
          main={`${fmtInt(esforco.mqls_inbound_mes)}/mês`}
          sub={`Conversão ${fmtPct(blended_conversao * 100)}`}
        />
        <Card
          title="Equipe Necessária"
          main={`${totalEquipe} investidores`}
          sub={
            hasBdr
              ? `CSP ${headcount.csp} · Comercial ${headcount.comercial} · G&A ${headcount.ga} · BDRs ${esforco.bdr_mes_m12}`
              : `CSP ${headcount.csp} · Comercial ${headcount.comercial} · G&A ${headcount.ga}`
          }
        />

        {/* Investimento Estimado — todos os itens em mesmo nível de fonte */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm"
          style={{ border: `1px solid ${kpis.postergar_escritorio ? '#C00000' : '#F2F2F2'}` }}
        >
          <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#8B0000' }}>
            Investimento Estimado
          </div>
          <div className="space-y-1" style={{ fontSize: '0.75rem', color: '#3D3D3D' }}>
            <div>Franquia = <strong style={{ color: '#1A1A1A' }}>R$ 100K</strong></div>
            <div>Fluxo de Caixa = <strong style={{ color: '#1A1A1A' }}>{fmtK(fluxoCaixa)}</strong></div>
            <div>
              Escritório + Equipamentos ={' '}
              <strong style={{ color: kpis.postergar_escritorio ? '#C00000' : '#1A1A1A' }}>
                {kpis.postergar_escritorio ? 'postergar após break-even' : 'R$ 100K–200K'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Card BDR — exibe quando há overflow para outbound no M12 */}
      {hasBdr && (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: '#FFF3CD', border: '1px solid #D4900A' }}
        >
          <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#D4900A' }}>
            ⚠ Complemento Outbound Necessário no M12
          </div>
          <p className="text-xs mb-3" style={{ color: '#3D3D3D' }}>
            O broker inbound não cobre toda a meta de clientes neste mês.
            São necessários <strong>{esforco.bdr_mes_m12} BDR{esforco.bdr_mes_m12 > 1 ? 's' : ''}</strong> para
            prospecção ativa, com custo adicional de <strong>{fmt(esforco.custo_bdr_mes_m12)}/mês</strong>.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold" style={{ color: '#1A1A1A' }}>Canal</div>
              <div style={{ color: '#7A7A7A' }}>Inbound</div>
              <div style={{ color: '#7A7A7A' }}>Outbound</div>
            </div>
            <div>
              <div className="font-bold" style={{ color: '#1A1A1A' }}>MQLs/mês</div>
              <div style={{ color: '#7A7A7A' }}>{fmtInt(esforco.mqls_inbound_mes)}</div>
              <div style={{ color: '#7A7A7A' }}>{fmtInt(esforco.mqls_outbound_mes)}</div>
            </div>
            <div>
              <div className="font-bold" style={{ color: '#1A1A1A' }}>Custo/mês</div>
              <div style={{ color: '#7A7A7A' }}>{fmt(esforco.broker_mes)}</div>
              <div style={{ color: '#7A7A7A' }}>{fmt(esforco.custo_bdr_mes_m12)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta: prejuízo acumulado vs capital disponível */}
      {showDeficitAlert && (
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: isCritico ? '#F4CCCC' : '#FFF3CD',
            border: `1px solid ${isCritico ? '#8B0000' : '#D4900A'}`,
          }}
        >
          <div
            className="text-xs font-bold uppercase tracking-wide mb-2"
            style={{ color: isCritico ? '#8B0000' : '#D4900A' }}
          >
            {isCritico
              ? '⚠ Capital muito próximo do prejuízo acumulado'
              : '⚠ Atenção: prejuízo acumulado acima de 50% do capital'}
          </div>
          <p className="text-xs" style={{ color: '#3D3D3D' }}>
            {isCritico
              ? 'O capital disponível está muito próximo do prejuízo acumulado nos primeiros meses, o que pode inviabilizar o investimento em escritório e equipamentos.'
              : 'O prejuízo acumulado nos primeiros meses representa mais de 50% do capital disponível. Considere esse ponto ao planejar o investimento em escritório e equipamentos.'}
          </p>
        </div>
      )}
    </div>
  )
}
