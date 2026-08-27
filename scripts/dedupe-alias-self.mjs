// 清理别名中与自身 chineseName 完全重复的词条
// 例: 「月桂属」别名含「月桂」→ 删除; 若全空则置 null
// 考虑「属」后缀: 月桂属 == 月桂(去掉属) 也视为自我重复
// 用法: node scripts/dedupe-alias-self.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PATH = resolve(ROOT, 'src/data/plants.json');

const plants = JSON.parse(readFileSync(PATH, 'utf8'));
let cleaned = 0;
let emptied = 0;

for (const p of plants) {
  if (!p.aliases) continue;
  const parts = p.aliases.split('·').map((s) => s.trim()).filter(Boolean);
  const cn = p.chineseName.trim();
  const base = cn.replace(/属$/, '');
  const kept = parts.filter((a) => a !== cn && a !== base);
  if (kept.length === parts.length) continue;
  p.aliases = kept.join('·') || null;
  cleaned++;
  if (!p.aliases) emptied++;
}

writeFileSync(PATH, JSON.stringify(plants, null, 2) + '\n', 'utf8');
console.log('清洗完成; 受影响:', cleaned, '条; 别名被清空:', emptied, '条');
