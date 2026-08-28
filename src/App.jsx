import { useMemo, useRef, useLayoutEffect, useState } from 'react';
import plantsData from './data/plants.json';
import FilterBar from './components/FilterBar.jsx';
import PlantDetail from './components/PlantDetail.jsx';
import OverviewTable from './components/OverviewTable.jsx';
import { PLANT_CATEGORIES, categoryOf } from './data/layers.js';

export default function App() {
  const [plants] = useState(plantsData);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(PLANT_CATEGORIES[0]);
  const [selectedId, setSelectedId] = useState(null);
  const filterRef = useRef(null);

  useLayoutEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    const set = () => {
      document.documentElement.style.setProperty('--filterbar-h', `${el.offsetHeight}px`);
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (category !== 'all' && categoryOf(p) !== category) return false;
      if (q) {
        const haystack = [p.chineseName, p.latinName, p.genus, p.family, p.aliases]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [plants, query, category]);

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
      <div
        ref={filterRef}
        className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/80"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <img src="/favicon.svg" alt="" className="h-4 w-4" />
            <span className="text-sm font-semibold text-green-800">Botanica</span>
          </div>
          <FilterBar
            query={query}
            onQuery={setQuery}
            category={category}
            onCategory={setCategory}
          />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4">
        <div
          className="sticky overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
          style={{ top: 'var(--filterbar-h)', height: 'calc(100vh - var(--filterbar-h))' }}
        >
          <div className="overflow-auto" style={{ height: '100%' }}>
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
