import { categoryOf } from '../data/layers.js';

export default function PlantCard({ plant, favorite, onToggleFavorite, onOpen }) {
  const { chineseName, latinName, designLayer, missingName, genusOnly } = plant;
  const category = categoryOf(plant);

  return (
    <button
      onClick={onOpen}
      className="group flex flex-col rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-stone-800">{chineseName}</h3>
          {latinName && <p className="truncate text-sm italic text-stone-500">{latinName}</p>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(plant.id);
          }}
          className="text-lg leading-none text-amber-500"
          aria-label={favorite ? '取消收藏' : '收藏'}
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">{category}</span>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{designLayer}</span>
        {missingName && (
          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">学名待核对</span>
        )}
        {genusOnly && !missingName && (
          <span className="rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-800">整属可用</span>
        )}
      </div>
    </button>
  );
}
