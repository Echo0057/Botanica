// 把联网核实后的学名/属/科/别名写入 plants.json(按 chineseName 精确匹配)
// 同时修正少数条目继承错误的 genus/family
// 用法: node scripts/apply-names.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PATH = resolve(ROOT, 'src/data/plants.json');

// 每条:name=中文名(latinName 匹配用), latin / genus / family / aliases(可选)
const MAP = [
  { name: '鸡爪槭 “中之乡”', latin: 'Acer palmatum', genus: '槭属', family: '无患子科', aliases: '鸡爪枫·羽枫·中之乡' },
  { name: '月季花', latin: 'Rosa chinensis', genus: '蔷薇属', family: '蔷薇科', aliases: '月月红(江浙)·月月花·庚申蔷薇' },
  { name: '紫茎泽兰', latin: 'Ageratina adenophora', genus: '紫茎泽兰属', family: '菊科', aliases: '破坏草·解放草·霸王草·臭草·腺泽兰' },
  { name: '绵杉菊', latin: 'Santolina chamaecyparissus', genus: '绵杉菊属', family: '菊科', aliases: '银香菊·薰衣草棉·棉雪松菊' },
  { name: '双色野鸢尾', latin: 'Dietes bicolor', genus: '离被鸢尾属', family: '鸢尾科', aliases: '黄色野鸢尾·孔雀花' },
  { name: '迷迭香', latin: 'Salvia rosmarinus', genus: '迷迭香属', family: '唇形科', aliases: 'Rosemary(异名 Rosmarinus officinalis)' },
  { name: '红千层', latin: 'Callistemon rigidus', genus: '红千层属', family: '桃金娘科', aliases: '串钱柳·瓶刷子树' },
  { name: '山菅兰', latin: 'Dianella ensifolia', genus: '山菅兰属', family: '阿福花科', aliases: '桔梗兰·山菅·山猫儿' },
  { name: '落叶百子莲', latin: 'Agapanthus praecox', genus: '百子莲属', family: '石蒜科', aliases: '非洲爱情花·蓝百合' },
  { name: '大戟', latin: 'Euphorbia', genus: '大戟属', family: '大戟科', aliases: '京大戟·大戟属' },
  { name: '岩蔷薇', latin: 'Cistus creticus', genus: '岩蔷薇属', family: '半日花科', aliases: '岩玫瑰·岩壁玫瑰' },
  { name: '猫薄荷', latin: 'Nepeta cataria', genus: '荆芥属', family: '唇形科', aliases: '荆芥·樟脑草·凉薄荷·小荆芥' },
  { name: '西班牙薰衣草', latin: 'Lavandula stoechas', genus: '薰衣草属', family: '唇形科', aliases: '法国薰衣草·头状薰衣草' },
  { name: '八宝景天', latin: 'Hylotelephium spectabile', genus: '八宝属', family: '景天科', aliases: '长药八宝·长药景天·石头菜·蝎子掌' },
  { name: '糙苏', latin: 'Phlomoides umbrosa', genus: '糙苏属', family: '唇形科', aliases: '糙苏(异名 Phlomis umbrosa)' },
  { name: '蓍草', latin: 'Achillea millefolium', genus: '蓍属', family: '菊科', aliases: '蓍·欧蓍·千叶蓍·锯草·洋蓍草' },
  { name: '银旋花', latin: 'Convolvulus cneorum', genus: '旋花属', family: '旋花科', aliases: '白银旋花' },
  { name: '火炬花', latin: 'Kniphofia uvaria', genus: '火炬花属', family: '阿福花科', aliases: '火把莲·红火棒' },
  { name: '剪秋罗', latin: 'Silene fulgens', genus: '蝇子草属', family: '石竹科', aliases: '大花剪秋罗(异名 Lychnis fulgens)' },
  // —— 第二批(联网核实) ——
  { name: '百里香', latin: 'Thymus vulgaris', genus: '百里香属', family: '唇形科', aliases: '普通百里香·花园百里香(异名南欧百里香)' },
  { name: '地榆', latin: 'Sanguisorba officinalis', genus: '地榆属', family: '蔷薇科', aliases: '黄瓜香·山地瓜·猪人参·血箭草·黄爪香·山枣子' },
  { name: '藿香“黑爵士”', latin: "Agastache 'Black Adder'", genus: '藿香属', family: '唇形科', aliases: '黑爵士藿香·巨型藿香(杂交大藿香)' },
  { name: '柳叶星河花', latin: 'Gomphostigma virgatum', genus: '河星花属', family: '玄参科', aliases: '帚枝河星花·柳叶星河·河之星·水獭木' },
  { name: '皮球柏', latin: "Juniperus chinensis 'Globosa'", genus: '圆柏属', family: '柏科', aliases: '球柏·圆球柏·皮球松' },
  { name: '紫娇花', latin: 'Tulbaghia violacea', genus: '紫娇花属', family: '石蒜科', aliases: '洋韭·非洲小百合·紫瓣花·野蒜' },
  { name: '澳洲米花', latin: 'Ozothamnus diosmifolius', genus: '米花菊属', family: '菊科', aliases: '大米花·小米花·爆米花·澳洲风铃草·水稻花' },
  { name: '新风轮菜', latin: 'Calamintha nepeta', genus: '新风轮属', family: '唇形科', aliases: '假荆芥·山薄荷·香蜂草·荆芥风轮菜' },
  { name: '蓝花莸', latin: 'Caryopteris × clandonensis', genus: '莸属', family: '唇形科', aliases: '兰香草·蓝花茶·蒙古莸' },
  { name: '蒲棒菊', latin: 'Rudbeckia maxima', genus: '金光菊属', family: '菊科', aliases: '大金光菊·大头金光菊·草原松果菊' },
  { name: '蓝花赝靛', latin: 'Baptisia australis', genus: '赝靛属', family: '豆科', aliases: '澳洲蓝豆·蓝花假靛·blue wild indigo' },
  { name: '芝樱（从生福禄考）', latin: 'Phlox subulata', genus: '福禄考属', family: '花荵科', aliases: '丛生福禄考·针叶天蓝绣球·芝樱花' },
  { name: '银瀑马蹄金', latin: "Dichondra argentea 'Silver Falls'", genus: '马蹄金属', family: '旋花科', aliases: '银马蹄金·银瀑·Silver Falls' },
  { name: '宿根福禄考（天蓝绣球）', latin: 'Phlox paniculata', genus: '天蓝绣球属', family: '花荵科', aliases: '天蓝绣球·锥花福禄考·草夹竹桃·福禄考' },
  { name: '千日红', latin: 'Gomphrena globosa', genus: '千日红属', family: '苋科', aliases: '百日红·火球花·千年红·千金红' },
  { name: '加勒比飞蓬', latin: 'Erigeron karvinskianus', genus: '飞蓬属', family: '菊科', aliases: '加勒比飞蓬(海飞蓬)·墨西哥飞蓬' },
  { name: '火星花', latin: 'Crocosmia × crocosmiiflora', genus: '雄黄兰属', family: '鸢尾科', aliases: '雄黄兰·观音兰·黄大蒜·倒挂金钩·标竿花' },
  { name: '匍匐筋骨草', latin: 'Ajuga reptans', genus: '筋骨草属', family: '唇形科', aliases: '匍筋骨草·匍匐筋骨草' },
  { name: '鹦鹉嘴百脉根', latin: 'Lotus berthelotii', genus: '百脉根属', family: '豆科', aliases: '鹦鹉喙·parrot beak·珊瑚宝石·火焰花' },
  { name: '醉鱼草', latin: 'Buddleja lindleyana', genus: '醉鱼草属', family: '玄参科', aliases: '鱼尾草·毒鱼草·闭鱼花' },
  { name: '天胡荽属', latin: 'Hydrocotyle', genus: '天胡荽属', family: '五加科', aliases: '天胡荽·遍地金·破铜钱' },
  { name: '紫叶狼尾草', latin: "Pennisetum setaceum 'Rubrum'", genus: '狼尾草属', family: '禾本科', aliases: '紫穗狼尾草·紫梦狼尾草·羽绒狼尾草' },
  { name: '小兔子狼尾草', latin: "Pennisetum alopecuroides 'Little Bunny'", genus: '狼尾草属', family: '禾本科', aliases: '小布尼狼尾草·Little Bunny' },
  { name: '布尼狼尾草', latin: 'Pennisetum orientale', genus: '狼尾草属', family: '禾本科', aliases: '东方狼尾草·大布尼狼尾草·布尼' },
  { name: '细叶芒', latin: "Miscanthus sinensis 'Gracillimus'", genus: '芒属', family: '禾本科', aliases: '拉手笼·纤细芒·细叶芒草' },
  { name: '熊猫堇', latin: 'Viola banksii', genus: '堇菜属', family: '堇菜科', aliases: '肾叶堇·班克斯堇菜·常春藤叶堇菜' },
];

const plants = JSON.parse(readFileSync(PATH, 'utf8'));
let applied = 0;
let warn = 0;
for (const m of MAP) {
  const p = plants.find((x) => x.chineseName.trim() === m.name.trim());
  if (!p) {
    console.warn(`[warn] 未找到:「${m.name}」`);
    warn++;
    continue;
  }
  p.latinName = m.latin;
  p.genus = m.genus;
  p.family = m.family;
  p.missingName = false;
  if (m.aliases) p.aliases = m.aliases;
  applied++;
}

writeFileSync(PATH, JSON.stringify(plants, null, 2) + '\n', 'utf8');
console.log('已更新:', applied, '条; 警告:', warn, '条');
