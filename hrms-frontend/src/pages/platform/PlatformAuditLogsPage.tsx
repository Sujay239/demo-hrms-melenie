import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { PlatformAuditLog, Tenant } from '@/demo-data/seedData';
import {
  ShieldAlert,
  Search,
  Download,
  RefreshCw,
  Calendar,
  User,
  Building2,
  Lock,
  Clock,
  Eye,
  Filter,
  Users2,
  CheckCircle2,
  FileJson,
} from 'lucide-react';

const CATEGORY_BADGES: Record<
  PlatformAuditLog['category'],
  { label: string; variant: 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' }
> = {
  AUTH_LOGIN: { label: 'Auth & Login', variant: 'sky' },
  TENANT_MGMT: { label: 'Company Mgmt', variant: 'emerald' },
  CONSULTANT_MGMT: { label: 'Consultant Mgmt', variant: 'indigo' },
  STRUCTURE_EVENT: { label: 'Company Structure', variant: 'amber' },
  SECURITY: { label: 'Security & Config', variant: 'rose' },
};

const ROLE_BADGES: Record<
  PlatformAuditLog['actorRole'],
  { label: string; variant: 'rose' | 'indigo' | 'neutral' }
> = {
  SUPER_ADMIN: { label: 'Super Admin', variant: 'rose' },
  CONSULTANT: { label: 'Consultant', variant: 'indigo' },
  TENANT_ADMIN: { label: 'Company Admin', variant: 'neutral' },
};

export const PlatformAuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(() =>
    mockStorage.getTenantItems<PlatformAuditLog>(KEYS.PLATFORM_AUDIT_LOGS)
  );

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedDetailLog, setSelectedDetailLog] = useState<PlatformAuditLog | null>(null);

  const reloadLogs = () => {
    setAuditLogs(mockStorage.getTenantItems<PlatformAuditLog>(KEYS.PLATFORM_AUDIT_LOGS));
    toast.success('Audit logs refreshed');
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.tenantName && log.tenantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.ipAddress && log.ipAddress.includes(searchTerm));

      const matchCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchRole = roleFilter === 'ALL' || log.actorRole === roleFilter;

      return matchSearch && matchCategory && matchRole;
    });
  }, [auditLogs, searchTerm, categoryFilter, roleFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = auditLogs.length;
    const authLogins = auditLogs.filter((l) => l.category === 'AUTH_LOGIN').length;
    const companyMgmt = auditLogs.filter((l) => l.category === 'TENANT_MGMT' || l.category === 'STRUCTURE_EVENT').length;
    const consultantActions = auditLogs.filter((l) => l.category === 'CONSULTANT_MGMT' || l.actorRole === 'CONSULTANT').length;
    return { total, authLogins, companyMgmt, consultantActions };
  }, [auditLogs]);

  // Export Audit Logs to JSON file download
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `platform-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('🎉 Platform audit logs exported to JSON file!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Compliance & Audit Trail</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Audit Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor high-level logins/logouts, consultant activities, tenant creations, and office structure changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={reloadLogs}
            leftIcon={<RefreshCw className="w-4 h-4 text-slate-600" />}
            className="font-semibold"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleExportJSON}
            leftIcon={<FileJson className="w-4 h-4" />}
            className="bg-slate-900 hover:bg-slate-800 font-bold shadow-xs"
          >
            Export JSON File
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Logged Events</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.total}</p>
          <span className="text-[11px] text-slate-400 font-medium">Platform-wide audit scope</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Auth & Login Events</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.authLogins}</p>
          <span className="text-[11px] text-slate-400 font-medium">Super Admin & Consultant logins</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Company & Office Events</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.companyMgmt}</p>
          <span className="text-[11px] text-slate-400 font-medium">Tenant & office region additions</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Consultant Activities</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.consultantActions}</p>
          <span className="text-[11px] text-slate-400 font-medium">Assignments & session logs</span>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by actor, email, company, or details..."
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs"
            options={[
              { value: 'ALL', label: 'All Event Categories' },
              { value: 'AUTH_LOGIN', label: '🔑 Auth & Login/Logout' },
              { value: 'TENANT_MGMT', label: '🏢 Company Management' },
              { value: 'CONSULTANT_MGMT', label: '👥 Consultant Actions' },
              { value: 'STRUCTURE_EVENT', label: '📍 Office & Department Structure' },
              { value: 'SECURITY', label: '🔒 Security Policy Changes' },
            ]}
          />

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs"
            options={[
              { value: 'ALL', label: 'All Actor Roles' },
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
              { value: 'CONSULTANT', label: 'Consultant' },
              { value: 'TENANT_ADMIN', label: 'Company Admin' },
            ]}
          />
        </div>
      </Card>

      {/* Audit Logs List / Table */}
      {filteredLogs.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50/50 border border-slate-200/80 rounded-2xl">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Platform Audit Logs Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm || categoryFilter !== 'ALL' || roleFilter !== 'ALL'
              ? 'No audit log records match your current filter parameters. Try clearing search filters.'
              : 'Audit events will automatically record here as Super Admins, Consultants, and Tenant Admins interact with the system.'}
          </p>
        </Card>
      ) : (
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Actor / Email</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Company / Details</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => {
                  const catBadge = CATEGORY_BADGES[log.category] || CATEGORY_BADGES.AUTH_LOGIN;
                  const rBadge = ROLE_BADGES[log.actorRole] || ROLE_BADGES.TENANT_ADMIN;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={catBadge.variant}>{catBadge.label}</Badge>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase shrink-0">
                            {log.actorName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{log.actorName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge size="sm" variant={rBadge.variant}>
                                {rBadge.label}
                              </Badge>
                              <span className="text-[11px] text-slate-400 font-mono">{log.actorEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-bold rounded border border-slate-200 font-mono">
                          {log.action}
                        </span>
                      </td>

                      {/* Details & Target Company */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {log.tenantName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded border border-indigo-100 mb-1">
                            <Building2 className="w-3 h-3" />
                            <span>{log.tenantName}</span>
                          </span>
                        )}
                        <p className="text-slate-700 text-xs line-clamp-1 leading-snug">{log.details}</p>
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDetailLog(log)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                          className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: VIEW AUDIT LOG INSPECT DETAILS */}
      <Modal
        isOpen={!!selectedDetailLog}
        onClose={() => setSelectedDetailLog(null)}
        title={selectedDetailLog ? `Audit Event: ${selectedDetailLog.action}` : 'Audit Event Details'}
        description="Full metadata payload for this platform audit trail entry."
        maxWidth="2xl"
      >
        {selectedDetailLog && (
          <div className="space-y-4 text-xs pt-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={CATEGORY_BADGES[selectedDetailLog.category]?.variant || 'sky'}>
                  {CATEGORY_BADGES[selectedDetailLog.category]?.label || selectedDetailLog.category}
                </Badge>
                <span className="px-2.5 py-0.5 bg-white text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 font-mono">
                  {selectedDetailLog.id}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(selectedDetailLog.timestamp).toISOString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Actor Information
                </span>
                <span className="font-bold text-slate-900 text-sm block">{selectedDetailLog.actorName}</span>
                <span className="text-slate-500 text-xs block">{selectedDetailLog.actorEmail}</span>
                <Badge variant={ROLE_BADGES[selectedDetailLog.actorRole]?.variant || 'neutral'} size="sm" className="mt-1">
                  Role: {ROLE_BADGES[selectedDetailLog.actorRole]?.label}
                </Badge>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Target Company / Network
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedDetailLog.tenantName || 'Platform Core (System)'}
                </span>
                <span className="text-slate-500 font-mono text-xs block">
                  IP Address: {selectedDetailLog.ipAddress || '192.168.1.1'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
              <span className="text-slate-400 font-sans text-[11px] font-semibold uppercase tracking-wider block mb-1">
                Event Details Payload
              </span>
              <p className="text-emerald-400 leading-relaxed">{selectedDetailLog.details}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]">
              <span className="text-slate-500 block mb-1 font-sans font-semibold">Raw JSON Payload:</span>
              <pre className="bg-white p-2.5 rounded-lg border border-slate-200 overflow-x-auto text-[10px] text-slate-800">
                {JSON.stringify(selectedDetailLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setSelectedDetailLog(null)}
                className="bg-slate-900 font-bold"
              >
                Close Audit Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
