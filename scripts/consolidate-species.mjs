// 一次性数据整理:
//   1) 去掉「目(order)」字段(分类只需 科-属-种)
//   2) 同一物种(拉丁学名的 属+种)下的不同园艺品种只保留一条
// 用法: node scripts/consolidate-species.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANTS_PATH = resolve(ROOT, 'src/data/plants.json');

const plants = JSON.parse(readFileSync(PLANTS_PATH, 'utf8'));

// 去掉「目(order)」
for (const p of plants) {
  delete p.order;
}

// 提取「属+种」作为物种键(忽略品种引号与作者名,× 杂交代用属+种)
function speciesKey(p) {
  const l = (p.latinName || '').trim().toLowerCase();
  if (!l) return null;
  const noQuote = l.split("'")[0];
  const words = noQuote.split(/[^a-z]+/).filter(Boolean);
  if (words.length >= 2) return `${words[0]} ${words[1]}`;
  if (words.length === 1) return words[0];
  return null;
}

const byKey = new Map();
const noKey = [];
for (const p of plants) {
  const k = speciesKey(p);
  if (k) {
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(p);
  } else {
    noKey.push(p);
  }
}

const uniq = (arr) => [...new Set(arr.filter(Boolean))].join('；');

const kept = [];
let collapsedCount = 0;
const groups = [];

// 缺学名的记录无法可靠归种,原样保留
kept.push(...noKey);

for (const [key, group] of byKey.entries()) {
  if (group.length === 1) {
    kept.push(group[0]);
    continue;
  }
  groups.push(key);
  // 代表:优先无品种引号的学名、且中文名较短
  const sorted = [...group].sort((a, b) => {
    const aq = /'/.test(a.latinName || '') ? 1 : 0;
    const bq = /'/.test(b.latinName || '') ? 1 : 0;
    if (aq !== bq) return aq - bq;
    return (a.chineseName || '').length - (b.chineseName || '').length;
  });
  const rep = sorted[0];
  const notes = uniq(group.map((g) => g.rawNotes));
  const aliases = uniq([rep.aliases, ...group.map((g) => g.aliases)]);
  if (notes) rep.rawNotes = notes;
  if (aliases) rep.aliases = aliases;
  kept.push(rep);
  collapsedCount += group.length - 1;
}

writeFileSync(PLANTS_PATH, JSON.stringify(kept, null, 2) + '\n', 'utf8');

console.log('原记录数:', plants.length);
console.log('合并后记录数:', kept.length);
console.log('归并的物种(组):', groups.length);
console.log('去掉的品种记录数:', collapsedCount);
console.log('已写入:', PLANTS_PATH);
