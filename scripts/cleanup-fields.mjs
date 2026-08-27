// 数据字段清理:
//   1) 删除 designLayer(与 category 重复)
//   2) 删除 rawNotes(特性字段,用户已弃用)
//   3) 合并「迷迭香」同种异名重复(Rosmarinus officinalis = Salvia rosmarinus)
//   4) 修正联网核对发现的学名格式错误(粘连/作者名/属名误写)
// 用法: node scripts/cleanup-fields.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PATH = resolve(ROOT, 'src/data/plants.json');

const plants = JSON.parse(readFileSync(PATH, 'utf8'));

// —— 合并迷迭香:保留更完整的灌木条目,并把另一条的有用字段并入 ——
const rosemary = plants.filter((p) => p.chineseName.trim() === '迷迭香');
if (rosemary.length >= 2) {
  // 选 category 为「灌木」的一条(常绿灌木,更准确)作为主体
  const main = rosemary.find((p) => p.category === '灌木') || rosemary[0];
  const extra = rosemary.filter((p) => p !== main);
  for (const x of extra) {
    // 合并缺失字段(以 main 已有值优先)
    for (const k of ['leafForm', 'sun', 'water', 'align', 'height', 'spread', 'bloomSeason', 'flowerColor']) {
      if (!main[k] && x[k]) main[k] = x[k];
    }
    const rn = [main.rawNotes, x.rawNotes].filter(Boolean);
    if (rn.length) main.rawNotes = rn.join('；');
  }
  main.latinName = 'Salvia rosmarinus';
  main.genus = '迷迭香属';
  main.family = '唇形科';
  main.aliases = main.aliases || 'Rosemary(异名 Rosmarinus officinalis)';
  main.missingName = false;
  plants.splice(0, plants.length, ...plants.filter((p) => !(rosemary.includes(p) && p !== main)));
}

// —— 删除设计层 / 特性字段 ——
for (const p of plants) {
  delete p.designLayer;
  delete p.rawNotes;
}

// —— 修正联网核对的学名 / 属 / 科 ——
const FIX = [
  { n: '丝兰', latin: 'Yucca filamentosa', genus: '丝兰属', family: '天门冬科', aliases: '亚当针·丝兰剑' },
  { n: '麻兰', latin: 'Phormium tenax', genus: '麻兰属', family: '阿福花科', aliases: '新西兰麻·金边剑麻' },
  { n: '马鞭草', latin: 'Verbena officinalis', genus: '马鞭草属', family: '马鞭草科', aliases: '铁马鞭·蜻蜓草·透骨草·马鞭子' },
  { n: '银叶勋章菊', latin: 'Gazania rigens', genus: '勋章菊属', family: '菊科', aliases: '勋章菊·勋章花' },
  { n: '柳宛（酒神菊）', latin: 'Baccharis halimifolia', genus: '柳宛属', family: '菊科', aliases: '酒神菊·柳雾菊' },
  { n: '棕竹', latin: 'Rhapis gracilis', genus: '棕竹属', family: '棕榈科', aliases: '细棕竹·棕竹' },
  { n: '千叶兰', latin: 'Muehlenbeckia complexa', genus: '千叶兰属', family: '蓼科', aliases: '蕨叶蓼·千叶草' },
];
let fixed = 0;
for (const f of FIX) {
  const p = plants.find((x) => x.chineseName.trim() === f.n.trim());
  if (!p) { console.warn('[fix-warn] 未找到:', f.n); continue; }
  if (f.latin) p.latinName = f.latin;
  if (f.genus) p.genus = f.genus;
  if (f.family) p.family = f.family;
  if (f.aliases && !p.aliases) p.aliases = f.aliases;
  p.missingName = false;
  fixed++;
}

writeFileSync(PATH, JSON.stringify(plants, null, 2) + '\n', 'utf8');
console.log('清理完成; 记录数:', plants.length, '; 修正:', fixed);
