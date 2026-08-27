# Botanica · 植物数据标准作业流程(SOP)

> 适用:向 Botanica 植物库**新增植物**、**核对学名**、**联网检索并补全特性**。
> 文档用英文文件名,正文用中文。每次录入/检索后按 `AGENTS.md` 约定 `git commit`(不主动 push)。

---

## 0. 数据从哪来

`src/data/plants.json` 是唯一数据库。**Excel 导入已停用**(2026-08-27):基础数据已固化在 `plants.json` 里,之后新增一律走手工清单。

1. **基础数据**:原 Excel(9 张表 = 9 个设计层)已固化进 `src/data/plants.json`,字段含义见 `design.md` / `../AGENTS.md`。
2. **手工清单**:`scripts/additional-plants.json` —— 所有新增植物都写这里。

> 不要手改 `plants.json`。新增就写进清单,再跑 `npm run import:plants` 合并(自动去重)。

---

## 1. 新增植物流程(用户提供一个植物名)

### 第 1 步:识辨植物

- 拿到中文名(如「三白草」)后,先确定它的**拉丁学名**(属名 + 种加词)。
- 我自己能确定的直接用;不确定或存在争议时,**联网核对**(见第 2 节),以 KEW POWO / RHS 为正名。
- 中文名可能有异名,多看一眼 `aliases`(别名)。

### 第 2 步:定分类

在 6 类里选一个:`常绿乔木 / 落叶乔木 / 灌木 / 宿根 / 匍匐攀缘 / 水生植物`。

- 乔木再分常绿/落叶;灌木合并;宿根是多年生草本;匍匐攀缘是地被/藤本;水生植物包括挺水/浮水/沉水/水边。
- 例如:紫藤 → 匍匐攀缘;鸢尾(宿根)→ 宿根;菖蒲 → 水生植物。

### 第 3 步:填字段(能填则填,不编造)

把已知信息按 `scripts/additional-plants.json` 的字段写进去。**必填**:`chineseName`、`category`。**建议填**:`latinName`、`genus`、`family`。分类只用 **科-属-种**(无「目(order)」字段)。其它(日照/水分/花期/花色/高度/耐寒等)从第 4 步检索后来填。

> **学名与分类**:学名 = 中文学名(`chineseName`)+ 拉丁学名(`latinName`)。分类系统统一采用 **APG IV**(被子植物;蕨类用 PPG I),仅保留 科-属-种。数据库按**种**为标准:同一物种下的不同园艺品种只保留一条(`scripts/consolidate-species.mjs`)。

### 第 4 步:联网检索特性(见第 2 节)

优先从海外权威库提取**结构字段**:

- `height`(米)、`spread`(米)、`sun`(full sun / part shade / shade)、`water`(dry / wet)、`habitat`(生境)、`flowerColor`、`bloomSeason`、`hardinessZone`、`reliability`、`leafForm`、`fragrance`。
- 把来源都记进该条的 `sources` 数组(站点 + URL)。

### 第 5 步:写入清单

在 `scripts/additional-plants.json` 数组末尾加一条。示例:

```json
{
  "chineseName": "某某植物",
  "latinName": "Genus species",
  "genus": "某属",
  "family": "某科",
  "habitat": "林下·耐荫 · 喜湿",
  "category": "宿根",
  "sun": "part shade",
  "water": "wet",
  "height": "0.5-1",
  "spread": "0.5",
  "flowerColor": "白",
  "bloomSeason": "夏",
  "reliability": "强健",
  "leafForm": "卵形叶",
  "notes": "一句话特性描述。",
  "sources": ["https://www.missouribotanicalgarden.org/PlantFinder/PlantFinderDetails.aspx?..."],
  "images": []
}
```

### 第 6 步:导入并校验

```bash
npm run import:plants
```

脚本会:读取 `scripts/additional-plants.json` 清单 + 现有 `plants.json` → 校验(缺中文名/类别非法会**中止**并报错)→ 按**种**去重(同一物种/已存在会跳过硬告)→ 追加新增 → 重算 `id`/`category`/`missingName` → 写回 `plants.json` → 打印分类统计与警告。

### 第 7 步:验证与提交

- 看输出:**没有 error**,确认「分类统计」里该分类 +1。
- 若开了 dev server,刷新页面看是否出现;或 `npm run build` 确认可构建。
- 按约定 `git commit`(不主动 push)。

---

## 2. 联网检索「特性」流程(海外植物/园艺数据库)

联网用 `search` 工具找页面,`open_page` 读正文。**优先级与用途**如下(按需组合,不必每站都查):

| 优先级 | 站点 | 用途 / 取什么 |
| --- | --- | --- |
| 1 | **KEW Plants of the World Online (POWO)** | 学名正名 / 科属/目 / 分布 / APG 分类权威 |
| 2 | **RHS Find a Plant** | 品种学名、株高冠幅、耐寒(近似)、园艺习性 |
| 3 | **Missouri Botanical Garden · Plant Finder** | 高度 / 冠幅 / 日照 / 水分 / 花期 / 花色 / 耐寒区(结构字段齐全) |
| 4 | **Great Plant Picks** | 「可靠好养/成熟表现佳」的可靠性判断 |
| 5 | **Mount Cuba Center** | 多年生草花试种结果、花期/表现可靠度 |
| 6 | **Wikimedia Commons / iNaturalist / GBIF** | 图片(多为 CC 授权) |
| 7 | 补充 | Wikipedia、园艺商/苗圃页(仅作参考) |

### 中文学名 / 中文别名(权威来源)

中文名与别名**不要凭印象**,要用以下权威库核对(中国原生植物尤须如此;引种/园艺品种则参考园艺通行中文名):

| 优先级 | 站点 | 用途 / 取什么 |
| --- | --- | --- |
| 1 | **《中国植物志》/ Flora of China(eFloras)** | 中文学名(正名)、别名、科属、拉丁学名 —— 中国原生植物最权威 |
| 2 | **iPlant 植物智(iPlant.cn)** | 中文名 / 别名 / 分类 / 图片,现代整理,推荐 |
| 3 | **中国植物图像库(PPBC, ppbc.iplant.cn)** | 中文名、别名与图片交叉核对(多为 CC) |

> 学名(拉丁)以 KEW POWO / RHS 为正名;中文名以《中国植物志》/ iPlant 为准;别名记入该条 `aliases`。

### 检索步骤

1. **先定中文名与别名**。搜 `"<中文名>" 植物智` 或 `"<中文名>" 中国植物志` 或 `"<拉丁学名>" iPlant`,拿到**中文学名**与**别名**。
2. **再确定拉丁学名**。用 `search` 搜 `"<拉丁学名>" RHS` 或 `"<拉丁学名>" powo.kew.org`,锁定 POWO / RHS 的正名。
3. **查结构特征**。搜 `"<学名>" Missouri Botanical Garden Plant Finder`;有结果用 `open_page` 读高度/冠幅/日照/水分/花期/耐寒。
4. **搜可靠性**。搜 `"<学名>" Great Plant Picks` 或 `Mount Cuba`;看「可靠好养」描述。
5. **有图片需求**时,搜 `"<学名>" site:commons.wikimedia.org` 或 iNaturalist / GBIF。

### 抽取规则(字段 → 来源)

- **height / spread(米)**:MoBot/RHS 给的是区间或描述,统一转成如 `"0.5-1"`、`"4-6"`(米)。拿不到就留 `null`,别猜。
- **sun**:MoBot 的 Light 区间 → `full sun`(全日照)/ `part shade`(半荫)/ `shade`(荫)。
- **water**:MoBot 的 Water 区间 → `dry` / `wet`(中等的暂留空)。
- **flowerColor / bloomSeason**:MoBot/RHS 的花色与花期转中文,`bloomSeason` 记季节(如 `夏季`、`春-夏`)。
- **hardinessZone**:MoBot/RHS 的耐寒区(如 USDA 4-9)→ 记 `"4-9"`。
- **reliability**:有 Good Plant Picks / Mount Cuba「表现佳/可靠」佐证记 `强健`;明确需要养护记 `需照料`;查不到留空。

### 交叉核对(重要)

- **学名以 POWO / RHS 为正名;中文名以《中国植物志》/ iPlant 为准**;别名(不标准叫法)记到 `aliases`。
- 同一信息不同库冲突时:以 MoBot = RHS > POWO(分类)> 其它;拿不准就把该字段留空,并在 `notes` 里写「待核对」。
- **不要从普通商品/论坛页直接抄结构数据**,只作线索。

### 记录出处

每条从网上确认的信息,把来源 **URL** 写进该条 `sources` 数组,方便回查与复核。

---

## 3. 字段参考(手工清单条目)

| 字段 | 必填 | 说明 / 示例 |
| --- | --- | --- |
| `chineseName` | 是 | 中文名,如 `三白草` |
| `category` | 是 | 6 类之一:常绿乔木/落叶乔木/灌木/宿根/匍匐攀缘/水生植物 |
| `latinName` | 建议 | 拉丁学名,如 `Saururus chinensis`;缺失会标记 `missingName` |
| `genus` / `family` | 建议 | 属/科(APG IV);分类只用 科-属-种,无「目(order)」 |
| `habitat` | 否 | 生境,如 `水生·水畔`、`林下·耐荫`;表格「生境」列直接读它 |
| `aliases` | 否 | 别名、异名 |
| `evergreen` | 否 | `evergreen` / `deciduous` |
| `height` / `spread` / `density` | 否 | 高度/冠幅(米)、种植密度(株/㎡) |
| `sun` | 否 | `full sun` / `part shade` / `shade` |
| `water` | 否 | `dry` / `wet` |
| `flowerColor` / `bloomSeason` | 否 | 花色 / 花期(如 `夏`) |
| `leafForm` | 否 | 叶形/形态,如 `剑形叶` |
| `fragrance` / `reliability` | 否 | 香气 / 可靠度(如 `强健`) |
| `lifespan` / `spreadRate` / `selfSeeding` | 否 | 寿命 / 扩散 / 自播 |
| `notes` | 否 | 一句话特性(映射到 `rawNotes`) |
| `sources` | 否 | 来源 URL 数组 |
| `images` | 否 | 本地 `public/images/` 文件名数组 |
| `tags` | 否 | 自定义标签数组 |

---

## 4. 数据质量规则(沿用现有)

- 缺拉丁学名 → 自动标 `missingName: true`,界面显示「学名待核对」。
- 只有「属」、整属可用 → `genusOnly: true`(仅作为数据标记,界面不再显示「整属可用」标签)。
- 富集字段没有把握就留 `null`,宁可少不要错。
- 分类以显式 `category` 为准(`categoryOf` 只读该字段)。
