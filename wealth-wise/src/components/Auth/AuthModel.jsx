import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { X, LogIn, UserPlus, Mail, Lock, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';



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

  export default AuthModal;