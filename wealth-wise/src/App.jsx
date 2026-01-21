import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  PieChart, TrendingUp, Download, Target, AlertCircle, RefreshCw, 
  Calculator, Home, Coins, Landmark, ShieldCheck, Plane, FileText, 
  Cloud, Check, Briefcase, TrendingDown, Wallet, ChevronRight, Save,
  User, LogOut, Mail, Lock, UserPlus, LogIn, X, Lightbulb, Sparkles as GrowthIcon
} from 'lucide-react';
import {ArrowRight, Sparkles, Coffee, Heart, Gem, ChevronDown} from 'lucide-react';
// --- Firebase SDK Imports ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// ---------------------------------------------------------
// 🔴 配置區
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : import.meta.env.VITE_FIREBASE_APP_ID;
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Gemini API Key (Runtime provides this)


// ---------------------------------------------------------
// 🟢 常數定義：FIRE 模式
// ---------------------------------------------------------
const FIRE_MODES = [
  { id: 'lean', name: 'Lean FIRE (簡約型)', multiplier: 20, icon: <Coffee className="w-4 h-4" />, desc: '適合追求極簡生活、開銷極低的使用者。' },
  { id: 'standard', name: 'Standard FIRE (經典型)', multiplier: 25, icon: <Target className="w-4 h-4" />, desc: '基於著名的 4% 法則，最平衡的退休方案。' },
  { id: 'chubby', name: 'Chubby FIRE (舒適型)', multiplier: 30, icon: <Heart className="w-4 h-4" />, desc: '提供更寬裕的旅遊與生活預算，不用斤斤計較。' },
  { id: 'fat', name: 'Fat FIRE (奢華型)', multiplier: 33, icon: <Gem className="w-4 h-4" />, desc: '極高度的安全邊際，支持高品質的優渥生活。' },
  { id: 'barista', name: 'Barista FIRE (兼職型)', multiplier: 15, icon: <Briefcase className="w-4 h-4" />, desc: '只需存夠部分資金，其餘靠輕鬆的興趣兼職負擔。' },
];

// 固定開支欄位的順序與名稱，避免登入後 Firestore 回傳順序變動導致 UI 閃爍
const EXPENSE_LABELS = {
  housing: '房租 / 房貸',
  living: '餐飲生活',
  transport: '交通通訊',
  entertainment: '休閒社交'
};

// 固定開支欄位的順序與名稱，避免登入後 Firestore 回傳順序變動導致 UI 閃爍
const FIX_EXPENSE_LABELS = {
  insurance: '保險',
  tax: '稅務',
  travel: '旅遊',
  loan: '貸款'
};

// ---------------------------------------------------------
// 🟢 子組件 1：引導介紹彈窗 (New)
// ---------------------------------------------------------
const IntroModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  if (!isOpen) return null;

  const content = [
    {
      title: "歡迎來到 WealthWise",
      subtitle: "您的專屬 FIRE 財務自由顧問",
      description: "這不只是一個計算機，而是一個幫助您掌控人生的財務規劃系統。讓我們一起邁向財務自由之路。",
      icon: <Landmark className="w-12 h-12 text-white" />,
      bg: "bg-indigo-600"
    },
    {
      title: "什麼是 FIRE？",
      subtitle: "Financial Independence, Retire Early",
      description: "核心觀念包含「4% 法則」：當您的投資資產達到年支出的 25 倍時，靠著每年 4% 的提領，理論上您可以永遠不再為錢工作。",
      icon: <Flame className="w-12 h-12 text-white" />,
      bg: "bg-orange-500"
    },
    {
      title: "如何使用此系統？",
      subtitle: "四步驟完成規劃",
      description: "1. 輸入資產與開支。 2. 設定 FIRE 目標。 3. 查看成長曲線模擬。 4. 點擊 AI 顧問獲得深度理財建議。",
      icon: <Target className="w-12 h-12 text-white" />,
      bg: "bg-emerald-500"
    }
  ];

  const current = content[step - 1];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`p-12 ${current.bg} transition-colors duration-500 flex flex-col items-center text-center text-white`}>
          <div className="mb-6 p-4 bg-white/20 rounded-3xl backdrop-blur-sm">
            {current.icon}
          </div>
          <h2 className="text-3xl font-black mb-2">{current.title}</h2>
          <p className="text-white/80 font-bold uppercase tracking-widest text-xs">{current.subtitle}</p>
        </div>
        
        <div className="p-10 text-center">
          <p className="text-slate-600 text-lg leading-relaxed mb-10 min-h-[80px]">
            {current.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
              ))}
            </div>
            
            {step < totalSteps ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                下一步 <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
              >
                立即開始 <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 輔助組件：FIRE 小標誌
const Flame = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

// ---------------------------------------------------------
// 🟢 子組件 2：會員登入/註冊彈窗
// ---------------------------------------------------------
const AuthModal = ({ mode, setMode, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!mode) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 基本前端驗證
    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setMode(null);
      setEmail('');
      setPassword('');
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      // 將常見 Firebase 錯誤轉換為中文提示
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') message = '該電子郵件已被註冊，請直接登入。';
      else if (err.code === 'auth/invalid-email') message = '無效的電子郵件格式。';
      else if (err.code === 'auth/weak-password') message = '密碼強度不足（至少 6 位）。';
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') message = '電子郵件或密碼錯誤。';
      else if (err.code === 'auth/operation-not-allowed') message = '請前往 Firebase Console 啟用 Email/Password 登入功能。';
      
      setError(message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden border border-white/20">
        <button onClick={() => setMode(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            {mode === 'login' ? <LogIn className="w-8 h-8 text-indigo-600" /> : <UserPlus className="w-8 h-8 text-indigo-600" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900">{mode === 'login' ? '歡迎回來' : '加入 WealthWise'}</h2>
          <p className="text-slate-400 text-sm mt-1">{mode === 'login' ? '登入後同步您的財務藍圖' : '開始規劃您的財務自由之路'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">電子郵件</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="name@example.com" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">密碼</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="至少 6 個字元" />
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (mode === 'login' ? '立即登入' : '完成註冊')} 
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
            {mode === 'login' ? '還沒有帳號？點此註冊' : '已經有帳號了？點此登入'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 🔵 子組件 2：資產輸入行
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 🟡 主程式 (Main App)
// ---------------------------------------------------------
const App = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');
  const [authMode, setAuthMode] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true); // 控制導覽彈窗
  // AI 顧問狀態
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  // FIRE 模式
  const [fireModeId, setFireModeId] = useState('standard'); // 預設經典模式
  // 核心數據
  const [income, setIncome] = useState(1200000); 
  const [manualGoal, setManualGoal] = useState(null);
  const [returnRate, setReturnRate] = useState(6);
  const [assets, setAssets] = useState({
    liquid: { cash: 0, stock: 0, bond: 0 },
    nonLiquid: { realEstate: 0, car: 0, other: 0 }
  });
  const [expenses, setExpenses] = useState({
    monthly: { "房貸/房租": 0, 伙食費: 0, 交通費: 0, 娛樂費: 0 },
    yearly: { 保險: 0, 稅務: 0, 旅遊: 0, 貸款: 0 }
  });
    const [incomes, setIncomes] = useState({
    monthly: { 月薪: 0, 獎金: 0 }
  });

  // 計算邏輯
  const stats = useMemo(() => {
    const annualIncome = (incomes.monthly.月薪 * 12) + (incomes.monthly.獎金 || 0);
    const monthlyTotal = Object.values(expenses.monthly).reduce((a, b) => a + b, 0);
    const yearlyOneOffTotal = Object.values(expenses.yearly).reduce((a, b) => a + b, 0);
    const totalAnnualExpense = (monthlyTotal * 12) + yearlyOneOffTotal;
    const annualAssetIncrease = annualIncome - totalAnnualExpense;
    const monthlySavings = annualAssetIncrease / 12;
    const totalLiquid = Object.values(assets.liquid).reduce((a, b) => a + b, 0);
    const totalNonLiquid = Object.values(assets.nonLiquid).reduce((a, b) => a + b, 0);
    const totalAssets = totalLiquid + totalNonLiquid;
    const savingsRate = annualIncome > 0 ? (annualAssetIncrease / annualIncome) * 100 : 0;
    
    // 獲取當前選擇的模式
    const selectedMode = FIRE_MODES.find(m => m.id === fireModeId);
    // 計算該模式目標：年支出 * 模式倍數
    const modeCalculatedGoal = totalAnnualExpense * selectedMode.multiplier;
    // 如果手動輸入為 null，使用模式計算結果
    const fireGoal = manualGoal !== null ? manualGoal : modeCalculatedGoal;

    // 緊急預備金水位 (6個月開支)
    const emergencyFundGoal = monthlyTotal * 6;
    const emergencyFundStatus = assets.liquid.cash >= emergencyFundGoal;

    return { 
      monthlyTotal, 
      totalAnnualExpense, 
      annualAssetIncrease, 
      monthlySavings, 
      totalLiquid, 
      totalNonLiquid, 
      totalAssets, 
      fireGoal, 
      savingsRate,
      emergencyFundGoal,
      emergencyFundStatus,
      annualIncome,
      modeCalculatedGoal,
      selectedMode
    };
  }, [assets, expenses, income, manualGoal, incomes, fireModeId]);

  // Auth 監聽
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      }
      setIsLoading(false);
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 從 Firestore 讀取資料
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.assets) setAssets(data.assets);
        if (data.expenses) setExpenses(data.expenses);
        if (data.incomes !== undefined) setIncomes(data.incomes);
        if (data.manualGoal !== undefined) setManualGoal(data.manualGoal);
        if (data.returnRate !== undefined) setReturnRate(data.returnRate);
        setStatus('saved');
      }
    });
  }, [user]);

  // 自動存檔
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    setStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        await setDoc(docRef, { incomes, assets, expenses, manualGoal, returnRate, updatedAt: new Date().toISOString() }, { merge: true });
        setStatus('saved');
      } catch (e) { setStatus('error'); }
    }, 2000);
  }, [assets, expenses, incomes, manualGoal, returnRate, user]);

  const fireProjection = useMemo(() => {
    let current = stats.totalLiquid; 
    let monthlyRate = returnRate / 100 / 12;
    let months = 0;
    let data = [];
    const monthlySavings = Math.max(0, stats.monthlySavings);
    while (current < stats.fireGoal && months < 600) {
      current = current * (1 + monthlyRate) + monthlySavings;
      months++;
      if (months % 12 === 0 || current >= stats.fireGoal) {
        data.push({ year: (months / 12).toFixed(0), amount: Math.floor(current) });
      }
    }
    return { years: (months / 12).toFixed(1), chart: data };
  }, [stats.totalLiquid, stats.fireGoal, returnRate, stats.monthlySavings]);

  // --- AI Advisor API Call with Exponential Backoff ---
  const fetchAIAdvice = async () => {
    setIsAiLoading(true);
    setAiAdvice('');
    setAiError('');
    
    const userPrompt = `
      我是一位尋求理財建議的使用者。以下是我的財務數據：
      - 年度收入：$${income}
      - 目前流動資產：$${stats.totalLiquid}
      - 年度總支出：$${stats.totalAnnualExpense}
      - 儲蓄率：${stats.savingsRate.toFixed(1)}%
      - FIRE 目標金額：$${stats.fireGoal}
      - 預期投資報酬率：${returnRate}%
      
      請以「專業理財顧問」身份，分析現狀並提供 3-5 條具體建議。
    `;

    const systemPrompt = "你是一位資深的個人理財顧問，擅長 FIRE 規劃。你的語氣專業、客觀。";

    const delays = [1000, 2000, 4000, 8000, 16000];
    
    const attemptRequest = async (retryIdx = 0) => {
      try {
        const modelName = "gemini-2.5-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt}] }
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || `API Error: ${response.status}`);
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("API 回傳內容為空");
        
        setAiAdvice(text);
        setIsAiLoading(false);
      } catch (err) {
        if (retryIdx < delays.length) {
          setTimeout(() => attemptRequest(retryIdx + 1), delays[retryIdx]);
        } else {
          setAiError(`分析失敗: ${err.message}`);
          setIsAiLoading(false);
        }
      }
    };

    attemptRequest();
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="w-8 h-8 animate-spin text-indigo-600" /></div>;


  // --- 圓餅圖路徑 ---
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* 1. 導覽引導彈窗 */}
      <IntroModal isOpen={showIntro} onClose={() => setShowIntro(false)} />
      <AuthModal mode={authMode} setMode={setAuthMode} />

      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2.5 rounded-xl shadow-lg">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">WealthWise</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personal Advisor</span>
            </div>
          </div>
          
          {/* 右側導覽區域 (分頁 + 會員狀態) */}
          <div className="flex items-center gap-8">
            <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-semibold">
              {[
                { id: 'assets', label: '資產', icon: Coins },
                { id: 'expenses', label: '開支', icon: Calculator },
                { id: 'fire', label: 'FIRE', icon: Target },
                { id: 'advisor', label: 'AI顧問', icon: Sparkles }
              ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 會員狀態與按鈕 */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 truncate max-w-[120px] hidden md:block">{user.email}</span>
                  <button onClick={() => signOut(auth)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : ( 
                <button onClick={() => setAuthMode('login')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
                  <User className="w-4 h-4" /> 登入
                </button> 
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
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

        {activeTab === 'assets' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-50 rounded-lg"><Coins className="w-4 h-4 text-indigo-600" /></div> 流動資產
                </h2>
                <AssetInputRow label="現金 / 活存" value={assets.liquid.cash} max={5000000} step={10000} onChange={v => setAssets({...assets, liquid: {...assets.liquid, cash: v}})} />
                <AssetInputRow label="股票 / ETF" value={assets.liquid.stock} max={10000000} step={10000} onChange={v => setAssets({...assets, liquid: {...assets.liquid, stock: v}})} />
                <AssetInputRow label="債券 / 基金" value={assets.liquid.bond} max={5000000} step={10000} onChange={v => setAssets({...assets, liquid: {...assets.liquid, bond: v}})} />
              </div>

              <div className={`p-6 rounded-3xl border shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all ${stats.emergencyFundStatus ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-bold ${stats.emergencyFundStatus ? 'text-emerald-900' : 'text-amber-900'}`}>緊急預備金診斷</h3>
                    <p className="text-xs opacity-70">建議維持至少 6 個月開支 ($${stats.emergencyFundGoal.toLocaleString()})</p>
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

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg"><Home className="w-4 h-4 text-slate-600" /></div> 非流動資產
                </h2>
                <AssetInputRow label="房地產現值" value={assets.nonLiquid.realEstate} max={50000000} step={100000} onChange={v => setAssets({...assets, nonLiquid: {...assets.nonLiquid, realEstate: v}})} />
                <AssetInputRow label="車輛" value={assets.nonLiquid.car} max={5000000} step={10000} onChange={v => setAssets({...assets, nonLiquid: {...assets.nonLiquid, car: v}})} />
                <AssetInputRow label="其他" value={assets.nonLiquid.other} max={5000000} step={10000} onChange={v => setAssets({...assets, nonLiquid: {...assets.nonLiquid, other: v}})} />

              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-10 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
               <div className="relative mb-10">
                  <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                    {pieData.map((slice, i) => <path key={i} d={getPiePath(slice.start, slice.end)} fill={slice.color} stroke="white" strokeWidth="0.02" />)}
                    <circle cx="0" cy="0" r="0.6" fill="white" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-emerald-400 text-sm font-bold">總資產</p>
                    <p className="text-2xl font-bold">${(stats.totalAssets/10000).toFixed(0)}萬</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
             <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)] ">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    <Wallet className="w-5 h-5 text-indigo-500" /> 年度總收入 
                    <p className={`text-3xl font-black text-emerald-500 font-mono ${stats.annualIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${stats.annualIncome.toLocaleString()}</p>

                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(incomes.monthly).map(([k, v]) => (
                      <div key={k} className="p-4 bg-slate-50 rounded-2xl">
                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{k}</label>
                        <input type="number" min="0" placeholder='0' value={v === 0 ? "" : v} onChange={e => setIncomes({...incomes, monthly: {...incomes.monthly, [k]: parseInt(e.target.value) || 0}})} className="w-full bg-transparent border-0 font-mono font-bold text-lg outline-none" />
                      </div>
                    ))}
                  </div>
                
                </div>
                <div className="bg-white p-8 rounded-[3rem] flex flex-col gap-4 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]  ">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    <Wallet className="w-5 h-5 text-indigo-500" /> 年度總支出 
                    <p className={`text-3xl font-black text-emerald-500 font-mono ${stats.totalAnnualExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${stats.totalAnnualExpense.toLocaleString()}</p>

                  </h2>
                    <div className="bg-white p-8 rounded-2xl shadow-md">
                      <h3 className="text-md font-bold text-slate-800 mb-6">每月開支</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {Object.keys(EXPENSE_LABELS).map((key) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-2xl">
                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                          {EXPENSE_LABELS[key]}
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          placeholder='0'
                          value={expenses.monthly[key] ===0 ? "" : expenses.monthly[key]} 
                          onChange={e => setExpenses({...expenses, monthly: {...expenses.monthly, [key]: parseInt(e.target.value) || 0}})} 
                          className="w-full bg-transparent border-0 font-mono font-bold text-lg outline-none" 
                        />
                      </div>
                    ))}
                        </div>
                    </div>  

                    <div className="bg-slate-40 p-8 rounded-2xl shadow-md ">
                      <h3 className="text-md font-bold text-slate-800 mb-6">其餘開支</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {Object.keys(FIX_EXPENSE_LABELS).map((key) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-2xl">
                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                          {FIX_EXPENSE_LABELS[key]}
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          placeholder='0'
                          value={expenses.yearly[key] ===0 ? "" : expenses.yearly[key]} 
                          onChange={e => setExpenses({...expenses, yearly: {...expenses.yearly, [key]: parseInt(e.target.value) || 0}})} 
                          className="w-full bg-transparent border-0 font-mono font-bold text-lg outline-none" 
                        />
                      </div>
                    ))}
                        </div>
                    </div>  
                </div>
             </div>
             <div className="lg:col-span-4 sticky top-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)]  relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-2">年度結餘</p>
                  <p className={`text-4xl font-black ${stats.annualAssetIncrease >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${stats.annualAssetIncrease.toLocaleString()}</p>
                  <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">每月平均儲蓄</span>
                      <span className="font-mono text-emerald-400 font-bold">${Math.floor(stats.monthlySavings).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">儲蓄率</span>
                      <div className="px-3 py-1 bg-white/10 rounded-full font-mono text-xs">{stats.savingsRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'fire' && (
           <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">

                  <h2 className="text-lg font-bold text-slate-800 mb-4">FIRE 參數設定</h2>
                  {/* 下拉式選單：選擇模式 */}
                  <div className="mb-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">選擇達成模式</label>
                    <div className="relative group">
                      <select 
                        value={fireModeId}
                        onChange={(e) => {
                          setFireModeId(e.target.value);
                          setManualGoal(null); // 切換模式時重設手動輸入，使其自動計算
                        }}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                      >
                        {FIRE_MODES.map(mode => (
                          <option key={mode.id} value={mode.id}>{mode.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                    </div>
                    {/* 模式說明 */}
                    <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                       <p className="text-xs text-indigo-700 leading-relaxed italic">
                         {stats.selectedMode.desc} 
                         <span className="block mt-1 font-black not-italic">目標為年支出的 {stats.selectedMode.multiplier} 倍。</span>
                       </p>
                    </div>
                  </div>
                  
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
             <div className="lg:col-span-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)] min-h-[400px]">
                <h2 className="text-lg font-bold text-slate-800 mb-10 flex items-center gap-2">
                   <GrowthIcon className="w-5 h-5 text-indigo-500" /> 資產成長模擬
                </h2>
                <div className="h-64 flex items-end gap-1.5 relative pl-10 border-l border-b border-slate-100">
                  {fireProjection.chart.map((d, i) => (
                    <div key={i} className="flex-1 bg-indigo-100 hover:bg-indigo-500 rounded-t-sm transition-all relative group" style={{ height: `${Math.min(100, (d.amount / stats.fireGoal) * 100)}%` }}>
                       <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl z-10 whitespace-nowrap">
                         第 {d.year} 年: ${Math.floor(d.amount/10000)}萬
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        )}

        {activeTab === 'advisor' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">WealthWise AI</h2>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">健康指標</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800">{stats.savingsRate.toFixed(0)}</span>
                    <span className="text-xs font-bold text-slate-400">/ 100 分</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col">
                {aiError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">{aiError}</span>
                  </div>
                )}

                {!aiAdvice && !isAiLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center animate-bounce">
                      <Lightbulb className="w-10 h-10 text-indigo-500" />
                    </div>
                    <button 
                      onClick={fetchAIAdvice}
                      className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 group"
                    >
                      開始分析我的財務現狀 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : isAiLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-slate-500 font-bold animate-pulse">正在為您運算深度理財計畫...</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">理財顧問建議報告</span>
                      <button onClick={fetchAIAdvice} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> 重新分析
                      </button>
                    </div>
                    <div className="prose prose-slate max-w-none flex-1 overflow-y-auto pr-4 scrollbar-thin">
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                        {aiAdvice}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;