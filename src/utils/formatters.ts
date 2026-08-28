export function formatCurrency(value: number, minDecimals = 2, maxDecimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  if (value < 0.0001 && value > 0) {
    return '$' + value.toExponential(2);
  }
  if (value < 1 && value > 0) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  if (value >= 1000) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals });
  }
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals });
}

export function formatCompactNumber(value: number, prefix = '$'): string {
  if (value === undefined || value === null || isNaN(value)) return `${prefix}0`;
  if (value >= 1e12) {
    return `${prefix}${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${prefix}${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${prefix}${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${prefix}${(value / 1e3).toFixed(1)}K`;
  }
  return `${prefix}${value.toFixed(2)}`;
}

export function formatPercent(value: number, showPlus = true): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const prefix = showPlus && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function getReturnColorClass(value: number): string {
  if (value > 5) return 'text-emerald-400 font-semibold';
  if (value > 0) return 'text-emerald-400';
  if (value < -5) return 'text-rose-400 font-semibold';
  if (value < 0) return 'text-rose-400';
  return 'text-slate-400';
}

export function getReturnBgClass(value: number): string {
  if (value >= 20) return 'bg-emerald-600/90 text-white';
  if (value >= 10) return 'bg-emerald-500/80 text-white';
  if (value >= 5) return 'bg-emerald-500/50 text-emerald-100';
  if (value > 0) return 'bg-emerald-500/25 text-emerald-200';
  if (value === 0) return 'bg-slate-800 text-slate-300';
  if (value > -5) return 'bg-rose-500/25 text-rose-200';
  if (value > -10) return 'bg-rose-500/50 text-rose-100';
  if (value > -20) return 'bg-rose-500/80 text-white';
  return 'bg-rose-600/90 text-white';
}

export function getHeatmapTileColor(value: number): { bg: string; text: string; border: string } {
  if (value >= 15) return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-400/40' };
  if (value >= 8) return { bg: 'bg-emerald-700/90', text: 'text-emerald-50', border: 'border-emerald-500/30' };
  if (value >= 3) return { bg: 'bg-emerald-800/80', text: 'text-emerald-100', border: 'border-emerald-600/30' };
  if (value > 0) return { bg: 'bg-emerald-950/90', text: 'text-emerald-200', border: 'border-emerald-800/40' };
  if (value === 0) return { bg: 'bg-slate-850', text: 'text-slate-300', border: 'border-slate-700' };
  if (value >= -3) return { bg: 'bg-rose-950/90', text: 'text-rose-200', border: 'border-rose-800/40' };
  if (value >= -8) return { bg: 'bg-rose-800/80', text: 'text-rose-100', border: 'border-rose-600/30' };
  if (value >= -15) return { bg: 'bg-rose-700/90', text: 'text-rose-50', border: 'border-rose-500/30' };
  return { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-400/40' };
}
