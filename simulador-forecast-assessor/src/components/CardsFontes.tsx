'use client'

import type { PLMensal, MixFontesM12 } from '@/types'
import { fmt, fmtPct, fmtInt } from '@/lib/format'

function Card({
  titulo, subtitulo, split, receita, share, detalhe,
}: {
  titulo: string; subtitulo: string; split: string
  receita: number; share: number; detalhe: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#8B0000' }}>{titulo}</p>
        <span className="text-xs font-bold" style={{ color: '#7A7A7A' }}>{split}</span>
      </div>
      <p className="text-xs mt-0.5" style={{ color: '#7A7A7A' }}>{subtitulo}</p>
      <p className="text-2xl font-bold mt-3" style={{ color: '#1A1A1A' }}>{fmt(receita)}</p>
      <div className="mt-2 flex justify-between text-xs" style={{ color: '#7A7A7A' }}>
        <span>{detalhe}</span>
        <span className="font-bold">{fmtPct(share * 100, 0)}</span>
      </div>
    </div>
  )
}

export function CardsFontes({ m12, mix }: { m12: PLMensal; mix: MixFontesM12 }) {
  const n = fmtInt
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card
        titulo="Fonte 1 — Alocação" subtitulo="Matriz origina · você opera" split="30 / 35%"
        receita={m12.receita_saber_matriz + m12.receita_executar_matriz} share={mix.alocacao}
        detalhe={`${n(m12.saber_novos_matriz)} Saber · ${n(m12.executar_ativos_matriz)} Executar`}
      />
      <Card
        titulo="Fonte 2 — Self-sourced" subtitulo="Você origina e opera" split="80%"
        receita={m12.receita_saber_self + m12.receita_executar_self} share={mix.self_sourced}
        detalhe={`${n(m12.saber_novos_self)} Saber · ${n(m12.executar_ativos_self)} Executar`}
      />
      <Card
        titulo="Fonte 3 — Originação" subtitulo="Você origina · outro opera" split="CAC"
        receita={m12.receita_originacao} share={mix.originacao}
        detalhe={
          m12.receita_originacao > 0
            ? `${n(m12.saber_originados + m12.executar_originados)} contrato(s) repassado(s)`
            : 'sua originação cabe na carteira'
        }
      />
    </div>
  )
}
