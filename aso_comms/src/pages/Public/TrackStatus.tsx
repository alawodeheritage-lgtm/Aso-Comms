// src/pages/Public/TrackStatus.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { trackAPI } from '../../api/track';

interface RepairData {
  ticketId: string;
  deviceModel: string;
  issueDescription: string;
  status: string;
  priority: string;
  dateLogged: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  paymentStatus: string;
  estimatedCompletion: string;
  maskedCustomer: {
    name: string;
    phone: string;
    email: string;
  };
}

const TrackStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [repairData, setRepairData] = useState<RepairData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTrackData(id);
    }
  }, [id]);

  const fetchTrackData = async (ticketId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await trackAPI.trackByTicket(ticketId);
      if (response.success && response.repair) {
        setRepairData(response.repair);
      } else {
        setError('No repair found with that ID.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to fetch status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = trackingId.trim().toUpperCase();
    if (!cleanInput) {
      setError('Please enter a tracking ID');
      return;
    }
    navigate(`/track/${cleanInput}`);
  };

  // If we are on the results page (has id)
  if (id) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-3 text-sm font-medium text-slate-500">Looking up your repair...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-red-600 text-4xl">error</span>
            <p className="text-sm font-medium text-red-600 mt-2">{error}</p>
            <Link
              to="/track"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-bold text-sm"
            >
              ← Try another ID
            </Link>
          </div>
        </div>
      );
    }

    if (!repairData) return null;

    // Build status steps based on repair status
    const getSteps = (status: string) => {
      const allSteps = [
        { label: 'Repair Request Received', icon: 'assignment', description: 'Your request has been logged' },
        { label: 'Device Diagnosis', icon: 'medical_services', description: 'Technician is inspecting your device' },
        { label: 'Repair in Progress', icon: 'build', description: 'Your device is being repaired' },
        { label: 'Ready for Collection', icon: 'check_circle', description: 'Repair complete, ready for pickup' },
      ];
      const statusMap: Record<string, number> = {
        'Pending': 0,
        'Diagnosing': 1,
        'Repairing': 2,
        'Ready': 3,
        'Collected': 3,
      };
      const currentIndex = statusMap[status] ?? 0;
      return allSteps.map((step, idx) => ({
        ...step,
        status: idx < currentIndex ? 'completed' : idx === currentIndex ? 'current' : 'pending',
      }));
    };

    const steps = getSteps(repairData.status);
    const statusMap: Record<string, string> = {
      'Pending': 'pending',
      'Diagnosing': 'under-review',
      'Repairing': 'in-progress',
      'Ready': 'resolved',
      'Collected': 'closed',
    };

    const priorityColors: Record<string, string> = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-amber-600 bg-amber-50',
      low: 'text-blue-600 bg-blue-50',
    };

    const statusColors: Record<string, string> = {
      Pending: 'bg-blue-100 text-blue-800 border-blue-200',
      Diagnosing: 'bg-amber-100 text-amber-800 border-amber-200',
      Repairing: 'bg-purple-100 text-purple-800 border-purple-200',
      Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Collected: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium mb-6 group"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Search another ticket
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
            {/* Header - Gradient */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-6 py-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl">construction</span>
                    <h1 className="text-xl font-bold tracking-tight">Repair Status</h1>
                  </div>
                  <p className="text-blue-100 text-sm mt-0.5 font-medium">
                    Ticket: <span className="font-mono font-bold text-white">{repairData.ticketId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColors[repairData.status] || 'bg-slate-100 text-slate-800'}`}>
                    {repairData.status}
                  </span>
                  <span className="material-symbols-outlined text-white/80 text-sm">calendar_month</span>
                  <span className="text-sm text-blue-100">
                    {new Date(repairData.dateLogged).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Customer & Device Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</h3>
                  </div>
                  <p className="text-base font-semibold text-slate-800">{repairData.maskedCustomer.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-400">phone</span>
                      {repairData.maskedCustomer.phone}
                    </span>
                    {repairData.maskedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
                        {repairData.maskedCustomer.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-base">devices</span>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Device</h3>
                  </div>
                  <p className="text-base font-semibold text-slate-800">{repairData.deviceModel}</p>
                  <p className="text-sm text-slate-600 mt-1">{repairData.issueDescription || 'No issue description provided.'}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColors[repairData.priority] || 'bg-slate-100 text-slate-600'}`}>
                      Priority: {repairData.priority || 'medium'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${repairData.paymentStatus === 'Paid in Full' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {repairData.paymentStatus || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-base">timeline</span>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress Timeline</h3>
                </div>
                <div className="space-y-0">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {/* Connector line */}
                      {idx < steps.length - 1 && (
                        <div className={`absolute left-4 top-9 w-0.5 h-[calc(100%-1rem)] ${step.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      )}
                      {/* Icon */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === 'completed' ? 'bg-emerald-500 text-white' :
                          step.status === 'current' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' :
                            'bg-slate-200 text-slate-400'
                        }`}>
                        <span className="material-symbols-outlined text-base">
                          {step.status === 'completed' ? 'check' : step.status === 'current' ? 'radio_button_checked' : step.icon}
                        </span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                            {step.label}
                          </p>
                          {step.status === 'current' && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              In Progress
                            </span>
                          )}
                          {step.status === 'completed' && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Done
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated completion */}
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-center">
                <p className="text-sm text-slate-600">
                  <span className="material-symbols-outlined text-sm align-middle text-blue-500">schedule</span>
                  Estimated completion: <span className="font-bold text-slate-800">{new Date(repairData.estimatedCompletion).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Repair times are estimates and may vary based on parts availability.</p>
              </div>

              {/* Print button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Print this page
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <p>This information is provided for tracking purposes only. Contact us for any questions.</p>
          </div>
        </div>
      </div>
    );
  }

  // Default view: the search form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-3xl text-white">search</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">Track Your Repair</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your ticket ID to check the current status</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTrack}>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">confirmation_number</span>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. ASO-2026-12345"
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Searching...
                </>
              ) : (
                <>
                  Track Status
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400">
              Your ticket ID is provided on your repair receipt or confirmation email.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              For privacy, customer details are partially masked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackStatus;