'use client'

import type { PLMensal, MixFontesM12 } from '@/types'
import { fmt, fmtPct } from '@/lib/format'
import { COR_FONTE } from '@/config/cores'

function Card({
  titulo, cor, subtitulo, split, receita, share, rodape,
}: {
  titulo: string
  /** A mesma cor da faixa dessa fonte no gráfico de área — ver `config/cores`. */
  cor: string
  subtitulo: string; split: string
  receita: number; share: number
  /** Substitui o rodapé padrão quando a fonte não movimentou nada no M12. */
  rodape?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      {/*
        Selo, e não texto colorido: a cor da fonte vira fundo e o texto sai em
        branco, como os selos do termômetro. Colorir a letra sobre branco
        derrubava o contraste do amarelo a 3,8:1; invertido, ele passa em AA.
      */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{ backgroundColor: cor, color: '#FFFFFF' }}
        >
          {titulo}
        </span>
        <span className="text-xs font-bold shrink-0" style={{ color: '#7A7A7A' }}>{split}</span>
      </div>
      <p className="text-xs mt-0.5" style={{ color: '#7A7A7A' }}>{subtitulo}</p>
      <p className="text-2xl font-bold mt-3" style={{ color: '#1A1A1A' }}>{fmt(receita)}</p>
      <div className="mt-2 flex justify-between gap-2 text-xs" style={{ color: '#7A7A7A' }}>
        <span>{rodape ?? 'receita do 12º mês'}</span>
        <span className="font-bold shrink-0">{fmtPct(share * 100, 0)} do total</span>
      </div>
    </div>
  )
}

export function CardsFontes({ m12, mix }: { m12: PLMensal; mix: MixFontesM12 }) {
  return (
    <div className="space-y-3">
      {/*
        O título existe para desarmar a leitura de previsão. O motor entrega UMA
        combinação coerente com o perfil declarado, não a divisão que a carteira
        dele vai ter — dois Assessores com o mesmo faturamento podem chegar lá
        por caminhos bem diferentes entre as três fontes.
      */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#3D3D3D' }}>
          Uma composição possível das três fontes
        </p>
        <p className="text-xs mt-1" style={{ color: '#7A7A7A' }}>
          Ilustrativo: o mesmo faturamento pode se dividir de várias formas entre as fontes.
          Esta é uma delas, coerente com o perfil que você declarou — não uma previsão de como
          a sua carteira vai se repartir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          titulo="Fonte 1 — Alocação" cor={COR_FONTE.alocacao}
          subtitulo="Rede origina · você opera" split="30 / 35%"
          receita={m12.receita_saber_matriz + m12.receita_executar_matriz} share={mix.alocacao}
        />
        <Card
          titulo="Fonte 2 — Self-sourced" cor={COR_FONTE.self_sourced}
          subtitulo="Você origina e opera" split="80%"
          receita={m12.receita_saber_self + m12.receita_executar_self} share={mix.self_sourced}
        />
        <Card
          titulo="Fonte 3 — Originação" cor={COR_FONTE.originacao}
          subtitulo="Você origina · rede opera" split="CAC"
          receita={m12.receita_originacao} share={mix.originacao}
          rodape={m12.receita_originacao > 0 ? undefined : 'sua originação cabe na carteira'}
        />
      </div>
    </div>
  )
}
