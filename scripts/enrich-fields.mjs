// 从「特性」自由文本中抽取结构化字段(启发式关键词规则,保守优先)

function firstMatch(text, rules) {
  for (const [re, value] of rules) {
    if (re.test(text)) return value;
  }
  return null;
}

export function enrichNotes(notes = '') {
  const t = notes || '';
  const sun = firstMatch(t, [
    [/全日照|喜阳|向阳|需全日照|日照较好处|需较好日照|阳光下/, 'full sun'],
    [/林下|耐阴|阴暗|树荫|背阴|荫蔽|阴处|露天阴暗/, 'shade'],
    [/半荫|半阴|半日照|明亮林下|可林下|耐荫|树下|亮荫/, 'part shade'],
  ]);

  const water = firstMatch(t, [
    [/极耐旱|耐旱耐贫瘠|耐旱耐晒|耐旱/,'dry'],
    [/喜潮湿|潮湿|水边|近水|浅水|水生|湿润|可水生|近水种植/, 'wet'],
  ]);

  const flowerColor = firstMatch(t, [
    [/橙红|水红|暗红|红色|红果|红花|红/, '红'],
    [/珊瑚粉|粉红|粉紫|粉色|粉/, '粉'],
    [/蓝紫|蓝花|蓝/, '蓝'],
    [/紫色|紫花|紫/, '紫'],
    [/黄花|黄色|黄/, '黄'],
    [/白花|白色|白至|近白|白/, '白'],
  ]);

  const bloomSeason = firstMatch(t, [
    [/五六月|五月|春夏之交|春夏/, '春-夏'],
    [/早春|初春|春天|春/, '春'],
    [/晚秋|秋叶|秋季|秋/, '秋'],
    [/冬季|冬天|冬/, '冬'],
    [/初夏|盛夏|夏季|夏/, '夏'],
  ]);

  const fragrance = /香/.test(t) ? '有香' : null;

  const reliability = firstMatch(t, [
    [/非常强健|最可靠|最稳固|非常可靠|极强健/, '极强健'],
    [/强健|可靠|雄健|皮实|稳定|强壮/, '强健'],
    [/平常|一般|较弱/, '一般'],
    [/易|需修剪|需控制|易倒伏|需频繁|不耐|怕湿|易染/, '需照料'],
  ]);

  const leafColor = firstMatch(t, [
    [/银叶|银色|银脉/, '银'],
    [/墨绿|深绿|暗绿|青绿|翠绿/, '深绿'],
    [/蓝绿|灰绿|蓝灰色/, '蓝绿'],
    [/柠檬绿|浅绿|淡绿/, '浅绿'],
    [/金色|金叶|黄色叶|金黄/, '金黄'],
    [/锈红|棕红|红褐/, '红褐'],
  ]);

  const growthForm = firstMatch(t, [
    [/羽状复叶|纸质/,'羽状叶'],
    [/剑形叶|狭长叶|狭叶|细叶|线形叶/, '细长叶'],
    [/阔叶|大叶|宽叶/, '宽叶'],
    [/对生叶|豆科的对生叶/, '对生叶'],
    [/铁线蕨叶/, '蕨类叶'],
    [/莲座|簇生/, '莲座簇生'],
    [/爬墙|藤本|攀援/, '攀援'],
    [/匍匐|地被|蔓延/, '匍匐'],
    [/垂吊|下垂/, '垂吊'],
    [/矮生丛生|球状|球/, '球状'],
    [/直立|竖线条|挺拔/, '直立'],
    [/丛生|从生/, '丛生'],
  ]);

  const spreadRate = firstMatch(t, [
    [/占领|不加控制会|蔓延|地下走茎|侵占|扩张速度|迅速壮大|易增殖/, '强'],
    [/缓慢壮大|逐渐壮大|生长缓慢|扩张一般|不增不减|生长很慢/, '慢'],
    [/不增不减|稳定|竞争性不强|不易扩散/, '无'],
  ]);

  const selfSeeding = firstMatch(t, [
    [/自播能力强|自播来|会自播|形成草坪|很会自播/, '强'],
    [/自播/, '中'],
  ]);

  const lifespan = firstMatch(t, [
    [/短寿|较短寿|短命/, '短'],
    [/多年|宿根|复花|年年/, '多年'],
    [/一年/, '一年'],
  ]);

  return {
    height: null,
    spread: null,
    density: null,
    sun,
    water,
    flowerColor,
    bloomSeason,
    seasonOfInterest: null,
    fragrance,
    reliability,
    leafColor,
    growthForm,
    lifespan,
    spreadRate,
    selfSeeding,
    persistence: null,
    hardinessZone: null,
  };
}
