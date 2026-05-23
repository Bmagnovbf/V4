# POP - Conciliação Bancária Conta Azul

**Código/Versão:** ADM/CBC-FIN-001
**Autor:** Kleber Alexandre Andrade Fonseca
**Área responsável:** Coordenador ADM
**Data da emissão:** 10/04/2026
**Periodicidade da revisão:** A cada 3 meses
**Document Status:** Ativo

---

## 1. Objetivo

Garantir que os registros de despesas e receitas no sistema Conta Azul
estejam corretos, sem divergências entre o controle interno da unidade e
os extratos bancários. Este procedimento é essencial para:

-   **Controle Financeiro:** Evitar erros que podem levar a prejuízos.
-   **Controle Gerencial:** Assegurar que relatórios (DRE, DFC) reflitam a realidade financeira.
-   **Prevenção de Riscos:** Detectar irregularidades, como desvios ou cobranças indevidas.
-   **Tomada de Decisão:** Fornecer dados confiáveis para a gestão de fluxo de caixa e planejamento.

---

## 2. Periodicidade

-   **Diária:** A conciliação deve ser realizada diariamente para evitar o acúmulo de lançamentos e garantir a precisão contínua dos dados financeiros.
-   **Mensal:** Um fechamento mensal deve ser realizado até o 5º dia útil do mês subsequente, consistindo na revisão final de todas as conciliações diárias do período.

---

## 3. Conteúdo

-   **Conciliação Bancária**
    -   Extração dos Extratos e OFX
    -   Conciliação dos Lançamentos
    -   Conciliação de um Lançamento Pré-existente (Complemento)
    -   Lançamento Manual de Transferência
    -   Divergência na Conciliação
    -   Ajuste pelo Pagamento da Diferença - Categorização da Dedução
    -   Revisão do lançamento
-   **Pontos de Atenção - Novos Contratos**
-   **Antecipação Booking Recorrente**

---

## 4. Ferramentas Utilizadas

-   **Conta Azul:** Ambiente de controle e conciliação.
-   **Finance / IUGU:** Para extração do extrato detalhado de recebimentos de clientes.
-   **Internet Banking:** Para extração de extratos bancários e conferência de despesas e transferências.

---

## 5. Pré-Requisitos

Para que o processo de conciliação seja executado com sucesso, é
mandatório que a plataforma do Conta Azul esteja configurada corretamente:

-   O **Plano de Contas** deve estar no padrão V4 Company.
-   Os **contratos e clientes** devem estar previamente cadastrados.
-   As **despesas** devem ser lançadas antes do início da conciliação.

---

## 6. Passo a Passo da Conciliação Bancária

O processo é dividido em três fases: coleta de extratos, configuração no
Conta Azul e, por fim, a conciliação dos lançamentos, que varia conforme
o modelo de faturamento da unidade (com ou sem SAP).

### 6.1. Coleta dos Extratos Bancários (Formato OFX)

O primeiro passo é obter todos os extratos necessários para a conciliação.

**Finance**

Clique em **Gestão Financeira** no canto esquerdo e depois em **Conciliação**.
Exporte a planilha de conciliação da sua unidade. A planilha contém data de pagamento, valor líquido, taxas e todas as informações necessárias.

**Extrato da IUGU (Caso ainda tenha):**

1.  Acesse sua conta na IUGU.
2.  Vá ao menu **Movimentação** e clique em **Extrato Detalhado**.
3.  Filtre o período desejado para a conciliação.

> **IMPORTANTE:** Sempre extrair de dias diferentes para não dar conflito no Conta Azul.
> Exemplo: se você já puxou do dia 01-10 a 16-10, puxe do dia 17-10 em diante.
> Evite tirar do dia atual pois pode haver diferença. Puxe sempre D1.

4.  Selecione o tipo de arquivo **OFX** e clique em **Exportar** para fazer o download.

**Extrato de Outros Bancos:**

Cada banco possui um procedimento diferente para exportar o extrato em formato OFX (Open Financial Exchange — formato baseado em XML). Acesse o internet banking da sua instituição financeira ou entre em contato com seu gerente para obter o arquivo.

Caminhos dos bancos mais comuns:

-   **Itaú:** Internet Banking > Serviços > Extrato > Exportar OFX
-   **Banco do Brasil:** Internet Banking > Extrato > Salvar como OFX
-   **Sicoob:** Internet Banking > Extrato > Exportar OFX
-   **Bradesco:** Internet Banking > Extrato > Download OFX
-   **Santander:** Internet Banking > Extrato > Exportar > OFX

---

### 6.2. Configuração e Importação no Conta Azul

**Cadastro da Conta Bancária (Caso Precise):**

1.  No Conta Azul, acesse **Financeiro > Outras Contas** e clique em **"Nova conta financeira"**.
2.  Selecione o tipo de conta (para a IUGU, utilize **"Conta Corrente"**).
3.  Informe o banco (para a IUGU, selecione "Outro Banco"), crie uma descrição (ex: "IUGU") e preencha os dados solicitados.
4.  Continue o processo **sem importar um extrato** neste momento.
5.  **Atenção:** Configure o saldo inicial com precisão. O valor do saldo deve ser o do final do dia anterior ao início dos lançamentos no Conta Azul para garantir que os cálculos futuros batam corretamente.

**Importação do Extrato OFX:**

1.  Acesse a conta desejada em **Financeiro > Outras Contas**.
2.  Clique em **Ações da conta > Importar extrato (.OFX)**.
3.  Selecione o arquivo OFX que você baixou do banco ou da IUGU.
4.  Confirme o saldo final da conta na data final do período do extrato. O sistema usará essa informação para validar a conciliação.

---

### 6.3. Conciliação dos Lançamentos

Após a importação do extrato, o Conta Azul exibirá a tela de "Conciliações pendentes". A partir daqui o processo se divide em dois cenários.

> **IMPORTANTE:** Dúvidas sobre lançamentos do contas a receber: consulte a *POP Gerenciamento de Contratos*. Dúvidas sobre lançamentos do contas a pagar: consulte a *POP Contas a Pagar.*

O lançamento do contrato no Conta Azul já é feito com base no valor
líquido (receita - royalties), devido ao split automático do faturamento.
IMPORTANTE: Com exceção de venda "cartão de crédito", mais dúvidas consulte a *POP Gerenciamento de Contratos.*

**1. Conciliar Recebimentos:**

-   Na tela de conciliações, clique na aba **"Recebimentos"**.
-   O Conta Azul irá exibir, à esquerda, os lançamentos do seu extrato (IUGU) e, à direita, os lançamentos do sistema.
-   A IA do sistema geralmente sugere o vínculo correto com base na data e valor. Verifique se o código da fatura corresponde.
-   Se não houver sugestão, clique em **"Buscar lançamento"**, localize a receita correspondente e clique em **"Conciliar"**. (Se tiver mais de uma receita, selecione quantas precisarem para dar o valor de entrada da IUGU.)
-   Depois clique em **Conciliar**.

**2. Conciliar Pagamentos (Tarifas e Transferências):**

-   Clique na aba **"Pagamentos"** para conciliar as saídas.
-   **Tarifas IUGU:** Para cada tarifa, crie um **"Novo lançamento"**. Na descrição, coloque "Tarifa IUGU", na categoria "2.2 Taxas", de acordo com a natureza da receita (Boleto/Pix ou Cartão) — Exemplo: 2.2.01 Boleto — e clique em **"Criar e conciliar"**.
-   **Saques/Transferências:** Para as transferências entre contas e saques da IUGU para sua conta bancária principal, utilize a função **"Nova transferência"**. Informe a descrição (ex: "Saque IUGU"), selecione a conta de destino e clique em **"Conciliar"**.

---

### 6.4 Método 2: Conciliação de um Lançamento Pré-existente (Complemento)

Utilize este método se a transferência já foi registrada manualmente no
sistema antes da importação do extrato.

1.  Acesse o menu: **Financeiro > Contas financeiras > Conciliações pendentes**.
2.  O sistema irá sugerir automaticamente a conciliação se encontrar um lançamento na Conta Azul com data, valor e banco compatíveis com a transação do extrato. Se a sugestão estiver correta, clique em **"Conciliar"**.
3.  Caso a sugestão não apareça, clique em **"Buscar lançamento"** na linha da transação bancária.
4.  Utilize os filtros para localizar o lançamento de transferência já cadastrado.
5.  Selecione o lançamento correto e clique em **"Conciliar"**.

---

### 6.5 Lançamento Manual de Transferência

Utilize este método caso não haja integração bancária ou se for
necessário registrar a transação manualmente.

1.  Acesse o menu: **Financeiro > Extrato de movimentações**.
2.  Clique no botão **"Nova > Transferência"**.
3.  Preencha os campos obrigatórios com atenção:
    -   **Conta de origem:** Conta da qual o valor saiu.
    -   **Conta de destino:** Conta que recebeu o valor.
    -   **Descrição:** Informe um texto claro (ex: "Transferência para aplicação financeira").
    -   **Data da transferência:** Insira a data em que a transação ocorreu (não é possível usar datas futuras).
    -   **Valor:** Informe o montante exato da transferência.
4.  (Opcional) Para anexar um comprovante, clique em **"📎 Escolha um arquivo"**.
5.  Clique em **"Salvar"** para concluir o lançamento.

---

### 6.6 Divergência na Conciliação

-   **5.1.1.** Acessar a tela de "Conciliação Bancária" no Conta Azul.
-   **5.1.2.** Localizar o recebimento importado pelo banco. O valor estará divergente do lançamento de venda previsto (contas a receber) pois o banco reflete o valor líquido (já descontado os royalties/retenções).
-   **5.1.3.** Ao identificar a venda correspondente, clique no botão **"Revisar valores"**.
    -   **Atenção:** Não conciliar automaticamente se os valores não baterem. É necessário justificar a diferença.

---

### 6.7.1 Ajuste pelo Pagamento da Diferença

-   **5.2.1.** Na tela de detalhamento da conciliação, o sistema mostrará o valor original da fatura e o valor efetivamente recebido.
-   **5.2.2.** Selecionar a opção de **"Pagamento pela diferença"** (ou funcionalidade pagamento, se quiser quebrar em mais de um valor ou mais de um lançamento).
-   **5.2.3.** O sistema abrirá um campo para informar o valor residual. Certifique-se de que este valor corresponde exatamente ao montante da dedução (ex: valor da taxa de antecipação).

---

### 6.7.2 Categorização da Dedução

-   **1.** Este é o passo mais crítico para a integridade do DRE. No campo de categoria da diferença, selecione a conta correta dentro do grupo de **DEDUÇÕES**. (**Ex:** 2.2.03 Cartões de Crédito)
-   **2.** Ajustar a descrição e a data, se necessário, para manter o histórico organizado.
-   **3.** Clicar em **"Salvar"**.
    -   ⚠️ **IMPORTANTE:** Nunca utilize categorias do grupo de "Despesas Financeiras" ou "Tarifas Bancárias" para este fim. A diferença deve ser alocada estritamente em **Deduções da Receita** (como Royalties ou Impostos sobre Vendas) para não distorcer o Lucro Bruto.

---

### 6.8 Revisão do Lançamento

-   **1.** Após salvar o ajuste, o sistema retornará para a tela de conciliação.
-   **2.** Verificar se o lançamento agora aparece "casado": Valor Recebido (Banco) + Valor da Dedução (Ajuste) = Valor da Fatura Original.
-   **3.** Estando tudo correto, clique no botão **"Conciliar"** para efetivar a baixa.

---

### 6.9. Revisão Final

1.  Após zerar todas as conciliações pendentes, clique na aba **"Movimentações"**.
2.  Esta tela exibirá um resumo diário, comparando o saldo do Conta Azul com o saldo do seu extrato bancário (Coluna "Outro Banco"). Se tiver divergência, ela irá apontar em amarelo.
3.  Se os valores baterem diariamente, o processo de conciliação foi concluído com sucesso. Divergências geralmente ocorrem devido a um saldo inicial incorreto ou a lançamentos manuais equivocados.

---

## 8. Pontos de Atenção - Novos Contratos

A regra é: **A categoria respeita a vigência do contrato.** Você não
muda a categoria no meio de um contrato vigente, apenas quando ele acaba e renova.

### Cenário: Novo Cliente — Categoria: Aquisição (Selecionar S.T.E.P. correto)

Use esta categoria para o **primeiro contrato** fechado com um cliente que acaba de chegar.

-   **Regra:** Todo o valor e período acordados neste primeiro contrato permanecem aqui até o fim do prazo estipulado. 6 meses por exemplo.
-   **Categoria no Conta Azul:** 1.1.03 Aquisição | [Nome do Produto]

**Como lançar:**

1.  **Produtos Recorrentes:** Lance em contratos, recorrente, colocando início e fim do contrato. (Exemplo: 6 meses).
    -   *Competência:* O valor vai entrar mensal, conforme o prazo.
    -   *Caixa:* O valor entra nas datas reais dos pagamentos (parcelamento).
2.  **Produtos "One Time" (Pontuais):**
    -   *Competência:* O valor total entra na data da venda/emissão.
    -   *Caixa:* O valor entra nas datas reais dos pagamentos (parcelamento).

> **Exemplo Prático:** Fechou um contrato de **6 meses** do produto "Executar" no valor total de R$ 18.000 (R$ 3.000/mês).
> -   **Do Mês 1 ao Mês 6:** Todos os lançamentos são 1.1.03 Aquisição.
> -   *Nota:* Mesmo que o cliente pague adiantado ou atrase, a competência desses 6 meses pertence à Aquisição.

---

### Cenário: Renovação (Continuidade)

Use esta categoria **apenas** quando o contrato inicial (seja de Aquisição ou de Expansão) chega ao fim do prazo, mas o cliente decide continuar pagando para manter o serviço.

-   **Regra:** Acabou o tempo de contrato "bookado"? O cliente não cancelou? Vira Renovação automaticamente no mês seguinte.
-   **Categoria no Conta Azul:** 1.2.03 Renovação | [Nome do Produto]

**Como lançar:**

-   No momento que finda o prazo do lançamento original (ex: acabou o mês 6), os próximos boletos/faturas a partir do mês 7 mudam para esta categoria.

> **Exemplo Prático:** O contrato de 6 meses do "Executar" acabou. O cliente está feliz e vai para o **Mês 7**.
> -   **A partir do Mês 7:** O lançamento passa a ser 1.2.03 Renovação.

---

### Cenário: Expansão (Novo Produto/Upsell)

Use esta categoria quando um cliente **já existente** compra um produto **diferente** ou adiciona um **novo contrato** paralelo ao atual.

-   **Regra:** O valor desse *novo* contrato é lançado integralmente como Expansão durante a vigência dele.
-   **Categoria no Conta Azul:** 1.3.01 Expansão | [Nome do Novo Produto]

**Como lançar:**

-   Você manterá o lançamento antigo onde ele estiver (Aquisição ou Renovação) e criará um **novo lançamento** separado para este novo produto.

> **Exemplo Prático:** O cliente do exemplo acima (que comprou "Executar") decidiu comprar também o projeto "Saber" por R$ 1.000 mensais durante 6 meses.
> -   **Lançamento:** Você cria um novo recebimento de R$ 1.000 por 6 meses classificado como 1.3.01 Expansão.
> -   *Atenção:* Não misture com o valor do contrato original.

---

## 9. Antecipação Booking Recorrente

Não é possível realizar a baixa de uma parcela de Booking recorrente se
ela ainda não estiver faturada. Caso o recebimento ocorra antes do
previsto, é obrigatório realizar a antecipação manual do faturamento
dentro do módulo de serviços.

1.  **Localização:** Acesse o menu lateral e entre no módulo **Vendas > Vendas de Serviços**.
2.  **Filtro de Período:** Altere o filtro de data para **"Todo o período"** para garantir que as parcelas futuras fiquem visíveis.
3.  **Busca do Contrato:** Pesquise pelo nome do cliente ou número do contrato que deseja antecipar.
4.  **Ação de Antecipação:**
    -   Identifique a parcela recorrente desejada.
    -   Clique no botão **Ações** (ou nos três pontos) ao lado da parcela.
    -   Selecione a opção **Antecipar**, confirme a operação para que o sistema gere o financeiro correspondente, depois é só clicar voltar.
5.  **Liberação para Baixa:** Após esse processo, a parcela estará disponível no extrato bancário para que você possa realizar a **conciliação/baixa do Booking** normalmente.

> **Atenção:** Repita o processo "parcela por parcela" caso haja mais de um vencimento sendo adiantado no mesmo lote de recebimento.

---

## 10. Conclusão

A execução rigorosa e diária da conciliação bancária é um pilar
fundamental para a saúde e a integridade financeira da unidade. A
prática de realizar as conciliações diariamente previne o acúmulo de
tarefas e a ocorrência de divergências, tornando o fechamento mensal um
processo ágil de revisão, e não uma tarefa complexa e demorada.

É mandatório que todos os contratos com clientes e as despesas da unidade
sejam lançados no sistema de gestão assim que ocorrem. O registro pontual
dos contratos garante a correta previsão e conciliação das receitas,
enquanto o lançamento imediato das despesas assegura que os relatórios
gerenciais (DRE e Fluxo de Caixa) reflitam a realidade financeira da
empresa em tempo real.

A combinação da conciliação diária com o lançamento ágil de contratos e
despesas não é apenas um requisito processual, mas uma prática
estratégica. Ela garante a acuracidade dos dados, oferece suporte para
uma tomada de decisão mais segura e assertiva, previne riscos financeiros
e assegura a conformidade e a transparência na gestão da unidade.
