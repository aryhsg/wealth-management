import React from 'react';

const AssetInputRow = ({ label, value, max, step, onChange }) => (
  <div className="mb-4 group">
    <div className="flex justify-between items-center mb-1">
       <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{label}</span>
    </div>
    <div className="flex items-center gap-3">
       <input 
          type="range" min="0" max={max} step={step} value={value} 
          onChange={(e) => onChange(parseInt(e.target.value) || 0)} 
          className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
       />
       <div className="relative w-36 shrink-0">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</div>
           <input 
              type="number" min="0"
              value={value === 0 ? "" : value} 
              placeholder="0"
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              className="w-full pl-6 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-right text-slate-700 bg-white shadow-sm"
           />
       </div>
    </div>
  </div>
);

export default AssetInputRow;