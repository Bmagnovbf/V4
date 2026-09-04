'use client'

import type { PLMensal } from '@/types'

const N = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

function cell(v: number, negativo = false) {
  if (Math.abs(v) < 0.5) return '–'
  return negativo ? `(${N.format(Math.abs(v))})` : N.format(v)
}

export function TabelaDRE({ projecao }: { projecao: PLMensal[] }) {
  const linhas: {
    label: string; get: (l: PLMensal) => number
    neg?: boolean; forte?: boolean; destaque?: boolean; sufixo?: string; indent?: boolean
    /** Sobe a linha inteira um passo de corpo — as duas que se lê primeiro. */
    grande?: boolean
  }[] = [
    { label: 'Saber · Alocação',        get: l => l.receita_saber_matriz },
    { label: 'Saber · Self-sourced',    get: l => l.receita_saber_self },
    { label: 'Executar · Alocação',     get: l => l.receita_executar_matriz },
    { label: 'Executar · Self-sourced', get: l => l.receita_executar_self },
    { label: 'Originação (CAC)',        get: l => l.receita_originacao },
    { label: '(=) Receita recebida',    get: l => l.receita_recebida, forte: true, grande: true },
    { label: '(−) Impostos',            get: l => l.impostos, neg: true },
    // Só a parte que fica com ele. O CSP das horas que estouram o limite está
    // na linha de baixo, com os terceirizados — é o que faz o DRE fechar linha
    // a linha: receita − impostos − CSP Assessor − terceirizados = resultado.
    { label: '(−) CSP Assessor',        get: l => l.csp_proprio, neg: true },
    { label: '(−) Softwares, ferramentas e Terceirizados', get: l => l.freelas_total, neg: true },
    { label: '(=) Resultado do negócio', get: l => l.renda_liquida, forte: true },
    { label: 'Remuneração Total (CSP + resultado)', get: l => l.remuneracao_total, forte: true, destaque: true, grande: true },
    { label: 'Horas Alocadas Previstas', get: l => l.horas_alocadas, sufixo: 'h', forte: true },
    { label: 'Horas Previstas Assessor', get: l => l.horas_alocadas - l.horas_terceirizadas, sufixo: 'h', indent: true },
    { label: 'Horas Terceirizadas',     get: l => l.horas_terceirizadas, sufixo: 'h', indent: true },
    { label: 'Caixa acumulado',         get: l => l.caixa_acumulado },
  ]

  const terceirizou = projecao.some(l => l.csp_terceirizado > 0)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F2F2F2' }}>
      <p className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: '#3D3D3D' }}>
        DRE projetado · 12 meses
      </p>
      <p className="text-xs mb-4" style={{ color: '#7A7A7A' }}>
        O CSP Assessor remunera as horas que você mesmo entrega
        {terceirizou && ' — o que passa de 190h/mês sai do seu bolso, na linha de terceirizados'}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
              <th className="text-left py-2 pr-3 font-bold" style={{ color: '#7A7A7A' }}>R$</th>
              {projecao.map(l => (
                <th key={l.mes} className="text-right py-2 px-2 font-bold" style={{ color: '#7A7A7A' }}>
                  M{l.mes}
                </th>
              ))}
              <th className="text-right py-2 pl-3 font-bold" style={{ color: '#3D3D3D' }}>Ano</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(linha => {
              const acumula = linha.label !== 'Caixa acumulado'
              const ano = acumula
                ? projecao.reduce((s, l) => s + linha.get(l), 0)
                : projecao[projecao.length - 1].caixa_acumulado
              return (
                <tr key={linha.label} style={{ borderBottom: '1px solid #F2F2F2' }}>
                  <td
                    className={`text-left py-1.5 pr-3 ${linha.grande ? 'text-sm' : ''}`}
                    style={{
                      color: linha.destaque ? '#1A5C38' : linha.forte ? '#1A1A1A' : '#3D3D3D',
                      fontWeight: linha.forte ? 700 : 400,
                      paddingLeft: linha.indent ? '1rem' : undefined,
                    }}
                  >
                    {linha.label}
                  </td>
                  {projecao.map(l => {
                    const v = linha.get(l)
                    return (
                      <td
                        key={l.mes}
                        className={`text-right py-1.5 px-2 ${linha.grande ? 'text-sm' : ''}`}
                        style={{
                          color: linha.destaque ? '#1A5C38'
                            : linha.neg || v < 0 ? '#8B0000'
                            : linha.forte ? '#1A1A1A' : '#3D3D3D',
                          fontWeight: linha.forte ? 700 : 400,
                        }}
                      >
                        {cell(v, linha.neg)}{linha.sufixo && v >= 0.5 ? linha.sufixo : ''}
                      </td>
                    )
                  })}
                  <td
                    className={`text-right py-1.5 pl-3 ${linha.grande ? 'text-sm' : ''}`}
                    style={{
                      color: linha.destaque ? '#1A5C38' : linha.neg ? '#8B0000' : '#1A1A1A',
                      fontWeight: 700,
                      borderLeft: '1px solid #F2F2F2',
                    }}
                  >
                    {cell(ano, linha.neg)}{linha.sufixo && ano >= 0.5 ? linha.sufixo : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
