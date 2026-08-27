import { PLANT_CATEGORIES, categoryOf, SUN_LABELS } from '../data/layers.js';

const COLUMNS = [
  { key: 'name', label: '学名' },
  { key: 'family', label: '科' },
  { key: 'genus', label: '属' },
  { key: 'habitat', label: '生境' },
  { key: 'height', label: '高度(m)' },
  { key: 'spread', label: '冠幅(m)' },
  { key: 'density', label: '密度(株/㎡)' },
  { key: 'leaf', label: '叶/形态' },
  { key: 'bloom', label: '花色·花期' },
  { key: 'sun', label: '日照' },
  { key: 'frag', label: '香气' },
  { key: 'life', label: '寿命' },
  { key: 'spreadRate', label: '扩散' },
  { key: 'seed', label: '自播' },
  { key: 'reliability', label: '可靠度' },
];

const dash = '—';
function cell(v) {
  return v == null || v === '' ? dash : v;
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
    case 'habitat':
      return cell(p.habitat);
    case 'height':
      return cell(p.height);
    case 'spread':
      return cell(p.spread);
    case 'density':
      return cell(p.density);
    case 'leaf':
      return cell(p.leafForm);
    case 'bloom':
      return bloom(p);
    case 'sun':
      return p.sun ? SUN_LABELS[p.sun] || p.sun : dash;
    case 'frag':
      return cell(p.fragrance);
    case 'life':
      return cell(p.lifespan);
    case 'spreadRate':
      return cell(p.spreadRate);
    case 'seed':
      return cell(p.selfSeeding);
    case 'reliability':
      return cell(p.reliability);
    default:
      return dash;
  }
}

export default function OverviewTable({ plants, activeCategory = 'all', onOpen }) {
  const cats = activeCategory && activeCategory !== 'all' ? [activeCategory] : PLANT_CATEGORIES;
  return (
    <div className="space-y-8">
      {cats.map((cat) => {
        const rows = plants.filter((p) => categoryOf(p) === cat);
        return (
          <section key={cat}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-stone-800">{cat}</h2>
              <span className="text-sm text-stone-400">{rows.length} 种</span>
            </div>
            {rows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-400">
                该分类暂无植物记录
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="w-full min-w-max border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-left text-stone-500">
                      {COLUMNS.map((c, i) => (
                        <th
                          key={c.key}
                          className={`whitespace-nowrap border-b border-stone-200 px-3 py-2 font-medium ${
                            i === 0 ? 'sticky left-0 z-10 bg-stone-50' : ''
                          }`}
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => onOpen(p.id)}
                        className="cursor-pointer border-b border-stone-100 last:border-0 hover:bg-green-50/40"
                      >
                        {COLUMNS.map((c, i) => (
                          <td
                            key={c.key}
                            className={`whitespace-nowrap px-3 py-2 align-top text-stone-700 ${
                              i === 0 ? 'sticky left-0 z-10 bg-white' : ''
                            }`}
                          >
                            {i === 0 ? (
                              <span title={p.aliases || undefined}>
                                <span className="block font-medium text-stone-800">{p.chineseName}</span>
                                {p.latinName && (
                                  <span className="block italic text-stone-500">{p.latinName}</span>
                                )}
                              </span>
                            ) : (
                              value(p, c.key)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
