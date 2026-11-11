#!/bin/bash
# Gera a metade desktop (desktop/) a partir da raiz. Fonte da verdade: raiz.
# Existem DUAS cópias de propósito:
#   - raiz (plugin.js + vendor/): o instalador de backend REMOTO clona a raiz
#     inteira para ~/.hermes/desktop-plugins/<id>/;
#   - desktop/ (plugin.js + vendor/): exigida por `hermes plugins validate`
#     e usada quando o pacote é copiado como metade desktop.
# A cópia precisa ser autocontida (vendor junto) porque o import é relativo.
set -e
cd "$(dirname "$0")/.."
rm -rf desktop
mkdir -p desktop
cp plugin.js desktop/plugin.js
cp -a vendor desktop/vendor
cp NOTICE desktop/NOTICE
echo "desktop/ sincronizado com a raiz ($(du -sh desktop | cut -f1))"
