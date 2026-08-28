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
