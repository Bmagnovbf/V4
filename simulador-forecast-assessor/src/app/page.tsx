'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { simular } from '@/lib/calculator'
import { fmt } from '@/lib/format'
import { PARAMS } from '@/config/params'
import type { Dedicacao, FormaPagamento } from '@/types'

const MIN_RENDA = 5_000,  MAX_RENDA = 45_000, STEP_RENDA = 1_000
const MIN_RET   = 2_000,  MAX_RET   = 15_000, STEP_RET   = 500
const MIN_RES   = 0,      MAX_RES   = 150_000, STEP_RES  = 5_000

function parseBRL(raw: string): number { return Number(raw.replace(/\D/g, '')) }
function formatInput(v: number): string { return v ? v.toLocaleString('pt-BR') : '' }

function CampoValor({
  label, hint, value, setValue, min, max, step,
}: {
  label: string; hint: string; value: number; setValue: (v: number) => void
  min: number; max: number; step: number
}) {
  const [raw, setRaw] = useState(formatInput(value))
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
        {label}
      </label>
      <p className="text-xs" style={{ color: '#7A7A7A' }}>{hint}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold shrink-0" style={{ color: '#7A7A7A' }}>R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={e => { const n = parseBRL(e.target.value); setRaw(formatInput(n)); setValue(n) }}
          className="flex-1 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none"
          style={{ border: '1px solid #F2F2F2', color: '#1A1A1A' }}
          onFocus={e => (e.target.style.borderColor = '#C00000')}
          onBlur={e => (e.target.style.borderColor = '#F2F2F2')}
        />
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => { const n = Number(e.target.value); setValue(n); setRaw(formatInput(n)) }}
        className="w-full" style={{ accentColor: '#C00000' }}
      />
      <div className="flex justify-between text-xs" style={{ color: '#7A7A7A' }}>
        <span>{fmt(min)}</span>
        <span className="font-bold" style={{ color: '#3D3D3D' }}>{fmt(value)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}

function ChipGroup<T extends string>({
  label, options, value, onChange, footer,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  footer?: string
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
              style={{
                backgroundColor: active ? '#8B0000' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#3D3D3D',
                border: `1px solid ${active ? '#8B0000' : '#E0E0E0'}`,
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {footer && <p className="text-xs" style={{ color: '#7A7A7A' }}>{footer}</p>}
    </div>
  )
}

export default function InputPage() {
  const router = useRouter()

  const [renda, setRenda] = useState(25_000)
  const [retirada, setRetirada] = useState(8_000)
  const [reserva, setReserva] = useState(25_000)
  const [pctComercial, setPctComercial] = useState(35)
  const [dedicacao, setDedicacao] = useState<Dedicacao>('integral')
  const [pagamento, setPagamento] = useState<FormaPagamento>('a_vista')

  function handleSimular() {
    const resultado = simular({
      meta_renda_liquida: renda,
      retirada_minima: retirada,
      reserva_capital: reserva,
      pct_comercial: pctComercial / 100,
      dedicacao,
      forma_pagamento: pagamento,
    })
    sessionStorage.setItem('simulacao', JSON.stringify(resultado))
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="max-w-xl mx-auto">

        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            Simulador de Forecast — Assessor V4
          </h1>
          <p className="text-sm" style={{ color: '#7A7A7A' }}>
            Projete receita, custos e renda líquida de um Assessor V4 nos primeiros 12 meses.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-8 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>

          <CampoValor
            label="Meta de Renda Líquida no Mês 12"
            hint="Pró-labore mensal, já descontados impostos, CSP e ferramentas"
            value={renda} setValue={setRenda}
            min={MIN_RENDA} max={MAX_RENDA} step={STEP_RENDA}
          />

          <CampoValor
            label="Retirada Mínima Mensal"
            hint="Quanto você precisa retirar por mês para se manter enquanto não atinge o objetivo"
            value={retirada} setValue={setRetirada}
            min={MIN_RET} max={MAX_RET} step={STEP_RET}
          />

          <div style={{ borderTop: '1px solid #F2F2F2' }} />

          {/* Perfil operacional × comercial — a alavanca central do modelo */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
              Seu Perfil
            </label>
            <p className="text-xs" style={{ color: '#7A7A7A' }}>
              Quanto da sua experiência é de operação (entregar) e quanto é de originação (vender)
            </p>
            <input
              type="range"
              min={0} max={100} step={5} value={pctComercial}
              onChange={e => setPctComercial(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#C00000' }}
            />
            <div className="flex justify-between text-xs font-bold" style={{ color: '#3D3D3D' }}>
              <span>{100 - pctComercial}% operacional</span>
              <span>{pctComercial}% comercial</span>
            </div>
            <p className="text-xs" style={{ color: '#7A7A7A' }}>
              Mais operacional → a matriz preenche sua carteira (Fonte 1, {(PARAMS.produtos.saber.split_matriz * 100).toFixed(0)}–{(PARAMS.produtos.executar.split_matriz * 100).toFixed(0)}%).
              Mais comercial → você traz o cliente e fica com {(PARAMS.produtos.saber.split_self * 100).toFixed(0)}% (Fonte 2);
              o que originar acima da sua capacidade vira comissão de originação (Fonte 3).
            </p>
          </div>

          <div style={{ borderTop: '1px solid #F2F2F2' }} />

          <ChipGroup<Dedicacao>
            label="Dedicação"
            options={[
              { value: 'integral', label: 'Integral' },
              { value: 'parcial',  label: 'Parcial'  },
            ]}
            value={dedicacao}
            onChange={setDedicacao}
            footer={`Integral ≈ até ${PARAMS.carteira.cap_ativos_integral} projetos ativos · Parcial ≈ até ${PARAMS.carteira.cap_ativos_parcial}`}
          />

          <ChipGroup<FormaPagamento>
            label="Entrada na rede"
            options={[
              { value: 'a_vista',   label: `${fmt(PARAMS.entrada.a_vista)} à vista` },
              { value: 'parcelado', label: `${PARAMS.entrada.parcelas}x ${fmt(PARAMS.entrada.parcela_valor)}` },
            ]}
            value={pagamento}
            onChange={setPagamento}
            footer="Vira crédito integral se você abrir sua própria unidade"
          />

          <div style={{ borderTop: '1px solid #F2F2F2' }} />

          <CampoValor
            label="Reserva de Capital de Giro"
            hint="Quanto você tem guardado para cobrir a retirada mínima até a renda alcançá-la (não inclui a entrada na rede)"
            value={reserva} setValue={setReserva}
            min={MIN_RES} max={MAX_RES} step={STEP_RES}
          />

          <button
            onClick={handleSimular}
            className="w-full py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors"
            style={{ backgroundColor: '#8B0000' }}
          >
            Simular
          </button>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: '#7A7A7A' }}>
          V4 Company · Uso interno — produto Assessor V4 ·{' '}
          <a href="/params" className="underline">Ver parâmetros</a>
        </p>
      </div>
    </main>
  )
}
