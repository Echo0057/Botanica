// 按学名从 Wikimedia Commons 抓图(全株/开花/叶/细节),下载到 public/images 并登记 images。
// 用法:
//   npm run fetch-images -- --only "Acer palmatum"
//   npm run fetch-images -- --category 灌木 --limit 12
//   npm run fetch-images -- --all
// 环境:本机联网即可(node 通过 curl 拉取,curl 走 IPv4 更稳)。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANTS_PATH = resolve(ROOT, 'src/data/plants.json');
const IMG_DIR = resolve(ROOT, 'public/images');
mkdirSync(IMG_DIR, { recursive: true });

// —— 参数 ——
const args = process.argv.slice(2);
const opt = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : null;
};
const only = opt('--only');
const category = opt('--category');
const limit = Number(opt('--limit') || 0);
const offset = Number(opt('--offset') || 0);
const all = args.includes('--all');

const plants = JSON.parse(readFileSync(PLANTS_PATH, 'utf8'));

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function curlText(url) {
  const out = execFileSync('curl', ['-sS', '-m', '40', '--noproxy', '*', url], {
    maxBuffer: 8 * 1024 * 1024,
  });
  return out.toString('utf8');
}

function curlBinary(url, dest) {
  execFileSync('curl', ['-sS', '-m', '60', '--noproxy', '*', '-o', dest, url], {
    maxBuffer: 64 * 1024 * 1024,
  });
}

// Commons 检索:返回候选 imageinfo(按像素面积降序)
function searchImages(latin, term) {
  const q = encodeURIComponent(`"${latin}" ${term}`);
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6' +
    `&gsrsearch=${q}&gsrlimit=8&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&format=json&origin=*`;
  try {
    const j = JSON.parse(curlText(url));
    const pages = Object.values(j.query?.pages || {});
    const out = [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      const mime = info.mime || '';
      if (!/^image\/(jpeg|png|webp)/.test(mime)) continue;
      out.push({
        title: p.title,
        url: info.thumburl || info.url,
        width: info.width || 0,
        height: info.height || 0,
        area: (info.width || 0) * (info.height || 0),
        source: info.thumburl || info.url,
      });
    }
    out.sort((a, b) => b.area - a.area);
    return out;
  } catch (e) {
    console.warn(`  [search fail] ${latin} ${term}: ${e.message}`);
    return [];
  }
}

// 为一种植物抓取指定部位的最优图(每部位只查一次,避免网络过慢)
const PART_TERM = {
  habit: 'plant',
  flower: 'flower',
  leaf: 'leaf',
  detail: 'close-up',
};

function pickBest(latin, type) {
  return searchImages(latin, PART_TERM[type] || type)[0] || null;
}

function download(pick, latin, type) {
  const fname = `${slug(latin)}-${type}.jpg`;
  const dest = join(IMG_DIR, fname);
  if (existsSync(dest)) return `/images/${fname}`;
  curlBinary(pick.url, dest);
  return `/images/${fname}`;
}

// 过滤待处理植物
let targets = plants;
if (only) targets = plants.filter((p) => p.latinName === only);
else if (category) targets = plants.filter((p) => p.category === category);
if (all) targets = plants.filter((p) => !p.images || !p.images.length);
targets = targets.slice(offset, limit ? offset + limit : undefined);

let ok = 0;
let fail = 0;
for (const p of targets) {
  const latin = p.latinName;
  if (!latin) { fail++; continue; }
  const imgs = [];
  for (const type of ['habit', 'flower', 'leaf', 'detail']) {
    process.stdout.write(`    ${type}...`);
    const pick = pickBest(latin, type);
    if (!pick) { console.log('×'); continue; }
    let src;
    try { src = download(pick, latin, type); } catch (e) { console.warn(`  [dl fail] ${latin} ${type}: ${e.message}`); continue; }
    imgs.push({ type, src, credit: pick.title, source: pick.source });
    console.log(`✔`);
  }
  if (imgs.length) {
    p.images = imgs;
    writeFileSync(PLANTS_PATH, JSON.stringify(plants, null, 2) + '\n');
    console.log(`✔ ${p.chineseName} (${latin}) → ${imgs.map((x) => x.type).join(',')}`);
    ok++;
  } else {
    console.log(`○ ${p.chineseName} (${latin}) 未找到图`);
    fail++;
  }
}
console.log(`[fetch] 完成 ${ok} 株成功, ${fail} 株无图。`);
