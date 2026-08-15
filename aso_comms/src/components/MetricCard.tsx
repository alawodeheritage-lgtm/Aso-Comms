// src/components/MetricCard.tsx
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  bgColor?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  color = 'text-[#1A365D]',
  bgColor = 'bg-[#1A365D]/10',
  trend
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p className={`text-2xl font-bold text-[#1A365D] mt-1`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-semibold mt-0.5 ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`${bgColor} ${color} p-2.5 rounded-xl flex-shrink-0 ml-2`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;