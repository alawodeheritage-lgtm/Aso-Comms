// src/utils/statusMapper.ts
export const mapStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Pending': 'pending',
    'pending': 'pending',
    'In Progress': 'in-progress',
    'in-progress': 'in-progress',
    'Under Review': 'under-review',
    'under-review': 'under-review',
    'Resolved': 'resolved',
    'resolved': 'resolved',
    'Escalated': 'escalated',
    'escalated': 'escalated',
    'Closed': 'closed',
    'closed': 'closed',
    'Diagnosing': 'diagnosing',
    'diagnosing': 'diagnosing',
    'Repairing': 'repairing',
    'repairing': 'repairing',
    'Ready': 'ready',
    'ready': 'ready',
    'Collected': 'collected',
    'collected': 'collected'
  };
  return statusMap[status] || 'pending';
};