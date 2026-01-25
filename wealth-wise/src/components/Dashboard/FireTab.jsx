import React, { useMemo } from 'react';
import { Target, ChevronDown, Sparkles as GrowthIcon } from 'lucide-react';
import { FIRE_MODES } from '../../constants/finance';

const FireTab = ({ 
  fireModeId, setFireModeId, 
  manualGoal, setManualGoal, 
  returnRate, setReturnRate, 
  stats 
}) => {
  
  // 將原本在 App.jsx 的複雜運算搬進來，讓 App 變輕
  const fireProjection = useMemo(() => {
    let current = stats.totalLiquid; 
    let monthlyRate = returnRate / 100 / 12;
    let months = 0;
    let data = [];
    const monthlySavings = Math.max(0, stats.monthlySavings);
    
    // 模擬計算：直到達到目標或滿 50 年 (600個月)
    while (current < stats.fireGoal && months < 600) {
      current = current * (1 + monthlyRate) + monthlySavings;
      months++;
      if (months % 12 === 0 || current >= stats.fireGoal) {
        data.push({ year: (months / 12).toFixed(0), amount: Math.floor(current) });
      }
    }
    return { years: (months / 12).toFixed(1), chart: data };
  }, [stats.totalLiquid, stats.fireGoal, returnRate, stats.monthlySavings]);

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 左側：參數控制區 */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-bold text-slate-800 mb-4">FIRE 參數設定</h2>
          
          {/* 模式選擇 */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">選擇達成模式</label>
            <div className="relative group">
              <select 
                value={fireModeId}
                onChange={(e) => {
                  setFireModeId(e.target.value);
                  setManualGoal(null); 
                }}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                {FIRE_MODES.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
               <p className="text-xs text-indigo-700 leading-relaxed italic">
                 {stats.selectedMode.desc} 
                 <span className="block mt-1 font-black not-italic">目標為年支出的 {stats.selectedMode.multiplier} 倍。</span>
               </p>
            </div>
          </div>
          
          {/* 目標金額調整 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">目標金額</label>
              {manualGoal !== null && (
                <button onClick={() => setManualGoal(null)} className="text-[10px] text-indigo-500 font-bold hover:underline">還原模式建議</button>
              )}
            </div>
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
               <input 
                 type="number" 
                 value={stats.fireGoal}
                 onChange={(e) => setManualGoal(parseInt(e.target.value) || 0)}
                 className={`w-full pl-10 pr-4 py-4 bg-white border-2 rounded-2xl font-mono font-black text-2xl outline-none transition-all ${manualGoal !== null ? 'border-orange-200 text-orange-600' : 'border-indigo-100 text-indigo-700'}`}
               />
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-6">財務自由參數</h2>
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-4">預期報酬率 ({returnRate}%)</label>
            <input type="range" min="1" max="15" step="0.5" value={returnRate} onChange={e => setReturnRate(parseFloat(e.target.value))} className="w-full accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer" />
          </div>

          <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl text-center relative overflow-hidden">
            <p className="text-indigo-200 text-xs font-bold uppercase mb-2">預計達成 FIRE 時間</p>
            <div className="text-6xl font-black tracking-tighter">{fireProjection.years} <span className="text-xl">年</span></div>
          </div>
        </div>
      </div>

      {/* 右側：圖表模擬區 */}
      <div className="lg:col-span-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)] min-h-[400px]">
        <h2 className="text-lg font-bold text-slate-800 mb-10 flex items-center gap-2">
           <GrowthIcon className="w-5 h-5 text-indigo-500" /> 資產成長模擬
        </h2>
        <div className="h-64 flex items-end gap-1.5 relative pl-10 border-l border-b border-slate-100">
          {fireProjection.chart.map((d, i) => (
            <div 
              key={i} 
              className="flex-1 bg-indigo-100 hover:bg-indigo-500 rounded-t-sm transition-all relative group" 
              style={{ height: `${Math.min(100, (d.amount / stats.fireGoal) * 100)}%` }}
            >
               <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl z-10 whitespace-nowrap">
                 第 {d.year} 年: ${Math.floor(d.amount/10000)}萬
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FireTab;