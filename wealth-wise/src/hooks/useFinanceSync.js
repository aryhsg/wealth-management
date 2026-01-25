// hooks/useFinanceSync.js
import { useEffect } from 'react';

export const useFinanceSync = (user, setters, setStatus) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  
  // 解構出你原本的 set 方法
  const { setAssets, setExpenses, setIncomes, setManualGoal, setReturnRate } = setters;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken(); 
        const response = await fetch(`${API_BASE_URL}/v1/profile/get`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('網路請求失敗');
        const result = await response.json();

        // 👇 這裡就是你原本的那串邏輯！完全一模一樣地搬進來
        if (result.status === "success" && result.data) {
          const userData = result.data;
          if (userData.assets) setAssets(userData.assets);
          if (userData.expenses) setExpenses(userData.expenses);
          if (userData.incomes !== undefined) setIncomes(userData.incomes);
          if (userData.manualGoal !== undefined) setManualGoal(userData.manualGoal);
          if (userData.returnRate !== undefined) setReturnRate(userData.returnRate);
          setStatus('saved');
        }
      } catch (e) {
        console.error("載入失敗:", e);
        setStatus('error');
      }
    };

    loadData();
  }, [user]); // 僅在 user 改變時執行（例如剛登入時）
};