# POP - Aplicação Financeira / Outras Contas

**POP:** Aplicação Financeira / Outras Contas  
**Autor:** Kleber Alexandre Andrade Fonseca  
**Código/Versão:** ADM/AFO-FIN-004  
**Área responsável:** Administrativo  
**Data da emissão:** 09/09/2025  
**Periodicidade da revisão:** A cada 6 meses  
**Document Status:** Ativa

---

## 1. Objetivo

Garantir a exatidão e a integridade dos registros de transações financeiras, incluindo aplicações, resgates e transferências entre contas bancárias, assegurando que todos os movimentos sejam corretamente lançados e conciliados no sistema de gestão.

---

## 2. Periodicidade

Este processo deve ser executado sempre que ocorrer qualquer transação financeira de aplicação, resgate ou transferência de valores entre contas da empresa.

---

## 3. Responsáveis

- **Principal:** Coordenador Administrativo
- **Apoio:** Equipe Administrativa (quando aplicável) e Contabilidade Externa.
- **Informados:** Todos os sócios da unidade de negócio.

---

## 4. Ferramentas Utilizadas

- **Sistema de Gestão Financeira:** Conta Azul — Integração Automática / Lançamento manual
- **Arquivos de Extrato Bancário:** Formato OFX (Open Financial Exchange)

---

## 5. Etapas do Processo

O processo é dividido em duas fases principais: a configuração inicial da conta (se necessário) e a conciliação das transações. Ela ocorre quando é feita uma aplicação ou resgate de uma conta corrente para uma aplicação, ou uma transferência entre bancos.

> ⚠️ **Regra fundamental:** Não usar lançamento normal de Despesa/Receita. Usar sempre a função **Transferência**.

---

### 5.1. Configuração Inicial da Conta Financeira (somente na 1ª vez)

Esta etapa é um pré-requisito e deve ser realizada uma única vez para cada nova conta.

1. Acesse o menu: **Financeiro > Contas financeiras** ou **Outras contas**.
2. Clique em **"Nova conta financeira"**.
3. Preencha todos os campos obrigatórios solicitados pelo sistema.
4. Nos campos **"Início dos lançamentos na Conta Azul"** e **"Saldo final bancário"**, informe a data e o valor do saldo correspondentes ao seu extrato bancário para garantir a consistência inicial.
5. Na criação de uma conta de aplicação, selecione o tipo **Investimento** ou **Aut Mais** e vincule com a conta corrente já existente.

---

### 5.2.1. Método 1: Conciliação Automática (Contas com Integração Bancária) — Preferencial

Este é o método preferencial para contas correntes que permitem a importação automática do extrato.

1. Acesse o menu: **Financeiro > Contas financeiras > Conciliações pendentes**.
2. Na coluna **"Banco"**, localize e selecione a movimentação (débito ou crédito) referente à transferência.
3. Na coluna da direita, **"Lançamentos da Conta Azul"**, clique na aba **"Nova transferência"**.
4. Preencha as informações da conta de destino/origem e confirme os dados.
5. Clique em **"Conciliar"** para finalizar o processo.

---

### 5.2.2. Método 2: Conciliação de Lançamento Pré-existente

Utilize este método se a transferência já foi registrada manualmente no sistema antes da importação do extrato.

1. Acesse o menu: **Financeiro > Contas financeiras > Conciliações pendentes**.
2. O sistema irá sugerir automaticamente a conciliação se encontrar um lançamento na Conta Azul com data, valor e banco compatíveis com a transação do extrato. Se a sugestão estiver correta, clique em **"Conciliar"**.
3. Caso a sugestão não apareça, clique em **"Buscar lançamento"** na linha da transação bancária.
4. Utilize os filtros para localizar o lançamento de transferência já cadastrado.
5. Selecione o lançamento correto e clique em **"Conciliar"**.

---

### 5.2.3. Método 3: Lançamento Manual de Transferência

Utilize este método caso não haja integração bancária ou se for necessário registrar a transação manualmente.

1. Acesse o menu: **Financeiro > Extrato de movimentações**.
2. Clique no botão **"Nova > Transferência"**.
3. Preencha os campos obrigatórios com atenção:
   - **Conta de origem:** Conta da qual o valor saiu.
   - **Conta de destino:** Conta que recebeu o valor.
   - **Descrição:** Informe um texto claro (ex: "Transferência para aplicação financeira").
   - **Data da transferência:** Insira a data em que a transação ocorreu (não é possível usar datas futuras).
   - **Valor:** Informe o montante exato da transferência.
4. (Opcional) Para anexar um comprovante, clique em **"📎 Escolha um arquivo"**.
5. Clique em **"Salvar"** para concluir o lançamento.

---

## 6. Finalização e Pontos de Atenção

- **Resumo de Utilização:** Este POP deve ser usado para registrar o movimento de dinheiro entre contas da mesma empresa (entre conta corrente e conta de aplicação ou outros bancos). Ele **não gera impacto no resultado financeiro** (lucro ou prejuízo).

- **Cuidado Essencial:** É fundamental diferenciar corretamente os tipos de lançamento:
  - **Transferência:** Movimentação de recursos entre contas internas. Não é uma despesa.
  - **Lançamento de Despesa/Receita:** Pagamento a um fornecedor ou recebimento de um cliente. Impacta diretamente o resultado da empresa.

- **Acuracidade dos Dados:** A precisão na data, valor e contas de origem/destino é vital. Erros na conciliação podem levar a uma visão distorcida do fluxo de caixa e da saúde financeira da empresa. Verifique sempre os dados antes de confirmar a conciliação.
