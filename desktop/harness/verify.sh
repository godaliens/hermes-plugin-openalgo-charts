#!/bin/bash
# Verificador objetivo do painel openalgo-charts.
# Sobe um http.server local na raiz do plugin, carrega harness/index.html num
# Chromium headless e falha se a engine não renderizar ou o alerta não disparar.
set -u
PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CH="${CHROME:-$HOME/.cache/ms-playwright/chromium-1223/chrome-linux/chrome}"
PORT="${PORT:-8899}"
OUT="$(mktemp -d)"
[ -x "$CH" ] || { echo "FAIL: chromium não encontrado em $CH (defina CHROME=...)"; exit 2; }

cd "$PLUGIN_DIR" || exit 2
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1

"$CH" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1200,800 --virtual-time-budget=15000 \
  --screenshot="$OUT/shot.png" --dump-dom "http://127.0.0.1:$PORT/harness/index.html" \
  2>/dev/null > "$OUT/dom.html"

python3 - "$OUT/dom.html" "$OUT/shot.png" <<'PY'
import re, sys
dom = open(sys.argv[1], encoding='utf-8', errors='replace').read()
m = re.search(r'<div id="log">(.*?)</div>', dom, re.S)
log = m.group(1) if m else ''
print(log.strip() or 'FAIL: harness não produziu log')
ok = 'RESULTADO ok=true' in log
try:
    from PIL import Image
    im = Image.open(sys.argv[2]).convert('RGB')
    crop = im.crop((0, 0, min(1100, im.size[0]), min(620, im.size[1])))
    px = list(crop.getdata())
    green = sum(1 for r, g, b in px if g > r + 25 and g > b + 20)
    red = sum(1 for r, g, b in px if r > g + 25 and r > b + 20)
    painted = green > 1000 and red > 1000
    print(f'pixels: velas verdes={green} vermelhas={red} → renderizou={painted}')
    ok = ok and painted
except Exception as exc:  # noqa: BLE001
    print('aviso: checagem de pixels indisponível:', exc)
print('VEREDITO:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
PY
