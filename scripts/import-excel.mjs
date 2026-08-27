// 将「适合江浙沪的自然主义花园植物目录.xlsx」导入为 src/data/plants.json
// 用法: node scripts/import-excel.mjs [excel路径]

import ExcelJS from 'exceljs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichNotes } from './enrich-fields.mjs';
import { AQUATIC_PLANTS } from './aquatic-plants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEFAULT_XLSX = process.env.BOTANICA_XLSX ||
  '/Users/echo/Documents/适合江浙沪的自然主义花园植物目录.xlsx';
const XLSX = process.argv[2] || DEFAULT_XLSX;
const OUT = resolve(ROOT, 'src/data/plants.json');

// 设计层(工作表名)与常绿/落叶的关系
const DESIGN_LAYERS = [
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

const EVERGREEN_BY_LAYER = {
  常绿乔木: 'evergreen',
  常绿灌木: 'evergreen',
  落叶乔木: 'deciduous',
  落叶灌木: 'deciduous',
  // 其余层常绿/落叶依单株而定，暂不在层级硬编码，留待补数据
};

const str = (v) => (v == null ? '' : String(v).trim());

function slugify(text) {
  const ascii = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return ascii.toLowerCase();
}

function makeId() {
  // 用已生成记录集合保证唯一
  const used = new Set();
  return function next(base) {
    let slug = slugify(base) || 'plant';
    let id = slug;
    let i = 2;
    while (used.has(id)) id = `${slug}_${i++}`;
    used.add(id);
    return id;
  };
}

const nextId = makeId();

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(XLSX);

const records = [];
let missingNameCount = 0;
let genusOnlyCount = 0;
let skippedCount = 0;

for (const sheetName of DESIGN_LAYERS) {
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) {
    console.warn(`[warn] 找不到工作表: ${sheetName}`);
    continue;
  }

  let rowIndex = 0; // 每层内序号，用于 id 稳定
  let carry = { genus: '', family: '', order: '' };

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    let genus = str(row.getCell(1).value);
    const species = str(row.getCell(2).value);
    const cultivar = str(row.getCell(3).value);
    const latin = str(row.getCell(4).value);
    let order = str(row.getCell(5).value);
    let family = str(row.getCell(6).value);
    const aliases = str(row.getCell(7).value);
    const notes = str(row.getCell(8).value);

    // 整行全空则跳过
    if (!genus && !species && !cultivar && !latin && !order && !family && !aliases && !notes) {
      skippedCount++;
      continue;
    }

    // 续表:空 C 列值继承上一行的属/目/科
    if (!genus) genus = carry.genus;
    if (!order) order = carry.order;
    if (!family) family = carry.family;

    carry = { genus, family, order };
    rowIndex++;

    const hasSpecies = !!species;
    const hasCultivar = !!cultivar;
    // 展示名:种 + 品种;若无种则退回属名
    const chineseName = [species, cultivar].filter(Boolean).join(' ') || genus;

    const missingName = !latin;
    if (missingName) missingNameCount++;
    const genusOnly = !hasSpecies; // 只有属(整属可用)
    if (genusOnly) genusOnlyCount++;

    // 从特性文本抽取结构化字段
    const en = enrichNotes(notes);
    let evergreen = EVERGREEN_BY_LAYER[sheetName] ?? null;
    if (/落叶/.test(notes)) evergreen = 'deciduous';
    else if (/常绿|四季常绿/.test(notes)) evergreen = 'evergreen';

    const leafForm = [en.leafColor, en.growthForm].filter(Boolean).join('·') || null;

    records.push({
      id: nextId(latin || chineseName || `${sheetName}_${rowIndex}`),
      designLayer: sheetName,
      chineseName,
      latinName: latin || null,
      genus: genus || null,
      family: family || null,
      order: order || null,
      aliases: aliases || null,
      evergreen,
      height: en.height,
      spread: en.spread,
      density: en.density,
      sun: en.sun,
      water: en.water,
      bloomSeason: en.bloomSeason,
      flowerColor: en.flowerColor,
      seasonOfInterest: en.seasonOfInterest,
      fragrance: en.fragrance,
      reliability: en.reliability,
      leafForm,
      lifespan: en.lifespan,
      spreadRate: en.spreadRate,
      selfSeeding: en.selfSeeding,
      persistence: en.persistence,
      hardinessZone: en.hardinessZone,
      rawNotes: notes || null,
      missingName,
      genusOnly,
      images: [],
      tags: [],
    });
  }
}

// 补充的水生植物(不在 Excel 表里)
for (const ap of AQUATIC_PLANTS) {
  const latin = ap.latinName || '';
  const missingName = !latin;
  if (missingName) missingNameCount++;
  records.push({
    id: nextId(latin || ap.chineseName || 'aquatic'),
    designLayer: ap.designLayer || '水生植物',
    chineseName: ap.chineseName,
    latinName: latin || null,
    genus: ap.genus || null,
    family: ap.family || null,
    order: ap.order || null,
    aliases: ap.aliases || null,
    evergreen: ap.evergreen ?? null,
    height: ap.height ?? null,
    spread: ap.spread ?? null,
    density: ap.density ?? null,
    sun: ap.sun ?? null,
    water: ap.water ?? null,
    bloomSeason: ap.bloomSeason ?? null,
    flowerColor: ap.flowerColor ?? null,
    seasonOfInterest: ap.seasonOfInterest ?? null,
    fragrance: ap.fragrance ?? null,
    reliability: ap.reliability ?? null,
    leafForm: ap.leafForm ?? null,
    lifespan: ap.lifespan ?? null,
    spreadRate: ap.spreadRate ?? null,
    selfSeeding: ap.selfSeeding ?? null,
    persistence: ap.persistence ?? null,
    hardinessZone: ap.hardinessZone ?? null,
    rawNotes: ap.rawNotes || null,
    missingName,
    genusOnly: false,
    images: [],
    tags: [],
  });
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(records, null, 2) + '\n', 'utf8');

const byLayer = Object.fromEntries(
  [...DESIGN_LAYERS, '水生植物'].map((l) => [l, records.filter((x) => x.designLayer === l).length]),
);

console.log('已写入:', OUT);
console.log('记录总数:', records.length);
console.log('缺拉丁学名:', missingNameCount);
console.log('仅属级(整属可用):', genusOnlyCount);
console.log('跳过空行:', skippedCount);
console.log('按层统计:', JSON.stringify(byLayer, null, 2));
