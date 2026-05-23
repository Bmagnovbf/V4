# Assistente Conta Azul V4 — Guia de Instalação
## Versão Gratuita (Claude.ai Free)

Siga este passo a passo para configurar o Assistente de Suporte Conta Azul no seu Claude gratuito. Após configurar, você poderá tirar dúvidas sobre o Conta Azul diretamente pelo Claude, sem precisar acionar o time da Matriz para perguntas do dia a dia.

---

## O que você vai precisar

- Uma conta gratuita no **claude.ai**
- Os arquivos enviados pela Matriz (pasta com os documentos de referência)
- Cerca de 5 minutos

---

## Passo 1 — Crie uma conta no Claude.ai

Acesse **https://claude.ai** e crie sua conta gratuita, se ainda não tiver.

---

## Passo 2 — Acesse os Projetos

Na barra lateral esquerda da tela, clique em **"Projetos"**.

> 💡 Se não aparecer, procure o ícone de pasta ou acesse diretamente: **https://claude.ai/projects**

---

## Passo 3 — Crie um novo Projeto

1. Clique em **"+ Novo Projeto"** (canto superior direito)
2. Dê o nome: **Suporte Conta Azul — V4 Company**
3. Clique em **"Criar projeto"**

---

## Passo 4 — Adicione as instruções

Dentro do projeto, localize o campo **"Instruções do projeto"** (ou "Custom Instructions") e cole o texto abaixo:

```
Você é um especialista no sistema Conta Azul, com conhecimento profundo dos processos financeiros padronizados pela rede V4 Company. Responda sempre em português brasileiro. Seu papel é orientar franqueados e coordenadores administrativos com respostas claras, baseadas nos documentos desta base de conhecimento.

Perfil do usuário: majoritariamente iniciantes no sistema. Use linguagem simples, sem jargões técnicos. Sempre indique o caminho de navegação no sistema (ex: Financeiro > Contas a Pagar). Use passo a passo numerado em processos com múltiplas etapas. Use ⚠️ para alertas críticos que possam afetar DRE, DFC ou integridade financeira.

Se a dúvida for ambígua, pergunte o contexto antes de responder. Pressupostos padrão: Executar = produto recorrente | Saber e Ter = produtos one time.

Se não encontrar a resposta nos documentos, responda: "Não encontrei essa informação nos nossos procedimentos. Por favor, acione o time Administrativo da Matriz."

Priorize sempre os POPs V4 em relação à documentação oficial do Conta Azul quando houver divergência.
```

Clique em **"Salvar"**.

---

## Passo 5 — Faça upload dos documentos

Ainda dentro do projeto, localize a seção **"Conhecimento do projeto"** e clique em **"+"** para adicionar arquivos.

Faça upload de todos os arquivos `.md` enviados pela Matriz:

- `conciliacao.md`
- `plano-contas-dre-dfc.md`
- `glossario-plano-contas.md`
- `lancamentos-contratos.md`
- `taxas-pagamentos-rotinas.md`

> ⚠️ **Limite do plano gratuito:** o total de conteúdo carregado deve caber dentro da janela de contexto do Claude. Se aparecer aviso de limite, priorize os 5 arquivos acima e deixe os POPs originais de fora — os arquivos principais já cobrem o essencial.

---

## Passo 6 — Teste o assistente

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

## Dúvidas sobre a configuração?

Entre em contato com o **time Administrativo da Matriz**.
