import { PARAMS } from '@/config/params'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #F2F2F2' }} open>
      <summary
        className="px-5 py-4 cursor-pointer text-sm font-bold uppercase tracking-wide select-none"
        style={{ color: '#3D3D3D', backgroundColor: '#F2F2F2' }}
      >
        {title}
      </summary>
      <div className="px-5 py-4 space-y-2 text-sm">{children}</div>
    </details>
  )
}

function Row({ path, value, tag }: { path: string; value: string; tag: '✅' | '🟡' | '🔴' }) {
  return (
    <div className="flex items-center justify-between py-1 gap-4" style={{ borderBottom: '1px solid #F2F2F2' }}>
      <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#F2F2F2', color: '#8B0000' }}>
        <span className="mr-1">{tag}</span>{path}
      </code>
      <span className="font-bold text-right shrink-0" style={{ color: '#1A1A1A' }}>{value}</span>
    </div>
  )
}

function pct(v: number) { return `${(v * 100).toFixed(1)}%` }
function brl(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) }

export default function ParamsPage() {
  const p = PARAMS
  const S = p.produtos.saber
  const E = p.produtos.executar
  const deployDate = process.env.VERCEL_GIT_COMMIT_DATE ?? 'dev local'

  return (
    <main className="min-h-screen px-4 py-6 lg:px-8" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="max-w-3xl mx-auto space-y-4">

        <div
          className="rounded-xl px-5 py-3 text-sm font-bold text-center"
          style={{ backgroundColor: '#F4CCCC', border: '1px solid #8B0000', color: '#8B0000' }}
        >
          Uso interno V4 · não exibir ao candidato
        </div>
        <div
          className="rounded-xl px-5 py-3 text-sm text-center"
          style={{ backgroundColor: '#FFF3CD', border: '1px solid #D4900A', color: '#D4900A' }}
        >
          Somente leitura · Para alterar: edite{' '}
          <code className="font-mono text-xs">src/config/params.ts</code> e faça push para o GitHub
        </div>

        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Parâmetros Vigentes — Assessor V4</h1>
        <p className="text-xs" style={{ color: '#7A7A7A' }}>
          ✅ lido da planilha do DRE · 🟡 decidido fora da planilha · 🔴 constante calibrada para o motor generativo
        </p>

        <Section title="Entrada na rede">
          <Row tag="✅" path="entrada.a_vista"       value={brl(p.entrada.a_vista)} />

        </Section>

        <Section title="Produto Saber (one-time)">
          <Row tag="✅" path="produtos.saber.ticket"       value={brl(S.ticket)} />
          <Row tag="✅" path="produtos.saber.split_matriz" value={`${pct(S.split_matriz)} → ${brl(S.ticket * S.split_matriz)}`} />
          <Row tag="✅" path="produtos.saber.split_self"   value={`${pct(S.split_self)} → ${brl(S.ticket * S.split_self)}`} />
          <Row tag="✅" path="produtos.saber.csp_onetime"  value={brl(S.csp_onetime)} />
        </Section>

        <Section title="Produto Executar (recorrente)">
          <Row tag="✅" path="produtos.executar.ticket"         value={`${brl(E.ticket)}/mês`} />
          <Row tag="✅" path="produtos.executar.split_matriz"   value={`${pct(E.split_matriz)} → ${brl(E.ticket * E.split_matriz)}/mês`} />
          <Row tag="✅" path="produtos.executar.split_self"     value={`${pct(E.split_self)} → ${brl(E.ticket * E.split_self)}/mês`} />
          <Row tag="✅" path="produtos.executar.csp_mes"        value={`${brl(E.csp_mes)}/mês`} />
          <Row tag="✅" path="produtos.executar.duracao_meses"  value={`${E.duracao_meses} meses`} />
        </Section>

        <Section title="Fonte 3 · Originação — ele traz, outro opera (CAC)">
          <Row tag="✅" path="originacao.saber_pct_ticket"  value={`${pct(p.originacao.saber_pct_ticket)} → ${brl(S.ticket * p.originacao.saber_pct_ticket)}`} />
          <Row tag="✅" path="originacao.executar_mult_mrr" value={`${p.originacao.executar_mult_mrr}× MRR → ${brl(E.ticket * p.originacao.executar_mult_mrr)}`} />
        </Section>

        <Section title="Horas de entrega">
          <Row tag="✅" path="horas.saber_onetime"  value={`${p.horas.saber_onetime}h por Saber, no mês da entrega`} />
          <Row tag="✅" path="horas.executar_mes"   value={`${p.horas.executar_mes}h/mês por Executar vigente`} />
          <Row tag="✅" path="horas.limite_proprio"          value={`${p.horas.limite_proprio}h/mês em dedicação integral — acima disso o CSP vira freelancer`} />
        </Section>

        <Section title="Impostos e overhead">
          <Row tag="✅" path="impostos.simples" value={pct(p.impostos.simples)} />
          {p.overhead.map((f, i) => (
            <Row key={i} tag="✅"
              path={`overhead[${i}]`}
              value={`${f.ate_mes >= 99 ? 'M9+' : `até M${f.ate_mes}`} · ${brl(f.valor)}/mês`} />
          ))}
        </Section>

        <Section title="Carteira">
          <Row tag="✅" path="carteira.cap_ativos"         value={`${p.carteira.cap_ativos} projetos — teto para a Fonte 1 alocar`} />
          <Row tag="🔴" path="carteira.pct_operacional_ref" value={`${pct(p.carteira.pct_operacional_ref)} — abaixo disso a capacidade cai`} />
          <Row tag="🔴" path="carteira.tolerancia_self"      value={`${p.carteira.tolerancia_self}× — a matriz trava no cap; ele rompe até aqui`} />
          <Row tag="✅" path="carteira.primeiros_saber"      value={`${p.carteira.primeiros_saber} primeiros contratos`} />
          <Row tag="🟡" path="carteira.mix_alocacao"        value={`${pct(p.carteira.mix_alocacao.saber)} Saber · ${pct(p.carteira.mix_alocacao.executar)} Executar`} />
          <Row tag="✅" path="carteira.mix_self"             value={`${pct(p.carteira.mix_self.saber)} Saber · ${pct(p.carteira.mix_self.executar)} Executar`} />
          <Row tag="✅" path="carteira.matriz_pace"          value={p.carteira.matriz_pace.slice(1).join(' · ') + ' cliente(s)/mês'} />
        </Section>

        <Section title="Rede de relacionamento">
          <Row tag="🔴" path="network.baixo" value={`${p.network.baixo.faixa} · fator ${p.network.baixo.fator}×`} />
          <Row tag="🔴" path="network.medio" value={`${p.network.medio.faixa} · fator ${p.network.medio.fator}×`} />
          <Row tag="🔴" path="network.alto"  value={`${p.network.alto.faixa} · fator ${p.network.alto.fator}×`} />
        </Section>

        <Section title="Vendas próprias (alimentam as Fontes 2 e 3)">
          <Row tag="✅" path="comercial.inicio_vendas_mes"      value={`M${p.comercial.inicio_vendas_mes}`} />
          <Row tag="🔴" path="comercial.expoente_maturacao"     value={`${p.comercial.expoente_maturacao} — curva côncava da rampa`} />
          <Row tag="🟡" path="comercial.calls_mes_max"          value={`${p.comercial.calls_mes_max} calls novas/mês`} />
          <Row tag="🟡" path="comercial.conversao_call_venda"   value={pct(p.comercial.conversao_call_venda)} />
          <Row tag="✅" path="→ teto de vendas"                 value={`${(p.comercial.calls_mes_max * p.comercial.conversao_call_venda).toFixed(1)}/mês × % comercial × fator de rede`} />
        </Section>

        <Section title="Termômetro de Viabilidade (dois eixos)">
          <Row tag="🔴" path="termometro.reserva_ratio" value={`verde ≥ ${p.termometro.reserva_ratio.verde}× · amarelo ≥ ${p.termometro.reserva_ratio.amarelo}×`} />
          <Row tag="🔴" path="termometro.meta_ratio"    value={`verde ≥ ${pct(p.termometro.meta_ratio.verde)} · amarelo ≥ ${pct(p.termometro.meta_ratio.amarelo)}`} />
        </Section>

        <p className="text-center text-xs pb-6" style={{ color: '#7A7A7A' }}>
          Último deploy: {deployDate} · <a href="/" className="underline">Voltar ao simulador</a>
        </p>
      </div>
    </main>
  )
}
