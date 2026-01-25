import React from 'react';
import { 
  Sparkles, AlertCircle, Lightbulb, ChevronRight, RefreshCw 
} from 'lucide-react';

// 🔴 修正重點：必須在大括號中加入從 App.jsx 傳下來的狀態與設定函式
const AiAdvisorTab = ({ 
  stats, 
  returnRate, 
  apiKey,
  aiAdvice,       // 接收目前的分析結果
  setAiAdvice,    // 接收設定函式
  isAiLoading,    // 接收讀取狀態
  setIsAiLoading, // 接收設定函式
  aiError,        // 接收錯誤訊息
  setAiError      // 接收設定函式
}) => {

  const fetchAIAdvice = async () => {
    setIsAiLoading(true);
    setAiAdvice('');
    setAiError('');
    
    const userPrompt = `
      我是一位尋求理財建議的使用者。以下是我的財務數據：
      - 年度收入：$${stats.annualIncome}
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
        
        setAiAdvice(text); // 這裡更新的是 App.jsx 的狀態
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col md:flex-row">
        {/* 左側欄位維持不變 */}
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

        {/* 右側內容區塊 */}
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
  );
};

export default AiAdvisorTab;