# Lançamentos no Conta Azul — V4 Company

---

## 1. Gerenciamento de Contratos

**Código POP:** ADM/GEC-FIN-006 | Atualizado: 20/03/2026

### Criar contrato — Caminho
Serviços > Contratos > Novo Contrato

### 1.1 Venda One Time (avulsa)
- Número: automático
- Cliente: selecionar
- Data da venda: data em que o cliente **assinou** o contrato (Visão de Competência)
- Categoria Financeira: conforme STEP (normalmente Saber = Aquisição para cliente novo)
- Valor: orientado lançar com **valor líquido** (já descontados royalties — SAP). Se lançar bruto, debitar royalties manualmente.
- Finalizar

### 1.2 Contrato Recorrente (Bookado)
- Número: automático
- Cliente: selecionar
- Data de início: data da venda / assinatura
- Data de término: fim do booking
- Dia de geração das vendas: ex: todo dia 08
- Recorrência: Mensal
- Término: período específico ou indeterminado
- Categoria: conforme STEP e momento do cliente (Aquisição / Renovação / Expansão)
- Item/Serviço: valor **mensal** pago pelo cliente (não o total do booking)
- Forma de pagamento, conta de recebimento e vencimento

### Regra de categorização por momento do cliente

| Cenário | Categoria | Código |
|---|---|---|
| Primeiro contrato | Aquisição | 1.1.0X Aquisição \| [Produto] |
| Renovação (após fim do booking) | Renovação | 1.2.0X Renovação \| [Produto] |
| Novo produto para cliente existente | Expansão | 1.3.0X Expansão \| [Produto] |

> **Regra fundamental:** A categoria respeita a vigência do contrato. Não muda no meio do contrato vigente.

### 1.3 Upsell — Adição de novo serviço
- **Não alterar o contrato original.** Criar novo contrato aditivo (seguir passo 1.2)
- Campo descrição: referenciar o contrato original para manter histórico

### 1.3b Upsell — Alteração de fee apenas
1. Serviços > Contratos > selecionar contrato > Editar Contrato
2. "Editar todas as próximas vendas do contrato"
3. Alterar valor > Salvar

### 1.4 Churn (Cancelamento)
1. Serviços > Contratos > localizar contrato
2. Abrir > "Encerrar"
   - CA exclui automaticamente todas as cobranças futuras não pagas
   - ⚠️ Ação irreversível — confirmar apenas com certeza do cancelamento

**Tipos de churn:**
- **Churn 0:** cliente desistiu antes de qualquer início ou pagamento → excluir o contrato apenas
- **Churn cancelamento de contrato:** encerrar + lançar Receita Avulsa para o valor de aviso prévio remanescente (ver item 3 abaixo)
- **Churn inadimplência:** baixar os títulos em aberto como perda PRIMEIRO, depois encerrar o contrato

### 1.5 Downsell (Redução)
- Se o cliente tem contrato principal + aditivos e cancela apenas um serviço adicional:
  - Encerrar apenas o contrato aditivo específico (processo de churn)
  - Contrato principal permanece inalterado

---

## 2. Contas a Pagar

**Código POP:** ADM/CAP-FIN-005 | Atualizado: 26/09/2025

### 2.1 Lançamento automático via Conta AI Captura
1. Acessar "Conta AI Captura" no CA
2. Anexar documento (NF, boleto ou comprovante)
3. Conferir campos preenchidos pela IA: fornecedor, valor, vencimento, categoria
4. Ajustar se necessário > Salvar

### 2.2 Lançamento manual — despesa simples
**Caminho:** Financeiro > Contas a Pagar > Nova Despesa (atalho: Alt + D)

Campos obrigatórios:
- **Data de competência:** quando a despesa ocorre
- **Descrição:** título claro
- **Valor:** total da despesa
- **Categoria:** categoria financeira correspondente

Condições de pagamento:
- **Pagamento no ato (à vista):** Parcelamento > À vista > data atual > marcar "Pago"
- **Pagamento futuro integral:** Parcelamento em 1x > preencher "Previsão de pagamento" (alimenta coluna "Previsto" no DFC)

### 2.3 Lançamento parcelado
- Mesmo caminho da despesa manual
- Condições de pagamento > Parcelamento > número de parcelas (máximo: 60x)
- Ajustar individualmente cada parcela (data, valor, forma de pagamento) se necessário

### 2.4 Lançamento recorrente
- Mesmo caminho > ativar "Repetir lançamento"
- Configurações de repetição > Personalizar:
  - Frequência (a cada X dias/semanas/meses/anos)
  - Término: número de ocorrências (máximo 366)
- Salvar > OK (o sistema cria todos os lançamentos futuros)

### 2.5 Edição e renegociação
- Editar uma parcela: Ações > Editar parcela
- Editar todas as parcelas: Ações > Editar parcela > Editar lançamento
- Renegociar saldo devedor: Ações > Editar parcela > Editar lançamento > Renegociar

### 2.6 Observações importantes
- **Rateio:** habilitar opção "Habilitar rateio" para dividir entre centros de custo ou categorias
- Lançamentos gerados por integração devem ser alterados na plataforma do parceiro, não no CA
- Excluir despesa no CA **não cancela** cobrança na plataforma parceira integrada

---

## 3. Receita Avulsa (Multa por quebra de contrato ou fees adicionais)

**Caminho:** Financeiro > Contas a Receber > Nova Receita

Campos:
- Cliente: selecionar
- Data de competência: data do fato gerador (ex: formalização do acordo)
- Categoria Financeira: categoria correta
- Centro de custo: se houver
- Condição de pagamento: conforme negociação

---

## 4. Aplicações Financeiras e Transferências entre Contas

**Código POP:** ADM/AFO-FIN-004 | Atualizado: 09/09/2025

> ⚠️ **Regra fundamental:** Não usar lançamento normal de Despesa/Receita. Usar **Transferência**.

### 4.1 Configuração inicial de conta de aplicação (apenas na 1ª vez)
1. Financeiro > Contas Financeiras ou Outras Contas
2. Nova conta financeira > preencher campos obrigatórios
3. Tipo: Investimento ou Aut Mais
4. Vincular com a conta corrente existente
5. "Início dos lançamentos" e "Saldo final bancário": informar data e valor do extrato para consistência inicial

### 4.2 Conciliação automática (contas com integração bancária — preferencial)
1. Financeiro > Contas Financeiras > Conciliações Pendentes
2. Coluna "Banco": localizar a movimentação (débito ou crédito da transferência)
3. Coluna direita "Lançamentos CA" > aba "Nova transferência"
4. Preencher conta de destino/origem > confirmar > "Conciliar"

### 4.3 Conciliação de lançamento pré-existente
1. Financeiro > Contas Financeiras > Conciliações Pendentes
2. O CA sugere automaticamente se encontrar lançamento com data, valor e banco compatíveis
3. Se sugestão correta: "Conciliar"
4. Se não aparecer: "Buscar lançamento" > filtros > selecionar > "Conciliar"

### 4.4 Lançamento manual de transferência
**Caminho:** Financeiro > Extrato de Movimentações > Nova > Transferência

Campos:
- Conta de origem
- Conta de destino
- Descrição clara (ex: "Transferência para aplicação financeira")
- Data da transferência (não é possível usar datas futuras)
- Valor exato
- Opcional: anexar comprovante
- Salvar
