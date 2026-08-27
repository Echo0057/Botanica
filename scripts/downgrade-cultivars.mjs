// 将含 品种/变种/亚种 的学名记录统一降到「属+种」级
//  - 去掉 var./subsp./cv./'品种引号' 及其后内容
//  - 杂交种(×)保留种级(如 Prunus × yedoensis),仅去掉品种
//  - 仅「属+品种」无种名的记录降为属级,并标记 genusOnly=true
//  - 被去掉的品种/变种名并入 aliases(用 · 连接,不覆盖已有别名)
//  - 中文名同步精简为种级标准名
// 用法: node scripts/downgrade-cultivars.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PATH = resolve(ROOT, 'src/data/plants.json');

// 显式映射: from=当前中文名, to={cn, latin, alias, genusOnly}
const MAP = {
  '鸡爪槭 羽毛槭': { cn: '鸡爪槭', latin: 'Acer palmatum', alias: '羽毛槭·羽状鸡爪槭' },
  '藿香“黑爵士”': { cn: '藿香属', latin: 'Agastache', alias: '黑爵士藿香·巨藿香', genusOnly: true },
  '皮球柏': { cn: '圆柏', latin: 'Juniperus chinensis', alias: '皮球柏·球柏·圆球柏' },
  '银瀑马蹄金': { cn: '银马蹄金', latin: 'Dichondra argentea', alias: '银瀑·Silver Falls' },
  '紫叶狼尾草': { cn: '紫狼尾草', latin: 'Pennisetum setaceum', alias: '紫叶狼尾草·紫穗狼尾草·紫梦狼尾草' },
  '小兔子狼尾草': { cn: '狼尾草', latin: 'Pennisetum alopecuroides', alias: '小兔子狼尾草·小布尼狼尾草·Little Bunny' },
  '细叶芒': { cn: '芒', latin: 'Miscanthus sinensis', alias: '细叶芒·拉手笼·纤细芒' },
  '西藏红豆杉 南方红豆杉': { cn: '西藏红豆杉', latin: 'Taxus wallichiana', alias: '南方红豆杉·红豆杉' },
  '日本四照花 四照花': { cn: '四照花', latin: 'Cornus kousa', alias: '日本四照花·四照花' },
  '马醉木 “妙龄少女”': { cn: '马醉木', latin: 'Pieris japonica', alias: '妙龄少女·Debutante' },
  '瑞香 金边瑞香': { cn: '瑞香', latin: 'Daphne odora', alias: '金边瑞香' },
  '羽扇槭 “舞孔雀”': { cn: '羽扇槭', latin: 'Acer japonicum', alias: '舞孔雀·Aconitifolium' },
  '色木槭 五角槭': { cn: '色木槭', latin: 'Acer pictum', alias: '五角槭' },
  '东京樱花 “染井吉野”': { cn: '东京樱花', latin: 'Prunus × yedoensis', alias: '染井吉野·Somei-yoshino' },
  '刺槐 “金叶”': { cn: '刺槐', latin: 'Robinia pseudoacacia', alias: '金叶刺槐·Frisia' },
  '北美海棠': { cn: '苹果属', latin: 'Malus', alias: '北美海棠·American', genusOnly: true },
  '复羽叶栾 黄山栾树': { cn: '复羽叶栾', latin: 'Koelreuteria bipinnata', alias: '黄山栾树' },
  '菱叶绣线菊 “粉霜”': { cn: '菱叶绣线菊', latin: 'Spiraea × vanhouttei', alias: '粉霜·Pink Ice' },
  '琼花 绣球荚蒾': { cn: '琼花', latin: 'Viburnum keteleeri', alias: '绣球荚蒾·聚绣球' },
  '欧洲荚蒾 玫瑰欧洲荚蒾': { cn: '欧洲荚蒾', latin: 'Viburnum opulus', alias: '玫瑰欧洲荚蒾·Roseum' },
  '溲疏 “罗切斯特的荣耀”': { cn: '溲疏', latin: 'Deutzia scabra', alias: '罗切斯特的荣耀·Pride of Rochester' },
  '齿叶溲疏 冰生溲疏': { cn: '齿叶溲疏', latin: 'Deutzia crenata', alias: '冰生溲疏·Nikko' },
  '绣球 山绣球': { cn: '绣球', latin: 'Hydrangea macrophylla', alias: '山绣球' },
  '西洋接骨木 紫叶接骨木': { cn: '西洋接骨木', latin: 'Sambucus nigra', alias: '紫叶接骨木·Black Lace' },
  '双色树锦葵': { cn: '双色树锦葵', latin: 'Malva subovata', alias: '双色锦葵（亚种 bicolor）' },
  '滨藜叶分药花 “蓝箭”': { cn: '滨藜叶分药花', latin: 'Salvia yangii', alias: '蓝箭·Blue Steel·分药花' },
  '打破碗花花 秋牡丹': { cn: '打破碗花花', latin: 'Anemone hupehensis', alias: '秋牡丹' },
  '长尾复叶耳蕨 花叶异羽复叶耳蕨': { cn: '长尾复叶耳蕨', latin: 'Arachniodes simplicior', alias: '花叶异羽复叶耳蕨·Variegata' },
  '金钱蒲 金叶石菖蒲': { cn: '金钱蒲', latin: 'Acorus gramineus', alias: '金叶石菖蒲·Ogon' },
  '纯金啤酒阔叶山麦冬': { cn: '山麦冬属', latin: 'Liriope', alias: '纯金啤酒麦冬·Pure Blonde', genusOnly: true },
  '细茎针茅': { cn: '细茎针茅', latin: 'Stipa tenuissima', alias: 'Pony Tails·墨西哥羽毛草' },
  '矮蒲苇': { cn: '蒲苇', latin: 'Cortaderia selloana', alias: '矮蒲苇·Pumila' },
  '卡尔拂子茅': { cn: '卡尔拂子茅', latin: 'Calamagrostis acutiflora', alias: 'Karl Foerster·拂子茅' },
  '路易斯安娜鸢尾 “黑斗鸡”': { cn: '路易斯安那鸢尾', latin: 'Iris louisiana', alias: '黑斗鸡·Black Gamecock' },
  '白花千屈菜': { cn: '千屈菜', latin: 'Lythrum salicaria', alias: '白花千屈菜' },
};

const plants = JSON.parse(readFileSync(PATH, 'utf8'));
let applied = 0;
let warn = 0;
for (const [from, to] of Object.entries(MAP)) {
  const p = plants.find((x) => x.chineseName.trim() === from.trim());
  if (!p) { console.warn('[warn] 未找到:', from); warn++; continue; }
  p.chineseName = to.cn;
  p.latinName = to.latin;
  p.missingName = false;
  if (to.genusOnly) p.genusOnly = true;
  // 别名合并(去重,用 · 连接)
  const parts = [p.aliases, to.alias].filter(Boolean).flatMap((s) => s.split('·').map((x) => x.trim()).filter(Boolean));
  p.aliases = [...new Set(parts)].join('·');
  applied++;
}

writeFileSync(PATH, JSON.stringify(plants, null, 2) + '\n', 'utf8');
console.log('降级完成:', applied, '条; 警告:', warn, '条; 总记录:', plants.length);
