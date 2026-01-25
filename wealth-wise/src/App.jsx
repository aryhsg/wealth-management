import React, { useState } from 'react';
// --- 1. Layout & Global Components ---
import Navbar from './components/Layout/Navbar';
import IntroModel from './components/Models/IntroModel';
import AuthModel from './components/Auth/AuthModel';

// --- 2. Dashboard Tabs ---
import AssetsTab from './components/Dashboard/AssetsTab';
import ExpensesTab from './components/Dashboard/ExpensesTab';
import FireTab from './components/Dashboard/FireTab';
import AiAdvisorTab from './components/Dashboard/AiAdvisorTab';

// --- 3. Custom Hooks ---
import { useAuth } from './hooks/useAuth';
import { useFinancialStats } from './hooks/useFinancialStats';
import { useAutoSave } from './hooks/useAutoSave';
import { useFinanceSync } from './hooks/useFinanceSync';

// --- 4. Utilities & Assets ---
import { Check, Save, RefreshCw } from 'lucide-react';
import { auth } from './lib/firebase'; // 根據圖片路徑

const App = () => {
  // --- A. 導覽與全域狀態 ---
  const [activeTab, setActiveTab] = useState('assets');
  const [status, setStatus] = useState('idle');
  const [showIntro, setShowIntro] = useState(true);

  // ---  AI 狀態 ---
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // --- B. 核心財務數據 State ---
  const [fireModeId, setFireModeId] = useState('standard');
  const [manualGoal, setManualGoal] = useState(null);
  const [returnRate, setReturnRate] = useState(6);
  const [assets, setAssets] = useState({
    liquid: { cash: 0, stock: 0, bond: 0 },
    nonLiquid: { realEstate: 0, car: 0, other: 0 }
  });
  const [expenses, setExpenses] = useState({
    monthly: { housing: 0, living: 0, transport: 0, entertainment: 0 },
    yearly: { insurance: 0, tax: 0, travel: 0, loan: 0 }
  });
  const [incomes, setIncomes] = useState({
    monthly: { 月薪: 0, 獎金: 0 }
  });

  // --- C. 邏輯封裝 ---
  const { user, isLoading, authMode, setAuthMode } = useAuth();
  
  // 1. 初始資料讀取 (Sync)
  useFinanceSync(user, { setAssets, setExpenses, setIncomes, setManualGoal, setReturnRate }, setStatus);

  // 2. 財務運算 (Stats)
  const stats = useFinancialStats(incomes, expenses, assets, manualGoal, fireModeId);

  // 3. 自動存檔 (AutoSave)
  useAutoSave(user, { incomes, assets, expenses, manualGoal, returnRate }, setStatus);

  // --- D. 載入守衛 ---
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* 彈窗組件 */}
      <IntroModel isOpen={showIntro} onClose={() => setShowIntro(false)} />
      <AuthModel mode={authMode} setMode={setAuthMode} />

      {/* 導覽列 */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        setAuthMode={setAuthMode} 
        auth={auth} 
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* 同步狀態標示 */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border text-xs font-medium transition-all ${
            status === 'saving' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
            status === 'saved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
            'bg-white border-slate-200 text-slate-500'
          }`}>
            {status === 'saving' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 
             status === 'saved' ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {status === 'saving' ? '同步中' : status === 'saved' ? '雲端已同步' : '已就緒'}
          </div>
        </div>

        {/* 依 Tab 切換顯示對應組件 */}
        {activeTab === 'assets' && (
          <AssetsTab assets={assets} setAssets={setAssets} stats={stats} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab expenses={expenses} incomes={incomes} setIncomes={setIncomes} setExpenses={setExpenses} stats={stats} />
        )}

        {activeTab === 'fire' && (
          <FireTab 
            stats={stats} 
            fireModeId={fireModeId} 
            setFireModeId={setFireModeId}
            manualGoal={manualGoal}
            setManualGoal={setManualGoal}
            returnRate={returnRate}
            setReturnRate={setReturnRate}
          />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorTab 
            stats={stats} 
            returnRate={returnRate} 
            apiKey={import.meta.env.VITE_GEMINI_API_KEY} 
            aiAdvice={aiAdvice}
            setAiAdvice={setAiAdvice}
            isAiLoading={isAiLoading}
            setIsAiLoading={setIsAiLoading}
            aiError={aiError}
            setAiError={setAiError}
          />
        )}
      </main>
    </div>
  );
};

export default App;