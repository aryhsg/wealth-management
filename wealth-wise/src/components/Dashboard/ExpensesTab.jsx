// src/components/Dashboard/ExpensesTab.jsx
import React from 'react';
import { Wallet, Calculator, TrendingDown } from 'lucide-react'; // 修正部分 Icon
import { EXPENSE_LABELS, FIX_EXPENSE_LABELS } from '../../constants/finance';

const ExpensesTab = ({ incomes, setIncomes, expenses, setExpenses, stats }) => {
  // --- 1. 核心數據防護 (Guard Clause) ---
  // 如果 App.jsx 還沒準備好數據，先顯示載入狀態或空畫面，防止讀取 .monthly 時崩潰
  if (!incomes || !incomes.monthly || !expenses || !expenses.monthly || !incomes?.monthly || !expenses?.monthly) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 font-bold">
        正在準備帳目數據...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 左側：收入與支出輸入區 */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* 1. 年度總收入區塊 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
            <Wallet className="w-5 h-5 text-indigo-500" /> 年度總收入 
            <p className={`text-3xl font-black font-mono ${(stats.annualIncome || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${(stats.annualIncome || 0).toLocaleString()}
            </p>
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* 確保 incomes.monthly 存在才 map */}
            {incomes.monthly && Object.entries(incomes.monthly).map(([k, v]) => (
              <div key={k} className="p-4 bg-slate-50 rounded-2xl">
                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{k}</label>
                <input 
                  type="number" min="0" placeholder='0' 
                  value={v === 0 ? "" : v} 
                  onChange={e => setIncomes({...incomes, monthly: {...incomes.monthly, [k]: parseInt(e.target.value) || 0}})} 
                  className="w-full bg-transparent border-0 font-mono font-bold text-lg outline-none" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. 年度總支出區塊 */}
        <div className="bg-white p-8 rounded-[3rem] flex flex-col gap-4 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
            <Calculator className="w-5 h-5 text-rose-500" /> 年度總支出 
            <p className={`text-3xl font-black font-mono ${(stats.totalAnnualExpense || 0) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ${(stats.totalAnnualExpense || 0).toLocaleString()}
            </p>
          </h2>

          {/* 每月開支子區塊 */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-50">
            <h3 className="text-md font-bold text-slate-800 mb-6">每月開支</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {expenses.monthly && Object.keys(EXPENSE_LABELS).map((key) => (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    {EXPENSE_LABELS[key]}
                  </label>
                  <input 
                    type="number" min="0" placeholder='0'
                    value={expenses.monthly[key] === 0 ? "" : expenses.monthly[key]} 
                    onChange={e => setExpenses({...expenses, monthly: {...expenses.monthly, [key]: parseInt(e.target.value) || 0}})} 
                    className="w-full bg-transparent border-0 font-mono font-bold text-lg outline-none" 
                  />
                </div>
              ))}
            </div>
          </div>  

          {/* 其餘年度開支子區塊 */}
          <div className="bg-slate-50 p-8 rounded-2xl shadow-md border border-slate-50">
            <h3 className="text-md font-bold text-slate-800 mb-6">其餘開支 (年)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {expenses.yearly && Object.keys(FIX_EXPENSE_LABELS).map((key) => (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    {FIX_EXPENSE_LABELS[key]}
                  </label>
                  <input 
                    type="number" min="0" placeholder='0'
                    value={expenses.yearly[key] === 0 ? "" : expenses.yearly[key]} 
                    onChange={e => setExpenses({...expenses, yearly: {...expenses.yearly, [key]: parseInt(e.target.value) || 0}})} 
                    className="w-full bg-transparent border-0 font-mono font-bold text-lg outline-none" 
                  />
                </div>
              ))}
            </div>
          </div>  
        </div>
      </div>

      {/* 右側：側邊統計資訊 (Sticky) */}
      <div className="lg:col-span-4 sticky top-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">年度結餘</p>
          <p className={`text-4xl font-black ${(stats.annualAssetIncrease || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${(stats.annualAssetIncrease || 0).toLocaleString()}
          </p>
          <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">每月平均儲蓄</span>
              <span className="font-mono text-emerald-400 font-bold">
                ${Math.floor(stats.monthlySavings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">儲蓄率</span>
              <div className="px-3 py-1 bg-white/10 rounded-full font-mono text-xs">
                {(stats.savingsRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesTab;