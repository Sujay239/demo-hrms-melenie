import React, { useState, useMemo } from 'react';
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
import {
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
  FileText,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Edit2,
  Trash2,
  HeartPulse,
  Layers,
  HelpCircle,
  Check,
  BookOpen,
  Search,
  Users,
  User,
} from 'lucide-react';

export const LeaveManagementPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Active tab: for Admin ('all' | 'approvals' | 'policies'), for Employee ('my' | 'policies')
  const [activeTab, setActiveTab] = useState<'all' | 'approvals' | 'my' | 'policies'>(
    isTenantAdmin ? 'all' : 'my'
  );

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeaveType | null>(null);

  // Apply Form state (Employee)
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Policy Form state (Admin)
  const [policyName, setPolicyName] = useState('');
  const [policyCode, setPolicyCode] = useState('');
  const [policyCategory, setPolicyCategory] = useState<'PAID' | 'SICK' | 'CASUAL' | 'PARENTAL' | 'UNPAID' | 'COMPENSATORY'>('PAID');
  const [annualAllowance, setAnnualAllowance] = useState<number>(18);
  const [monthlyCredit, setMonthlyCredit] = useState<number>(1.5);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState<number>(5);
  const [carryForwardLimit, setCarryForwardLimit] = useState<number>(5);
  const [policyDescription, setPolicyDescription] = useState('');
  const [requiresDoc, setRequiresDoc] = useState(false);

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() =>
    mockStorage.getTenantItems<LeaveType>(KEYS.LEAVE_TYPES, currentTenant.id)
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, currentTenant.id)
  );

  const reloadData = () => {
    setLeaveTypes(mockStorage.getTenantItems<LeaveType>(KEYS.LEAVE_TYPES, currentTenant.id));
    setLeaveRequests(mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, currentTenant.id));
  };

  const myRequests = useMemo(() => {
    return leaveRequests.filter(
      (r) =>
        r.employeeId === currentUser.id ||
        (r.employeeName && currentUser.name && r.employeeName.toLowerCase() === currentUser.name.toLowerCase())
    );
  }, [leaveRequests, currentUser]);

  const pendingApprovals = useMemo(() => {
    return leaveRequests.filter((r) => r.status === 'PENDING');
  }, [leaveRequests]);

  const approvedRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.status === 'APPROVED');
  }, [leaveRequests]);

  // Selected Leave Type in Apply Modal
  const activeLeaveTypeId = leaveTypeId || leaveTypes[0]?.id;
  const selectedTypeObj = leaveTypes.find((lt) => lt.id === activeLeaveTypeId) || leaveTypes[0];

  // Calculated Days
  const computedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // Balance calculation for current user
  const usedDaysForType = myRequests
    .filter((r) => r.leaveTypeId === selectedTypeObj?.id && (r.status === 'APPROVED' || r.status === 'PENDING'))
    .reduce((acc, r) => acc + (r.requestedDays || 0), 0);

  const remainingBalance = Math.max(0, (selectedTypeObj?.annualAllowance || 15) - usedDaysForType);
  const isExceedingBalance = computedDays > remainingBalance;
  const isExceedingConsecutive = selectedTypeObj ? computedDays > selectedTypeObj.maxConsecutiveDays : false;

  const handleOpenApplyModal = () => {
    setLeaveTypeId(leaveTypes[0]?.id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setIsApplyModalOpen(true);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (computedDays <= 0) {
      toast.error('End date must be on or after start date');
      return;
    }

    if (isExceedingBalance) {
      toast.error(`Insufficient Balance! You only have ${remainingBalance} days available for ${selectedTypeObj?.name || 'this category'}.`);
      return;
    }

    if (isExceedingConsecutive) {
      toast.error(`Policy Limit Exceeded! Maximum consecutive allowed days for ${selectedTypeObj.name} is ${selectedTypeObj.maxConsecutiveDays} days.`);
      return;
    }

    const newReq: LeaveRequest = {
      id: `lr-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      leaveTypeId: selectedTypeObj.id,
      leaveTypeName: selectedTypeObj.name,
      startDate,
      endDate,
      requestedDays: computedDays,
      reason: reason.trim(),
      status: 'PENDING',
      appliedDate: new Date().toISOString(),
    };

    mockStorage.addTenantItem<LeaveRequest>(KEYS.LEAVE_REQUESTS, newReq);
    mockStorage.addAuditLog('LEAVE_APPLIED', 'LEAVE', newReq.id);
    toast.success(`🎉 Leave application for ${computedDays} ${computedDays === 1 ? 'day' : 'days'} submitted!`);
    setIsApplyModalOpen(false);
    reloadData();
  };

  const handleChangeDecision = (request: LeaveRequest, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isBeforeStart = request.startDate >= todayStr;

    if (!isBeforeStart && newStatus !== request.status) {
      const proceed = window.confirm(
        `Note: The leave start date (${request.startDate}) is today or in the past. Are you sure you want to retroactively change this decision to ${newStatus}?`
      );
      if (!proceed) return;
    }

    mockStorage.updateTenantItem<LeaveRequest>(KEYS.LEAVE_REQUESTS, request.id, { status: newStatus });
    mockStorage.addAuditLog(`LEAVE_DECISION_UPDATED_${newStatus}`, 'LEAVE', request.id);

    if (newStatus === 'APPROVED') {
      toast.success(`🎉 Decision Updated: Leave for ${request.employeeName} marked as APPROVED.`);
    } else if (newStatus === 'REJECTED') {
      toast.error(`❌ Decision Updated: Leave for ${request.employeeName} marked as REJECTED.`);
    } else {
      toast.info(`🔄 Decision Reset: Leave for ${request.employeeName} reset to PENDING.`);
    }
    reloadData();
  };

  // Open Policy Configuration Modal (Admin)
  const handleOpenPolicyModal = (policy?: LeaveType) => {
    if (policy) {
      setEditingPolicy(policy);
      setPolicyName(policy.name);
      setPolicyCode(policy.code || '');
      setPolicyCategory(policy.category || 'PAID');
      setAnnualAllowance(policy.annualAllowance);
      setMonthlyCredit(policy.monthlyCredit);
      setMaxConsecutiveDays(policy.maxConsecutiveDays);
      setCarryForwardLimit(policy.carryForwardLimit || 5);
      setPolicyDescription(policy.description || '');
      setRequiresDoc(!!policy.requiresDoc);
    } else {
      setEditingPolicy(null);
      setPolicyName('');
      setPolicyCode('');
      setPolicyCategory('PAID');
      setAnnualAllowance(18);
      setMonthlyCredit(1.5);
      setMaxConsecutiveDays(5);
      setCarryForwardLimit(5);
      setPolicyDescription('');
      setRequiresDoc(false);
    }
    setIsPolicyModalOpen(true);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim()) {
      toast.error('Policy / Category Name is required');
      return;
    }

    if (annualAllowance <= 0) {
      toast.error('Annual allowance must be greater than 0');
      return;
    }

    if (maxConsecutiveDays <= 0) {
      toast.error('Max consecutive days must be greater than 0');
      return;
    }

    if (editingPolicy) {
      mockStorage.updateTenantItem<LeaveType>(KEYS.LEAVE_TYPES, editingPolicy.id, {
        name: policyName.trim(),
        code: policyCode.trim() || policyName.slice(0, 3).toUpperCase(),
        category: policyCategory,
        annualAllowance: Number(annualAllowance),
        monthlyCredit: Number(monthlyCredit) || 1.25,
        maxConsecutiveDays: Number(maxConsecutiveDays),
        carryForwardLimit: Number(carryForwardLimit) || 0,
        description: policyDescription.trim(),
        requiresDoc,
      });
      mockStorage.addAuditLog('LEAVE_POLICY_UPDATED', 'LEAVE_TYPE', editingPolicy.id);
      toast.success(`Leave policy "${policyName}" updated successfully!`);
    } else {
      const newPolicy: LeaveType = {
        id: `lt-${Date.now()}`,
        tenantId: currentTenant.id,
        name: policyName.trim(),
        code: policyCode.trim() || policyName.slice(0, 3).toUpperCase(),
        category: policyCategory,
        annualAllowance: Number(annualAllowance),
        monthlyCredit: Number(monthlyCredit) || 1.5,
        maxConsecutiveDays: Number(maxConsecutiveDays),
        carryForwardLimit: Number(carryForwardLimit) || 0,
        description: policyDescription.trim(),
        requiresDoc,
        status: 'ACTIVE',
      };
      mockStorage.addTenantItem<LeaveType>(KEYS.LEAVE_TYPES, newPolicy);
      mockStorage.addAuditLog('LEAVE_POLICY_CREATED', 'LEAVE_TYPE', newPolicy.id);
      toast.success(`🎉 New Leave category "${policyName}" created successfully!`);
    }

    setIsPolicyModalOpen(false);
    reloadData();
  };

  const handleDeletePolicy = (policy: LeaveType) => {
    if (leaveTypes.length <= 1) {
      toast.error('At least one leave policy must remain active.');
      return;
    }

    mockStorage.deleteTenantItem(KEYS.LEAVE_TYPES, policy.id);
    mockStorage.addAuditLog('LEAVE_POLICY_DELETED', 'LEAVE_TYPE', policy.id);
    toast.success(`Leave policy "${policy.name}" removed.`);
    reloadData();
  };

  // Filtered All Company Requests
  const filteredAllRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.reason && r.reason.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || r.leaveTypeId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [leaveRequests, searchTerm, statusFilter, categoryFilter]);

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'employeeName',
      header: 'Applicant',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span>{r.employeeName}</span>
            {r.employeeId === currentUser.id && (
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                You
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">Applied {new Date(r.appliedDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'leaveTypeName',
      header: 'Leave Category',
      render: (r) => (
        <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
          {r.leaveTypeName}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Dates / Duration',
      render: (r) => (
        <span className="text-xs text-slate-800 font-medium">
          {r.startDate} to {r.endDate}{' '}
          <strong className="text-indigo-600 font-bold">
            ({r.requestedDays} {r.requestedDays === 1 ? 'day' : 'days'})
          </strong>
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <span className="text-xs text-slate-600 truncate max-w-xs block">{r.reason}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Decision & Actions',
      className: 'text-right',
      render: (r) => {
        if (!isTenantAdmin) return null;

        const todayStr = new Date().toISOString().split('T')[0];
        const isBeforeStart = r.startDate >= todayStr;

        if (r.status === 'PENDING') {
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs font-semibold"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleChangeDecision(r, 'APPROVED')}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => handleChangeDecision(r, 'REJECTED')}
              >
                Reject
              </Button>
            </div>
          );
        }

        if (r.status === 'APPROVED') {
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              {isBeforeStart ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleChangeDecision(r, 'REJECTED')}
                    title="Mistakenly approved? Change to Rejected before leave starts"
                  >
                    Change to Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-700 text-xs"
                    onClick={() => handleChangeDecision(r, 'PENDING')}
                    title="Reset back to Pending"
                  >
                    Reset
                  </Button>
                </>
              ) : (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                  Approved (Active / Past)
                </span>
              )}
            </div>
          );
        }

        if (r.status === 'REJECTED') {
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              {isBeforeStart ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs font-semibold"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => handleChangeDecision(r, 'APPROVED')}
                    title="Mistakenly rejected? Change to Approved before leave starts"
                  >
                    Change to Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-700 text-xs"
                    onClick={() => handleChangeDecision(r, 'PENDING')}
                    title="Reset back to Pending"
                  >
                    Reset
                  </Button>
                </>
              ) : (
                <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                  Rejected (Past)
                </span>
              )}
            </div>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Time-Off Ledger & Policy Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isTenantAdmin
              ? `Manage company leave categories, annual allowances, maximum consecutive days, and audit all employee applications for ${currentTenant.name}.`
              : `View your leave quotas, remaining balances, and apply for time-off according to company policies.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isTenantAdmin ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenPolicyModal()}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
            >
               Configure Leave Category
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenApplyModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
            >
              Apply for Leave
            </Button>
          )}
        </div>
      </div>

      {/* ADMIN KPI OVERVIEW vs EMPLOYEE PERSONAL BALANCE CARDS */}
      {isTenantAdmin ? (
        /* Company Admin KPI Stats Cards */
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-indigo-600 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leave Requests</p>
            <h3 className="text-2xl font-bold text-slate-900">{leaveRequests.length}</h3>
            <p className="text-[11px] text-slate-400">All submitted employee requests</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</h3>
            <p className="text-[11px] text-slate-400">Awaiting manager/HR action</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-600 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Requests</p>
            <h3 className="text-2xl font-bold text-emerald-600">{approvedRequests.length}</h3>
            <p className="text-[11px] text-slate-400">Active time-off grants</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-600 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configured Categories</p>
            <h3 className="text-2xl font-bold text-purple-600">{leaveTypes.length}</h3>
            <p className="text-[11px] text-slate-400">Active company quota rules</p>
          </Card>
        </div>
      ) : (
        /* Employee Personal Quota Balances Cards */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {leaveTypes.map((lt) => {
            const used = myRequests
              .filter((r) => r.leaveTypeId === lt.id && (r.status === 'APPROVED' || r.status === 'PENDING'))
              .reduce((acc, r) => acc + (r.requestedDays || 0), 0);
            const available = Math.max(0, lt.annualAllowance - used);
            const percentage = Math.min(100, Math.round((available / lt.annualAllowance) * 100));

            return (
              <Card key={lt.id} className="p-4 border-l-4 border-l-indigo-600 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{lt.name}</p>
                      {lt.category && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {lt.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <h3 className="text-2xl font-bold text-slate-900">{available}</h3>
                      <span className="text-xs text-slate-400 font-medium">/ {lt.annualAllowance} Days Available</span>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Accrual: {lt.monthlyCredit} days / mo</span>
                    <span className="font-semibold text-slate-600">Max: {lt.maxConsecutiveDays} consecutive</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {isTenantAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Company Leave Applications ({leaveRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'approvals' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pending Approvals Queue</span>
              {pendingApprovals.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Company Leave Categories & Quotas ({leaveTypes.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'my' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Leave Applications ({myRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Company Leave Categories & Rules ({leaveTypes.length})</span>
            </button>
          </>
        )}
      </div>

      {/* TAB CONTENT: 1. ALL COMPANY LEAVE REQUESTS (ADMIN) */}
      {activeTab === 'all' && isTenantAdmin && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by employee name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories ({leaveTypes.length})</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredAllRequests}
            keyExtractor={(r) => r.id}
            emptyTitle="No company leave requests found"
            emptyDescription="Try adjusting search or status filters."
          />
        </div>
      )}

      {/* TAB CONTENT: 2. PENDING APPROVALS QUEUE (ADMIN) */}
      {activeTab === 'approvals' && isTenantAdmin && (
        <div className="space-y-4 animate-in fade-in">
          <DataTable
            columns={columns}
            data={pendingApprovals}
            keyExtractor={(r) => r.id}
            emptyTitle="No pending leave applications"
            emptyDescription="All employee leave requests have been reviewed."
          />
        </div>
      )}

      {/* TAB CONTENT: 3. MY LEAVE APPLICATIONS (EMPLOYEE ONLY) */}
      {activeTab === 'my' && !isTenantAdmin && (
        <div className="space-y-4 animate-in fade-in">
          <DataTable
            columns={columns}
            data={myRequests}
            keyExtractor={(r) => r.id}
            emptyTitle="No personal leave applications yet"
            emptyDescription="Click 'Apply for Leave' at the top to submit a time-off request."
          />
        </div>
      )}

      {/* TAB CONTENT: 4. POLICIES & QUOTA RULES */}
      {activeTab === 'policies' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Company Leave Categories & Quota Rules</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTenantAdmin
                  ? 'Set annual allotments, monthly accruals, and maximum consecutive days per category.'
                  : 'Company standard leave categories, allowances, and consecutive days rules.'}
              </p>
            </div>
            {isTenantAdmin && (
              <Button
                size="sm"
                onClick={() => handleOpenPolicyModal()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Add New Leave Category
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((policy) => (
              <Card key={policy.id} className="p-4 border border-slate-200 space-y-3 shadow-xs bg-white rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{policy.name}</h4>
                      {policy.code && (
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {policy.code}
                        </span>
                      )}
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {policy.category || 'PAID'}
                    </span>
                  </div>

                  {isTenantAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-indigo-600 p-1.5"
                        onClick={() => handleOpenPolicyModal(policy)}
                        title="Edit Policy"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-600 p-1.5"
                        onClick={() => handleDeletePolicy(policy)}
                        title="Delete Policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {policy.description && (
                  <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                    {policy.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Annual Allotment</span>
                    <strong className="text-slate-900 font-bold">{policy.annualAllowance} Days</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Max Consecutive</span>
                    <strong className="text-indigo-600 font-bold">{policy.maxConsecutiveDays} Days</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Monthly Accrual</span>
                    <strong className="text-slate-900">{policy.monthlyCredit}d / mo</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* APPLY FOR LEAVE MODAL (EMPLOYEE)                             */}
      {/* ============================================================ */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        maxWidth="lg"
        title="Apply for Leave"
        description="Submit your leave application. Duration is checked against company category quotas."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyLeave}
              disabled={isExceedingBalance || isExceedingConsecutive || computedDays <= 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Submit Application
            </Button>
          </>
        }
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <FormField label="Select Leave Category / Type" required>
            <Select
              value={activeLeaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              options={leaveTypes.map((lt) => ({
                value: lt.id,
                label: `${lt.name} — ${lt.annualAllowance} days/yr (Max ${lt.maxConsecutiveDays} consecutive allowed)`,
              }))}
            />
          </FormField>

          {selectedTypeObj?.description && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-indigo-950 font-bold">{selectedTypeObj.name} Policy Guidelines</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">{selectedTypeObj.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Leave Start Date" required>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Leave End Date" required>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          {/* Live Duration & Policy Validation Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Requested Duration:</span>
              <strong className="text-slate-900 font-bold text-sm font-mono">
                {computedDays} {computedDays === 1 ? 'Working Day' : 'Working Days'}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400 block">Remaining Category Balance:</span>
                <strong className="text-emerald-700 font-bold">{remainingBalance} Days Available</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Max Consecutive Rule:</span>
                <strong className="text-indigo-700 font-bold">{selectedTypeObj?.maxConsecutiveDays} Days Max</strong>
              </div>
            </div>

            {isExceedingBalance && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 flex items-center gap-2 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Requested days ({computedDays}) exceed your remaining balance ({remainingBalance} days).</span>
              </div>
            )}

            {isExceedingConsecutive && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-2 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Policy Limit: Maximum consecutive days allowed for {selectedTypeObj?.name} is{' '}
                  {selectedTypeObj?.maxConsecutiveDays} days.
                </span>
              </div>
            )}
          </div>

          <FormField label="Reason for Leave" required helperText="Briefly explain the purpose of your time off">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family vacation / Medical consultation"
              required
            />
          </FormField>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* CONFIGURE POLICY MODAL (FOR ADMIN)                           */}
      {/* ============================================================ */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        maxWidth="2xl"
        title={editingPolicy ? `Edit Leave Policy: ${editingPolicy.name}` : 'Configure New Leave Category & Policy'}
        description="Establish company leave quotas, maximum consecutive limits, and accrual rates."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPolicyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {editingPolicy ? 'Save Policy Changes' : 'Create Leave Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <FormField label="Leave Category Name" required helperText="e.g. Paid Time Off (PTO), Sick Leave, Sabbatical">
                <Input
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g. Paid Vacation (PTO)"
                  required
                />
              </FormField>
            </div>

            <FormField label="Short Code" helperText="e.g. PTO, SICK, CL">
              <Input
                value={policyCode}
                onChange={(e) => setPolicyCode(e.target.value.toUpperCase())}
                placeholder="e.g. PTO"
                maxLength={6}
              />
            </FormField>
          </div>

          <FormField label="Classification Class" required>
            <Select
              value={policyCategory}
              onChange={(e) => setPolicyCategory(e.target.value as any)}
              options={[
                { value: 'PAID', label: 'PAID — Regular Paid Time Off' },
                { value: 'SICK', label: 'SICK — Medical & Health Leave' },
                { value: 'CASUAL', label: 'CASUAL — Personal / Casual Leave' },
                { value: 'PARENTAL', label: 'PARENTAL — Maternity / Paternity' },
                { value: 'COMPENSATORY', label: 'COMPENSATORY — Comp-Off Credit' },
                { value: 'UNPAID', label: 'UNPAID — Sabbatical / Leave Without Pay' },
              ]}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <FormField label="Annual Allowance (Number of Leaves / Year)" required helperText="Total quota granted per employee per year">
              <Input
                type="number"
                min="1"
                max="180"
                value={annualAllowance}
                onChange={(e) => setAnnualAllowance(Number(e.target.value))}
                required
              />
            </FormField>

            <FormField label="Max Consecutive Days Allowed" required helperText="Maximum days an employee can take in a single request">
              <Input
                type="number"
                min="1"
                max="90"
                value={maxConsecutiveDays}
                onChange={(e) => setMaxConsecutiveDays(Number(e.target.value))}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Monthly Accrual Rate (Days / Month)" required helperText="Accrued per month of service">
              <Input
                type="number"
                step="0.25"
                min="0"
                max="10"
                value={monthlyCredit}
                onChange={(e) => setMonthlyCredit(Number(e.target.value))}
                required
              />
            </FormField>

            <FormField label="Carry Forward Limit (Days)" helperText="Unused days carried over to next calendar year">
              <Input
                type="number"
                min="0"
                max="60"
                value={carryForwardLimit}
                onChange={(e) => setCarryForwardLimit(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormField label="Policy Guidelines / Instructions to Employees" helperText="Shown to employees when applying for this leave type">
            <Input
              value={policyDescription}
              onChange={(e) => setPolicyDescription(e.target.value)}
              placeholder="e.g. Must be requested at least 3 days in advance. Requires manager confirmation."
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
