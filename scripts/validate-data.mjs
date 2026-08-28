// 数据一致性/格式校验:用于拦截联网富集或人工录入产生的命名冲突、字段取值漂移。
// 用法: npm run validate  (node scripts/validate-data.mjs)
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SUN_VALUES, WATER_VALUES, EVERGREEN_VALUES, BLOOM_SEASONS,
  FAMILY_VARIANTS, GENUS_VARIANTS, HARDINESS_RE, SIZE_RE,
} from '../src/data/taxonomy-cn.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const plants = JSON.parse(
  readFileSync(resolve(__dirname, '../src/data/plants.json'), 'utf8')
);

const errors = [];
const norm = (s) => (s || '').toLowerCase();
const latinGenus = (ln) => norm(String(ln || '').trim().split(/\s+/)[0] || '');
const uniq = (set) => [...set].filter(Boolean).sort();

// 1) 同一拉丁属只能对应一个中文属名
const genusByLatin = new Map();
// 2) 同一中文属只能对应一个科
const familyByGenus = new Map();

for (const p of plants) {
  const lg = latinGenus(p.latinName);
  if (!lg) {
    errors.push(`缺少 latinName,无法取属: ${p.chineseName || p.id}`);
    continue;
  }
  if (!genusByLatin.has(lg)) genusByLatin.set(lg, new Set());
  genusByLatin.get(lg).add(p.genus);
  if (p.genus) {
    if (!familyByGenus.has(p.genus)) familyByGenus.set(p.genus, new Set());
    familyByGenus.get(p.genus).add(p.family);
  }
}

for (const [lg, set] of genusByLatin) {
  if (set.size > 1) {
    errors.push(`拉丁属「${lg}」对应多个中文属名: ${uniq(set).join(' / ')}`);
  }
}
for (const [g, set] of familyByGenus) {
  if (set.size > 1) {
    errors.push(`中文属「${g}」对应多个科: ${uniq(set).join(' / ')}`);
  }
}

// 3) 科/属名变体检测(应使用标准写法)
for (const p of plants) {
  if (p.family && FAMILY_VARIANTS[p.family]) {
    errors.push(`科名用变体「${p.family}」,应为「${FAMILY_VARIANTS[p.family]}」(${p.chineseName})`);
  }
  if (p.genus && GENUS_VARIANTS[p.genus]) {
    errors.push(`属名用变体「${p.genus}」,应为「${GENUS_VARIANTS[p.genus]}」(${p.chineseName})`);
  }
}

// 4) 字段取值白名单
for (const p of plants) {
  if (p.sun && !SUN_VALUES.includes(p.sun)) errors.push(`日照值超范围: "${p.sun}" (${p.chineseName})`);
  if (p.water && !WATER_VALUES.includes(p.water)) errors.push(`水分值超范围: "${p.water}" (${p.chineseName})`);
  if (p.evergreen && !EVERGREEN_VALUES.includes(p.evergreen)) errors.push(`常绿值超范围: "${p.evergreen}" (${p.chineseName})`);
  if (p.bloomSeason && !BLOOM_SEASONS.includes(p.bloomSeason)) errors.push(`花期值超范围: "${p.bloomSeason}" (${p.chineseName})`);
}

// 5) 格式校验(耐寒区 / 高度 / 冠幅)
for (const p of plants) {
  if (p.hardinessZone && !HARDINESS_RE.test(String(p.hardinessZone).trim())) {
    errors.push(`耐寒区格式错误: "${p.hardinessZone}" (${p.chineseName})`);
  }
  if (p.height && !SIZE_RE.test(String(p.height).trim())) {
    errors.push(`高度格式错误: "${p.height}" (${p.chineseName})`);
  }
  if (p.spread && !SIZE_RE.test(String(p.spread).trim())) {
    errors.push(`冠幅格式错误: "${p.spread}" (${p.chineseName})`);
  }
}

if (errors.length) {
  console.error(`[validate] 发现 ${errors.length} 处问题:`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

console.log(
  `[validate] OK · ${plants.length} 条,科/属一致性、字段白名单、格式校验全部通过。`
);
