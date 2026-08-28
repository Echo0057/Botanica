import { SUN_LABELS, WATER_LABELS, EVERGREEN_LABELS, label } from '../data/layers.js';

const TYPE_LABEL = { habit: '全株', detail: '细节', flower: '开花', autumn: '叶变色', leaf: '叶部' };
const TYPE_ORDER = ['habit', 'detail', 'flower', 'autumn', 'leaf'];

// 归一 images:兼容旧字符串数组与新 {type,src} 对象数组,并按类型排序(全株 > 细节 > 开花 > 叶变色)。
function orderedImages(plant) {
  const imgs = (plant.images || [])
    .map((it, i) =>
      typeof it === 'string'
        ? { type: 'habit', src: it, key: i }
        : { type: it.type || 'detail', src: it.src, key: i }
    )
    .filter((x) => x.src);
  const rank = (t) => {
    const idx = TYPE_ORDER.indexOf(t);
    return idx === -1 ? TYPE_ORDER.length : idx;
  };
  return imgs.sort((a, b) => rank(a.type) - rank(b.type));
}

export default function PlantDetail({ plant, onClose, onPrev, onNext, hasPrev, hasNext }) {
  if (!plant) return null;

  const imgs = orderedImages(plant);
  const [hero, ...rest] = imgs;

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

        <div className="mt-4">
          {imgs.length ? (
            <>
              <figure className="overflow-hidden rounded-lg bg-stone-100">
                <img
                  src={hero.src}
                  alt={`${plant.chineseName} · ${TYPE_LABEL[hero.type] || '图片'}`}
                  loading="lazy"
                  className="h-64 w-full object-cover"
                />
                <figcaption className="px-2 py-1 text-xs text-stone-500">
                  {TYPE_LABEL[hero.type] || '图片'}
                </figcaption>
              </figure>
              {rest.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {rest.map((img) => (
                    <figure key={img.key} className="overflow-hidden rounded-lg bg-stone-100">
                      <img
                        src={img.src}
                        alt={`${plant.chineseName} · ${TYPE_LABEL[img.type] || '图片'}`}
                        loading="lazy"
                        className="h-40 w-full object-cover"
                      />
                      <figcaption className="px-2 py-1 text-xs text-stone-500">
                        {TYPE_LABEL[img.type] || '图片'}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
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
