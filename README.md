# openalgo-charts — plugin do Hermes Desktop

Gráfico de candles nativo no Hermes Desktop, construído sobre **OpenAlgo Charts 2.7.0**
(Apache-2.0, zero dependências), com dados públicos da **Binance USDⓈ-M futures** e
alertas de preço do próprio engine.

- Página: `/openalgo-charts` (linha **OpenAlgo** na sidebar + comando ⌘K)
- **Chip `OpenAlgo` na barra de informações** (`STATUSBAR_AREAS.right`): abre a UI web da
  plataforma no navegador padrão via `ctx.os.openExternal`. O ponto à esquerda é sonda de
  disponibilidade (fetch `no-cors` a cada 30 s: verde responde, vermelho não). A URL alterna
  entre tailnet (padrão, `http://100.117.110.100:5000`) e loopback da VPS pelo comando
  `OpenAlgo: alternar URL (tailnet / local)` — a escolha fica em `ctx.storage` (`webUrl`).
- Fonte: `src/plugin.js` (importa a engine de `vendor/`) → **build** gera o `plugin.js`
  autocontido com a engine embutida. Motivo: o loader do desktop aceita **apenas**
  `@hermes/plugin-sdk`, `react` e `react/jsx-runtime`; import relativo (`./vendor/...`) é
  recusado em runtime com `unsupported imports`. `npm run build` faz esbuild + copia para
  `desktop/plugin.js`.
- Verificadores: `harness/verify.sh` (engine + 5 feeds + alerta em Chromium) e
  `harness/smoke.html` (carrega o **bundle buildado** via import map com stub do SDK e prova
  que ele avalia, registra as 6 contribuições e renderiza a página).
- Feeds (todos públicos, sem chave, CORS `*` — verificados em 11/11/2026):
  - `binance` — `fapi.binance.com/fapi/v1/klines` + WS `fstream.binance.com`
  - `hyperliquid` — `POST api.hyperliquid.xyz/info` (`candleSnapshot`)
  - `hyperliquid-testnet` — `POST api.hyperliquid-testnet.xyz/info`
  - `aster` — `fapi.asterdex.com/fapi/v1/klines` (API estilo Binance)
  - `aster-testnet` — `fapi.asterdex-testnet.com/fapi/v1/klines`
  Live: WS só na Binance; as demais fazem polling de 12 s na última barra.
- Indicadores: EMA 9/21 no preço; qualquer outro built-in via
  `chart.addIndicator('<id>', {...})` — 112 disponíveis (rsi, macd, supertrend,
  halftrend, vwap, cpr, adx, bollinger, donchian, zigzag…)
- Alertas: `AlertController` (`crossingUp`, `crossingDown`, `greaterThan`, `lessThan`),
  avaliados no fechamento da barra (`policy: 'onBarClose'`), entregues como toast +
  lista, persistidos em `ctx.storage` sob a chave `alerts`. Um alerta nunca envia ordem.

## Instalar

No app, com backend remoto: **Settings → Plugins → Install from Git** →
`godaliens/hermes-plugin-openalgo-charts` → **marque o alvo `Desktop`**.

O alvo importa: instalado só como backend, o cartão mostra
`Desktop unavailable (remote backend)` e nada aparece na interface — o app não copia a metade
desktop de um backend remoto, ele clona o repo na máquina da janela. Depois de instalar com
alvo Desktop, ligue o toggle em Settings → Plugins (metade desktop entra opt-in).

No CLI (backend): `hermes plugins install godaliens/hermes-plugin-openalgo-charts --enable`.

### Atualizar (observado na prática, 12/11/2026)

**Rescan**, desativar/ativar e **Update** nao re-clonam a metade desktop: a copia em
`~/.hermes/desktop-plugins/<id>/` continua na versao antiga. O caminho que funciona e
**desinstalar e reinstalar** (Install from Git, alvo Desktop). Alternativa por terminal, se a
copia tiver `.git`: `git -C ~/.hermes/desktop-plugins/openalgo-charts pull --ff-only`.

Para saber qual build esta carregado, a pagina mostra `v<versao> · tier widget` no canto
direito da faixa da fonte (`VERSION` em `src/plugin.js`, espelhado em `plugin.yaml`).

## Verificação (objetiva)

```bash
harness/verify.sh      # PASS esperado
```

O harness carrega a mesma API que o plugin usa contra dados reais da Binance num Chromium
headless e falha se as velas não renderizarem (contagem de pixels verdes/vermelhos) ou se
o alerta não disparar. Saída de referência:

```
feed binance: 200 barras · aster: 200 · aster-testnet: 200
feed hyperliquid: 201 · hyperliquid-testnet: 201
EMA 9/21 ok · RSI ok · alerta crossingUp com state "triggered"
pixels: velas verdes=8178 vermelhas=13613 → renderizou=True
RESULTADO ok=true feedsOk=true alertFired=true · VEREDITO: PASS
```

**Pitfall do alerta `onBarClose` (custou dois ciclos):** a barra que cruza precisa estar
EM FORMAÇÃO quando cruza. Mutar uma barra já fechada é tratado pela engine como
"correção de barra antiga" — e correção nunca é julgada. O harness semeia a barra do
bucket atual abaixo do alvo, cruza nela, e só então fecha com a barra seguinte.

## Por que não é um iframe do OpenAlgo

A UI do OpenAlgo manda `X-Frame-Options: DENY` e `frame-ancestors 'self'`; e o CORS da API
está fechado (`CORS_ALLOWED_ORIGINS` = `http://127.0.0.1:5000`). Um iframe não embute e um
`fetch` direto do renderer seria barrado. Por isso: engine vendorizada + feed público.

## BingX

A API pública da BingX responde **403** a qualquer requisição que carregue `Origin`
(proteção WAF), então o feed BingX precisa de proxy fora do navegador — o backend Python
do plugin (`ctx.rest` → `/api/plugins/<id>`) é o caminho quando formos plugar BingX,
ordens assinadas e alertas no servidor.
