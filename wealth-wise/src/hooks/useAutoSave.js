import { useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAutoSave = (user, financialData, setStatus) => {
  const saveTimeoutRef = useRef(null);

  // 解構數據，確保 useEffect 監聽正確的變數
  const { incomes, assets, expenses, manualGoal, returnRate } = financialData;

  useEffect(() => {
    // 原始邏輯：如果沒有使用者或者是匿名登入，則不執行存檔
    if (!user || user.isAnonymous) return;

    setStatus('saving');

    // 如果 2 秒內又有變動，清除上一次的計時器
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // 1. 取得身分證 (Firebase ID Token)
        const token = await user.getIdToken();

        // 2. 呼叫你的 Python 後端 API
        const response = await fetch(`${API_BASE_URL}/v1/profile/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            incomes,
            assets,
            expenses,
            manualGoal,
            returnRate
          })
        });

        if (response.ok) {
          setStatus('saved');
        } else {
          const errorData = await response.json();
          console.error("存檔失敗:", errorData.detail);
          setStatus('error');
        }
      } catch (e) {
        console.error("存檔出錯:", e);
        setStatus('error');
      }
    }, 2000); // 延遲 2 秒執行

    // 清除副作用
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [assets, expenses, incomes, manualGoal, returnRate, user, setStatus]);
};