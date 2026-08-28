// 已知「品种名 / 园艺品种 / 变种」别名,需从 aliases 中剔除。
// 政策:aliases 仅收录中文通用名/俗名,不写品种名(品种级已按种合并到一条记录)。
// 本模块同时供 strip-cultivar-aliases.mjs 与 validate-data.mjs 复用。

export const CULTIVAR_ALIASES = [
  // 鸡爪槭 / 羽毛槭品种群
  '中之乡', '羽毛槭', '羽状鸡爪槭',
  // 藿香属
  '黑爵士藿香',
  // 银马蹄金
  '银瀑', 'Silver Falls',
  // 紫狼尾草
  '紫梦狼尾草',
  // 狼尾草
  '小布尼狼尾草', '小兔子狼尾草', 'Little Bunny',
  // 马醉木
  '妙龄少女', 'Debutante',
  // 羽扇槭
  '舞孔雀', 'Aconitifolium',
  // 东京樱花
  '染井吉野', 'Somei-yoshino',
  // 刺槐
  '金叶刺槐', 'Frisia',
  // 苹果属
  'American',
  // 菱叶绣线菊
  '粉霜', 'Pink Ice',
  // 欧洲荚蒾
  '玫瑰欧洲荚蒾', 'Roseum',
  // 溲疏
  '罗切斯特的荣耀', '雪樱花', '日光', '斑丽', 'Pride of Rochester',
  // 齿叶溲疏
  '冰生溲疏', 'Nikko',
  // 西洋接骨木
  '紫叶接骨木', 'Black Lace',
  // 滨藜叶分药花
  '蓝箭', 'Blue Steel',
  // 瑞香
  '金边瑞香',
  // 长尾复叶耳蕨
  '花叶异羽复叶耳蕨', 'Variegata',
  // 金钱蒲
  '金叶石菖蒲', 'Ogon',
  // 山麦冬属
  '纯金麦冬', '纯金啤酒麦冬', 'Pure Blonde',
  // 细茎针茅
  'Pony Tails',
  // 蒲苇
  '矮蒲苇', 'Pumila',
  // 卡尔拂子茅
  '卡尔福斯特', 'Karl Foerster',
  // 路易斯安那鸢尾
  '黑斗鸡', 'Black Gamecock',
  // 绣线菊
  '金色喷泉', '金焰绣线菊',
  // 栎叶绣球
  '雪花', '小蜜蜂',
  // 山梅花
  '金叶山梅花',
  // 加拿大紫荆
  '永恒之火',
  // 薹草
  '凤凰绿', '埃弗利斯特',
  // 千屈菜(白花变型 f. alba)
  '白花千屈菜',
];

const CULTIVAR_SET = new Set(CULTIVAR_ALIASES);

// 将 aliases 中的品种名剔除;若剔除后为空字符串则返回 null。
export function stripCultivarAliases(aliases) {
  if (!aliases) return aliases;
  const parts = String(aliases)
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !CULTIVAR_SET.has(s));
  return parts.length ? parts.join('·') : null;
}
