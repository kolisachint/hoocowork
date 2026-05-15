const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template function - HooCowork logo
function createIconSVG(size) {
  const padding = Math.round(size * 0.125); // 12.5% padding
  const innerSize = size - (padding * 2);
  const rx = Math.round(innerSize * 0.2); // 20% corner radius
  const strokeWidth = Math.max(1.5, Math.round(size * 0.04));
  const dotRadius = Math.max(1, Math.round(size * 0.025));
  
  // Scale positions relative to inner content area
  const centerX = size / 2;
  const centerY = size / 2;
  const bracketOffset = Math.round(innerSize * 0.22);
  const bracketY1 = centerY - Math.round(innerSize * 0.125);
  const bracketY2 = centerY + Math.round(innerSize * 0.125);
  const slashX1 = centerX - Math.round(innerSize * 0.06);
  const slashX2 = centerX + Math.round(innerSize * 0.06);
  const slashY1 = centerY + Math.round(innerSize * 0.1875);
  const slashY2 = centerY - Math.round(innerSize * 0.1875);
  const dotY1 = padding + Math.round(innerSize * 0.1875);
  const dotY2 = size - padding - Math.round(innerSize * 0.1875);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${rx}" fill="#111110"/>
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${rx}" stroke="#2a2a29" stroke-width="${Math.max(1, Math.round(size * 0.015))}"/>
  
  <!-- Left bracket -->
  <path d="M${centerX - bracketOffset} ${bracketY1}L${centerX - bracketOffset - Math.round(innerSize * 0.09)} ${centerY}L${centerX - bracketOffset} ${bracketY2}" 
        stroke="#f5f5f5" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Right bracket -->
  <path d="M${centerX + bracketOffset} ${bracketY1}L${centerX + bracketOffset + Math.round(innerSize * 0.09)} ${centerY}L${centerX + bracketOffset} ${bracketY2}" 
        stroke="#f5f5f5" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Center slash -->
  <path d="M${slashX1} ${slashY1}L${slashX2} ${slashY2}" stroke="#6366f1" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  
  <!-- AI sparkle dots -->
  <circle cx="${centerX}" cy="${dotY1}" r="${dotRadius}" fill="#6366f1"/>
  <circle cx="${centerX}" cy="${dotY2}" r="${dotRadius}" fill="#6366f1"/>
</svg>`;
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, 'icons', filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Created ${filename}`);
});

console.log('\nSVG icons created!');
console.log('To convert to PNG, run: bun run scripts/convert-icons.ts');
