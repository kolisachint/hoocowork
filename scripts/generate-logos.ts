#!/usr/bin/env bun
/**
 * generate-logos.ts
 *
 * Generates PNG logos from SVG at various sizes for favicons and app icons.
 * Requires sharp: bun install sharp
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const sizes = [32, 64, 128, 256, 512];
const publicDir = join(process.cwd(), 'public');

async function generateLogos() {
  const svgBuffer = readFileSync(join(publicDir, 'logo.svg'));
  
  console.log('[generate-logos] Generating PNG logos from SVG...');
  
  for (const size of sizes) {
    const outputPath = join(publicDir, `logo-${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`[generate-logos] Created logo-${size}.png`);
  }
  
  // Generate favicon.png (32x32)
  const faviconBuffer = readFileSync(join(publicDir, 'favicon.svg'));
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('[generate-logos] Created favicon.png');
  
  console.log('[generate-logos] Done!');
}

generateLogos().catch(err => {
  console.error('[generate-logos] Error:', err);
  process.exit(1);
});
