import { useMemo } from 'react';
import { FIRE_MODES } from '../constants/finance';

export const useFinancialStats = (incomes, expenses, assets, manualGoal, fireModeId) => {
  const stats = useMemo(() => {
    // --- 1. 收入與支出計算 ---
    const annualIncome = (incomes.monthly.月薪 * 12) + (incomes.monthly.獎金 || 0);
    const monthlyTotal = Object.values(expenses.monthly).reduce((a, b) => a + b, 0);
    const yearlyOneOffTotal = Object.values(expenses.yearly).reduce((a, b) => a + b, 0);
    const totalAnnualExpense = (monthlyTotal * 12) + yearlyOneOffTotal;

    // --- 2. 儲蓄與資產增長 ---
    const annualAssetIncrease = annualIncome - totalAnnualExpense;
    const monthlySavings = annualAssetIncrease / 12;
    const totalLiquid = Object.values(assets.liquid).reduce((a, b) => a + b, 0);
    const totalNonLiquid = Object.values(assets.nonLiquid).reduce((a, b) => a + b, 0);
    const totalAssets = totalLiquid + totalNonLiquid;
    const savingsRate = annualIncome > 0 ? (annualAssetIncrease / annualIncome) * 100 : 0;
    
    // --- 3. FIRE 目標計算 ---
    const selectedMode = FIRE_MODES.find(m => m.id === fireModeId) || FIRE_MODES[0];
    const modeCalculatedGoal = totalAnnualExpense * selectedMode.multiplier;
    const fireGoal = manualGoal !== null ? manualGoal : modeCalculatedGoal;

    // --- 4. 安全邊際 (緊急預備金) ---
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
  }, [assets, expenses, incomes, manualGoal, fireModeId]);

  return stats;
};