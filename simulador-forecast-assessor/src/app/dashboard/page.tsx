'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SimulacaoResult } from '@/types'
import { fmt } from '@/lib/format'
import { TermometroViabilidade } from '@/components/Termometro'
import { KPICards } from '@/components/KPICards'
import { CardsFontes } from '@/components/CardsFontes'
import { GraficoReceita } from '@/components/GraficoReceita'
import { GraficoRenda } from '@/components/GraficoRenda'
import { TabelaDRE } from '@/components/TabelaDRE'

export default function DashboardPage() {
  const router = useRouter()
  const [resultado, setResultado] = useState<SimulacaoResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('simulacao')
    if (!raw) { router.replace('/'); return }
    setResultado(JSON.parse(raw))
  }, [router])

  if (!resultado) return null

  const { input, kpis, termometro, projecao, mix_m12 } = resultado
  const m12 = projecao[projecao.length - 1]
  const pctComercial = Math.round(input.pct_comercial * 100)

  return (
    <main className="min-h-screen px-4 py-6 lg:px-8" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div
          className="bg-white rounded-2xl p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm"
          style={{ border: '1px solid #F2F2F2' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#3D3D3D' }}>
                {100 - pctComercial}% operacional · {pctComercial}% comercial
              </span>
              <span className="text-xs font-bold" style={{ color: '#7A7A7A' }}>
                V4 Company · Simulador de Forecast — Assessor
              </span>
            </div>
            <p className="text-sm" style={{ color: '#3D3D3D' }}>
              Meta <strong>{fmt(input.meta_renda_liquida)}/mês</strong> ·
              retirada mínima <strong>{fmt(input.retirada_minima)}/mês</strong> ·
              Dedicação <strong>{input.dedicacao}</strong> ·
              rede <strong>{({ baixo: 'baixa', medio: 'média', alto: 'alta' } as const)[input.network_level]}</strong>
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: '#8B0000' }}
          >
            Refazer simulação
          </button>
        </div>

        <TermometroViabilidade termometro={termometro} payback={kpis.payback_mes} mesAutossuficiencia={kpis.mes_autossuficiencia} />
        <KPICards kpis={kpis} />
        <CardsFontes m12={m12} mix={mix_m12} />
        <GraficoReceita projecao={projecao} />
        <GraficoRenda projecao={projecao} meta={input.meta_renda_liquida} retirada={input.retirada_minima} />
        <TabelaDRE projecao={projecao} />

        <p className="text-center text-xs pb-6" style={{ color: '#7A7A7A' }}>
          V4 Company · Assessor V4
        </p>
      </div>
    </main>
  )
}
