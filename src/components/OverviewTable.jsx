import { SUN_LABELS, WATER_LABELS, EVERGREEN_LABELS, label } from '../data/layers.js';

const COLUMNS = [
  { key: 'name', label: '学名' },
  { key: 'family', label: '科' },
  { key: 'genus', label: '属' },
  { key: 'height', label: '高度(m)' },
  { key: 'spread', label: '冠幅(m)' },
  { key: 'leaf', label: '叶/形态' },
  { key: 'evergreen', label: '常绿/落叶' },
  { key: 'bloom', label: '花色·花期' },
  { key: 'sun', label: '日照' },
  { key: 'water', label: '水分' },
];

const dash = '—';
function cell(v) {
  return v == null || v === '' ? dash : v;
}

// 取悬停预览图:优先全株(habit),否则任意一张。
function habitImage(p) {
  const imgs = p.images || [];
  for (const it of imgs) {
    const type = typeof it === 'string' ? 'habit' : it.type;
    const src = typeof it === 'string' ? it : it.src;
    if (type === 'habit' && src) return src;
  }
  for (const it of imgs) {
    const src = typeof it === 'string' ? it : it.src;
    if (src) return src;
  }
  return null;
}

function bloom(p) {
  const color = p.flowerColor;
  const season = p.bloomSeason;
  if (color && season) return `${color}花·${season}`;
  if (color) return `${color}花`;
  return cell(season);
}

function value(p, key) {
  switch (key) {
    case 'name':
      return p.latinName || p.chineseName;
    case 'family':
      return cell(p.family);
    case 'genus':
      return cell(p.genus);
    case 'height':
      return cell(p.height);
    case 'spread':
      return cell(p.spread);
    case 'leaf':
      return cell(p.leafForm);
    case 'bloom':
      return bloom(p);
    case 'sun':
      return label(SUN_LABELS, p.sun) || dash;
    case 'water':
      return label(WATER_LABELS, p.water) || dash;
    case 'evergreen':
      return label(EVERGREEN_LABELS, p.evergreen) || dash;
    default:
      return dash;
  }
}

export default function OverviewTable({ plants, onOpen }) {
  if (plants.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-stone-400">
        该分类暂无植物记录
      </div>
    );
  }
  return (
    <table className="w-full min-w-max border-collapse text-xs">
        <thead>
          <tr className="text-left text-stone-500">
            {COLUMNS.map((c, i) => (
              <th
                key={c.key}
                className={`sticky top-0 whitespace-nowrap border-b border-stone-200 bg-stone-50 px-3 py-2 font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.05)] ${
                  i === 0 ? 'left-0 z-20 border-r' : 'z-10'
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plants.map((p) => {
            const hover = habitImage(p);
            return (
              <tr
                key={p.id}
                onClick={() => onOpen(p.id)}
                className="group cursor-pointer border-b border-stone-100 last:border-0 hover:bg-green-50/40"
              >
                {COLUMNS.map((c, i) => (
                  <td
                    key={c.key}
                    className={`whitespace-nowrap px-3 py-2 align-top text-stone-700 ${
                      i === 0 ? 'sticky left-0 z-10 border-r border-stone-200 bg-white group-hover:bg-green-50' : ''
                    }`}
                  >
                    {i === 0 ? (
                      <span className="relative inline-block" title={p.aliases || undefined}>
                        <span className="block font-medium text-stone-800">{p.chineseName}</span>
                        {p.latinName && (
                          <span className="block italic text-stone-500">{p.latinName}</span>
                        )}
                        {hover && (
                          <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden -translate-x-1/2 group-hover:block">
                            <img
                              src={hover}
                              alt={p.chineseName}
                              className="max-h-48 w-auto max-w-60 rounded-md border border-stone-200 object-contain shadow-lg"
                            />
                          </span>
                        )}
                      </span>
                    ) : (
                      value(p, c.key)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
    </table>
  );
}
