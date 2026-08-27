# Botanica · 项目进度记录

> 名称:Botanica · 江浙沪自然主义花园植物数据库
> 定位:本地单机、纯前端、不联网部署
> 更新:2026-08-27(每次提交前更新本文件)

---

## 当前状态

- **技术栈**:React 19 + Vite 8 + Tailwind CSS v4,纯前端,无后端/数据库。
- **数据**:`src/data/plants.json`,共 227 条。
  - 基础 236 条源自 Excel(Excel 导入已停用);手工补充 8 种水生植物。
  - 已按**种**整理:同一物种的不同园艺品种只保留一条(`scripts/consolidate-species.mjs`),并去掉「目(order)」字段。
- **分类(6 类)**:常绿乔木 / 落叶乔木 / 灌木 / 宿根 / 匍匐攀缘 / 水生植物。
- **分类系统**:统一 **APG IV**(科-属-种)。
- **界面**:总览表(奥多夫《荒野之美》风格,按 6 大类分组)+ 名称搜索 + 分类筛选 + 植物详情弹窗。
  - 学名列为「中文学名 + 拉丁学名」,别名悬浮显示;表格含「科 / 属 / 生境」列;已去掉「设计层」列。
  - 已移除:浏览卡片视图、收藏功能。
  - 浏览器标签页图标为 Botanica 叶子 favicon(`public/favicon.svg`)。
- **Dock 启动器**:`~/Applications/Botanica.app`,点击可确保 Vite 在跑并打开浏览器。

---

## 分类统计

| 分类 | 数量 |
| --- | ---: |
| 常绿乔木 | 10 |
| 落叶乔木 | 23 |
| 灌木 | 46 |
| 宿根 | 123 |
| 匍匐攀缘 | 12 |
| 水生植物 | 13 |
| **合计** | **227** |

---

## 数据工作流(SOP)

- 新增植物 → 写 `scripts/additional-plants.json`(必填 `chineseName`+`category`)→ `npm run import:plants` 校验/去重/合并 → `git commit`。
- 联网检索特性 → 见 `plant-data-sop.md`(KEW POWO / RHS / MoBot Plant Finder / Great Plant Picks / Mount Cuba / Commons 等)。
- Excel 导入已停用(2026-08-27)。

---

## 下一步(备选)

1. 补图片(`public/images/`,CC 来源)。
2. 补结构化字段(高度/冠幅/密度/耐寒/持久性/自播等,从海外库检索)。
3. 「我的花园」档案 + 「适合我家」筛选 / 设计搭配(palette)。
