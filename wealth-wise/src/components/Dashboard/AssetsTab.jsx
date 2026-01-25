import React from 'react';
import { Coins, ShieldCheck, AlertCircle, Home } from 'lucide-react';
import AssetInputRow from './AssetInputRow';

// --- 1. 圓餅圖路徑純函數 (留在外面沒問題，因為它是純計算，不依賴 assets) ---
const getPiePath = (startPct, endPct) => {
  const x1 = Math.cos(2 * Math.PI * startPct);
  const y1 = Math.sin(2 * Math.PI * startPct);
  const x2 = Math.cos(2 * Math.PI * endPct);
  const y2 = Math.sin(2 * Math.PI * endPct);
  const largeArc = endPct - startPct > 0.5 ? 1 : 0;
  return `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`;
};

const AssetsTab = ({ assets, setAssets, stats }) => {
  // --- 2. 在組件內部計算 pieData (這時才能讀取到 props 中的 assets) ---
  const pieData = [
    { label: '現金', value: assets.liquid.cash || 0, color: '#4F46E5' },
    { label: '股票', value: assets.liquid.stock || 0, color: '#3B82F6' },
    { label: '債券', value: assets.liquid.bond || 0, color: '#60A5FA' },
    { label: '房產', value: assets.nonLiquid.realEstate || 0, color: '#94A3B8' },
    { label: '其他', value: (assets.nonLiquid.car || 0) + (assets.nonLiquid.other || 0), color: '#CBD5E1' },
  ].map((point, i, arr) => {
    const total = arr.reduce((sum, p) => sum + p.value, 0);
    const pct = total > 0 ? point.value / total : 0;
    const start = arr.slice(0, i).reduce((sum, p) => sum + (p.value / total || 0), 0);
    return { ...point, pct, start, end: start + pct };
  });

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-5 space-y-6">
        {/* 流動資產區塊 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-1.5 bg-indigo-50 rounded-lg"><Coins className="w-4 h-4 text-indigo-600" /></div> 流動資產
          </h2>
          <AssetInputRow label="現金 / 活存" value={assets.liquid.cash} max={5000000} step={10000} onChange={v => setAssets({...assets, liquid: {...assets.liquid, cash: v}})} />
          <AssetInputRow label="股票 / ETF" value={assets.liquid.stock} max={10000000} step={10000} onChange={v => setAssets({...assets, liquid: {...assets.liquid, stock: v}})} />
          <AssetInputRow label="債券 / 基金" value={assets.liquid.bond} max={5000000} step={10000} onChange={v => setAssets({...assets, liquid: {...assets.liquid, bond: v}})} />
        </div>

        {/* 緊急預備金診斷 */}
        <div className={`p-6 rounded-3xl border shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all ${stats.emergencyFundStatus ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={`font-bold ${stats.emergencyFundStatus ? 'text-emerald-900' : 'text-amber-900'}`}>緊急預備金診斷</h3>
              <p className="text-xs opacity-70">建議維持至少 6 個月開支 (${stats.emergencyFundGoal.toLocaleString()})</p>
            </div>
            {stats.emergencyFundStatus ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-amber-500" />}
          </div>
          <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${stats.emergencyFundStatus ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (assets.liquid.cash / stats.emergencyFundGoal) * 100)}%` }}></div>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-right">
            {stats.emergencyFundStatus ? '防護完整' : `尚缺 $${(stats.emergencyFundGoal - assets.liquid.cash).toLocaleString()}`}
          </p>
        </div>

        {/* 非流動資產區塊 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-1.5 bg-slate-100 rounded-lg"><Home className="w-4 h-4 text-slate-600" /></div> 非流動資產
          </h2>
          <AssetInputRow label="房地產現值" value={assets.nonLiquid.realEstate} max={50000000} step={100000} onChange={v => setAssets({...assets, nonLiquid: {...assets.nonLiquid, realEstate: v}})} />
          <AssetInputRow label="車輛" value={assets.nonLiquid.car} max={5000000} step={10000} onChange={v => setAssets({...assets, nonLiquid: {...assets.nonLiquid, car: v}})} />
          <AssetInputRow label="其他" value={assets.nonLiquid.other} max={5000000} step={10000} onChange={v => setAssets({...assets, nonLiquid: {...assets.nonLiquid, other: v}})} />
        </div>
      </div>

      {/* 右側：圖表顯示區 */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-10 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="relative mb-10">
          <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
            {pieData.map((slice, i) => (
              <path key={i} d={getPiePath(slice.start, slice.end)} fill={slice.color} stroke="white" strokeWidth="0.02" />
            ))}
            <circle cx="0" cy="0" r="0.6" fill="white" />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-emerald-400 text-sm font-bold">總資產</p>
            <p className="text-2xl font-bold">${(stats.totalAssets / 10000).toFixed(0)}萬</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          {pieData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-lg">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-600">{item.label}</span>
              <span className="ml-auto font-mono">{(item.pct * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetsTab;