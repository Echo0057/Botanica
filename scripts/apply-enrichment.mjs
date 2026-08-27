// 将 scripts/enrichment/*.json 的富集字段合并进 src/data/plants.json
// 用法: npm run enrich   (node scripts/apply-enrichment.mjs)
//
// enrichment 文件结构(数组):
// {
//   "match": "latinName 或 chineseName",   // 用于定位植物
//   "by": "latin" | "chinese",             // 匹配方式,默认 latin
//   "fields": { ...要合并的字段... },
//   "sources": ["https://..."]             // 可选,来源 URL
// }

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANTS_PATH = resolve(ROOT, 'src/data/plants.json');
const ENRICH_DIR = resolve(ROOT, 'scripts/enrichment');

function norm(s) {
  return (s || '')
    .replace(/[\u00d7\u2715\u2716\u2573]/g, 'x')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

if (!existsSync(PLANTS_PATH)) {
  console.error('[error] 找不到 src/data/plants.json');
  process.exit(1);
}

const plants = JSON.parse(readFileSync(PLANTS_PATH, 'utf8'));
const files = existsSync(ENRICH_DIR)
  ? readdirSync(ENRICH_DIR).filter((f) => f.endsWith('.json'))
  : [];

if (!files.length) {
  console.log('[info] scripts/enrichment 下暂无富集文件');
  process.exit(0);
}

// 建立查询索引
const byLatin = new Map();
const byChinese = new Map();
for (const p of plants) {
  if (p.latinName) byLatin.set(norm(p.latinName), p);
  if (p.chineseName) byChinese.set(p.chineseName.trim(), p);
}

let applied = 0;
let skipped = 0;
const missing = [];
const logs = [];

for (const file of files) {
  let entries;
  try {
    entries = JSON.parse(readFileSync(join(ENRICH_DIR, file), 'utf8'));
  } catch (e) {
    console.error(`[error] 无法解析 ${file}:`, e.message);
    process.exit(1);
  }
  if (!Array.isArray(entries)) continue;

  for (const item of entries) {
    const by = item.by === 'chinese' ? 'chinese' : 'latin';
    const plant = item.matcher
      ? plants.find(item.matcher)
      : by === 'chinese'
        ? byChinese.get(String(item.match).trim())
        : byLatin.get(norm(item.match));

    if (!plant) {
      missing.push(`[${file}] ${item.match}`);
      continue;
    }

    const fields = item.fields || {};
    const merged = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v == null || v === '') continue;
      if (plant[k] === v) continue; // 已一致,跳过
      plant[k] = v;
      merged[k] = v;
    }

    if (item.sources && item.sources.length) {
      const cur = Array.isArray(plant.sources) ? plant.sources : [];
      for (const s of item.sources) {
        if (!cur.includes(s)) cur.push(s);
      }
      plant.sources = cur;
    }

    applied++;
    if (Object.keys(merged).length) {
      logs.push(`${plant.chineseName}: ${Object.entries(merged).map(([k, v]) => `${k}=${v}`).join(' | ')}`);
    }
  }
}

if (missing.length) {
  console.warn('[warn] 以下条目未匹配到植物(跳过):');
  for (const m of missing) console.warn('  ', m);
}

writeFileSync(PLANTS_PATH, JSON.stringify(plants, null, 2) + '\n');

console.log(`[done] 共处理 ${applied} 条,未匹配 ${missing.length} 条。`);
if (logs.length) {
  console.log('--- 本轮变更 ---');
  for (const l of logs) console.log('  ', l);
}
console.log('--- 当前覆盖 ---');
const counts = {};
for (const p of plants) counts[p.category] = (counts[p.category] || 0) + 1;
console.log(counts);
