import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { AttendanceRecord, OvertimeRequest } from '@/demo-data/seedData';
import { Clock, Play, Square, Plus } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  // Overtime Modal
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otMinutes, setOtMinutes] = useState('120');
  const [otReason, setOtReason] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const attendance = mockStorage.getTenantItems<AttendanceRecord>(KEYS.ATTENDANCE, currentTenant.id);
  const overtime = mockStorage.getTenantItems<OvertimeRequest>(KEYS.OVERTIME, currentTenant.id);

  const handleClockToggle = () => {
    if (!isClockedIn) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsClockedIn(true);
      setClockInTime(now);

      mockStorage.addTenantItem<AttendanceRecord>(KEYS.ATTENDANCE, {
        id: `att-${Date.now()}`,
        tenantId: currentTenant.id,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        clockInTime: now,
        totalMinutes: 0,
        status: 'PRESENT',
      });

      mockStorage.addAuditLog('EMPLOYEE_CLOCK_IN', 'ATTENDANCE', `att-${Date.now()}`);
      toast.success(`Clocked in successfully at ${now}`);
    } else {
      setIsClockedIn(false);
      mockStorage.addAuditLog('EMPLOYEE_CLOCK_OUT', 'ATTENDANCE', `att-${Date.now()}`);
      toast.success('Clocked out successfully!');
    }
  };

  const handleRequestOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otReason) {
      toast.error('Overtime reason is required');
      return;
    }

    mockStorage.addTenantItem<OvertimeRequest>(KEYS.OVERTIME, {
      id: `ot-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      requestedMinutes: parseInt(otMinutes, 10),
      reason: otReason,
      status: 'PENDING',
    });

    toast.success('Overtime request submitted for manager approval');
    setIsOtModalOpen(false);
    setOtReason('');
  };

  const handleOtApprove = (id: string, status: 'APPROVED' | 'REJECTED') => {
    mockStorage.updateTenantItem<OvertimeRequest>(KEYS.OVERTIME, id, { status });
    toast.success(`Overtime request ${status.toLowerCase()}`);
  };

  const attColumns: Column<AttendanceRecord>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900">{a.employeeName}</div>
          <div className="text-xs text-slate-400">{a.date}</div>
        </div>
      ),
    },
    {
      key: 'clockInTime',
      header: 'Clock In',
      render: (a) => <span className="font-mono text-xs text-slate-700">{a.clockInTime || '--'}</span>,
    },
    {
      key: 'clockOutTime',
      header: 'Clock Out',
      render: (a) => <span className="font-mono text-xs text-slate-700">{a.clockOutTime || '--'}</span>,
    },
    {
      key: 'totalMinutes',
      header: 'Working Duration',
      render: (a) => (
        <span className="text-xs font-medium text-slate-700">
          {Math.floor(a.totalMinutes / 60)}h {a.totalMinutes % 60}m
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <Badge status={a.status as any} />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance & Overtime</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Clock in/out events, attendance records, correction logs, and overtime requests.
          </p>
        </div>

        <Button onClick={() => setIsOtModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Request Overtime
        </Button>
      </div>

      {/* Clocking Hero Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-0 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/30">
              Authoritative Server Timestamp Clock
            </span>
            <h3 className="text-2xl font-bold mt-2">
              {isClockedIn ? `Currently Clocked In since ${clockInTime}` : 'You are currently Clocked Out'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Time zone: {currentTenant.defaultRegionId} • Invariant checks prevent double clocking
            </p>
          </div>

          <Button
            variant={isClockedIn ? 'destructive' : 'primary'}
            size="lg"
            leftIcon={isClockedIn ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            onClick={handleClockToggle}
            className="shrink-0"
          >
            {isClockedIn ? 'Clock Out Now' : 'Clock In Now'}
          </Button>
        </div>
      </Card>

      {/* Attendance Records Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Attendance Log</h3>
        <DataTable
          columns={attColumns}
          data={attendance}
          keyExtractor={(a) => a.id}
          emptyTitle="No attendance records"
          emptyDescription="Clock in to record your daily working hours."
        />
      </div>

      {/* Overtime Requests Table */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-900">Overtime Requests</h3>
        <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-xs">
          {overtime.map((ot) => (
            <div key={ot.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{ot.employeeName}</span>
                  <Badge variant="indigo" size="sm">{ot.requestedMinutes} mins</Badge>
                  <Badge status={ot.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Date: {ot.date} • Reason: {ot.reason}
                </p>
              </div>

              {ot.status === 'PENDING' && isTenantAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200"
                    onClick={() => handleOtApprove(ot.id, 'APPROVED')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200"
                    onClick={() => handleOtApprove(ot.id, 'REJECTED')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Request Overtime Modal */}
      <Modal
        isOpen={isOtModalOpen}
        onClose={() => setIsOtModalOpen(false)}
        title="Request Overtime Approval"
        description="Submit additional working duration with justification."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOtModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestOvertime}>Submit Overtime Request</Button>
          </>
        }
      >
        <form onSubmit={handleRequestOvertime} className="space-y-4">
          <FormField label="Requested Duration (Minutes)" required>
            <Select
              value={otMinutes}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOtMinutes(e.target.value)}
              options={[
                { value: '60', label: '60 minutes (1 hour)' },
                { value: '120', label: '120 minutes (2 hours)' },
                { value: '180', label: '180 minutes (3 hours)' },
                { value: '240', label: '240 minutes (4 hours)' },
              ]}
            />
          </FormField>

          <FormField label="Reason for Overtime" required>
            <Input
              value={otReason}
              onChange={(e) => setOtReason(e.target.value)}
              placeholder="e.g. Critical production release deployment"
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
