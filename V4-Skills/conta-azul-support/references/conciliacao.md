# Conciliação Bancária no Conta Azul — V4 Company

**Código POP:** ADM/CBC-FIN-001 | Atualizado: 14/02/2026  
**Periodicidade:** Diária + Fechamento até o 5º dia útil do mês seguinte

---

## Pré-requisitos obrigatórios
- Plano de Contas no padrão V4 Company
- Contratos e clientes previamente cadastrados
- Despesas lançadas ANTES de iniciar a conciliação

---

## Etapa 1 — Coleta dos Extratos (Formato OFX)

### Finance (V4)
- Menu lateral esquerdo > Gestão Financeira > Conciliação
- Exportar planilha de conciliação da unidade
- A planilha contém: data de pagamento, valor líquido, taxas

### IUGU (se ainda ativo)
1. Login na conta IUGU
2. Movimentação > Extrato Detalhado
3. Filtrar período desejado
4. Exportar em formato OFX

> ⚠️ **IMPORTANTE:** Sempre extrair períodos diferentes para não gerar conflito no Conta Azul. Se já puxou 01/10 a 16/10, puxe a partir de 17/10. Evite o dia atual — puxe sempre D-1.

### Outros Bancos (Itaú, BB, Sicoob, Bradesco, Santander)
- Cada banco tem procedimento próprio para exportar OFX
- Acesse o internet banking ou solicite ao gerente

---

## Etapa 2 — Configuração e Importação no Conta Azul

### Cadastro de nova conta bancária (se necessário)
1. Financeiro > Outras Contas > Nova conta financeira
2. Para IUGU: tipo "Conta Corrente", banco "Outro Banco", descrição "IUGU"
3. Saldo inicial = saldo do final do dia **anterior** ao início dos lançamentos no CA

### Importação do OFX
1. Financeiro > Outras Contas > selecionar a conta
2. Ações da conta > Importar extrato (.OFX)
3. Selecionar o arquivo baixado
4. Confirmar saldo final da conta na data final do período

---

## Etapa 3 — Conciliação dos Lançamentos

> O lançamento do contrato no CA já é feito com base no **valor líquido** (receita - royalties), devido ao split automático do faturamento. Exceção: cartão de crédito.

### 3A — Conciliar Recebimentos
- Tela de Conciliações Pendentes > aba "Recebimentos"
- Lado esquerdo: lançamentos do extrato (IUGU/banco)
- Lado direito: lançamentos do sistema
- A IA sugere o vínculo com base em data e valor — verificar o código da fatura
- Se não houver sugestão: "Buscar lançamento" > localizar receita > "Conciliar"
- Se houver mais de uma receita para o mesmo valor de entrada, selecionar todas

### 3B — Conciliar Pagamentos (Tarifas e Transferências)
- Aba "Pagamentos"
- **Tarifas IUGU:** "Novo lançamento" > categoria **2.2 Taxas** conforme natureza (ex: 2.2.01 Boleto/PIX, outra para cartão) > "Criar e conciliar"
- **Saques/Transferências:** "Nova transferência" > conta de destino > "Conciliar"

---

## Etapa 4 — Revisão Final
1. Após zerar conciliações pendentes: aba "Movimentações"
2. Comparar saldo do CA com saldo do extrato (coluna "Outro Banco")
3. Divergência aparece em amarelo
4. Se os valores baterem diariamente = conciliação concluída com sucesso
5. Causas comuns de divergência: saldo inicial incorreto ou lançamentos manuais equivocados

---

## Pontos de Atenção — Categorização de Contratos na Conciliação

A regra fundamental: **a categoria respeita a vigência do contrato.** Não muda no meio do contrato.

| Cenário | Categoria no CA | Código |
|---|---|---|
| Cliente novo (1º contrato) | Aquisição | 1.1.0X Aquisição \| [Produto] |
| Renovação (cliente continuou após fim do booking) | Renovação | 1.2.0X Renovação \| [Produto] |
| Upsell (novo produto para cliente existente) | Expansão | 1.3.0X Expansão \| [Produto] |

**Exemplo prático:** Contrato de 6 meses do "Executar" (R$ 3.000/mês = R$ 18.000 total)
- Meses 1 a 6: 1.1.03 Aquisição | [Executar]
- Mês 7 em diante (se não cancelou): 1.2.03 Renovação | [Executar]
- Novo produto "Saber" contratado em paralelo: 1.3.01 Expansão | [Saber]

---

## Conciliação com Divergência de Valores (Deduções)

> Quando o valor recebido no banco é **menor** que o valor faturado (ex: royalties ou taxas já descontados).

**Código POP:** ADM/FIN-CONC-001

### Passo a passo

1. Tela de Conciliação Bancária > localizar recebimento divergente
2. Identificar venda correspondente > clicar em **"Revisar valores"**
   - ⚠️ Não conciliar automaticamente se os valores não baterem
3. Selecionar **"Pagamento pela diferença"**
4. Informar valor residual (deve ser exatamente o valor da dedução)
5. **Campo de categoria:** selecionar conta dentro do grupo **DEDUÇÕES** (ex: 2.2.03 Cartões de Crédito)
   - ❌ **NUNCA** usar "Despesas Financeiras" ou "Tarifas Bancárias" para este fim — distorce o Lucro Bruto
6. Ajustar descrição e data > Salvar
7. Verificar se o lançamento está "casado": Valor Recebido + Dedução = Valor Original da Fatura
8. Clicar em "Conciliar"

### Verificação final
- Aba Movimentações > expandir a transação
- Deve aparecer quebrado em dois: crédito do valor líquido + registro da dedução
