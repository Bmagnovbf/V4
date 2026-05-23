'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SimulacaoResult } from '@/types'
import { fmt } from '@/lib/format'
import { gerarPPTX } from '@/lib/pptx'
import { TermometroViabilidade } from '@/components/Termometro'
import { KPICards } from '@/components/KPICards'
import { GraficoFaturamento } from '@/components/GraficoFaturamento'
import { GraficoMQLs } from '@/components/GraficoMQLs'
import { GraficoLucratividade } from '@/components/GraficoLucratividade'
import { CardsMargemRetorno } from '@/components/CardsMargemRetorno'
import { CardsEsforco } from '@/components/CardsEsforco'
import { AlocacaoRecursos } from '@/components/AlocacaoRecursos'

export default function DashboardPage() {
  const router = useRouter()
  const [resultado, setResultado] = useState<SimulacaoResult | null>(null)
  const [gerando, setGerando] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('simulacao')
    if (!raw) { router.replace('/'); return }
    setResultado(JSON.parse(raw))
  }, [router])

  if (!resultado) return null

  const { horizonte, input, kpis, termometro, esforco, projecao, headcount, alocacao_m12, blended } = resultado

  // H4+: bloquear simulação
  if (horizonte === 'H4+') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F2F2F2' }}>
        <div className="max-w-md text-center space-y-4">
          <div className="text-5xl">🚧</div>
          <h1 className="text-2xl font-bold" style={{ color: '#8B0000' }}>Meta fora do escopo</h1>
          <p className="text-sm" style={{ color: '#3D3D3D' }}>
            Sua meta de {fmt(input.meta_fat_bruto)}/mês está acima do horizonte H3 (H4+).
            Este simulador cobre apenas H1, H2 e H3. Entre em contato com a equipe V4 para uma análise dedicada.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ backgroundColor: '#8B0000' }}
          >
            Refazer simulação
          </button>
        </div>
      </main>
    )
  }

  async function handleDownload() {
    setGerando(true)
    try { await gerarPPTX(resultado!) } finally { setGerando(false) }
  }

  return (
    <main className="min-h-screen px-4 py-6 lg:px-8" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Bloco A: Cabeçalho ────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm"
          style={{ border: '1px solid #F2F2F2' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#3D3D3D' }}
              >
                {horizonte}
              </span>
              <span className="text-xs font-bold" style={{ color: '#7A7A7A' }}>
                V4 Company · Simulador de Forecast
              </span>
            </div>
            <div className="text-sm" style={{ color: '#3D3D3D' }}>
              Meta M12: <strong>{fmt(input.meta_fat_bruto)}</strong> bruto/mês ·
              Capital: <strong>{fmt(input.capital_disponivel)}</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors"
              style={{ borderColor: '#7A7A7A', color: '#7A7A7A' }}
            >
              Refazer simulação
            </button>
            <button
              onClick={handleDownload}
              disabled={gerando}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#8B0000' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#C00000')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#8B0000')}
            >
              {gerando ? 'Gerando...' : 'Baixar Apresentação (.pptx)'}
            </button>
          </div>
        </div>

        {/* ── Alerta: meta abaixo do pace mínimo de horizonte ──────────── */}
        {input.meta_fat_bruto < 150_000 && (
          <div
            className="rounded-2xl p-4 flex gap-3 items-start shadow-sm"
            style={{ backgroundColor: '#FFF5F5', border: '1px solid #C00000' }}
          >
            <span className="text-lg shrink-0" style={{ color: '#C00000' }}>⚠</span>
            <div className="space-y-1">
              <p className="text-sm font-bold" style={{ color: '#C00000' }}>
                Ambição abaixo do pace mínimo de avanço de horizonte
              </p>
              <p className="text-xs" style={{ color: '#3D3D3D' }}>
                Uma unidade com 12 meses de operação precisa estar faturando no mínimo{' '}
                <strong>R$ 150.000/mês</strong>. Seu forecast de{' '}
                <strong>{fmt(input.meta_fat_bruto)}/mês</strong> está abaixo deste patamar —
                revise sua meta ou reavalie o plano de aquisição antes de avançar.
              </p>
            </div>
          </div>
        )}

        {/* ── Bloco B: Termômetro ───────────────────────────────────────── */}
        <TermometroViabilidade termometro={termometro} horizonte={horizonte} meta_fat_bruto={input.meta_fat_bruto} />

        {/* ── Bloco C: KPIs primários ───────────────────────────────────── */}
        <KPICards kpis={kpis} />

        {/* ── Blocos D + E: Faturamento/Broker + MQLs ──────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GraficoFaturamento projecao={projecao} />
          <GraficoMQLs projecao={projecao} />
        </div>

        {/* ── Bloco F: Margens e Retorno ────────────────────────────────── */}
        <CardsMargemRetorno kpis={kpis} />

        {/* ── Bloco G: Lucratividade acumulada ─────────────────────────── */}
        <GraficoLucratividade
          projecao={projecao}
          breakeven_mes={kpis.breakeven_mes}
          payback_mes={kpis.payback_mes}
        />

        {/* ── Bloco F (esforço): Esforço Operacional ───────────────────── */}
        <CardsEsforco
          esforco={esforco}
          kpis={kpis}
          headcount={headcount}
          blended_conversao={blended.conversao}
        />

        {/* ── Bloco H: Alocação de Recursos ─────────────────────────────── */}
        <AlocacaoRecursos alocacao={alocacao_m12} />

        <p className="text-center text-xs pb-4" style={{ color: '#7A7A7A' }}>
          Simulação baseada em benchmarks da rede V4. Valores projetados, não garantidos. ·{' '}
          <a href="/params" className="underline">Ver parâmetros</a>
        </p>
      </div>
    </main>
  )
}
