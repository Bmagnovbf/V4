/**
 * Painel Regionais V4 — servidor do Web App (Google Apps Script)
 *
 * Por que Apps Script: o script roda com a permissão do DONO da planilha, então lê a base privada sem
 * expor o Sheets (resolve o HTTP 401 que obrigava o "Colar CSV"), e o acesso ao painel fica barrado pelo
 * login do Workspace — só perfis V4 entram. Nada de dados fica no navegador de quem abre.
 *
 * Onde mora: projeto Apps Script AVULSO ("Painel Regionais"), NÃO o projeto vinculado à planilha — aquele
 * é o das macros da base ("Carteira ADM": filtro/macros/update/atualização) e mexer nele arrisca a
 * automação dela. Vínculo é desnecessário: a leitura vai pela API, com a permissão de quem publicou.
 *
 * O sufixo _painel nos nomes de função é seguro barato: no Apps Script todos os arquivos de um projeto
 * dividem o mesmo escopo global, então uma função homônima acrescentada depois sobrescreveria a nossa
 * em silêncio. Só `doGet` fica sem sufixo, porque o nome é exigido pelo Web App.
 *
 * Arquivos do projeto:
 *   Código.gs        → este arquivo
 *   index.html       → cópia EXATA do index.html do repositório (sem alterações)
 *   appsscript.json  → manifesto com os escopos mínimos (Configurações › mostrar manifesto)
 *
 * Deploy: ver README-deploy.md nesta pasta.
 */

var CFG_PAINEL = {
  SHEET_ID: '1xI8E5g_IaykvI6pZhzSKAUfDOX_vbQVij70qyUO6OEI',
  GID: 511003944,          // aba lida; se a aba for renomeada o GID continua válido
  CACHE_SEG: 300           // 5 min — protege a planilha de reler a cada F5 sem deixar o dado velho
};

/**
 * Serve o painel. Nome fixo: é o que o Web App chama. Se ESTE projeto já tiver outro doGet (de outra
 * publicação), os dois colidem — nesse caso o painel precisa de um projeto Apps Script separado.
 * O index.html é servido como está: o próprio front detecta o Apps Script e chama getDados_painel().
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Painel Regionais V4 — Resultado Financeiro')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Devolve { vals, atualizadoEm }: a aba inteira como matriz de TEXTO (getDisplayValues), no mesmo formato
 * que o CSV colado ("R$ 1.976,62", "62,98%", "#N/A") — assim o front usa os mesmos parsers para as duas
 * origens, uma única régua de leitura — mais a data da última edição da planilha, para o carimbo do banner.
 */
function getDados_painel() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('dados_v2');
  if (hit) return JSON.parse(hit);

  var payload = {
    vals: valoresDaAba_painel(CFG_PAINEL.SHEET_ID, CFG_PAINEL.GID),
    atualizadoEm: ultimaAtualizacao_painel(CFG_PAINEL.SHEET_ID)
  };

  // O cache tem teto de 100KB por chave; base grande simplesmente não é cacheada (segue lendo direto).
  try { cache.put('dados_v2', JSON.stringify(payload), CFG_PAINEL.CACHE_SEG); } catch (e) {}
  return payload;
}

/**
 * Quando a PLANILHA foi editada pela última vez (ms epoch) — não quando o painel foi aberto. É o que
 * sustenta o alerta de base defasada no banner (âmbar >21 dias, vermelho >35): sem isso o carimbo marcaria
 * a hora do carregamento e diria "agora mesmo" com a base parada há meses, que é pior do que não ter carimbo.
 *
 * Vai direto à API do Drive pedindo só `modifiedTime`, em vez de usar `DriveApp`: assim o projeto pede
 * `drive.metadata.readonly` (metadados, sem conteúdo) no lugar do escopo amplo do DriveApp, que na tela de
 * consentimento aparece como "ver e baixar TODOS os seus arquivos do Drive" — desproporcional para ler uma data.
 *
 * O "//" da URL pode ser literal aqui: o removedor de comentários do Apps Script só atua no JS embutido no
 * HTML servido, nunca neste arquivo. No index.html a mesma sequência precisa vir por escape (ver SPEC §10.2).
 */
function ultimaAtualizacao_painel(id) {
  try {
    var url = 'https://www.googleapis.com/drive/v3/files/' + id + '?fields=modifiedTime&supportsAllDrives=true';
    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) {
      Logger.log('ultimaAtualizacao_painel: HTTP %s — %s', res.getResponseCode(), res.getContentText().slice(0, 200));
      return null;
    }
    var mt = JSON.parse(res.getContentText()).modifiedTime;   // ISO 8601, ex.: "2026-08-22T12:28:04.000Z"
    return mt ? new Date(mt).getTime() : null;
  } catch (e) {
    Logger.log('ultimaAtualizacao_painel falhou: %s', e);
    return null;
  }
}

/**
 * Quem está vendo o painel, para a barra lateral. Executando como o dono, `getActiveUser()` só devolve
 * e-mail para usuário do MESMO domínio — como o acesso é restrito à V4, é sempre o caso; fora disso vem
 * vazio e o bloco continua oculto em vez de mostrar nome de outra pessoa.
 * Chamada separada da base de propósito: responde em milissegundos, sem esperar as 3 mil linhas.
 */
function getUsuario_painel() {
  var email = '';
  try { email = Session.getActiveUser().getEmail() || ''; }
  catch (e) { Logger.log('getUsuario_painel falhou: %s', e); }
  return { email: email, nome: nomeDoEmail_painel(email) };
}

/** "bruno.magno@v4company.com" → "Bruno Magno". Heurística do padrão nome.sobrenome do Workspace da V4. */
function nomeDoEmail_painel(email) {
  if (!email) return '';
  return email.split('@')[0].split(/[._-]+/)
    .filter(function (p) { return p; })
    .map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); })
    .join(' ');
}

/** Chamada HTTP autenticada com o token do próprio script. Centralizada para o tratamento de erro ser um só. */
function api_painel(url) {
  var res = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('HTTP ' + res.getResponseCode() + ' em ' + url.split('?')[0] + ' → ' + res.getContentText().slice(0, 300));
  }
  return JSON.parse(res.getContentText());
}

/**
 * Lê a aba (localizada pelo GID) como matriz de TEXTO, via API do Sheets.
 *
 * Por que não `SpreadsheetApp.openById`: ele exige o escopo `auth/spreadsheets`, que é LEITURA E ESCRITA de
 * todas as planilhas do usuário — o painel só lê, e pedir poder de editar/excluir seria desproporcional.
 * A API REST aceita `spreadsheets.readonly`, então o app fica tecnicamente incapaz de escrever qualquer coisa.
 *
 * `FORMATTED_VALUE` devolve exatamente o que o `getDisplayValues()` dava ("R$ 1.976,62", "62,98%", "#N/A"),
 * mantendo os mesmos parsers do CSV colado no front — uma única régua de leitura (SPEC §10.2).
 * A busca é por GID (e não por nome de aba) para sobreviver à renomeação, que é o que costuma quebrar.
 */
function valoresDaAba_painel(id, gid) {
  var meta = api_painel('https://sheets.googleapis.com/v4/spreadsheets/' + id + '?fields=sheets.properties(sheetId,title)');
  var titulo = null;
  (meta.sheets || []).forEach(function (s) {
    if (s.properties && s.properties.sheetId === gid) titulo = s.properties.title;
  });
  if (!titulo) throw new Error('Aba com GID ' + gid + ' não encontrada na planilha ' + id);

  // Range em notação A1 = a aba inteira, com o título entre aspas simples (aspas internas dobram)
  var range = encodeURIComponent("'" + titulo.replace(/'/g, "''") + "'");
  var r = api_painel('https://sheets.googleapis.com/v4/spreadsheets/' + id + '/values/' + range +
                     '?valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS');
  return r.values || [];   // linhas finais vazias vêm omitidas; o mapRows já trata célula ausente
}

/** Roda uma vez no editor após publicar: confirma acesso à planilha e o tamanho do que será servido. */
function testarLeitura_painel() {
  var d = getDados_painel(), vals = d.vals || [];
  Logger.log('linhas: %s · colunas: %s — o painel usa 42; as extras da base são ignoradas', vals.length, vals[0] ? vals[0].length : 0);
  Logger.log('planilha atualizada em: %s', d.atualizadoEm ? new Date(d.atualizadoEm) : '(indisponível)');
  Logger.log('cabeçalho: %s', JSON.stringify(vals[0]));
  Logger.log('1ª linha de dados: %s', JSON.stringify(vals[1]));
}
