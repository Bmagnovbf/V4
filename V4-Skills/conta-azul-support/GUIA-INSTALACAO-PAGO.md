# Assistente Conta Azul V4 — Guia de Instalação
## Versão Paga (Claude.ai Pro ou Max)

Siga este passo a passo para configurar o Assistente de Suporte Conta Azul no seu Claude Pro ou Max. Com o plano pago, o assistente carrega **todos** os documentos de referência com maior capacidade, garantindo respostas mais completas e precisas.

---

## O que você vai precisar

- Uma conta **Claude.ai Pro ou Max** (a partir de ~$20/mês)
- Os arquivos enviados pela Matriz (pasta com os documentos de referência)
- Cerca de 5 minutos

---

## Passo 1 — Acesse os Projetos

Na barra lateral esquerda da tela, clique em **"Projetos"**.

> 💡 Ou acesse diretamente: **https://claude.ai/projects**

---

## Passo 2 — Crie um novo Projeto

1. Clique em **"+ Novo Projeto"** (canto superior direito)
2. Dê o nome: **Suporte Conta Azul — V4 Company**
3. Clique em **"Criar projeto"**

---

## Passo 3 — Adicione as instruções

Dentro do projeto, localize o campo **"Instruções do projeto"** e cole o texto abaixo:

```
Você é um especialista no sistema Conta Azul, com conhecimento profundo dos processos financeiros padronizados pela rede V4 Company. Responda sempre em português brasileiro. Seu papel é orientar franqueados e coordenadores administrativos com respostas claras, baseadas nos documentos desta base de conhecimento.

Perfil do usuário: majoritariamente iniciantes no sistema. Use linguagem simples, sem jargões técnicos. Sempre indique o caminho de navegação no sistema (ex: Financeiro > Contas a Pagar). Use passo a passo numerado em processos com múltiplas etapas. Use ⚠️ para alertas críticos que possam afetar DRE, DFC ou integridade financeira.

Se a dúvida for ambígua, pergunte o contexto antes de responder. Pressupostos padrão: Executar = produto recorrente | Saber e Ter = produtos one time.

Se não encontrar a resposta nos documentos, responda: "Não encontrei essa informação nos nossos procedimentos. Por favor, acione o time Administrativo da Matriz."

Priorize sempre os POPs V4 em relação à documentação oficial do Conta Azul quando houver divergência.
```

Clique em **"Salvar"**.

---

## Passo 4 — Faça upload de todos os documentos

Dentro do projeto, localize a seção **"Conhecimento do projeto"** e clique em **"+"** para adicionar arquivos.

Faça upload de **todos** os arquivos enviados pela Matriz, na seguinte ordem:

**Arquivos de referência principais (obrigatórios):**
- `conciliacao.md`
- `plano-contas-dre-dfc.md`
- `glossario-plano-contas.md`
- `lancamentos-contratos.md`
- `taxas-pagamentos-rotinas.md`

**POPs originais completos (recomendados — garantem detalhes adicionais):**
- `pop-conciliacao-bancaria-2026.md`
- `pop-conciliacao-recebimentos-deducoes.md`
- `pop-adequacao-plano-contas-dre-dfc-2026.md`
- `pop-gerenciamento-contratos-2026.md`
- `pop-contas-a-pagar-2026.md`
- `pop-aplicacao-financeira-outras-contas.md`
- `pop-taxas-v4-finance-iugu.md`
- `pop-pagamentos-cheque.md`
- `pop-rotinas-e-rituais.md`
- `pop-novo-relatorios-dre-dfc.md`
- `glossario-plano-contas.md`

> ✅ Com o plano pago, o Claude ativa automaticamente o modo RAG (Recuperação Inteligente) quando necessário, expandindo em até 10x a capacidade da base de conhecimento. Você não precisa se preocupar com limite de arquivos.

---

## Passo 5 — Teste o assistente

Dentro do projeto, inicie uma nova conversa e faça uma pergunta de teste:

> *"Como faço a conciliação bancária no Conta Azul?"*

Se o assistente responder com base nos procedimentos V4, a configuração está correta. ✅

---

## Como usar no dia a dia

Sempre que tiver uma dúvida sobre o Conta Azul:

1. Acesse **claude.ai/projects**
2. Abra o projeto **Suporte Conta Azul — V4 Company**
3. Inicie uma nova conversa e faça sua pergunta

---

## Dica: atualizando a base de conhecimento

Quando a Matriz enviar novos POPs ou atualizações:

1. Acesse o projeto
2. Na seção "Conhecimento do projeto", clique em **"+"**
3. Faça upload do novo arquivo
4. O assistente passa a usar o novo documento imediatamente nas próximas conversas

---

## Dúvidas sobre a configuração?

Entre em contato com o **time Administrativo da Matriz**.
