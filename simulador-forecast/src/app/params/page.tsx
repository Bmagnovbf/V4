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

function Row({ path, value }: { path: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 gap-4" style={{ borderBottom: '1px solid #F2F2F2' }}>
      <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#F2F2F2', color: '#8B0000' }}>
        {path}
      </code>
      <span className="font-bold text-right shrink-0" style={{ color: '#1A1A1A' }}>{value}</span>
    </div>
  )
}

function pct(v: number) { return `${(v * 100).toFixed(1)}%` }
function brl(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) }

export default function ParamsPage() {
  const p = PARAMS
  const deployDate = process.env.VERCEL_GIT_COMMIT_DATE ?? 'dev local'

  return (
    <main className="min-h-screen px-4 py-6 lg:px-8" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Banner somente leitura */}
        <div
          className="rounded-xl px-5 py-3 text-sm font-bold text-center"
          style={{ backgroundColor: '#FFF3CD', border: '1px solid #D4900A', color: '#D4900A' }}
        >
          Painel somente leitura · Para alterar: edite{' '}
          <code className="font-mono text-xs">src/config/params.ts</code>{' '}
          e faça push para o GitHub
        </div>

        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Parâmetros Vigentes</h1>

        {/* Horizontes */}
        <Section title="Horizontes">
          <Row path="PARAMS.horizontes.H1" value={brl(p.horizontes.H1) + '/mês líquido'} />
          <Row path="PARAMS.horizontes.H2" value={brl(p.horizontes.H2) + '/mês líquido'} />
          <Row path="PARAMS.horizontes.H3" value={brl(p.horizontes.H3) + '/mês líquido'} />
        </Section>

        {/* Deduções */}
        <Section title="Deduções sobre Fat. Bruto">
          <Row path="PARAMS.deducoes.royalties"     value={pct(p.deducoes.royalties)} />
          <Row path="PARAMS.deducoes.impostos"      value={pct(p.deducoes.impostos)} />
          <Row path="PARAMS.deducoes.inadimplencia" value={pct(p.deducoes.inadimplencia)} />
        </Section>

        {/* Mix de Tiers */}
        <Section title="Mix de Tiers por Horizonte">
          {(['H1','H2','H3'] as const).map(h => (
            <div key={h} className="mb-2">
              <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>{h}</div>
              <Row path={`PARAMS.mix_tiers.${h}.tiny`}   value={pct(p.mix_tiers[h].tiny)} />
              <Row path={`PARAMS.mix_tiers.${h}.small`}  value={pct(p.mix_tiers[h].small)} />
              <Row path={`PARAMS.mix_tiers.${h}.medium`} value={pct(p.mix_tiers[h].medium)} />
            </div>
          ))}
        </Section>

        {/* Tickets */}
        <Section title="Tickets Médios por Produto e Tier">
          <div className="mb-2">
            <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>Saber (one-time)</div>
            <Row path="PARAMS.tickets.saber.tiny"   value={brl(p.tickets.saber.tiny)} />
            <Row path="PARAMS.tickets.saber.small"  value={brl(p.tickets.saber.small)} />
            <Row path="PARAMS.tickets.saber.medium" value={brl(p.tickets.saber.medium)} />
          </div>
          <div className="mb-2">
            <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>Ter (recorrente/mês)</div>
            <Row path="PARAMS.tickets.ter.tiny"   value={brl(p.tickets.ter.tiny)} />
            <Row path="PARAMS.tickets.ter.small"  value={brl(p.tickets.ter.small)} />
            <Row path="PARAMS.tickets.ter.medium" value={brl(p.tickets.ter.medium)} />
          </div>
          <div className="mb-2">
            <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>Executar (Medium+ only)</div>
            <Row path="PARAMS.tickets.executar.medium" value={brl(p.tickets.executar.medium)} />
          </div>
          <Row path="PARAMS.tickets.ter_pontual" value={brl(p.tickets.ter_pontual) + ' (expansão)'} />
        </Section>

        {/* Canais */}
        <Section title="Canais de Aquisição">
          <div className="mb-2">
            <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>Inbound — Conversão MQL→Venda</div>
            <Row path="PARAMS.canais.inbound.conversao.tiny"   value={pct(p.canais.inbound.conversao.tiny)} />
            <Row path="PARAMS.canais.inbound.conversao.small"  value={pct(p.canais.inbound.conversao.small)} />
            <Row path="PARAMS.canais.inbound.conversao.medium" value={pct(p.canais.inbound.conversao.medium)} />
          </div>
          <div className="mb-2">
            <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>Inbound — CPMQL</div>
            <Row path="PARAMS.canais.inbound.cpmql.tiny"   value={brl(p.canais.inbound.cpmql.tiny)} />
            <Row path="PARAMS.canais.inbound.cpmql.small"  value={brl(p.canais.inbound.cpmql.small)} />
            <Row path="PARAMS.canais.inbound.cpmql.medium" value={brl(p.canais.inbound.cpmql.medium)} />
          </div>
          <Row path="PARAMS.canais.outbound.conversao"       value={pct(p.canais.outbound.conversao)} />
          <Row path="PARAMS.canais.trigger_outbound_ratio"   value={pct(p.canais.trigger_outbound_ratio)} />
        </Section>

        {/* Mix de Aquisição */}
        <Section title="Mix de Aquisição e Regra 75/25">
          <Row path="PARAMS.mix_aquisicao.saber"       value={pct(p.mix_aquisicao.saber)} />
          <Row path="PARAMS.mix_aquisicao.executar"    value={pct(p.mix_aquisicao.executar)} />
          <Row path="PARAMS.mix_receita_m12.aquisicao" value={pct(p.mix_receita_m12.aquisicao)} />
          <Row path="PARAMS.mix_receita_m12.retencao"  value={pct(p.mix_receita_m12.retencao)} />
        </Section>

        {/* Upsell e Retenção */}
        <Section title="Upsell, Retenção e Churn Executar">
          <Row path="PARAMS.upsell.upsell_rate_regime"       value={pct(p.upsell.upsell_rate_regime)} />
          <Row path="PARAMS.upsell.modifier_solida_pp"       value={`+${pct(p.upsell.modifier_solida_pp)}`} />
          <Row path="PARAMS.upsell.pct_expansao_ter"         value={pct(p.upsell.pct_expansao_ter) + ' (a partir de M3)'} />
          <Row path="PARAMS.upsell.renovacao_executar"       value={pct(p.upsell.renovacao_executar) + ' renovam a cada 6 meses'} />
          <Row path="PARAMS.upsell.threshold_churn_executar" value={brl(p.upsell.threshold_churn_executar) + ' (trava de churn)'} />
        </Section>

        {/* BDR Outbound */}
        <Section title="BDR — Outbound Overflow">
          <Row path="PARAMS.canais.outbound.conversao"   value={pct(p.canais.outbound.conversao)} />
          <Row path="PARAMS.canais.bdr.custo"            value={brl(p.canais.bdr.custo) + '/BDR/mês'} />
          <Row path="PARAMS.canais.bdr.leads_por_bdr"    value={p.canais.bdr.leads_por_bdr + ' leads/BDR/mês'} />
        </Section>

        {/* Ramp-up */}
        <Section title="Curva de Ramp-Up (Q1=15% · Q2=25% · Q3=28% · Q4=32%)">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <Row key={m} path={`PARAMS.ramp_up[${m}]`} value={pct(p.ramp_up[m])} />
          ))}
          <Row path="PARAMS.ramp_up[13+]" value="cresce 6%/mês (composto)" />
        </Section>

        {/* CAPEX */}
        <Section title="CAPEX">
          <Row path="PARAMS.capex.franquia"                     value={brl(p.capex.franquia)} />
          <Row path="PARAMS.capex.escritorio_baixo"             value={brl(p.capex.escritorio_baixo)} />
          <Row path="PARAMS.capex.escritorio_alto"              value={brl(p.capex.escritorio_alto)} />
          <Row path="PARAMS.capex.escritorio_ref"               value={brl(p.capex.escritorio_ref)} />
          <Row path="PARAMS.capex.limiar_postergar_escritorio"  value={brl(p.capex.limiar_postergar_escritorio)} />
        </Section>

        {/* Headcount */}
        <Section title="Headcount por Horizonte">
          {(['H1','H2'] as const).map(h => (
            <div key={h} className="mb-2">
              <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>{h}</div>
              <Row path={`PARAMS.headcount.${h}.csp`}       value={String(p.headcount[h].csp)} />
              <Row path={`PARAMS.headcount.${h}.comercial`} value={String(p.headcount[h].comercial)} />
              <Row path={`PARAMS.headcount.${h}.ga`}        value={String(p.headcount[h].ga)} />
              <Row path={`PARAMS.headcount.${h}.total`}     value={String(p.headcount[h].total)} />
            </div>
          ))}
          {p.headcount.H3.map((b, i) => (
            <div key={`H3-${i}`} className="mb-2">
              <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>
                {`H3 (até ${brl(b.ate)})`}
              </div>
              <Row path={`PARAMS.headcount.H3[${i}].csp`}       value={String(b.csp)} />
              <Row path={`PARAMS.headcount.H3[${i}].comercial`} value={String(b.comercial)} />
              <Row path={`PARAMS.headcount.H3[${i}].ga`}        value={String(b.ga)} />
              <Row path={`PARAMS.headcount.H3[${i}].total`}     value={String(b.total)} />
            </div>
          ))}
          <div className="mb-2">
            <div className="text-xs font-bold mb-1" style={{ color: '#7A7A7A' }}>H4 (não exibido — simulador cobre H1–H3)</div>
            <Row path="PARAMS.headcount.H4.csp"       value={String(p.headcount.H4.csp)} />
            <Row path="PARAMS.headcount.H4.comercial" value={String(p.headcount.H4.comercial)} />
            <Row path="PARAMS.headcount.H4.ga"        value={String(p.headcount.H4.ga)} />
            <Row path="PARAMS.headcount.H4.total"     value={String(p.headcount.H4.total)} />
          </div>
        </Section>

        {/* Piso mínimo de custos */}
        <Section title="Estrutura de Custos — Piso Mínimo (R$/mês)">
          <Row path="PARAMS.custos_minimos.csp"              value={brl(p.custos_minimos.csp)} />
          <Row path="PARAMS.custos_minimos.broker"           value={brl(p.custos_minimos.broker)} />
          <Row path="PARAMS.custos_minimos.comercial_equipe" value={brl(p.custos_minimos.comercial_equipe)} />
          <Row path="PARAMS.custos_minimos.ga"               value={brl(p.custos_minimos.ga)} />
          <Row path="Total mínimo"                           value={brl(p.custos_minimos.csp + p.custos_minimos.broker + p.custos_minimos.comercial_equipe + p.custos_minimos.ga)} />
        </Section>

        {/* Proporcional ao fat. líquido */}
        <Section title="Estrutura de Custos — Proporcional ao Fat. Líquido">
          <Row path="PARAMS.proporcoes.csp"              value={pct(p.proporcoes.csp)} />
          <Row path="PARAMS.proporcoes.broker"           value={pct(p.proporcoes.broker)} />
          <Row path="PARAMS.proporcoes.comercial_equipe" value={pct(p.proporcoes.comercial_equipe)} />
          <Row path="PARAMS.proporcoes.ga"               value={pct(p.proporcoes.ga)} />
          <Row path="EBITDA regime pleno (implícito)"    value={pct(1 - p.proporcoes.csp - p.proporcoes.broker - p.proporcoes.comercial_equipe - p.proporcoes.ga)} />
        </Section>

        {/* Termômetro */}
        <Section title="Thresholds do Termômetro">
          <Row path="PARAMS.termometro.capital_ratio.verde"   value="≥ 1,5×" />
          <Row path="PARAMS.termometro.capital_ratio.amarelo" value="≥ 1,0×" />
          <Row path="PARAMS.termometro.payback_meses.verde"   value="≤ 18 meses" />
          <Row path="PARAMS.termometro.payback_meses.amarelo" value="≤ 24 meses" />
        </Section>

        <p className="text-center text-xs pb-6" style={{ color: '#7A7A7A' }}>
          Último deploy: {deployDate} · <a href="/" className="underline">Voltar ao simulador</a>
        </p>
      </div>
    </main>
  )
}
