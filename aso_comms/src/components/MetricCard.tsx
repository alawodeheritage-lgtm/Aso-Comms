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
  color = 'text-[#004ac6]',
  bgColor = 'bg-[#2563eb]/10',
  trend
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e1e2ed]/50">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#434655] truncate">
            {label}
          </p>
          <p className={`text-2xl font-bold tracking-[-0.02em] ${color} mt-1`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-semibold mt-0.5 ${trend.direction === 'up' ? 'text-green-600' : 'text-[#ba1a1a]'
              }`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`${bgColor} ${color} p-2 rounded-lg flex-shrink-0 ml-2`}>
          <span className="material-symbols-outlined text-base">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;