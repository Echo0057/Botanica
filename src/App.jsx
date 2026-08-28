import { useMemo, useState } from 'react';
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
      <main className="mx-auto max-w-6xl px-4 py-4">
        <div
          className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
        >
          <div className="border-b border-stone-200 bg-stone-50/60">
            <div className="flex items-center gap-2 px-4 pt-4">
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
