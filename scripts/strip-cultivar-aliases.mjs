// 从 aliases 中剔除品种名(品种名已按种合并,不再写入别名)。
// 用法: node scripts/strip-cultivar-aliases.mjs [--additional]
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CULTIVAR_ALIASES, stripCultivarAliases } from './cultivar-names.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANT_PATH = resolve(ROOT, 'src/data/plants.json');
const ADDITIONAL_PATH = resolve(ROOT, 'scripts/additional-plants.json');

const doAdditional = process.argv.includes('--additional');

function clean(file) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  let changed = 0;
  let removed = 0;
  for (const p of list) {
    const before = p.aliases;
    const after = stripCultivarAliases(p.aliases);
    if (after !== before) {
      changed++;
      const beforeSet = new Set((before || '').split('·').map((s) => s.trim()).filter(Boolean));
      const afterSet = new Set((after || '').split('·').map((s) => s.trim()).filter(Boolean));
      removed += [...beforeSet].filter((s) => !afterSet.has(s)).length;
      p.aliases = after;
    }
  }
  if (changed) writeFileSync(file, JSON.stringify(list, null, 2) + '\n', 'utf8');
  console.log(`[strip] ${file} · 修改 ${changed} 条 · 剔除品种名 ${removed} 个`);
}

console.log(`[strip] 剔除品种名单: ${CULTIVAR_ALIASES.length} 个`);
clean(PLANT_PATH);
if (doAdditional) clean(ADDITIONAL_PATH);
