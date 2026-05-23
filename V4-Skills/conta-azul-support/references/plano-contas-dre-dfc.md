# Plano de Contas, DRE e DFC — Padrão V4 Company

**Código POP:** ADM/FIN-CONC-002 | Atualizado: 29/01/2026  
**Também referencia:** ADM/RDC-FIN-008 (Nova tela de relatórios, 04/12/2025)

---

## Estrutura do Plano de Contas V4 Company

### Receitas

| Código | Descrição |
|---|---|
| **1** | **Receitas Operacionais Totais** |
| 1.1 | Receitas Aquisição |
| 1.1.01 a 1.1.08 | Aquisição \| [Produto] BR/USA (Saber, Ter, Executar, Potencializar) |
| 1.2 | Receitas Renovação |
| 1.3 | Receitas Expansão |
| 1.4 | Receitas Variáveis |
| 1.4.01 | Comissão de Cliente (BV / Variável) |
| 1.4.02 | Comissão Stack Digital |
| **6.1** | **Receita Financeira** (2 níveis apenas) |
| 6.1.01 | Rendimentos de Aplicações |
| 6.1.02 | Dividendos Recebidos |
| 6.1.03 | Aluguel de Sublocação |
| 6.1.04 | Receitas de Exercícios Anteriores |
| 6.1.05 | Outras Receitas Não Operacionais |
| 6.1.06 | Multas e Juros Recebidos |
| 6.1.07 | Variação Cambial |

**Categorias sem "mãe" (Nível 1):**
- (+) Aporte de Capital (Sócios)
- (+) Entrada de Empréstimos / Financiamentos
- (+) Venda de Ativo / Quotas

### Deduções da Receita

| Código | Descrição |
|---|---|
| **2** | **Deduções Da Receita** |
| 2.1 | Impostos Sobre o Faturamento |
| 2.1.01 | PIS |
| 2.1.02 | COFINS |
| 2.1.03 | ISS |
| 2.1.04 | CBS |
| 2.1.05 | IBS |
| 2.1.06 | DAS (Simples Nacional) |
| 2.1.07 | Outros Impostos (IOF, DIFAL, INSS, etc) |
| 2.2 | Tarifas Sobre Receita |
| 2.2.01 | Taxas Receita - Boleto |
| 2.2.02 | Taxas Receita - PIX |
| 2.2.03 | Taxas Receita - Cartões de Crédito |
| 2.2.04 | Taxas Receita - Antecipação de Recebíveis |
| 2.2.05 | Taxas Receita - Stripe (USA) |
| 2.2.06 | Taxas Receita - Vanagin Cambial (USA) |
| 2.3 | Royalties e Outras Deduções |
| 2.3.01 | Royalties (BR) |
| 2.3.02 | Royalties (USA) |
| 2.3.03 | Descontos, Devoluções e Cancelamentos |

### Custos Operacionais (CSP)

| Código | Descrição |
|---|---|
| **3** | **Custos Operacionais** |
| 3.1 | Mão de Obra Operacional (CSP) |
| 3.1.01 | CSP - Gerente de PE&G |
| 3.1.02 | CSP - Coordenador de PE&G |
| 3.1.03 | CSP - Operação [Saber] |
| 3.1.04 | CSP - Operação [Ter] |
| 3.1.05 | CSP - Operação [Executar] |
| 3.1.06 | CSP - Operação [Potencializar] |
| 3.1.07 | Encargos Folha CSP [Saber] |
| 3.1.08 | Encargos Folha CSP [Ter] |
| 3.1.09 | Encargos Folha CSP [Executar] |
| 3.2 | Inside Sales As A Service (ISAAS) |
| 3.2.01 | ISAAS - Fixo |
| 3.2.02 | ISAAS - Variável |
| 3.2.03 | ISAAS - Encargos sobre Folha |
| 3.3 | Serviços Terceirizados |
| 3.3.01 | CSP Terceirizados - [Saber] (Account, DT, Design, Copy) |
| 3.3.02 | CSP Terceirizados - [Ter] (Account) |
| 3.4 | Custo Variável Operacional / Comissão Equipe Técnica |

---

## Categorias Padrão — Tabela de Vínculos Automáticos

| Campo no CA | Categoria vinculada |
|---|---|
| Impostos retidos em vendas | 2.1.06 DAS (Simples Nacional) |
| Descontos incondicionais obtidos | 6.1.05 Outras Receitas Não Oper. |
| Descontos incondicionais concedidos | 2.3.03 Descontos, Devoluções e Cancelamentos |
| Descontos financeiros obtidos | 6.1.05 Outras Receitas Não Oper. |
| Descontos financeiros concedidos | 6.2.04 Outras Despesas Não Oper. |
| Multas recebidas | 6.1.05 Outras Receitas Não Oper. |
| Multas pagas | 6.2.04 Outras Despesas Não Oper. |
| Juros recebidos | 6.1.05 Outras Receitas Não Oper. |
| Juros pagos | 6.2.04 Outras Despesas Não Oper. |
| Tarifas | 2.2.03 Taxas Receita - Cartões de Crédito |
| Perdas | 6.2.05 Perdas com Clientes (Inadimplência) |

> ⚠️ As duas primeiras linhas (de frete) devem ser ignoradas.

---

## Adequação do Plano de Contas (Franquia nova ou fora do padrão)

### Etapa 1 — Adequação Inicial do DRE
1. Menu lateral > Relatórios > ícone de engrenagem (canto superior direito)
2. Selecionar "DRE"
3. Usar a planilha "Plano de Contas Modelo" para copiar/colar nomenclaturas
4. Atenção especial: "Resultados Financeiros" e "Impostos Sobre Lucro" têm apenas 2 níveis
5. **Limpeza:** Remover todas as linhas antigas clicando no 'X', **exceto** "(+) Aporte de Capital (Sócios)"
6. Salvar

### Etapa 2 — Adequação do Plano de Categorias
1. Financeiro > Cadastros > Categorias financeiras
2. Aba "Categorias de receita": criar Nível 2 e Nível 3 (Nível 1 geralmente já existe)
   - Botão "Cadastrar" > "Categoria de receita"
   - Campo "Descrição" = nome da conta
   - Campo "Aparecer dentro da categoria" = define a hierarquia (categoria "mãe")
3. Se categoria antiga tiver lançamentos: ao excluir, selecionar a nova categoria correspondente (tabela "De/Para" da planilha modelo)

**Tabela De/Para (categorias antigas → novas):**

| Antiga | Nova |
|---|---|
| 1.1.01 Receita Recorrente | 1.2.03 Renovação \| [Executar] BR |
| 1.1.02 Monetização Recorrente | 1.2.03 Renovação \| [Executar] BR |
| 1.1.03 Receita com Terceirização (Recorrente) | 1.2.03 Renovação \| [Executar] BR |
| 1.1.04 Receita Recorrente [USA] | 1.1.07 Aquisição \| [Executar] USA |
| 1.2.01 Aquisição One Time | 1.1.01 Aquisição \| [Saber] BR |
| 1.2.02 Monetização One Time | 1.3.01 Expansão \| [Saber] BR |
| 1.2.03 Receita com Terceirização (One Time) | 1.1.01 Aquisição \| [Saber] BR |
| 1.2.04 Aquisição One Time [USA] | 1.1.01 Aquisição \| [Saber] USA |

### Etapa 3 — Tratamento de Irregularidades
1. Identificar contas fora do padrão (ex: "Despesas Diversas")
2. Financeiro > Visão de Competência > Mais filtros > Categoria > pesquisar a irregular
3. Realocar todos os lançamentos para as categorias corretas

### Etapa 4 — Adequação das Categorias Padrão
1. Financeiro > Cadastros > Categorias Financeiras > Configurar Categorias Padrão
2. Aplicar tabela de vínculos automáticos (seção acima)
3. Salvar

### Etapa 5 — Finalização do DRE
1. Engrenagem > DRE
2. Inserir novas linhas criadas dentro de suas respectivas categorias de agrupamento
3. Dica: filtrar pelo número da categoria (ex: "1.1") para selecionar todas as subcategorias de uma vez
4. **Regra crítica:** linhas de "Lançamento de Ativo Imobilizado" **NÃO** devem constar no DRE
5. Configurar linhas não operacionais ((+) Aporte, (-) Empréstimos) no final do relatório
6. Salvar

### Etapa 6 — Configuração do DFC
1. Engrenagem > Configurar Fluxo de Caixa
2. Seguir planilha modelo "Modelo DFC"
3. Segregar: Atividades Operacionais, de Investimento e de Financiamento
4. Usar as mesmas categorias vinculadas no DRE
5. Salvar

**Estrutura do DFC:**
- **Atividades Operacionais:**
  - (+) Recebimentos → categorias 1.1.XX a 1.4.XX
  - (-) Deduções + Royalties → grupo 2
  - (-) Custos Operacionais → grupo 3
  - (-) Despesas administrativas e comerciais (SG&A) → grupo 4
- **Atividades de Investimento:**
  - (-) Compra de ativo → categorias "Não DRE" (Imobilizado)
  - (+) Recebimento de Dividendos → (+) Venda de Ativo / Quotas
- **Atividades Financeiras:**
  - Entradas/saídas de empréstimos e financiamentos

---

## Nova Tela de Relatórios (desde dez/2025)

**Código POP:** ADM/RDC-FIN-008

### Estrutura das abas
- **Favoritos:** relatórios marcados como principais (DRE, DFC — salvar aqui para acesso rápido)
- **Padrão:** relatórios nativos do CA, versões mais modernas — usar esta aba preferencialmente
- **Personalizados:** relatórios criados pela unidade, inclusive com apoio de IA do CA
- **Antigos (Legado):** apenas para consulta temporária durante transição — migrar para Padrão

### Regras gerais
- Todos os relatórios estão centralizados em uma única tela
- Não usar mais submenus dispersos como "Mais relatórios financeiros"
- Nenhum dado histórico foi perdido — apenas a interface mudou
- Priorizar sempre as abas **Padrão** ou **Personalizados**

---

## Checklist de Qualidade — Adequação do Plano de Contas

- [ ] Nomenclaturas idênticas à planilha modelo (sem erros de caracteres ou espaços extras)
- [ ] DRE salvo sem vínculos antigos (exceto "(+) Aporte de Sócios")
- [ ] Todas as categorias antigas vazias foram excluídas
- [ ] Lançamentos de Ativo Imobilizado não constam no DRE
- [ ] DFC configurado e batendo com a estrutura do DRE
