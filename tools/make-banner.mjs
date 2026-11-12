// Embuti o banner como data URI: o plugin é um único plugin.js e o loader não
// resolve <img src="./assets/..."> relativo à pasta do plugin. Gerado no build.
import { readFileSync, writeFileSync } from 'node:fs'
const jpg = readFileSync('assets/banner.jpg')
const uri = `data:image/jpeg;base64,${jpg.toString('base64')}`
writeFileSync(
  'src/banner.js',
  `// GERADO por tools/make-banner.mjs a partir de assets/banner.jpg — não editar\nexport const BANNER = '${uri}'\n`,
)
console.log(`src/banner.js: ${(uri.length / 1024).toFixed(0)} KB`)
