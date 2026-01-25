import React from 'react';
import { Coffee, Target, Heart, Gem, Briefcase } from 'lucide-react';

export const FIRE_MODES = [
  { id: 'lean', name: 'Lean FIRE (簡約型)', multiplier: 20, icon: <Coffee className="w-4 h-4" />, desc: '適合追求極簡生活、開銷極低的使用者。' },
  { id: 'standard', name: 'Standard FIRE (經典型)', multiplier: 25, icon: <Target className="w-4 h-4" />, desc: '基於著名的 4% 法則，最平衡的退休方案。' },
  { id: 'chubby', name: 'Chubby FIRE (舒適型)', multiplier: 30, icon: <Heart className="w-4 h-4" />, desc: '提供更寬裕的旅遊與生活預算，不用斤斤計較。' },
  { id: 'fat', name: 'Fat FIRE (奢華型)', multiplier: 33, icon: <Gem className="w-4 h-4" />, desc: '極高度的安全邊際，支持高品質的優渥生活。' },
  { id: 'barista', name: 'Barista FIRE (兼職型)', multiplier: 15, icon: <Briefcase className="w-4 h-4" />, desc: '只需存夠部分資金，其餘靠輕鬆的興趣兼職負擔。' },
];

export const EXPENSE_LABELS = {
  housing: '房租 / 房貸',
  living: '餐飲生活',
  transport: '交通通訊',
  entertainment: '休閒社交'
};

export const FIX_EXPENSE_LABELS = {
  insurance: '保險',
  tax: '稅務',
  travel: '旅遊',
  loan: '貸款'
};

// 輔助組件：FIRE 小標誌
export const Flame = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);