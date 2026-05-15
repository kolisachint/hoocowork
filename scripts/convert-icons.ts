#!/usr/bin/env bun
/**
 * convert-icons.ts
 *
 * Converts PWA icon SVGs to PNGs using sharp.
 * Run after generate-icons.cjs to create PNG versions.
 */

import sharp from 'sharp';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const iconsDir = join(process.cwd(), 'public', 'icons');

async function convertIcons() {
  const files = readdirSync(iconsDir).filter(f => f.endsWith('.svg') && f.startsWith('icon-'));
  
  console.log('[convert-icons] Converting SVG icons to PNG...');
  
  for (const file of files) {
    const size = parseInt(file.match(/icon-(\d+)x\d+/)?.[1] || '0');
    if (!size) continue;
    
    const svgBuffer = readFileSync(join(iconsDir, file));
    const outputPath = join(iconsDir, file.replace('.svg', '.png'));
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`[convert-icons] Created ${file.replace('.svg', '.png')}`);
  }
  
  console.log('[convert-icons] Done!');
}

convertIcons().catch(err => {
  console.error('[convert-icons] Error:', err);
  process.exit(1);
});
