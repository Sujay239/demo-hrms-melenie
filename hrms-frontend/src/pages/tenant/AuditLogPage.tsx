import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { AuditLog } from '@/demo-data/seedData';
import { Search, ShieldAlert, Lock } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const auditLogs = mockStorage.getTenantItems<AuditLog>(KEYS.AUDIT_LOGS, currentTenant.id);

  const filtered = auditLogs.filter(
    (a) =>
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.actorName.toLowerCase().includes(search.toLowerCase()) ||
      a.resourceType.toLowerCase().includes(search.toLowerCase()) ||
      a.requestId.toLowerCase().includes(search.toLowerCase())
  );

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (a) => (
        <span className="font-mono text-xs text-slate-700 font-medium">
          {new Date(a.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actorName',
      header: 'Actor',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900">{a.actorName}</div>
          <div className="text-[11px] font-mono text-slate-400">ID: {a.actorId}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Executed',
      render: (a) => (
        <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
          {a.action}
        </span>
      ),
    },
    {
      key: 'resourceType',
      header: 'Resource Target',
      render: (a) => (
        <span className="text-xs text-slate-700 font-medium">
          {a.resourceType} <span className="font-mono text-slate-400 text-[11px]">({a.resourceId})</span>
        </span>
      ),
    },
    {
      key: 'requestId',
      header: 'Request ID',
      render: (a) => <span className="font-mono text-xs text-slate-400">{a.requestId}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Event Logs</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              <Lock className="w-3 h-3 text-amber-500" /> Read-Only Integrity Log
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable, append-only security and administrative audit stream for {currentTenant.name}.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <Input
            placeholder="Filter audit events by actor, action type, resource, or request ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(a) => a.id}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          totalPages,
        }}
        onPageChange={setPage}
        emptyTitle="No audit records"
        emptyDescription="Administrative and sensitive security operations will generate audit events here."
      />
    </div>
  );
};
