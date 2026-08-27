import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { LeaveRequest, LeaveType, Employee, User as UserType } from '@/demo-data/seedData';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  FileText,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Download,
  Building,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const LeaveDetailPage: React.FC = () => {
  const { slug, leaveId } = useParams<{ slug: string; leaveId: string }>();
  const navigate = useNavigate();

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant?.id);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, currentTenant?.id)
  );
  const [decisionNotes, setDecisionNotes] = useState('');

  const request = leaveRequests.find((r) => r.id === leaveId);

  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id);
  const leaveTypes = mockStorage.getTenantItems<LeaveType>(KEYS.LEAVE_TYPES, currentTenant?.id);

  const applicant = employees.find((e) => e.id === request?.employeeId || e.name === request?.employeeName);
  const leaveTypePolicy = leaveTypes.find((lt) => lt.id === request?.leaveTypeId || lt.name === request?.leaveTypeName);

  const reloadData = () => {
    setLeaveRequests(mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, currentTenant?.id));
  };

  const handleDecision = (newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    if (!request) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isBeforeStart = request.startDate >= todayStr;

    if (!isBeforeStart && newStatus !== request.status) {
      const proceed = window.confirm(
        `Note: The leave start date (${request.startDate}) is in the past. Are you sure you want to change this decision to ${newStatus}?`
      );
      if (!proceed) return;
    }

    mockStorage.updateTenantItem<LeaveRequest>(KEYS.LEAVE_REQUESTS, request.id, {
      status: newStatus,
    });

    mockStorage.addAuditLog(
      `LEAVE_DECISION_${newStatus}`,
      'LEAVE',
      request.id
    );

    if (newStatus === 'APPROVED') {
      toast.success(`🎉 Leave application for ${request.employeeName} APPROVED!`);
    } else if (newStatus === 'REJECTED') {
      toast.error(`❌ Leave application for ${request.employeeName} REJECTED.`);
    } else {
      toast.info(`🔄 Leave status reset to PENDING.`);
    }

    setDecisionNotes('');
    reloadData();
  };

  if (!request) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(`/${slug}/leave`)}
        >
          Back to Leave Management
        </Button>
        <Card className="p-12 text-center space-y-3 bg-white rounded-2xl shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Leave Application Not Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The requested leave application ID ({leaveId}) could not be located or may have been deleted.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6  mx-auto animate-in fade-in">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/${slug}/leave`)}
            className="shadow-2xs font-semibold"
          >
            Back to Leaves
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Leave Request #{request.id.slice(-6).toUpperCase()}
              </h1>
              <Badge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Applied on {new Date(request.appliedDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {/* Quick Admin Actions */}
        {isAdmin && request.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => handleDecision('APPROVED')}
            >
              Approve Leave
            </Button>
            <Button
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => handleDecision('REJECTED')}
            >
              Reject Leave
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Leave Details & Medical Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Overview Card */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Leave Period & Duration</h3>
              </div>
              <span className="font-bold text-indigo-700 text-sm bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                {request.leaveTypeName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase block">Start Date</span>
                <strong className="text-slate-900 font-semibold text-sm mt-0.5 block">{request.startDate}</strong>
              </div>

              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase block">End Date</span>
                <strong className="text-slate-900 font-semibold text-sm mt-0.5 block">{request.endDate}</strong>
              </div>

              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase block">Requested Days</span>
                <strong className="text-indigo-600 font-bold text-sm mt-0.5 block">
                  {request.requestedDays} {request.requestedDays === 1 ? 'Working Day' : 'Working Days'}
                </strong>
              </div>
            </div>

            {/* Purpose / Reason for Leave */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Purpose & Reason for Leave</span>
              </label>
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-normal">
                {request.reason || 'No detailed reason provided.'}
              </div>
            </div>
          </Card>

          {/* Attached Medical Document / Supporting Certificates */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Attached Document / File</h3>
              </div>
              {leaveTypePolicy?.requiresDoc && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  ⚠️ Policy Requirement
                </span>
              )}
            </div>

            {request.attachmentUrl ? (
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {request.attachmentName || 'Medical Certificate / Note'}
                      </p>
                      <span className="text-[11px] text-indigo-600 font-semibold">Supporting File Uploaded</span>
                    </div>
                  </div>

                  <a
                    href={request.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={request.attachmentName || `leave-${request.id}-document`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download</span>
                  </a>
                </div>

                {/* Inline Image Preview if Image attachment */}
                {request.attachmentUrl.startsWith('data:image/') && (
                  <div className="pt-2 border-t border-indigo-100">
                    <p className="text-[11px] text-slate-500 font-bold mb-2">Document Image Preview:</p>
                    <div className="rounded-xl border border-indigo-200/80 overflow-hidden max-h-64 bg-slate-900/5 flex items-center justify-center">
                      <img
                        src={request.attachmentUrl}
                        alt="Medical Certificate Preview"
                        className="max-h-64 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <Paperclip className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No medical documents or files attached to this request.</p>
              </div>
            )}
          </Card>

          {/* Admin Decision Note / Management Actions */}
          {isAdmin && (
            <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Manager / HR Decision Desk</h3>
              </div>

              <div className="space-y-3">
                <FormField label="Decision Notes & Comments" helperText="Add feedback or notes visible in audit logs">
                  <Input
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="e.g. Approved per medical note provided / Rejected due to team coverage"
                  />
                </FormField>

                <div className="flex items-center gap-2 pt-2">
                  {request.status !== 'APPROVED' && (
                    <Button
                      onClick={() => handleDecision('APPROVED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve Leave
                    </Button>
                  )}

                  {request.status !== 'REJECTED' && (
                    <Button
                      onClick={() => handleDecision('REJECTED')}
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold"
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Reject Leave
                    </Button>
                  )}

                  {request.status !== 'PENDING' && (
                    <Button
                      onClick={() => handleDecision('PENDING')}
                      variant="ghost"
                      className="text-slate-600 font-semibold"
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right 1 Column: Applicant & Policy Information */}
        <div className="space-y-6">
          {/* Applicant Profile Card */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Applicant Profile</span>
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {applicant?.avatarUrl ? (
                  <img src={applicant.avatarUrl} alt={request.employeeName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  request.employeeName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-slate-900 text-sm truncate">{request.employeeName}</h5>
                <span className="text-xs text-indigo-600 font-medium block">
                  {applicant?.employeeId || `ID: ${request.employeeId}`}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{applicant?.email || 'N/A'}</span>
              </div>
              {applicant?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{applicant.phone}</span>
                </div>
              )}
              {applicant?.workLocation && (
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{applicant.workLocation}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Leave Category Policy Information */}
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Leave Policy Rules</span>
            </h4>

            {leaveTypePolicy ? (
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Annual Quota</span>
                  <strong className="text-slate-900 font-bold">{leaveTypePolicy.annualAllowance} Days / Year</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Max Consecutive Days</span>
                  <strong className="text-slate-900 font-bold">{leaveTypePolicy.maxConsecutiveDays} Days</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Accrual Monthly Credit</span>
                  <strong className="text-slate-900 font-bold">+{leaveTypePolicy.monthlyCredit} Days / Month</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Medical Doc Required</span>
                  <strong className={leaveTypePolicy.requiresDoc ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                    {leaveTypePolicy.requiresDoc ? 'Yes (Medical Note Required)' : 'No (Optional)'}
                  </strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Standard company leave policy applies.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
