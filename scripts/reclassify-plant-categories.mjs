// 一次性分类重排脚本:
//   1) 宿根 → 灌木(亚灌木/木本)/常绿乔木/藤本 的错位修正
//   2) 水生植物 → 落叶乔木/灌木 的错位修正
//   3) 匍匐攀缘 拆分为 藤本 + 地被
//   4) 剩余 宿根 → 宿根草本, 水生植物 → 水岸植物
// 用法: node scripts/reclassify-plant-categories.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANTS_PATH = resolve(ROOT, 'src/data/plants.json');

// 统一拉丁名:去掉 × 变体、折叠空格、转小写,保证匹配稳定
function normLatin(s) {
  return (s || '')
    .replace(/[\u00d7\u2715\u2716\u2573]/g, 'x')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// 显式迁移表:拉丁名 → 新分类(拉丁名是唯一可靠键,避免中文名空格/引号差异)
const MOVES = {
  // 宿根 → 灌木(具有木质茎/半木质化的亚灌木与灌木)
  'santolina chamaecyparissus': '灌木',
  'thymus vulgaris': '灌木',
  'callistemon rigidus': '灌木',
  'cistus creticus': '灌木',
  'convolvulus cneorum': '灌木',
  'gomphostigma virgatum': '灌木',
  'ozothamnus diosmifolius': '灌木',
  'caryopteris x clandonensis': '灌木',
  'buddleja lindleyana': '灌木',
  'baccharis halimifolia': '灌木',
  'anisodontea capensis': '灌木',
  'crossostephium chinense': '灌木',
  'rhapis gracilis': '灌木',
  'malva subovata': '灌木',
  'salvia yangii': '灌木',

  // 宿根 → 常绿乔木(圆柏)
  'juniperus chinensis': '常绿乔木',

  // 宿根 → 藤本(千叶兰为攀援性藤本)
  'muehlenbeckia complexa': '藤本',

  // 水生植物 → 落叶乔木(落羽杉为湿地乔木)
  'taxodium': '落叶乔木',

  // 水生植物 → 灌木(木芙蓉为湿生灌木)
  'hibiscus mutabilis': '灌木',

  // 匍匐攀缘 → 藤本
  'lonicera japonica': '藤本',
  'clematis': '藤本',
  'ficus pumila': '藤本',
  'trachelospermum jasminoides': '藤本',
  'hedera helix': '藤本',
  'wisteria': '藤本',

  // 匍匐攀缘 → 地被
  'viola banksii': '地被',
  'persicaria capitata': '地被',
  'glechoma hederacea': '地被',
  'saxifraga': '地被',
  'pratia pedunculata': '地被',
  'pachysandra terminalis': '地被',
};

// 旧分类 → 新分类(批量改名)
const RENAME = {
  宿根: '宿根草本',
  水生植物: '水岸植物',
};

if (!existsSync(PLANTS_PATH)) {
  console.error('[error] 找不到 src/data/plants.json');
  process.exit(1);
}

const plants = JSON.parse(readFileSync(PLANTS_PATH, 'utf8'));
const byLatin = new Map();
const unmatched = [];
for (const p of plants) {
  const key = normLatin(p.latinName);
  if (key) byLatin.set(key, p);
}

let moved = 0;
for (const [key, cat] of Object.entries(MOVES)) {
  const p = byLatin.get(key);
  if (!p) {
    unmatched.push(key);
    continue;
  }
  if (p.category !== cat) {
    console.log(`[move] ${p.chineseName} (${p.latinName}): ${p.category} → ${cat}`);
    p.category = cat;
    moved++;
  }
}

let renamed = 0;
for (const p of plants) {
  const next = RENAME[p.category];
  if (next) {
    p.category = next;
    renamed++;
  }
}

if (unmatched.length) {
  console.error('[warn] 迁移表中有条目未在数据中找到:', unmatched.join(', '));
}

// 校验:不应再出现旧分类
const oldCats = ['宿根', '水生植物', '匍匐攀缘'];
const leftovers = plants.filter((p) => oldCats.includes(p.category));
if (leftovers.length) {
  console.error('[error] 仍有旧分类残留:');
  for (const p of leftovers) console.error(`  ${p.chineseName} (${p.latinName}) -> ${p.category}`);
  process.exit(1);
}

writeFileSync(PLANTS_PATH, JSON.stringify(plants, null, 2) + '\n');

const counts = {};
for (const p of plants) counts[p.category] = (counts[p.category] || 0) + 1;
console.log('[done] 迁移/改名完成。迁移', moved, '条,改名', renamed, '条。');
console.log('分类统计:', JSON.stringify(counts, null, 2));
