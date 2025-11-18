# Fix PDFKit avec Next.js

## Problème

PDFKit ne fonctionne pas correctement avec Next.js Turbopack car il cherche les fonts dans un chemin incorrect (`/ROOT/node_modules/...`).

## Solution

### En développement avec Turbopack (`npm run dev`)

**❌ Ne fonctionne pas** - PDFKit est incompatible avec Turbopack

### En développement avec Webpack (`npm run dev:webpack`)

**✅ Fonctionne** - mais nécessite de copier les fonts manuellement :

```bash
# Copier les fonts PDFKit dans le bundle Webpack
node scripts/copy-pdfkit-fonts.js
```

Ou manuellement :
```bash
mkdir -p .next/server/vendor-chunks/data
cp -r node_modules/pdfkit/js/data/*.afm .next/server/vendor-chunks/data/
```

### En production (`npm run build && npm start`)

Les fonts sont automatiquement bundlées correctement par Webpack lors du build de production.

## Recommandation

Pour le développement, utilisez :
```bash
npm run dev:webpack
```

Si les factures ne se génèrent pas, lancez :
```bash
node scripts/copy-pdfkit-fonts.js
```

## Alternatives futures

Si PDFKit continue à poser problème, considérez :
- **pdf-lib** : Alternative pure JavaScript
- **puppeteer** : Génération via HTML→PDF
- **react-pdf** : Génération déclarative de PDF
