// 数据一致性/格式校验:用于拦截联网富集或人工录入产生的命名冲突、字段取值漂移。
// 用法: npm run validate  (node scripts/validate-data.mjs)
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SUN_VALUES, WATER_VALUES, EVERGREEN_VALUES, BLOOM_SEASONS,
  FAMILY_VARIANTS, GENUS_VARIANTS, HARDINESS_RE, SIZE_RE,
  hardinessSuitability,
} from '../src/data/taxonomy-cn.js';
import { CULTIVAR_ALIASES } from './cultivar-names.js';
import { habitatIssues } from './habitat-rules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const plants = JSON.parse(
  readFileSync(resolve(__dirname, '../src/data/plants.json'), 'utf8')
);

const errors = [];
const warnings = [];
const CULTIVAR_SET = new Set(CULTIVAR_ALIASES);
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

// 4.5) 中文名规范:应只含单一标准中文名,不允许夹带别名/品种名/空格拼接多个名字
for (const p of plants) {
  const cn = String(p.chineseName || '');
  if (/[（(]/.test(cn)) {
    errors.push(`中文名含括号别名,应改为标准名+aliases: "${cn}"(${p.latinName})`);
  }
  if (/\s/.test(cn)) {
    errors.push(`中文名含空格(疑似多个名字拼接),应改为标准名+aliases: "${cn}"(${p.latinName})`);
  }
  if (/[“”"'×·,，]/.test(cn)) {
    errors.push(`中文名含引号/品种名/分隔符,应只存标准中文名: "${cn}"(${p.latinName})`);
  }
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

// 6) 上海适温评估(非阻断,仅提示;用于排查耐寒偏弱的植物)
for (const p of plants) {
  if (p.hardinessZone) {
    const s = hardinessSuitability(p.hardinessZone);
    if (s.level === 'alert' || s.level === 'warn') {
      warnings.push(`${p.chineseName}(${p.latinName}) 耐寒区 ${p.hardinessZone} · ${s.reason}`);
    }
  }
}

// 7) 政策:数据库不含图片(images 字段已整体移除)
for (const p of plants) {
  if ('images' in p) {
    warnings.push(`${p.chineseName} 仍含有 images 字段(政策:不做图片)`);
  }
}

// 8) 政策:别名只收通用名,不写品种名
for (const p of plants) {
  if (!p.aliases) continue;
  const bad = String(p.aliases).split('·').map((s) => s.trim()).filter((s) => CULTIVAR_SET.has(s));
  if (bad.length) warnings.push(`${p.chineseName} 别名含品种名: ${bad.join(' / ')}`);
}

// 9) 政策:生境只收生态型微生境,不含海拔/地区/国家/括号/栽植用词
for (const p of plants) {
  if (p.habitat == null && p.habitat !== '') continue;
  const bad = habitatIssues(p.habitat);
  if (bad.length) errors.push(`${p.chineseName} 生境不合规: ${bad.join(' / ')} -> "${p.habitat}"`);
}

if (errors.length) {
  console.error(`[validate] 发现 ${errors.length} 处问题:`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

console.log(
  `[validate] OK · ${plants.length} 条,科/属一致性、字段白名单、格式校验全部通过。`
);
if (warnings.length) {
  console.warn(`[validate] ⚠️ 提醒 ${warnings.length} 条(不阻断):`);
  for (const w of warnings) console.warn('  ⚠️ ' + w);
}
