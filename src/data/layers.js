export const SUN_LABELS = {
  'full sun': '全日照',
  'part shade': '半荫',
  shade: '荫',
};

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
