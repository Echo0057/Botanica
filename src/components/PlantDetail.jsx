import { SUN_LABELS, WATER_LABELS, EVERGREEN_LABELS, label } from '../data/layers.js';

export default function PlantDetail({ plant, onClose, onPrev, onNext, hasPrev, hasNext }) {
  if (!plant) return null;

  const rows = [
    ['别名', plant.aliases],
    ['科', plant.family],
    ['属', plant.genus],
    ['高度', plant.height],
    ['冠幅', plant.spread],
    ['日照', label(SUN_LABELS, plant.sun)],
    ['水分', label(WATER_LABELS, plant.water)],
    ['花期', plant.bloomSeason],
    ['花色', plant.flowerColor],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="上一个"
          className="absolute left-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl text-stone-700 shadow-lg transition md:left-6 hover:bg-white hover:text-green-700"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="下一个"
          className="absolute right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl text-stone-700 shadow-lg transition md:right-6 hover:bg-white hover:text-green-700"
        >
          ›
        </button>
      )}
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800">{plant.chineseName}</h2>
            {plant.latinName && <p className="text-sm italic text-stone-500">{plant.latinName}</p>}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700" aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {plant.missingName && (
            <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">学名待核对</span>
          )}
        </div>

        <dl className="mt-4 divide-y divide-stone-100 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="shrink-0 text-stone-500">{k}</dt>
              <dd className="text-right text-stone-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
