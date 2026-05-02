
import React from 'react';

interface SentimentGaugeProps {
  score: number;
  label: string;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, label }) => {
  const percentage = Math.round(score * 100);
  const colorClass = score > 0.7 ? 'bg-green-500' : score > 0.4 ? 'bg-indigo-500' : 'bg-red-500';

  return (
    <div className="flex flex-col items-center p-4 bg-slate-900 rounded-xl shadow-xl border border-slate-800">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-slate-800 stroke-current"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`${colorClass.replace('bg-', 'text-')} stroke-current transition-all duration-1000 ease-out`}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export default SentimentGauge;
