import { DESIGN_LAYERS } from '../data/layers.js';

function chip(active) {
  return `rounded-full px-3 py-1 text-xs font-medium transition ${
    active ? 'bg-green-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
  }`;
}

export default function FilterBar({ query, onQuery, layer, onLayer, evergreen, onEvergreen }) {
  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="搜索中文名 / 学名 / 属 / 科…"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onLayer('all')} className={chip(layer === 'all')}>
          全部
        </button>
        {DESIGN_LAYERS.map((l) => (
          <button key={l} onClick={() => onLayer(l)} className={chip(layer === l)}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-stone-500">常绿/落叶</span>
        {[
          ['all', '全部'],
          ['evergreen', '常绿'],
          ['deciduous', '落叶'],
        ].map(([val, label]) => (
          <button key={val} onClick={() => onEvergreen(val)} className={chip(evergreen === val)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
