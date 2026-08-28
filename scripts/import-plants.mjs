// 从 scripts/additional-plants.json 合并新增植物进 src/data/plants.json
// 用法: npm run import:plants   (等效 node scripts/import-plants.mjs)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categoryOf, PLANT_CATEGORIES } from '../src/data/layers.js';
import { stripCultivarAliases } from './cultivar-names.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANTS_PATH = resolve(ROOT, 'src/data/plants.json');
const ADDITIONAL_PATH = resolve(ROOT, 'scripts/additional-plants.json');

function slugify(text) {
  const ascii = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return ascii.toLowerCase();
}

function makeId(existing) {
  const used = new Set(existing);
  return function next(base) {
    let slug = slugify(base) || 'plant';
    let id = slug;
    let i = 2;
    while (used.has(id)) id = `${slug}_${i++}`;
    used.add(id);
    return id;
  };
}

// 按「属+种」提取物种键,防止同一物种下的不同品种重复入库
function speciesKey(latin) {
  const l = (latin || '').trim().toLowerCase();
  if (!l) return null;
  const words = l.split("'")[0].split(/[^a-z]+/).filter(Boolean);
  return words.length >= 2 ? `${words[0]} ${words[1]}` : words.length ? words[0] : null;
}

// 中文名规范:只保留标准中文名。
// 若写成「标准名（别名）」这样的形式,把括号里的名字拆到 aliases,避免中文名夹带别名的重大错误。
function splitNameAlias(name) {
  const m = String(name || '').match(/^(.*?)[（(](.+?)[)）]$/);
  if (!m) return { name, aliasParts: [] };
  const base = m[1].trim();
  const aliasParts = m[2]
    .split(/[·|、，,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { name: base, aliasParts };
}

if (!existsSync(PLANTS_PATH)) {
  console.error('[error] 找不到 src/data/plants.json');
  process.exit(1);
}

let plants = JSON.parse(readFileSync(PLANTS_PATH, 'utf8'));
let additional = [];
try {
  additional = JSON.parse(readFileSync(ADDITIONAL_PATH, 'utf8'));
} catch (e) {
  console.error('[error] 无法读取 additional-plants.json:', e.message);
  process.exit(1);
}
if (!Array.isArray(additional)) {
  console.error('[error] additional-plants.json 必须是数组');
  process.exit(1);
}

const existingNames = new Set(plants.map((p) => (p.chineseName || '').trim().toLowerCase()));
const existingSpecies = new Set();
for (const p of plants) {
  const k = speciesKey(p.latinName);
  if (k) existingSpecies.add(k);
}
const nextId = makeId(plants.map((p) => p.id));
const errors = [];
const warnings = [];
let added = 0;

for (const entry of additional) {
  const { name, aliasParts } = splitNameAlias((entry.chineseName || '').trim());
  if (!name) {
    errors.push('有一条清单记录缺少 chineseName');
    continue;
  }
  const cat = (entry.category || '').trim();
  if (!PLANT_CATEGORIES.includes(cat)) {
    errors.push(`「${name}」的 category 无效: "${cat}"(应为 ${PLANT_CATEGORIES.join(' / ')})`);
    continue;
  }
  const latin = (entry.latinName || '').trim();
  const spKey = speciesKey(latin);
  const dup = spKey ? existingSpecies.has(spKey) : existingNames.has(name.toLowerCase());
  if (dup) {
    warnings.push(`跳过已存在(按种去重):「${name}」`);
    continue;
  }
  if (spKey) existingSpecies.add(spKey);
  else existingNames.add(name.toLowerCase());
  if (!latin) warnings.push(`「${name}」缺少拉丁学名(建议补上)`);

  plants.push({
    id: nextId(latin || name || 'plant'),
    chineseName: name,
    latinName: latin || null,
    genus: entry.genus || null,
    family: entry.family || null,
    aliases: stripCultivarAliases(
      [entry.aliases, ...aliasParts].filter(Boolean).join('·')
    ),
    evergreen: entry.evergreen ?? null,
    height: entry.height ?? null,
    spread: entry.spread ?? null,
    sun: entry.sun ?? null,
    water: entry.water ?? null,
    bloomSeason: entry.bloomSeason ?? null,
    flowerColor: entry.flowerColor ?? null,
    seasonOfInterest: entry.seasonOfInterest ?? null,
    leafForm: entry.leafForm ?? null,
    persistence: entry.persistence ?? null,
    hardinessZone: entry.hardinessZone ?? null,
    habitat: entry.habitat ?? null,
    missingName: !latin,
    genusOnly: false,
    category: cat,
    sources: Array.isArray(entry.sources) ? entry.sources : entry.sources ? [entry.sources] : [],
    tags: Array.isArray(entry.tags) ? entry.tags : [],
  });
  added++;
}

if (errors.length) {
  console.error('[error] additional-plants.json 校验失败,已中止:');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

writeFileSync(PLANTS_PATH, JSON.stringify(plants, null, 2) + '\n', 'utf8');

const byCategory = Object.fromEntries(
  PLANT_CATEGORIES.map((c) => [c, plants.filter((p) => categoryOf(p) === c).length]),
);

console.log('已写入:', PLANTS_PATH);
console.log('记录总数:', plants.length);
console.log('本次新增:', added);
if (warnings.length) console.log('警告:', warnings);
console.log('按分类统计:', JSON.stringify(byCategory, null, 2));
