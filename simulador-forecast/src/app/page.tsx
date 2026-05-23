'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { simular } from '@/lib/calculator'
import { fmt } from '@/lib/format'
import { PARAMS } from '@/config/params'
import type { NetworkLevel, Tier, Experiencia } from '@/types'

const MIN_FAT  = 60_000
const MAX_FAT  = 450_000
const STEP_FAT = 5_000
const MIN_CAP  = 40_000
const MAX_CAP  = 700_000
const STEP_CAP = 10_000

function TicketInput({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(value))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const txt = e.target.value.replace(/[^\d]/g, '')
    setRaw(txt)
    const n = parseInt(txt, 10)
    if (!isNaN(n) && n >= 1) onChange(n)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const n = parseInt(raw, 10)
    const clamped = isNaN(n) || n < 1 ? 1 : n
    setRaw(String(clamped))
    onChange(clamped)
    e.currentTarget.parentElement!.style.borderColor = '#E0E0E0'
  }

  return (
    <div className="space-y-1">
      <p className="text-xs" style={{ color: '#7A7A7A' }}>{label}</p>
      <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
        <span className="px-2 py-2 text-xs font-bold shrink-0" style={{ backgroundColor: '#F2F2F2', color: '#7A7A7A' }}>R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex-1 px-2 py-2 text-sm font-bold focus:outline-none min-w-0"
          style={{ color: '#1A1A1A' }}
          onFocus={e => (e.currentTarget.parentElement!.style.borderColor = '#C00000')}
        />
      </div>
    </div>
  )
}

function ConvInput({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(value))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // aceita vírgula como separador decimal
    const txt = e.target.value.replace(',', '.')
    setRaw(e.target.value) // mantém o que o usuário digitou (com vírgula ou ponto)
    const n = parseFloat(txt)
    if (!isNaN(n) && n > 0 && n <= 100) onChange(n)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const n = parseFloat(raw.replace(',', '.'))
    const clamped = isNaN(n) ? 0.1 : Math.min(100, Math.max(0.1, n))
    setRaw(String(clamped))
    onChange(clamped)
    e.currentTarget.parentElement!.style.borderColor = '#E0E0E0'
  }

  return (
    <div className="space-y-1">
      <p className="text-xs" style={{ color: '#7A7A7A' }}>{label}</p>
      <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex-1 px-2 py-2 text-sm font-bold focus:outline-none min-w-0"
          style={{ color: '#1A1A1A' }}
          onFocus={e => (e.currentTarget.parentElement!.style.borderColor = '#C00000')}
        />
        <span className="px-2 py-2 text-xs font-bold shrink-0" style={{ backgroundColor: '#F2F2F2', color: '#7A7A7A' }}>%</span>
      </div>
    </div>
  )
}

function parseBRL(raw: string): number {
  return Number(raw.replace(/\D/g, ''))
}

function formatInput(value: number): string {
  if (!value) return ''
  return value.toLocaleString('pt-BR')
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  footer,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
  footer?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              style={{
                backgroundColor: active ? '#8B0000' : '#F2F2F2',
                color:           active ? '#FFFFFF' : '#3D3D3D',
                border:          active ? '1px solid #8B0000' : '1px solid #E0E0E0',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget.style.borderColor = '#C00000')
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget.style.borderColor = '#E0E0E0')
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {footer && (
        <p className="text-xs" style={{ color: '#7A7A7A' }}>{footer}</p>
      )}
    </div>
  )
}

export default function InputPage() {
  const router = useRouter()
  const [fat, setFat] = useState(150_000)
  const [cap, setCap] = useState(400_000)
  const [fatRaw, setFatRaw] = useState(formatInput(150_000))
  const [capRaw, setCapRaw] = useState(formatInput(400_000))

  const [networkLevel, setNetworkLevel] = useState<NetworkLevel | null>(null)
  const [networkTier,  setNetworkTier]  = useState<Tier | null>(null)
  const [experiencia,  setExperiencia]  = useState<Experiencia | null>(null)

  // Ponto 1 — tickets editáveis (default = benchmarks da imersão)
  const [tkSaberTiny,   setTkSaberTiny]   = useState<number>(PARAMS.tickets.saber.tiny)
  const [tkSaberSmall,  setTkSaberSmall]  = useState<number>(PARAMS.tickets.saber.small)
  const [tkSaberMed,    setTkSaberMed]    = useState<number>(PARAMS.tickets.saber.medium)
  const [tkTerTiny,     setTkTerTiny]     = useState<number>(PARAMS.tickets.ter.tiny)
  const [tkTerSmall,    setTkTerSmall]    = useState<number>(PARAMS.tickets.ter.small)
  const [tkTerMed,      setTkTerMed]      = useState<number>(PARAMS.tickets.ter.medium)
  const [tkExec,        setTkExec]        = useState<number>(PARAMS.tickets.executar.medium)

  // Ponto 2 — conversão editável (exibido em %, armazenado em %)
  const [convTiny,   setConvTiny]   = useState<number>(+(PARAMS.canais.inbound.conversao.tiny   * 100).toFixed(1))
  const [convSmall,  setConvSmall]  = useState<number>(+(PARAMS.canais.inbound.conversao.small  * 100).toFixed(1))
  const [convMedium, setConvMedium] = useState<number>(+(PARAMS.canais.inbound.conversao.medium * 100).toFixed(1))

  function handleFatInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setFatRaw(raw)
    const n = parseBRL(raw)
    if (n >= MIN_FAT && n <= MAX_FAT) setFat(n)
  }

  function handleFatBlur() {
    const clamped = Math.min(MAX_FAT, Math.max(MIN_FAT, fat))
    setFat(clamped)
    setFatRaw(formatInput(clamped))
  }

  function handleCapInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setCapRaw(raw)
    const n = parseBRL(raw)
    if (n >= MIN_CAP && n <= MAX_CAP) setCap(n)
  }

  function handleCapBlur() {
    const clamped = Math.min(MAX_CAP, Math.max(MIN_CAP, cap))
    setCap(clamped)
    setCapRaw(formatInput(clamped))
  }

  function handleSimular() {
    if (!networkLevel || !networkTier || !experiencia) return
    const resultado = simular({
      meta_fat_bruto:     fat,
      capital_disponivel: cap,
      network_level:      networkLevel,
      network_tier:       networkTier,
      experiencia,
      ticket_saber_tiny:      tkSaberTiny,
      ticket_saber_small:     tkSaberSmall,
      ticket_saber_medium:    tkSaberMed,
      ticket_ter_tiny:        tkTerTiny,
      ticket_ter_small:       tkTerSmall,
      ticket_ter_medium:      tkTerMed,
      ticket_executar_medium: tkExec,
      conversao_mql_tiny:     convTiny   / 100,
      conversao_mql_small:    convSmall  / 100,
      conversao_mql_medium:   convMedium / 100,
    })
    sessionStorage.setItem('simulacao', JSON.stringify(resultado))
    router.push('/dashboard')
  }

  const isReady = fat >= MIN_FAT && cap >= MIN_CAP && !!networkLevel && !!networkTier && !!experiencia

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="w-full max-w-lg">
        {/* Marca */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#8B0000' }}>
            V4 Company
          </span>
          <p className="mt-1 text-sm" style={{ color: '#7A7A7A' }}>
            Simulador de Forecast para Franqueados
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8" style={{ border: '1px solid #F2F2F2' }}>

          {/* Campo 1: Faturamento bruto */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
              Meta de Faturamento Bruto no Mês 12
            </label>
            <p className="text-xs" style={{ color: '#7A7A7A' }}>
              Total de vendas antes de royalties e impostos
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold shrink-0" style={{ color: '#7A7A7A' }}>R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={fatRaw}
                onChange={handleFatInput}
                onBlur={handleFatBlur}
                placeholder="150.000"
                className="flex-1 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none"
                style={{ border: '1px solid #F2F2F2', color: '#1A1A1A' }}
                onFocus={e => (e.target.style.borderColor = '#C00000')}
              />
            </div>
            <input
              type="range"
              min={MIN_FAT} max={MAX_FAT} step={STEP_FAT} value={fat}
              onChange={e => { const n = Number(e.target.value); setFat(n); setFatRaw(formatInput(n)) }}
              className="w-full"
              style={{ accentColor: '#C00000' }}
            />
            <div className="flex justify-between text-xs" style={{ color: '#7A7A7A' }}>
              <span>{fmt(MIN_FAT)}</span>
              <span className="font-bold" style={{ color: '#3D3D3D' }}>{fmt(fat)}</span>
              <span>{fmt(MAX_FAT)}</span>
            </div>
          </div>

          {/* Campo 2: Capital disponível */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
              Capital Disponível Total
            </label>
            <p className="text-xs" style={{ color: '#7A7A7A' }}>
              CAPEX + capital de giro (inclui taxa de franquia R$&nbsp;100K)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold shrink-0" style={{ color: '#7A7A7A' }}>R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={capRaw}
                onChange={handleCapInput}
                onBlur={handleCapBlur}
                placeholder="400.000"
                className="flex-1 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none"
                style={{ border: '1px solid #F2F2F2', color: '#1A1A1A' }}
                onFocus={e => (e.target.style.borderColor = '#C00000')}
              />
            </div>
            <input
              type="range"
              min={MIN_CAP} max={MAX_CAP} step={STEP_CAP} value={cap}
              onChange={e => { const n = Number(e.target.value); setCap(n); setCapRaw(formatInput(n)) }}
              className="w-full"
              style={{ accentColor: '#C00000' }}
            />
            <div className="flex justify-between text-xs" style={{ color: '#7A7A7A' }}>
              <span>{fmt(MIN_CAP)}</span>
              <span className="font-bold" style={{ color: '#3D3D3D' }}>{fmt(cap)}</span>
              <span>{fmt(MAX_CAP)}</span>
            </div>
          </div>

          {/* Divisor */}
          <div style={{ borderTop: '1px solid #F2F2F2' }} />

          {/* MCQ 1: Nível de rede */}
          <ChipGroup<NetworkLevel>
            label="Como você avalia sua rede de relacionamento com empresários?"
            options={[
              { value: 'baixo', label: 'Baixa' },
              { value: 'medio', label: 'Média' },
              { value: 'alto',  label: 'Alta'  },
            ]}
            value={networkLevel}
            onChange={setNetworkLevel}
            footer="Baixa ≈ 10 empresas · Média ≈ 30 empresas · Alta ≈ 50 empresas ou +"
          />

          {/* MCQ 2: Tier da rede */}
          <ChipGroup<Tier>
            label="Qual o porte predominante dos empresários da sua rede?"
            options={[
              { value: 'tiny',   label: 'Tiny (fat. < R$1,2M/ano)'    },
              { value: 'small',  label: 'Small (R$1,2M – R$2,4M/ano)' },
              { value: 'medium', label: 'Medium+ (fat. > R$25M/ano)'  },
            ]}
            value={networkTier}
            onChange={setNetworkTier}
          />

          {/* MCQ 3: Experiência */}
          <ChipGroup<Experiencia>
            label="Qual sua experiência com marketing de performance e vendas?"
            options={[
              { value: 'teorico', label: 'Teórico'  },
              { value: 'solida',  label: 'Prática'  },
            ]}
            value={experiencia}
            onChange={setExperiencia}
          />

          {/* Divisor */}
          <div style={{ borderTop: '1px solid #F2F2F2' }} />

          {/* Parâmetros de Imersão */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
                Parâmetros de Imersão
              </p>
              <p className="text-xs mt-1" style={{ color: '#7A7A7A' }}>
                Insira os valores aprendidos durante a imersão V4. Dados incorretos impactam diretamente o forecast.
              </p>
            </div>

            {/* Ticket Saber */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>
                $ Ticket Médio — Saber
              </p>
              <div className="grid grid-cols-3 gap-2">
                <TicketInput label="Tiny"   value={tkSaberTiny}  onChange={setTkSaberTiny}  />
                <TicketInput label="Small"  value={tkSaberSmall} onChange={setTkSaberSmall} />
                <TicketInput label="Medium" value={tkSaberMed}   onChange={setTkSaberMed}   />
              </div>
            </div>

            {/* Ticket Ter */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>
                $ Ticket Médio — Ter
              </p>
              <div className="grid grid-cols-3 gap-2">
                <TicketInput label="Tiny"   value={tkTerTiny}  onChange={setTkTerTiny}  />
                <TicketInput label="Small"  value={tkTerSmall} onChange={setTkTerSmall} />
                <TicketInput label="Medium" value={tkTerMed}   onChange={setTkTerMed}   />
              </div>
            </div>

            {/* Ticket Executar */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>
                $ Ticket Médio — Executar
              </p>
              <div className="grid grid-cols-3 gap-2">
                <TicketInput label="Medium" value={tkExec} onChange={setTkExec} />
              </div>
            </div>

            {/* Conversão MQL */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7A7A7A' }}>
                % Conversão MQL → Venda
              </p>
              <div className="grid grid-cols-3 gap-2">
                <ConvInput label="Tiny"   value={convTiny}   onChange={setConvTiny}   />
                <ConvInput label="Small"  value={convSmall}  onChange={setConvSmall}  />
                <ConvInput label="Medium" value={convMedium} onChange={setConvMedium} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleSimular}
            disabled={!isReady}
            className="w-full py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors"
            style={{
              backgroundColor: isReady ? '#8B0000' : '#ccc',
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (isReady) (e.currentTarget.style.backgroundColor = '#C00000') }}
            onMouseLeave={e => { if (isReady) (e.currentTarget.style.backgroundColor = '#8B0000') }}
          >
            Simular
          </button>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: '#7A7A7A' }}>
          V4 Company · Uso interno — dados simulados com base em benchmarks da rede ·{' '}
          <a href="/params" className="underline">Ver parâmetros</a>
        </p>
      </div>
    </main>
  )
}
