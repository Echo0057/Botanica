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

// 新的植物分类(常绿乔木 / 落叶乔木 / 灌木 / 宿根 / 一年生 / 匍匐攀缘 / 水生植物)
export const PLANT_CATEGORIES = [
  '常绿乔木',
  '落叶乔木',
  '灌木',
  '宿根',
  '一年生',
  '匍匐攀缘',
  '水生植物',
];

// 设计层 → 基础分类(一年生 / 水生植物 通过数据特征额外判定)
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

const AQUATIC_RE = /水生|可水生|浅水|水边|近水/;
const ANNUAL_RE = /一年生|一年|短命|当年生/;

export function categoryOf(plant) {
  const notes = plant.rawNotes || '';
  if (AQUATIC_RE.test(notes)) return '水生植物';
  if (ANNUAL_RE.test(notes) || plant.lifespan === '一年') return '一年生';
  return CATEGORY_BY_LAYER[plant.designLayer] || '宿根';
}
