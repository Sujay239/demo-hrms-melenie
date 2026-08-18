import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { LeaveRequest, LeaveType } from '@/demo-data/seedData';
import { Plus, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const LeaveManagementPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'my' | 'approvals' | 'policies'>('my');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form states
  const [leaveTypeId, setLeaveTypeId] = useState('lt-pto');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();

  const isTenantAdmin = currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const leaveTypes = mockStorage.getTenantItems<LeaveType>(KEYS.LEAVE_TYPES, currentTenant.id);
  const leaveRequests = mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, currentTenant.id);

  const myRequests = leaveRequests.filter((r) => r.employeeId === currentUser.id);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Dates and reason are required');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const selectedType = leaveTypes.find((lt) => lt.id === leaveTypeId);

    mockStorage.addTenantItem<LeaveRequest>(KEYS.LEAVE_REQUESTS, {
      id: `lr-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      leaveTypeId,
      leaveTypeName: selectedType?.name || 'PTO',
      startDate,
      endDate,
      requestedDays: diffDays,
      reason,
      status: 'PENDING',
      appliedDate: new Date().toISOString(),
    });

    toast.success('Leave application submitted for manager approval!');
    setIsApplyModalOpen(false);
    setReason('');
  };

  const handleApprovalAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    mockStorage.updateTenantItem<LeaveRequest>(KEYS.LEAVE_REQUESTS, id, { status });
    mockStorage.addAuditLog(`LEAVE_REQUEST_${status}`, 'LEAVE', id);
    toast.success(`Leave request ${status.toLowerCase()}!`);
    // rerender
    setActiveTab(activeTab);
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'employeeName',
      header: 'Applicant',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900">{r.employeeName}</div>
          <div className="text-xs text-slate-400">Applied {new Date(r.appliedDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'leaveTypeName',
      header: 'Leave Type',
      render: (r) => <Badge variant="indigo">{r.leaveTypeName}</Badge>,
    },
    {
      key: 'dates',
      header: 'Dates / Duration',
      render: (r) => (
        <span className="text-xs text-slate-700 font-medium">
          {r.startDate} to {r.endDate} ({r.requestedDays} {r.requestedDays === 1 ? 'day' : 'days'})
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <span className="text-xs text-slate-600 truncate max-w-xs">{r.reason}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (r) =>
        r.status === 'PENDING' && isTenantAdmin ? (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleApprovalAction(r.id, 'APPROVED')}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
              onClick={() => handleApprovalAction(r.id, 'REJECTED')}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configurable leave policies, balances, applications, and manager approvals.
          </p>
        </div>
        <Button onClick={() => setIsApplyModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Apply for Leave
        </Button>
      </div>

      {/* Balances Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaveTypes.map((lt) => (
          <Card key={lt.id} className="border-l-4 border-l-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{lt.name}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {lt.annualAllowance - 3} / {lt.annualAllowance}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Monthly Credit: {lt.monthlyCredit} days • Max consecutive: {lt.maxConsecutiveDays} days
            </p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'my' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Applications ({myRequests.length})
        </button>
        {isTenantAdmin && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'approvals' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Approvals ({leaveRequests.filter((r) => r.status === 'PENDING').length})
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={activeTab === 'my' ? myRequests : leaveRequests}
        keyExtractor={(r) => r.id}
        emptyTitle="No leave applications"
        emptyDescription="Apply for leave to track balance debits and manager decisions."
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        description="Submit leave interval for policy validation and manager approval."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyLeave}>Submit Application</Button>
          </>
        }
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <FormField label="Leave Type" required>
            <Select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              options={leaveTypes.map((lt) => ({
                value: lt.id,
                label: `${lt.name} (Max ${lt.maxConsecutiveDays} days)`,
              }))}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </FormField>
            <FormField label="End Date" required>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Reason for Leave" required>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Personal commitment / Medical checkup"
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
