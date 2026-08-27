// 一次性:根据现有字段预填充每条记录的 habitat 字段(初始值,后续可经 SOP 补准)
// 用法: node scripts/seed-habitat.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUN_LABELS } from '../src/data/layers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANTS_PATH = resolve(ROOT, 'src/data/plants.json');

const plants = JSON.parse(readFileSync(PLANTS_PATH, 'utf8'));

function habitat(p) {
  const n = p.rawNotes || '';
  const parts = [];
  if (p.category === '水生植物' || /水生植物|浅水|水边|近水/.test(n)) parts.push('水生·水畔');
  if (/林下|耐阴|耐荫|树荫|阴/.test(n)) parts.push('林下·耐荫');
  if (/耐旱|耐贫瘠|贫瘠|干旱/.test(n)) parts.push('耐旱·耐瘠');
  if (p.sun) parts.push(SUN_LABELS[p.sun]);
  if (p.water === 'wet') parts.push('喜湿');
  const uniq = [...new Set(parts)];
  return uniq.length ? uniq.join(' · ') : null;
}

let filled = 0;
for (const p of plants) {
  p.habitat = habitat(p);
  if (p.habitat) filled++;
}

writeFileSync(PLANTS_PATH, JSON.stringify(plants, null, 2) + '\n', 'utf8');
console.log('已写入:', PLANTS_PATH);
console.log('填充 habitat 的记录:', filled, '/', plants.length);
