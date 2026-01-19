import React, { useState, useEffect, useRef } from 'react';
import { 
  PieChart, TrendingUp, Download, Target, AlertCircle, RefreshCw, 
  Calculator, Home, Coins, Landmark, ShieldCheck, Plane, FileText, 
  Cloud, Check, Briefcase, Car, TrendingDown, Wallet
} from 'lucide-react';

// --- Firebase SDK Imports ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// ---------------------------------------------------------
// 🔴 Firebase 設定區
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDTBf7vyxrVxya18GL-JIt06WE4w2S257E",
  authDomain: "wealth-management-12d1a.firebaseapp.com",
  projectId: "wealth-management-12d1a",
  storageBucket: "wealth-management-12d1a.firebasestorage.app",
  messagingSenderId: "11629933495",
  appId: "1:11629933495:web:9ba067ecc42b85e2fcae32",
  measurementId: "G-D014HC4B1C"
};

let app, db, auth;
if (firebaseConfig.projectId !== "wealth-management-12d1a") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

// --- 輔助元件：滑桿與輸入框組合 ---
const AssetInputRow = ({ label, value, max, step, onChange }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
       <span className="text-xs font-bold text-slate-500">{label}</span>
    </div>
    <div className="flex items-center gap-3">
       <input 
          type="range" min="0" max={max} step={step} value={value} 
          onChange={onChange} 
          className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
       />
       <div className="relative w-32 shrink-0">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</div>
           <input 
              type="number" min="0"
              value={value === 0 ? "" : value} 
              placeholder="0"
              onChange={onChange}
              className="w-full pl-6 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-right text-slate-700"
           />
       </div>
    </div>
  </div>
);

const App = () => {
  // 1. 狀態宣告
  const [activeTab, setActiveTab] = useState('assets');
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [income, setIncome] = useState(1200000); 
  const [manualGoal, setManualGoal] = useState(null); // 手動目標金額

  const [assets, setAssets] = useState({
    liquid: { cash: 300000, stock: 1200000, bond: 500000 },
    nonLiquid: { realEstate: 15000000, car: 800000, other: 200000 }
  });

  const [expenses, setExpenses] = useState({
    monthly: { housing: 25000, living: 15000, transport: 3000, entertainment: 5000 },
    yearly: { insurance: 60000, tax: 25000, travel: 80000 }
  });

  // 2. 計算邏輯
  const monthlyTotal = Object.values(expenses.monthly).reduce((a, b) => a + b, 0);
  const yearlyOneOffTotal = Object.values(expenses.yearly).reduce((a, b) => a + b, 0);
  const totalAnnualExpense = (monthlyTotal * 12) + yearlyOneOffTotal;
  const annualAssetIncrease = income - totalAnnualExpense;
  const monthlyAssetIncrease = annualAssetIncrease / 12;

  const totalLiquid = Object.values(assets.liquid).reduce((a, b) => a + b, 0);
  const totalNonLiquid = Object.values(assets.nonLiquid).reduce((a, b) => a + b, 0);
  const totalAssets = totalLiquid + totalNonLiquid;

  // FIRE 目標邏輯：若手動有值則用手動，否則預設 25 倍支出
  const effectiveFireGoal = manualGoal !== null ? manualGoal : totalAnnualExpense * 25;

  // --- Firebase 整合 ---
  useEffect(() => {
    if (!auth) return;
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus('loading');
        const userDocRef = doc(db, 'users', currentUser.uid);
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.assets) setAssets(data.assets);
            if (data.expenses) setExpenses(data.expenses);
            if (data.income !== undefined) setIncome(data.income);
            if (data.manualGoal !== undefined) setManualGoal(data.manualGoal);
            setStatus('saved');
          }
        });
      } else {
        signInAnonymously(auth);
      }
    });
  }, []);

  // --- 自動儲存 ---
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!user || !db) return;
    setStatus('saving'); 
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { income, assets, expenses, manualGoal, updatedAt: new Date().toISOString() }, { merge: true });
        setStatus('saved');
      } catch (error) { setStatus('error'); }
    }, 1500);
  }, [assets, expenses, income, manualGoal, user]);

  // --- 圖表與 FIRE 計算 ---
  const [returnRate, setReturnRate] = useState(6);
  const [fireYears, setFireYears] = useState(null);
  const [fireChartData, setFireChartData] = useState([]);

  useEffect(() => {
    let current = totalLiquid; 
    let monthlyRate = returnRate / 100 / 12;
    let months = 0;
    let data = [];
    const monthlySavings = Math.max(0, monthlyAssetIncrease);
    
    while (current < effectiveFireGoal && months < 600) {
      current = current * (1 + monthlyRate) + monthlySavings;
      months++;
      if (months % 12 === 0 || current >= effectiveFireGoal) {
        data.push({ year: (months / 12).toFixed(1), amount: Math.floor(current) });
      }
    }
    setFireYears((months / 12).toFixed(1));
    setFireChartData(data);
  }, [totalLiquid, effectiveFireGoal, returnRate, monthlyAssetIncrease]);

  const getPiePath = (startPct, endPct) => {
    const x1 = Math.cos(2 * Math.PI * startPct);
    const y1 = Math.sin(2 * Math.PI * startPct);
    const x2 = Math.cos(2 * Math.PI * endPct);
    const y2 = Math.sin(2 * Math.PI * endPct);
    const largeArc = endPct - startPct > 0.5 ? 1 : 0;
    return `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`;
  };

  const pieData = [
    { label: '現金', value: assets.liquid.cash, color: '#4F46E5' },
    { label: '股票', value: assets.liquid.stock, color: '#3B82F6' },
    { label: '債券', value: assets.liquid.bond, color: '#60A5FA' },
    { label: '房產', value: assets.nonLiquid.realEstate, color: '#94A3B8' },
    { label: '其他', value: assets.nonLiquid.car + assets.nonLiquid.other, color: '#CBD5E1' },
  ].map((point, i, arr) => {
    const total = arr.reduce((sum, p) => sum + p.value, 0);
    const pct = point.value / total || 0;
    const start = arr.slice(0, i).reduce((sum, p) => sum + (p.value / total || 0), 0);
    return { ...point, pct, start, end: start + pct };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-700 p-2 rounded-lg shadow-sm"><Landmark className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl tracking-tight">WealthWise</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg text-sm font-medium">
            {['assets', 'expenses', 'fire'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md transition ${activeTab === tab ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>
                {tab === 'assets' ? '資產' : tab === 'expenses' ? '開支' : 'FIRE'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'assets' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2"><Coins className="w-5 h-5" /> 流動資產</h2>
                <AssetInputRow label="現金 / 活存" value={assets.liquid.cash} max={5000000} step={10000} onChange={(e) => setAssets({...assets, liquid: {...assets.liquid, cash: parseInt(e.target.value) || 0}})} />
                <AssetInputRow label="股票 / ETF" value={assets.liquid.stock} max={10000000} step={10000} onChange={(e) => setAssets({...assets, liquid: {...assets.liquid, stock: parseInt(e.target.value) || 0}})} />
                <AssetInputRow label="債券 / 基金" value={assets.liquid.bond} max={5000000} step={10000} onChange={(e) => setAssets({...assets, liquid: {...assets.liquid, bond: parseInt(e.target.value) || 0}})} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><Home className="w-5 h-5" /> 非流動資產</h2>
                <AssetInputRow label="房地產現值" value={assets.nonLiquid.realEstate} max={50000000} step={100000} onChange={(e) => setAssets({...assets, nonLiquid: {...assets.nonLiquid, realEstate: parseInt(e.target.value) || 0}})} />
                <AssetInputRow label="車輛 / 其他" value={assets.nonLiquid.car} max={5000000} step={10000} onChange={(e) => setAssets({...assets, nonLiquid: {...assets.nonLiquid, car: parseInt(e.target.value) || 0}})} />
              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative mb-8">
                  <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                    {pieData.map((slice, i) => <path key={i} d={getPiePath(slice.start, slice.end)} fill={slice.color} stroke="white" strokeWidth="0.02" />)}
                    <circle cx="0" cy="0" r="0.6" fill="white" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-slate-400 text-xs font-bold">總資產</p>
                    <p className="text-2xl font-bold">${(totalAssets/10000).toFixed(0)}萬</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                      <span className="text-slate-600">{item.label}</span>
                      <span className="ml-auto font-mono">{(item.pct * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-500" /> 年度收入</h2>
                <input type="number" value={income} onChange={(e) => setIncome(parseInt(e.target.value) || 0)} className="w-full p-4 bg-slate-50 border rounded-xl text-2xl font-bold font-mono" />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-500" /> 每月開支</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(expenses.monthly).map(([k, v]) => (
                    <div key={k}><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{k}</label><input type="number" value={v} onChange={(e) => setExpenses({...expenses, monthly: {...expenses.monthly, [k]: parseInt(e.target.value) || 0}})} className="w-full p-2 border rounded font-mono" /></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl">
                <p className="text-slate-400 text-sm">年度結餘</p>
                <p className={`text-4xl font-bold mb-6 ${annualAssetIncrease >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${annualAssetIncrease.toLocaleString()}</p>
                <div className="space-y-2 text-sm border-t border-slate-700 pt-4">
                  <div className="flex justify-between"><span>每月可存</span><span className="font-mono text-emerald-400">${monthlyAssetIncrease.toFixed(0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>儲蓄率</span><span className="font-mono">{((annualAssetIncrease/income)*100).toFixed(1)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fire' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">FIRE 參數設定</h2>
                
                {/* 目前資產展示 */}
                <div className="p-4 bg-slate-50 rounded-xl border mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">目前總資產</span>
                  <span className="text-xl font-mono font-bold text-slate-700">${totalAssets.toLocaleString()}</span>
                </div>

                {/* 目標金額輸入 */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500">設定目標金額</label>
                    <button onClick={() => setManualGoal(null)} className="text-xs text-indigo-500 hover:underline">還原預設</button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={effectiveFireGoal} 
                      onChange={(e) => setManualGoal(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg font-mono font-bold text-indigo-700" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">* 建議 (25倍支出): ${(totalAnnualExpense * 25).toLocaleString()}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 mb-2">預期報酬率 ({returnRate}%)</label>
                  <input type="range" min="1" max="15" step="0.5" value={returnRate} onChange={(e) => setReturnRate(e.target.value)} className="w-full accent-indigo-600" />
                </div>
                
                <div className="space-y-2 text-sm pt-4 border-t">
                  <div className="flex justify-between"><span>每月投入</span><span className="font-bold text-emerald-600">${Math.max(0, monthlyAssetIncrease).toFixed(0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>尚差額度</span><span className="font-bold text-red-500">${Math.max(0, effectiveFireGoal - totalAssets).toLocaleString()}</span></div>
                </div>
              </div>

              <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg text-center">
                <p className="text-indigo-200 text-sm mb-1">預計達成時間</p>
                <div className="text-5xl font-bold">{fireYears} <span className="text-lg">年</span></div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> 資產成長曲線</h2>
              <div className="h-64 flex items-end gap-1 relative pl-10 border-l border-b border-slate-100">
                {fireChartData.map((d, i) => (
                  <div key={i} className="flex-1 bg-indigo-100 hover:bg-indigo-400 transition-all relative group" style={{height: `${Math.min(100, (d.amount/effectiveFireGoal)*100)}%`}}>
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-1 rounded z-10 whitespace-nowrap">
                      {d.year}年: ${Math.floor(d.amount/10000)}萬
                    </div>
                  </div>
                ))}
                <div className="absolute left-0 top-0 w-full border-t border-dashed border-emerald-500 opacity-30"></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;