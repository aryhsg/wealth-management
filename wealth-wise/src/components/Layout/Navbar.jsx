import React from 'react';
import { 
  Landmark, Coins, Calculator, Target, Sparkles, 
  User, LogOut 
} from 'lucide-react';
import { signOut } from 'firebase/auth';

const Navbar = ({ activeTab, setActiveTab, user, setAuthMode, auth }) => {
  return (
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
  );
};

export default Navbar;