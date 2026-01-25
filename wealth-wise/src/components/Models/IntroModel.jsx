import { useState } from "react";
import { Landmark, Flame, Target, ArrowRight, Check } from "lucide-react";

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

export default IntroModal;