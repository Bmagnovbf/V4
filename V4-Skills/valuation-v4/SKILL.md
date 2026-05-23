---
name: valuation-v4
description: >
  Especialista em cálculo de Valuation de unidades franqueadas da V4 Company.
  Use esta skill sempre que o usuário mencionar: "valuation", "quanto vale a unidade",
  "avaliação da franquia", "entrada de sócio", "saída de sócio", "venda da unidade",
  "fusão", "M&A", "compra de franquia", "avaliar unidade", ou quando enviar DRE/DFC/BP
  de uma unidade com intenção de avaliação financeira. Também acionar quando o usuário
  mencionar acordo de sócios em contexto de negociação ou saída. O output é sempre um
  .docx com o resultado do valuation e memorial de cálculo completo com rastreabilidade
  das fontes.
---

# Skill: Valuation de Unidades V4 Company

## Visão Geral

Esta skill calcula o Valuation individual de unidades franqueadas V4 Company para os
seguintes contextos: entrada/saída de sócios, venda da unidade, e M&A (fusão/aquisição
com outra franquia).

O output é sempre um documento `.docx` com resultado e memorial de cálculo completo,
citando a fonte de cada dado utilizado.

---

## Passo 1 — Coletar contexto de uso

Antes de qualquer cálculo, perguntar ao usuário:

> **"Qual é o contexto desta avaliação?"**
> 1. Entrada ou saída de sócio
> 2. Venda da unidade
> 3. M&A (fusão ou aquisição com outra unidade)

Dependendo da resposta, coletar informações adicionais:

### 1a. Entrada/Saída de Sócio
- É saída **voluntária** ou **involuntária**?
- Existe **acordo de sócios**? (solicitar PDF se sim)

### 1b. Venda da Unidade
- Será vendida apenas a **carteira de clientes**, ou a **equipe vai junto**?
- Existem **outros ativos** envolvidos? (ação da matriz, escritório, equipamentos)

### 1c. M&A
- Há **duas unidades** a avaliar? Se sim, solicitar dados de ambas.
- Calcular individualmente cada unidade e gerar **bloco comparativo** ao final.

---

## Passo 2 — Verificar existência de Acordo de Sócios

Se o usuário indicar que **existe acordo de sócios**:
- Solicitar o PDF do acordo
- Ler o acordo e identificar a **cláusula de metodologia de valuation**
- Seguir **exclusivamente** o método previsto no acordo
- Documentar no memorial: `"Metodologia conforme Acordo de Sócios (Cláusula X, p. Y)"`

Se **não existe acordo de sócios**, prosseguir com as metodologias padrão abaixo.

---

## Passo 3 — Solicitar documentos financeiros

Dados necessários (aceitar PDF ou planilha .xlsx):

| Documento | Dados extraídos |
|-----------|----------------|
| DRE | NOPAT, Faturamento Líquido (inicial e final) |
| DFC | Depreciação/Amortização, CAPEX, Amortização de Dívidas |
| BP (Balanço Patrimonial) | Contas a Receber (inicial/final), Contas a Pagar (inicial/final) |

Se algum dado estiver ausente, solicitar ao usuário antes de prosseguir.

---

## Passo 4 — Definir Metodologia

**Regra de precedência:**

1. Se existe **acordo de sócios** → usar **exclusivamente** a metodologia prevista no acordo.
2. Se **não existe acordo** → usar FCFE Adaptado V4 como padrão, com Múltiplos de EBITDA como validação complementar.
3. **Exceção à regra 1:** Se a metodologia do acordo resultar em valuation zero ou negativo (ex: FCFE negativo), a skill deve:
   - Alertar o usuário sobre o resultado e sua causa
   - Recomendar metodologia alternativa (Múltiplos de EBITDA)
   - Documentar a inconsistência no memorial: "Metodologia prevista no Acordo de Sócios resultou em valuation inválido (FCFE negativo). Metodologia alternativa aplicada com anuência do usuário."
   - Aguardar confirmação do usuário antes de prosseguir com o método alternativo

---

### Metodologia A — FCFE Adaptado V4 (padrão sem acordo de sócios)

Esta é a metodologia interna da V4 Company. Difere do FCFE tradicional da literatura
financeira — documentar isso claramente no memorial.

**Fórmula:**

```
FCFE = NOPAT + D&A - CAPEX + ΔCAG - P

Onde:
  NOPAT  = Lucro Operacional após impostos (fonte: DRE)
  D&A    = Depreciação + Amortização (fonte: DFC)
  CAPEX  = Investimentos em ativos (fonte: DFC)
  ΔCAG   = (Contas a Receber Final - Contas a Receber Inicial)
           + (Contas a Pagar Inicial - Contas a Pagar Final)  [fonte: BP]
  P      = Amortização de Dívidas efetivamente pagas no período (fonte: DFC)
           Nota: P corresponde apenas aos pagamentos realizados no período a título
           de amortização do principal de dívidas e financiamentos de longo prazo.
           Parcelamentos constituídos no período sem amortização registrada resultam
           em P = 0. O saldo total do parcelamento não deve ser utilizado como P.

CAGR = ((Fat. Líquido Final / Fat. Líquido Inicial) ^ (1 / (n-1))) - 1
  n = número de exercícios sociais disponíveis (padrão: 3 anos, conforme Acordo de Sócios padrão V4)

  Se a unidade não possui histórico de 3 anos:
    - Utilizar o período disponível (n real)
    - Solicitar o CAGR apurado via BI Matriz como fonte alternativa
    - Documentar obrigatoriamente no memorial: o período efetivo utilizado,
      a justificativa (início de atividades recente), e a ressalva de que o valor
      não deve ser interpretado como taxa de crescimento sustentável de longo prazo

Múltiplo Base:
  - Saída Voluntária  → 1.5
  - Outros contextos  → 3.0  (padrão: saída involuntária, venda, M&A)

Múltiplo Efetivo (Mef) = Múltiplo Base × 2

VALUATION = FCFE × CAGR × Mef
```

**Alerta de múltiplo:** Se o CAGR calculado for muito divergente da média do setor
(referência: 15–30% a.a. para franquias de marketing em crescimento), ou se o FCFE
for negativo, alertar o usuário e recomendar revisão do múltiplo antes de finalizar.

---

### Metodologia B — Múltiplos de EBITDA

Utilizar quando o usuário solicitar ou como método complementar de validação.

**Referência padrão V4:** 3x EBITDA

A skill pode sugerir ajuste do múltiplo para cima ou para baixo com base em:
- CAGR de faturamento (crescimento acima de 20% → sugerir múltiplo maior)
- Margem EBITDA (abaixo de 10% → sugerir múltiplo menor)
- Recorrência de receita (alta recorrência → múltiplo maior)
- Dependência de clientes-chave (>30% da receita em 1 cliente → múltiplo menor)

A decisão final sobre o múltiplo é sempre do usuário.

```
VALUATION = EBITDA × Múltiplo
```

---

### M&A — Bloco Comparativo

Quando o contexto for M&A, calcular o valuation de cada unidade separadamente
(usando a metodologia aplicável a cada uma), depois gerar seção adicional no .docx:

**"Análise Comparativa — M&A"** contendo:
- Valuation individual de cada unidade (ambos os métodos se disponível)
- Comparativo de CAGR, FCFE, EBITDA e margens
- Relação de troca sugerida (participação % de cada parte em uma eventual fusão)
- Fatores qualitativos relevantes: carteira de clientes, equipe, ativos, dívidas

---

## Passo 5 — Confirmar antes de gerar o documento

Após apresentar o resultado do cálculo no chat (valuation final, metodologia, variáveis utilizadas e ressalvas), **perguntar explicitamente ao usuário:**

> "O cálculo está correto? Posso gerar o documento agora?"

Aguardar confirmação afirmativa antes de prosseguir. Se o usuário solicitar ajustes (ex: revisar múltiplo, corrigir um dado), aplicar as correções e apresentar o resultado atualizado antes de perguntar novamente.

---

## Passo 6 — Gerar o documento .docx

Ler a skill de geração de documentos Word antes de criar o arquivo:
`/mnt/skills/public/docx/SKILL.md`

Ler a skill de geração de documentos Word antes de criar o arquivo:
`/mnt/skills/public/docx/SKILL.md`

### Estrutura do documento

```
1. CAPA
   - Nome da unidade avaliada
   - CNPJ
   - Data-base da avaliação
   - Data de emissão do documento
   - Contexto (ex: "Saída voluntária de sócio")
   - Metodologia aplicada

2. RESULTADO
   - Valuation final: R$ XXX.XXX,XX
   - Preço por quota
   - Tabela-resumo com indicadores principais (TQ, metodologia, cláusula, múltiplo, data-base)

3. MEMORIAL DE CÁLCULO
   - Para cada variável utilizada:
     • Nome da variável
     • Valor utilizado
     • Fonte do dado (ex: "Balancete 2025, conta X.X.X")
     • Fórmula intermediária (quando aplicável)
   - Composição detalhada de cada componente (deduções, despesas, ΔCAG)
   - Resultado de cada etapa do cálculo
   - Valuation final com todas as etapas expostas

4. NOTAS METODOLÓGICAS E ALERTAS
   - Explicar que o FCFE utilizado é adaptação interna da V4 Company
   - Alertas informativos sobre: divergências na documentação, CAGR com histórico
     inferior ao previsto, rubricas de impacto significativo, base de dados limitada
   - Limitações do cálculo (dados utilizados, período, premissas)

5. DOCUMENTOS UTILIZADOS
   - Tabela com cada documento utilizado, período de referência e observações
   - Indicar qual documento foi fonte primária e justificar quando houver divergência

6. [APENAS PARA M&A] ANÁLISE COMPARATIVA
   - Conforme descrito na seção M&A acima

Nota: NÃO incluir seção de condições de pagamento — esse tema não entra no escopo
do documento de valuation.
```

### Identidade Visual
- Fonte: Arial
- Sem uso de azul
- Paleta: preto, cinza, branco, vermelho (alertas), verde (resultado positivo), âmbar (ressalvas)

---

## Passo 7 — Entregar resultado

- Salvar o `.docx` em `/mnt/user-data/outputs/valuation_[nome-unidade]_[data].docx`
- Usar `present_files` para entregar o arquivo
- Apresentar o resultado no chat em formato resumido:
  - Valuation final
  - Metodologia utilizada
  - Principal variável de impacto (ex: "O CAGR de X% foi o principal driver")
  - Ressalvas críticas, se houver

---

## Regras Gerais

- **Rastreabilidade obrigatória:** todo número no memorial deve ter fonte explícita
- **Nunca assumir dados ausentes** — sempre solicitar ao usuário
- **Acordo de sócios prevalece** sobre qualquer outra metodologia quando existir
- **Múltiplo de EBITDA padrão = 3x**, mas a skill deve sugerir ajuste quando os
  fundamentos justificarem, deixando decisão final com o usuário
- **Alertar** quando FCFE negativo ou CAGR fora do intervalo esperado
- **Nunca apresentar o Valuation como definitivo** — sempre como estimativa baseada
  nos dados fornecidos
