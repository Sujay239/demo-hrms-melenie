import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Ticket, TicketComment, Tenant } from '@/demo-data/seedData';
import {
  LifeBuoy,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Building2,
  Clock,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  Tag,
  MessageSquare,
  ArrowRight,
  Flame,
  Check,
  FileJson,
  User,
  Inbox,
  Sparkles,
} from 'lucide-react';

const STATUS_BADGES: Record<
  Ticket['status'],
  { label: string; variant: 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'neutral' }
> = {
  OPEN: { label: 'Open', variant: 'rose' },
  IN_PROGRESS: { label: 'In Progress', variant: 'indigo' },
  WAITING: { label: 'Waiting on Info', variant: 'amber' },
  RESOLVED: { label: 'Resolved', variant: 'emerald' },
  CLOSED: { label: 'Closed', variant: 'neutral' },
};

const PRIORITY_BADGES: Record<
  Ticket['priority'],
  { label: string; bg: string; text: string; border: string }
> = {
  URGENT: { label: 'Urgent', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  HIGH: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  LOW: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

export const PlatformTicketsPage: React.FC = () => {
  const tenants = useMemo(() => mockStorage.getTenants(), []);
  const currentUser = mockStorage.getCurrentUser();

  const [tickets, setTickets] = useState<Ticket[]>(() =>
    mockStorage.getTenantItems<Ticket>(KEYS.TICKETS)
  );

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PLATFORM_SUPER_ADMIN' | 'INTERNAL_COMPANY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [tenantFilter, setTenantFilter] = useState<string>('ALL');

  // Detail Modal & Response State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [ticketStatus, setTicketStatus] = useState<Ticket['status']>('OPEN');
  const [ticketPriority, setTicketPriority] = useState<Ticket['priority']>('HIGH');

  const reloadTickets = () => {
    const loaded = mockStorage.getTenantItems<Ticket>(KEYS.TICKETS);
    setTickets(loaded);
  };

  useEffect(() => {
    reloadTickets();
    const handleSync = () => reloadTickets();
    window.addEventListener('storage', handleSync);
    window.addEventListener('dataSynced', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('dataSynced', handleSync);
    };
  }, []);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((tkt) => {
      const matchSearch =
        tkt.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tkt.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tkt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tkt.tenantName && tkt.tenantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tkt.createdByName && tkt.createdByName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tkt.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchScope =
        scopeFilter === 'ALL'
          ? true
          : scopeFilter === 'PLATFORM_SUPER_ADMIN'
          ? tkt.targetScope === 'PLATFORM_SUPER_ADMIN' || !tkt.targetScope
          : tkt.targetScope === 'INTERNAL_COMPANY';

      const matchStatus = statusFilter === 'ALL' || tkt.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || tkt.priority === priorityFilter;
      const matchTenant = tenantFilter === 'ALL' || tkt.tenantId === tenantFilter;

      return matchSearch && matchScope && matchStatus && matchPriority && matchTenant;
    });
  }, [tickets, searchTerm, scopeFilter, statusFilter, priorityFilter, tenantFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const directBugs = tickets.filter((t) => t.targetScope === 'PLATFORM_SUPER_ADMIN' || !t.targetScope).length;
    const openBugs = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const urgentIssues = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;
    const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 100;

    return { total, directBugs, openBugs, urgentIssues, resolvedCount, resolutionRate };
  }, [tickets]);

  // Open Ticket Detail Modal
  const handleOpenDetail = (tkt: Ticket) => {
    setSelectedTicket(tkt);
    setTicketStatus(tkt.status);
    setTicketPriority(tkt.priority);
    setAdminReply('');
  };

  // Submit Super Admin Reply & Update Status
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const newComments: TicketComment[] = [...(selectedTicket.comments || [])];

    if (adminReply.trim()) {
      newComments.push({
        id: `comm-${Date.now()}`,
        authorName: currentUser?.name || 'Platform Super Admin',
        authorRole: 'SUPER_ADMIN',
        content: adminReply.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const updatedTicket: Ticket = {
      ...selectedTicket,
      status: ticketStatus,
      priority: ticketPriority,
      comments: newComments,
    };

    mockStorage.updateTenantItem<Ticket>(KEYS.TICKETS, selectedTicket.id, updatedTicket);
    mockStorage.addAuditLog('TICKET_RESOLVED', 'TICKET', selectedTicket.id);

    toast.success(`Ticket #${selectedTicket.ticketNumber} updated successfully!`);
    setSelectedTicket(updatedTicket);
    setAdminReply('');
    reloadTickets();
  };

  // Quick Status Transition Button Handler
  const handleQuickStatus = (ticketId: string, nextStatus: Ticket['status']) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const updated = {
      ...target,
      status: nextStatus,
      comments: [
        ...(target.comments || []),
        {
          id: `comm-${Date.now()}`,
          authorName: currentUser?.name || 'Platform Super Admin',
          authorRole: 'SUPER_ADMIN',
          content: `Status changed to ${nextStatus} by Platform Super Admin.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    mockStorage.updateTenantItem<Ticket>(KEYS.TICKETS, ticketId, updated);
    mockStorage.addAuditLog('TICKET_STATUS_CHANGED', 'TICKET', ticketId);
    toast.success(`Ticket #${target.ticketNumber} marked as ${nextStatus}`);
    reloadTickets();
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updated);
      setTicketStatus(nextStatus);
    }
  };

  // Export Tickets as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `platform_tickets_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exported platform tickets to JSON');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Support & Bug Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" /> Super Admin Inbox
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of technical bugs, software glitches, and help desk tickets submitted by Company Admins and HR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reloadTickets}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="cursor-pointer"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="cursor-pointer"
          >
            Export Logs (JSON)
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reported Tickets</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-[11px] text-slate-500">{stats.directBugs} direct Super Admin bug tickets</p>
        </Card>

        <Card className="p-4 bg-white border border-rose-200/80 rounded-2xl shadow-xs space-y-1 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Open & Active Issues</span>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700">{stats.openBugs}</p>
          <p className="text-[11px] text-rose-600 font-medium">{stats.urgentIssues} high or urgent priority</p>
        </Card>

        <Card className="p-4 bg-white border border-amber-200/80 rounded-2xl shadow-xs space-y-1 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Urgent Attention</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-800">{stats.urgentIssues}</p>
          <p className="text-[11px] text-amber-700">Needs immediate patch or developer review</p>
        </Card>

        <Card className="p-4 bg-white border border-emerald-200/80 rounded-2xl shadow-xs space-y-1 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved / Closed</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-800">{stats.resolvedCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium">{stats.resolutionRate}% resolution success rate</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by ticket #, company name, subject, or issue description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Target Scope Switcher */}
          <Select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            options={[
              { value: 'ALL', label: 'Scope: All Tickets' },
              { value: 'PLATFORM_SUPER_ADMIN', label: '🐞 Super Admin Bugs' },
              { value: 'INTERNAL_COMPANY', label: '🏢 Tenant Internal' },
            ]}
            className="text-xs min-w-40 font-semibold"
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Status: All' },
              { value: 'OPEN', label: 'Status: Open' },
              { value: 'IN_PROGRESS', label: 'Status: In Progress' },
              { value: 'WAITING', label: 'Status: Waiting' },
              { value: 'RESOLVED', label: 'Status: Resolved' },
              { value: 'CLOSED', label: 'Status: Closed' },
            ]}
            className="text-xs min-w-32"
          />

          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Priority: All' },
              { value: 'URGENT', label: '🔴 Urgent' },
              { value: 'HIGH', label: '🟠 High' },
              { value: 'MEDIUM', label: '🟡 Medium' },
              { value: 'LOW', label: '⚪ Low' },
            ]}
            className="text-xs min-w-32"
          />

          {/* Tenant / Company Filter */}
          <Select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            options={[
              { value: 'ALL', label: '🏢 All Companies' },
              ...tenants.map((t) => ({ value: t.id, label: t.name })),
            ]}
            className="text-xs min-w-36"
          />
        </div>
      </div>

      {/* Tickets List Card */}
      <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-indigo-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Support Ticket Records ({filteredTickets.length})
            </CardTitle>
          </div>
        </CardHeader>

        <div className="divide-y divide-slate-100">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Tickets Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No support tickets or platform bug reports matched your selected filter criteria.
              </p>
            </div>
          ) : (
            filteredTickets.map((tkt) => {
              const pBadge = PRIORITY_BADGES[tkt.priority] || PRIORITY_BADGES.MEDIUM;
              const sBadge = STATUS_BADGES[tkt.status] || STATUS_BADGES.OPEN;
              const isDirectBug = tkt.targetScope === 'PLATFORM_SUPER_ADMIN' || !tkt.targetScope;

              return (
                <div
                  key={tkt.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                        {tkt.ticketNumber}
                      </span>

                      {/* Scope Badge */}
                      {isDirectBug ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <Flame className="w-3 h-3 text-rose-600" /> Platform Super Admin Bug
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold rounded-full">
                          Internal Support
                        </span>
                      )}

                      {/* Company Name */}
                      {tkt.tenantName && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded border border-indigo-100 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{tkt.tenantName}</span>
                        </span>
                      )}

                      {/* Category */}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                        {tkt.category}
                      </span>

                      {/* Priority */}
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded border uppercase ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}
                      >
                        {tkt.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{tkt.subject}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{tkt.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>
                          Reported by: <strong className="text-slate-700 font-semibold">{tkt.createdByName}</strong>
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(tkt.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                      {tkt.comments && tkt.comments.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <MessageSquare className="w-3 h-3" />
                            <span>{tkt.comments.length} updates / notes</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Controls */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    <Badge variant={sBadge.variant} className="text-xs py-1 px-2.5 font-bold">
                      {sBadge.label}
                    </Badge>

                    {/* Quick Resolve Button */}
                    {tkt.status !== 'RESOLVED' && tkt.status !== 'CLOSED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickStatus(tkt.id, 'RESOLVED')}
                        leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                        className="text-xs font-bold hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 cursor-pointer"
                      >
                        Resolve
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleOpenDetail(tkt)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      Inspect & Reply
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* DETAILED TICKET & RESOLUTION MODAL */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket #${selectedTicket.ticketNumber}: ${selectedTicket.subject}`}
          description="Investigate bug report parameters, update resolution status, and reply directly to Company Admin."
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs pt-1">
            {/* Top Banner with Scope & Tenant */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 bg-white text-slate-800 rounded-lg border border-slate-200">
                    {selectedTicket.ticketNumber}
                  </span>
                  {selectedTicket.tenantName && (
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{selectedTicket.tenantName}</span>
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg text-xs">
                    {selectedTicket.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Reported by <strong className="text-slate-700">{selectedTicket.createdByName}</strong> on{' '}
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-slate-700 text-xs">Status:</span>
                <Select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as any)}
                  options={[
                    { value: 'OPEN', label: '🔴 Open' },
                    { value: 'IN_PROGRESS', label: '🔵 In Progress' },
                    { value: 'WAITING', label: '🟡 Waiting on Customer' },
                    { value: 'RESOLVED', label: '🟢 Resolved' },
                    { value: 'CLOSED', label: '⚫ Closed' },
                  ]}
                  className="font-bold text-xs bg-white w-44"
                />
              </div>
            </div>

            {/* Problem Description */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Bug / Issue Detailed Description
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Priority & Reassignment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Assigned Priority Level">
                <Select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  options={[
                    { value: 'URGENT', label: '🔴 URGENT — Critical platform outage' },
                    { value: 'HIGH', label: '🟠 HIGH — Core function degraded' },
                    { value: 'MEDIUM', label: '🟡 MEDIUM — Minor defect / UI glitch' },
                    { value: 'LOW', label: '⚪ LOW — General question / enhancement' },
                  ]}
                />
              </FormField>

              <FormField label="Target Routing Scope">
                <Input
                  value={
                    selectedTicket.targetScope === 'PLATFORM_SUPER_ADMIN'
                      ? 'Direct Platform Super Admin Desk'
                      : 'Tenant Internal Support'
                  }
                  disabled
                  className="bg-slate-100 text-slate-600 font-semibold"
                />
              </FormField>
            </div>

            {/* Conversation & Resolution Updates History */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Resolution History & Discussion Thread ({selectedTicket.comments?.length || 0})</span>
                </label>
                <span className="text-[11px] text-slate-400">Updates are synchronized to Company Admin</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
                    No notes or replies added yet. Post a resolution message below.
                  </p>
                ) : (
                  selectedTicket.comments.map((comm) => {
                    const isSuperAdmin = comm.authorRole === 'SUPER_ADMIN';
                    return (
                      <div
                        key={comm.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          isSuperAdmin
                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 ml-4'
                            : 'bg-slate-50 border-slate-200 text-slate-900 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="truncate">{comm.authorName}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {comm.authorRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{comm.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Super Admin Response Input Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <FormField label="Post Response / Patch Notes / Troubleshooting Guide">
                <textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type troubleshooting steps, resolution confirmation, or developer patch notes for the Company Admin..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </FormField>

              {/* Quick Template Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Quick Notes:</span>
                {[
                  'Fix deployed in latest patch. Please verify.',
                  'Under developer investigation. We will update shortly.',
                  'Issue resolved. Closing ticket.',
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setAdminReply((prev) => (prev ? `${prev} ${tmpl}` : tmpl))}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    + {tmpl}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Save & Send Update
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
