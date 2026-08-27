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

// 把 9 个设计层归到三个大类别(乔木 / 灌木 / 宿根·草花·地被)
export const MAJOR_GROUPS = {
  乔木: ['常绿乔木', '落叶乔木'],
  灌木: ['常绿灌木', '落叶灌木'],
  '宿根·草花·地被': ['喜阳灌木宿根', '耐阴宿根', '观赏草', '球根根茎类', '匍匐攀援类'],
};

export function majorGroupOf(designLayer) {
  for (const [group, layers] of Object.entries(MAJOR_GROUPS)) {
    if (layers.includes(designLayer)) return group;
  }
  return '其他';
}
