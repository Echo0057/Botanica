import { useMemo, useState } from 'react';
import plantsData from './data/plants.json';
import FilterBar from './components/FilterBar.jsx';
import PlantDetail from './components/PlantDetail.jsx';
import OverviewTable from './components/OverviewTable.jsx';
import {
  PLANT_CATEGORIES,
  categoryOf,
  SUN_LABELS,
  WATER_LABELS,
  EVERGREEN_LABELS,
  label,
} from './data/layers.js';

const zh = new Intl.Collator(['zh-Hans', 'zh'], { sensitivity: 'base' });
const latin = new Intl.Collator('en', { sensitivity: 'base' });

// 日照/水分/常绿的搜索同义词,便于按「耐旱」「荫蔽」「喜湿」等特性检索
const SUN_SYN = {
  'full sun': '全日照 阳光充足 喜阳 耐晒',
  'full sun to part shade': '全日照至半荫 半荫 喜阳',
  'part shade': '半荫 半阴 耐荫 喜阴',
  'part shade to full sun': '半荫至全日照',
  'part shade to shade': '半荫至荫 耐荫',
  shade: '荫 荫蔽 耐荫 喜荫 阴生',
};
const WATER_SYN = {
  dry: '耐旱 干 旱生 耐干',
  'dry to medium': '干至中等 耐旱 中等',
  medium: '中等 湿润偏干',
  'medium to wet': '中等至湿 喜湿',
  wet: '喜湿 湿 水湿 湿地',
};
const EVERGREEN_SYN = { evergreen: '常绿', deciduous: '落叶' };

// 组装整条可检索文本:基础字段 + 特性字段(含中文标签与同义词)
function searchable(p) {
  const sun = p.sun ? `${label(SUN_LABELS, p.sun)} ${SUN_SYN[p.sun] || ''}` : '';
  const water = p.water ? `${label(WATER_LABELS, p.water)} ${WATER_SYN[p.water] || ''}` : '';
  const ever = p.evergreen ? `${label(EVERGREEN_LABELS, p.evergreen)} ${EVERGREEN_SYN[p.evergreen] || ''}` : '';
  const bloom = [p.bloomSeason, p.flowerColor].filter(Boolean).join(' ');
  return [
    p.chineseName,
    p.latinName,
    p.genus,
    p.family,
    p.aliases,
    categoryOf(p),
    p.height,
    p.spread,
    sun,
    water,
    ever,
    bloom,
    p.leafForm,
    p.habitat,
    p.seasonOfInterest,
    ...(Array.isArray(p.tags) ? p.tags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function App() {
  const [plants] = useState(plantsData);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(PLANT_CATEGORIES[0]);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants
      .filter((p) => {
        if (category !== 'all' && categoryOf(p) !== category) return false;
        if (q) {
          if (!searchable(p).includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const fam = zh.compare(a.family || '', b.family || '');
        if (fam) return fam;
        const gen = zh.compare(a.genus || '', b.genus || '');
        if (gen) return gen;
        return latin.compare(
          a.latinName || a.chineseName || '',
          b.latinName || b.chineseName || ''
        );
      });
  }, [plants, query, category, zh, latin]);

  const selectedIndex = filtered.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : null;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < filtered.length - 1;
  const goTo = (dir) => {
    const next = selectedIndex + dir;
    if (next < 0 || next >= filtered.length) return;
    setSelectedId(filtered[next].id);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <main className="mx-auto max-w-6xl px-4 py-4">
        <div
          className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
        >
          <div className="border-b border-stone-200 bg-stone-50/60">
            <FilterBar
              query={query}
              onQuery={setQuery}
              category={category}
              onCategory={setCategory}
            />
          </div>

          <div className="flex-1 overflow-auto">
            <OverviewTable plants={filtered} onOpen={setSelectedId} />
          </div>
        </div>
      </main>

      <PlantDetail
        plant={selected}
        onClose={() => setSelectedId(null)}
        onPrev={() => goTo(-1)}
        onNext={() => goTo(1)}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
}
