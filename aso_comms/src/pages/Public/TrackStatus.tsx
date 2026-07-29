// src/pages/Public/TrackStatus.tsx - Add API integration
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { trackAPI } from '../../api/track';

interface ComplaintData {
  id: string;
  ticketId: string;
  category: string;
  createdDate: string;
  status: 'pending' | 'in-progress' | 'under-review' | 'resolved' | 'escalated' | 'closed';
  subject: string;
  customer: string;
  sla: string;
  update: string;
  steps: {
    label: string;
    date: string;
    status: 'completed' | 'current' | 'pending';
  }[];
}

const TrackStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(!!id);
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTrackData(id);
    }
  }, [id]);

  const fetchTrackData = async (ticketId: string) => {
    try {
      setIsLoading(true);
      const response = await trackAPI.trackByTicket(ticketId);

      // Transform backend data to match your UI structure
      const repair = response.repair || response;
      const maskedCustomer = response.maskedCustomer || { name: 'Customer', phone: '**********' };

      // Map backend status to UI status
      const statusMap: Record<string, any> = {
        'Pending': 'pending',
        'Diagnosing': 'under-review',
        'Repairing': 'in-progress',
        'Ready': 'resolved',
        'Collected': 'closed'
      };

      // Build steps based on repair status
      const steps = [
        { label: 'Complaint Received', date: repair.createdAt || repair.dateLogged || 'N/A', status: 'completed' as const },
        { label: 'Assigned to Specialist', date: repair.updatedAt || repair.dateLogged || 'N/A', status: 'completed' as const },
        { label: 'Investigation / Processing', date: 'In Progress', status: 'current' as const },
        { label: 'Resolution & Final Response', date: 'Expected Completion', status: 'pending' as const }
      ];

      // Adjust steps based on actual status
      if (repair.status === 'Ready' || repair.status === 'Collected') {
        steps[2].status = 'completed';
        steps[3].status = 'current';
      }

      const data: ComplaintData = {
        id: repair.ticketId || repair._id,
        ticketId: repair.ticketId,
        category: 'Repair Status',
        createdDate: new Date(repair.dateLogged || repair.createdAt).toLocaleString(),
        status: statusMap[repair.status] || 'in-progress',
        subject: repair.deviceModel || 'Device Repair',
        customer: maskedCustomer.name || repair.customerName || 'Customer',
        sla: 'Estimated completion: ' + new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        update: `Status: ${repair.status}. ${repair.issueDescription || 'No additional notes.'}`,
        steps
      };

      setComplaintData(data);
      setShowResult(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No complaint found with this ID.');
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = trackingId.trim();

    if (!cleanInput) {
      setError('Please enter a tracking ID');
      return;
    }

    navigate(`/track/${cleanInput.replace('#', '')}`);
    await fetchTrackData(cleanInput.replace('#', ''));
  };

  // ... rest of your TrackStatus component stays the same (JSX)
};
export default TrackStatus;