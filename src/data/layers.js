export const SUN_LABELS = {
  'full sun': '全日照',
  'full sun to part shade': '全日照至半荫',
  'part shade': '半荫',
  'part shade to full sun': '半荫至全日照',
  'part shade to shade': '半荫至荫',
  shade: '荫',
};

export const WATER_LABELS = {
  dry: '耐旱/干',
  'dry to medium': '干至中等',
  medium: '中等',
  'medium to wet': '中等至湿',
  wet: '喜湿',
};

export const EVERGREEN_LABELS = {
  evergreen: '常绿',
  deciduous: '落叶',
};

export function label(map, value) {
  return value == null || value === '' ? value : map[value] || value;
}

// 新的植物分类(常绿乔木 / 落叶乔木 / 灌木 / 宿根草本 / 藤本 / 地被 / 水生植物)
export const PLANT_CATEGORIES = [
  '常绿乔木',
  '落叶乔木',
  '灌木',
  '宿根草本',
  '藤本',
  '地被',
  '水生植物',
];

export function categoryOf(plant) {
  return plant.category || '宿根草本';
}
