import { useEffect, useMemo, useState } from 'react';
import plantsData from './data/plants.json';
import FilterBar from './components/FilterBar.jsx';
import PlantCard from './components/PlantCard.jsx';
import PlantDetail from './components/PlantDetail.jsx';
import OverviewTable from './components/OverviewTable.jsx';
import { categoryOf } from './data/layers.js';

const FAV_KEY = 'botanica:favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export default function App() {
  const [plants] = useState(plantsData);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [view, setView] = useState('overview');

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (category !== 'all' && categoryOf(p) !== category) return false;
      if (q) {
        const haystack = [p.chineseName, p.latinName, p.genus, p.family, p.order, p.aliases]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [plants, query, category]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-1 text-sm">
          {[
            ['overview', '总览表'],
            ['browse', '浏览卡片'],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setView(val)}
              className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition ${
                view === val ? 'bg-green-700 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <FilterBar
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
        />

        <div className="mt-4 text-sm text-stone-500">
          共 {filtered.length} / {plants.length} 种
        </div>

        {view === 'overview' ? (
          <div className="mt-4">
            <OverviewTable plants={filtered} onOpen={setSelectedId} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-stone-300 p-10 text-center text-stone-400">
            没有符合条件的植物
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PlantCard
                key={p.id}
                plant={p}
                favorite={favorites.has(p.id)}
                onToggleFavorite={toggleFavorite}
                onOpen={() => setSelectedId(p.id)}
              />
            ))}
          </div>
        )}
      </main>

      <PlantDetail
        plant={selected}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
