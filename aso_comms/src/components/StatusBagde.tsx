import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusInfo = (status: string) => {
    const s = status?.toLowerCase() || '';

    if (s === 'pending') {
      return { label: 'Pending', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
    }
    if (s === 'in-progress' || s === 'in progress') {
      return { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
    }
    if (s === 'under-review' || s === 'under review') {
      return { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    }
    if (s === 'resolved' || s === 'ready') {
      return { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
    if (s === 'escalated') {
      return { label: 'Escalated', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
    }
    if (s === 'closed' || s === 'collected') {
      return { label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' };
    }
    if (s === 'diagnosing') {
      return { label: 'Diagnosing', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    }
    if (s === 'repairing') {
      return { label: 'Repairing', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
    }

    return { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' };
  };

  const info = getStatusInfo(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${info.color} ${sizeClasses[size]} font-semibold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
};

export default StatusBadge;