import { categoryOf } from '../data/layers.js';

export default function PlantDetail({ plant, onClose }) {
  if (!plant) return null;

  const rows = [
    ['别名', plant.aliases],
    ['类别', categoryOf(plant)],
    ['科', plant.family],
    ['属', plant.genus],
    ['高度', plant.height],
    ['冠幅', plant.spread],
    ['日照', plant.sun],
    ['水分', plant.water],
    ['花期', plant.bloomSeason],
    ['花色', plant.flowerColor],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
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

        <div className="mt-4 grid grid-cols-3 gap-2">
          {plant.images.length ? (
            plant.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={plant.chineseName}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))
          ) : (
            <div className="col-span-3 flex h-32 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
              暂无图片
            </div>
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
