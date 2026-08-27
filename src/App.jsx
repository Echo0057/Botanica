import { useMemo, useState } from 'react';
import plantsData from './data/plants.json';
import FilterBar from './components/FilterBar.jsx';
import PlantDetail from './components/PlantDetail.jsx';
import OverviewTable from './components/OverviewTable.jsx';
import { categoryOf } from './data/layers.js';

export default function App() {
  const [plants] = useState(plantsData);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
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

  const selected = plants.find((p) => p.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight text-green-800">Botanica</h1>
          <p className="mt-1 text-sm text-stone-500">江浙沪 · 自然主义花园植物数据库</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <FilterBar
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
        />

        <div className="mt-4 text-sm text-stone-500">
          共 {filtered.length} / {plants.length} 种
        </div>

        <div className="mt-4">
          <OverviewTable plants={filtered} activeCategory={category} onOpen={setSelectedId} />
        </div>
      </main>

      <PlantDetail
        plant={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
