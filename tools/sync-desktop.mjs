// Copia o plugin.js JÁ BUILDADO para desktop/plugin.js (metade do pacote).
// Não há vendor do lado do desktop: o build embute a engine.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
mkdirSync('desktop', { recursive: true })
copyFileSync('plugin.js', 'desktop/plugin.js')
if (existsSync('NOTICE')) copyFileSync('NOTICE', 'desktop/NOTICE')
console.log('desktop/plugin.js sincronizado com o build')
