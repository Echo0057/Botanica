// 中文科/属名权威归一(以《中国植物志》标准写法为准)
// 作用是:富集或人工录入若混入变体,先由 canonical* 归一到标准写法,再由 validate 拦截。
import { SUN_LABELS, WATER_LABELS, EVERGREEN_LABELS } from './layers.js';

// 中文科名变体 -> 标准科名
export const FAMILY_VARIANTS = {
  木樨科: '木犀科',
};

// 中文属名变体 -> 标准属名
export const GENUS_VARIANTS = {
  木樨榄属: '木犀榄属',
  木樨属: '木犀属',
};

export function canonicalFamily(s) {
  return FAMILY_VARIANTS[s] || s;
}

export function canonicalGenus(s) {
  return GENUS_VARIANTS[s] || s;
}

// 字段取值白名单(来自显示层映射键,避免显示成英文/未知值)
export const SUN_VALUES = Object.keys(SUN_LABELS);
export const WATER_VALUES = Object.keys(WATER_LABELS);
export const EVERGREEN_VALUES = Object.keys(EVERGREEN_LABELS);

export const BLOOM_SEASONS = [
  '春', '夏', '秋', '冬',
  '春-夏', '春-秋', '夏-秋', '秋-冬', '冬-春',
];

// 格式校验正则
export const HARDINESS_RE = /^\d{1,2}(\s*[-–—]\s*\d{1,2})?$/;
export const SIZE_RE = /^\d+(\.\d+)?(\s*[-–—]\s*\d+(\.\d+)?)?$/;

// 解析耐寒区("5-9" / "9-10" / "8")
export function hardinessRange(hz) {
  const s = String(hz ?? '').trim();
  const m = s.match(/(\d{1,2})\s*[-–—]\s*(\d{1,2})/);
  if (m) return { min: +m[1], max: +m[2] };
  const one = s.match(/^\d{1,2}$/);
  if (one) return { min: +one[0], max: +one[0] };
  return null;
}

// 上海适温评估(基于 USDA 耐寒区;据近年冬季实测,市区≈9a,郊区/崇明≈8b,寒潮可到~-9℃)
export function hardinessSuitability(hz) {
  const r = hardinessRange(hz);
  if (!r) return { level: null, reason: '耐寒区缺失/无法解析,请人工判断' };
  if (r.max < 7) return { level: 'warn', reason: `耐寒上限 ${r.max} 区,忌酷热/湿热,上海夏季难养` };
  if (r.min > 9) return { level: 'alert', reason: `耐寒下限 ${r.min} 区(仅10区及以上),上海冬季寒潮(郊区可达-9℃)易冻死,不建议露天` };
  if (r.min === 9) return { level: 'warn', reason: `耐寒下限 9 区,寒潮年(如2025年2月郊区-9℃)可能冻伤,建议避风/保护` };
  return { level: 'ok', reason: '可正常过冬' };
}
