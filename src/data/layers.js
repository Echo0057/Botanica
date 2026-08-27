// 固定的 9 个设计层(与 Excel 工作表名一致)
export const DESIGN_LAYERS = [
  '常绿乔木',
  '常绿灌木',
  '落叶乔木',
  '落叶灌木',
  '喜阳灌木宿根',
  '耐阴宿根',
  '观赏草',
  '球根根茎类',
  '匍匐攀援类',
];

export const EVERGREEN_LABELS = {
  evergreen: '常绿',
  deciduous: '落叶',
};

export const SUN_LABELS = {
  'full sun': '全日照',
  'part shade': '半荫',
  shade: '荫',
};

export const WATER_LABELS = {
  dry: '耐旱',
  wet: '喜湿',
};

// 新的植物分类(常绿乔木 / 落叶乔木 / 灌木 / 宿根 / 短寿宿根 / 匍匐攀缘 / 水生植物)
export const PLANT_CATEGORIES = [
  '常绿乔木',
  '落叶乔木',
  '灌木',
  '宿根',
  '短寿宿根',
  '匍匐攀缘',
  '水生植物',
];

// 设计层 → 基础分类(短寿宿根 / 水生植物 通过数据特征额外判定)
const CATEGORY_BY_LAYER = {
  常绿乔木: '常绿乔木',
  落叶乔木: '落叶乔木',
  常绿灌木: '灌木',
  落叶灌木: '灌木',
  喜阳灌木宿根: '宿根',
  耐阴宿根: '宿根',
  观赏草: '宿根',
  球根根茎类: '宿根',
  匍匐攀援类: '匍匐攀缘',
};

// 仅当描述为明确的(半)水生植物时才归为水生,排除「近水/水边/可水生/喜湿」等
const AQUATIC_RE = /水生植物|浅水|挺水|浮水|沉水|水景|生于水中/;
const SHORTLIVED_RE = /短寿|较短寿|短命|不一定能复花|未必复花|难复花/;

export function categoryOf(plant) {
  const notes = plant.rawNotes || '';
  if (AQUATIC_RE.test(notes)) return '水生植物';
  if (SHORTLIVED_RE.test(notes) || plant.lifespan === '短') return '短寿宿根';
  return CATEGORY_BY_LAYER[plant.designLayer] || '宿根';
}
