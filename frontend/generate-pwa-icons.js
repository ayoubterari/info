// Script pour générer des icônes PWA PNG
// Utilise Canvas pour créer les images

const fs = require('fs');
const path = require('path');

// Fonction pour créer un SVG simple
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#000000"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" stroke="#FFFFFF" stroke-width="${size * 0.05}" fill="none"/>
  <text x="${size / 2}" y="${size / 2}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">AI</text>
</svg>`;
}

// Créer les SVG
const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

// Créer le dossier public s'il n'existe pas
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Créé: ${filename}`);
});

console.log('\n📝 Note: Les fichiers SVG ont été créés.');
console.log('Pour une vraie PWA, vous devez les convertir en PNG.');
console.log('\nOptions:');
console.log('1. Ouvrez generate-icons.html dans votre navigateur');
console.log('2. Ou utilisez un outil en ligne comme: https://www.iloveimg.com/convert-to-jpg/svg-to-jpg');
console.log('3. Ou utilisez ImageMagick: convert icon.svg icon.png');
