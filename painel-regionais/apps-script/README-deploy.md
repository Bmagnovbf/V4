# Publicação do Painel Regionais — Google Apps Script Web App

**Publicado em 22/08/2026:**
`https://script.google.com/a/macros/v4company.com/s/AKfycbzetIVW5LOLU0Jv4M4VMFQNBvoB8RIR6vlg20tr-bcgURO0BHr_vL38MwYeD6BEbWRa9A/exec`
Projeto Apps Script **avulso** ("Painel Regionais"), não o das macros da planilha. Executa como o dono, acesso "Qualquer pessoa em V4 Company".

Decisão de 19/08/2026: publicar como **Web App do Apps Script**, com **acesso restrito a perfis V4** e leitura **direta da planilha** (sem "Colar CSV").

Por que essa via resolve os três problemas de uma vez:

| Problema | Como o Apps Script resolve |
|---|---|
| Planilha privada → HTTP 401 no navegador | O script executa **com a permissão do dono**; quem abre o painel nunca toca no Sheets |
| Dados precisam estar vinculados ao painel | O painel lê a base a cada abertura — qualquer pessoa, em qualquer máquina, vê os mesmos dados |
| Acesso só para perfis V4 | O Workspace exige login `@v4company.com` **antes** de servir a página; sem lista de usuários para manter |

---

## Passo a passo (~10 min)

**1. Criar um projeto AVULSO (não o da planilha)**
Abra **script.google.com › Novo projeto**, logado na conta V4.

> ⚠️ **Não** use *Extensões › Apps Script* da planilha: aquele projeto é o das **macros da própria base** (`filtro.gs`, `macros.gs`, `update.gs`, `atualização.gs`) — mexer nele arrisca quebrar a automação da planilha, e todos os arquivos de um projeto dividem o mesmo escopo global (uma função homônima sobrescreve a outra em silêncio). O painel não precisa de vínculo: lê a base pela **API do Sheets**, com a permissão de quem publicou.

**2. Colar os arquivos**
- **Configurações do projeto** (engrenagem na lateral) → marcar **"Mostrar o arquivo de manifesto appsscript.json no editor"** → abrir o `appsscript.json` que aparece na lista e colar o deste repositório. Ele declara os **quatro escopos mínimos** (planilha somente leitura · metadados do Drive · requisição externa · e-mail do usuário) e fixa `executeAs: USER_DEPLOYING` + `access: DOMAIN`. Sem ele o Apps Script infere escopos amplos sozinho — foi assim que a 1ª autorização pediu "ver e baixar TODOS os seus arquivos do Drive" só para ler uma data.
- `Código.gs` (vem vazio, com um `myFunction` de exemplo) → apagar tudo e colar o `apps-script/Code.gs` deste repositório.
- **Arquivo › Novo › HTML**, nome exatamente **`index`** → cole o `index.html` inteiro do repositório, **sem alterações**.

> O `index.html` funciona nos dois modos sozinho: em `file://` segue com "Colar CSV"; publicado, detecta o Apps Script (`google.script.run`) e chama `getDados_painel()`. É o mesmo arquivo nos dois lugares — não mantenha versões separadas.

**3. Conferir a leitura antes de publicar**
No editor, selecione a função **`testarLeitura_painel`** e execute. Na primeira vez o Google pede autorização para **Planilhas e Drive** (o Drive é só para ler a data da última edição do arquivo, que vira o carimbo do banner) — a tela de "app não verificado" é esperada em projeto próprio: *Avançado › Acessar projeto*.

Em *Execuções / Logs* confira quatro coisas:
- `linhas` > 0
- `colunas: 45` — 42 usadas + 2 sem título + `Última Atualização`; extras são ignoradas. O que importa é o painel **não** acusar coluna faltando no banner
- `planilha atualizada em:` com uma data plausível (se vier `(indisponível)`, a autorização do Drive não passou)
- cabeçalho e 1ª linha de dados com a cara do CSV ("R$ 1.976,62", "62,98%")

**4. Publicar**
**Implantar › Nova implantação › Tipo: App da Web**:

| Campo | Valor |
|---|---|
| Descrição | `Painel Regionais v1` |
| Executar como | **Eu (`seu-usuário@v4company.com`)** ← é isso que dá acesso à planilha privada |
| Quem pode acessar | **Qualquer pessoa em V4 Company** ← é isso que restringe aos perfis V4 |

Copie a URL `.../exec` — é o link do painel.

> ⚠️ **Não** selecione "Qualquer pessoa" nem "Qualquer pessoa com o link": combinado com "Executar como: eu", isso publicaria a base financeira da rede inteira para fora da V4.

**5. Validar**
Abra a URL numa **janela anônima** logado com a conta V4 (deve entrar) e, se possível, peça a alguém de fora para abrir (deve barrar no login).

---

## Atualizações

- **Mudou a planilha:** nada a fazer — o painel lê a cada abertura (cache de 5 min; F5 depois disso já traz o dado novo) e o carimbo do banner acompanha a data de edição do arquivo.
- **Mudou o `index.html`:** cole a versão nova no arquivo `index` **e** faça **Implantar › Gerenciar implantações › ✏️ › Versão: Nova**. Sem esse passo a URL continua servindo a versão antiga.
- **Mudou a aba de origem:** ajuste `CFG_PAINEL.GID` no `Code.gs`. A busca é por GID justamente para sobreviver a renomeação de aba.

## Habilitar as APIs no projeto Cloud (obrigatório)

As chamadas REST exigem que as APIs estejam **habilitadas** no projeto Cloud por trás do Apps Script — os serviços nativos não exigiam, e por isso o erro só aparece depois da migração (`HTTP 403: Google Sheets API has not been used in project … before or it is disabled`). No editor: seção **Serviços** na lateral esquerda → **+** → adicionar **Google Sheets API** (v4) e **Drive API** (v3, listada sem o prefixo "Google"). Isso habilita as APIs no projeto e grava `enabledAdvancedServices` no manifesto.

**Efeito colateral bom:** a leitura da base caiu de ~19s (`SpreadsheetApp`) para ~4s (API REST).

## Por que nada de `SpreadsheetApp` / `DriveApp`

Os serviços nativos do Apps Script pedem escopos largos: `SpreadsheetApp.openById` exige `auth/spreadsheets` (**ler e escrever** todas as planilhas do usuário) e `DriveApp` exige "ver e **baixar** todos os arquivos do Drive". O painel só lê uma aba e uma data. Por isso as duas leituras vão por **API REST** com o token do próprio script, o que permite declarar no manifesto os escopos mínimos: `spreadsheets.readonly` e `drive.metadata.readonly`. Efeito prático: o app fica **tecnicamente incapaz de escrever** em qualquer planilha e não enxerga conteúdo de arquivo nenhum no Drive.

## Limites conhecidos

- **URL:** `script.google.com/a/macros/v4company.com/s/.../exec` — longa. Para um link curto, um redirecionamento tipo `regionais.v4company.com` resolve a aparência, mas a autenticação continua sendo a do Workspace.
- **Cota:** o Apps Script tem teto diário de execuções por conta. Para dezenas de leitores por dia, o cache de 5 min mantém o consumo baixo com folga.
- **Perfis:** o corte é **binário por decisão** (19/08/2026) — quem é V4 vê todas as regionais. O painel mostra margens e valores agregados, não o detalhamento por unidade, então não há problema em cada regional enxergar as demais. Reavaliar **apenas se** entrar detalhamento financeiro linha a linha; nesse caso, filtrar no `getDados_painel()` por `Session.getActiveUser().getEmail()`.
