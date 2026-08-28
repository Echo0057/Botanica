import { PLANT_CATEGORIES } from '../data/layers.js';

function chip(active) {
  return `rounded-full px-3 py-1 text-xs font-medium transition ${
    active ? 'bg-green-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
  }`;
}

export default function FilterBar({ query, onQuery, category, onCategory }) {
  return (
    <div className="space-y-3 px-4 py-4">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="搜索中文名 / 学名 / 属 / 科…"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
      />

      <div className="flex flex-wrap items-center gap-2">
        {PLANT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategory(c)}
            className={chip(category === c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
