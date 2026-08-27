export const SUN_LABELS = {
  'full sun': '全日照',
  'part shade': '半荫',
  shade: '荫',
};

// 新的植物分类(常绿乔木 / 落叶乔木 / 灌木 / 宿根 / 匍匐攀缘 / 水生植物)
export const PLANT_CATEGORIES = [
  '常绿乔木',
  '落叶乔木',
  '灌木',
  '宿根',
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
  水生植物: '水生植物',
};

// 明确的水(半)水生描述,或「适合近水种植/宜种水边/可水生」;排除「喜湿」等宽泛表述
const AQUATIC_RE = /水生植物|浅水|挺水|浮水|沉水|水景|生于水中|近水|水边|可水生/;

export function categoryOf(plant) {
  // 已显式写入的分类,优先采用(手工新增清单使用)
  if (plant.category) return plant.category;
  const notes = plant.rawNotes || '';
  if (AQUATIC_RE.test(notes)) return '水生植物';
  return CATEGORY_BY_LAYER[plant.designLayer] || '宿根';
}
