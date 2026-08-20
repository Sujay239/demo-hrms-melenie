import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Ticket, Department } from '@/demo-data/seedData';
import { Plus, Search, Ticket as TicketIcon, Send, MessageSquare } from 'lucide-react';

export const TicketListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-acme-eng');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newComment, setNewComment] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const tickets = mockStorage.getTenantItems<Ticket>(KEYS.TICKETS, currentTenant.id);
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      toast.error('Subject and description are required');
      return;
    }

    const dept = departments.find((d) => d.id === departmentId);

    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      tenantId: currentTenant.id,
      ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      subject,
      description,
      category: 'General',
      departmentId,
      departmentName: dept?.name || 'Department',
      priority,
      status: 'OPEN',
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      comments: [
        {
          id: `c-${Date.now()}`,
          authorName: 'System',
          authorRole: 'SYSTEM',
          content: 'Ticket created and queued.',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    mockStorage.addTenantItem<Ticket>(KEYS.TICKETS, newTicket);
    mockStorage.addAuditLog('TICKET_CREATED', 'TICKET', newTicket.id);

    toast.success(`Ticket ${newTicket.ticketNumber} created!`);
    setIsCreateModalOpen(false);
    setSubject('');
    setDescription('');
  };

  const handleStatusTransition = (ticketId: string, newStatus: Ticket['status']) => {
    mockStorage.updateTenantItem<Ticket>(KEYS.TICKETS, ticketId, { status: newStatus });
    toast.success(`Ticket status updated to ${newStatus}`);
    if (selectedTicket) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;

    const commentObj = {
      id: `c-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...selectedTicket.comments, commentObj];
    mockStorage.updateTenantItem<Ticket>(KEYS.TICKETS, selectedTicket.id, {
      comments: updatedComments,
    });

    setSelectedTicket({ ...selectedTicket, comments: updatedComments });
    setNewComment('');
    toast.success('Comment added');
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (t) => (
        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
          {t.ticketNumber}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Details',
      render: (t) => (
        <div>
          <div className="font-semibold text-slate-900">{t.subject}</div>
          <div className="text-xs text-slate-400">Created by {t.createdByName} • {t.departmentName}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => (
        <Badge variant={t.priority === 'HIGH' ? 'rose' : t.priority === 'MEDIUM' ? 'amber' : 'sky'}>
          {t.priority}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <Badge status={t.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (t) => <span className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Help Desk & Tickets</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Department-routed support tickets and resolution tracking.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Ticket
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by ticket number or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'OPEN', label: 'OPEN' },
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
              { value: 'WAITING', label: 'WAITING' },
              { value: 'RESOLVED', label: 'RESOLVED' },
              { value: 'CLOSED', label: 'CLOSED' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(t) => t.id}
        onRowClick={(t) => setSelectedTicket(t)}
        emptyTitle="No tickets found"
        emptyDescription="Create a ticket to request assistance from company departments."
      />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`${selectedTicket.ticketNumber}: ${selectedTicket.subject}`}
          description={`Created by ${selectedTicket.createdByName} • Department: ${selectedTicket.departmentName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Status Transition Control (SRS canonical state machine) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                <Badge status={selectedTicket.status} />
              </div>

              {isTenantAdmin && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 mr-1">Move to:</span>
                  {(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'] as Ticket['status'][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusTransition(selectedTicket.id, st)}
                        disabled={selectedTicket.status === st}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                          selectedTicket.status === st
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-800">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h5>
              <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> Activity & Comments Thread
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedTicket.comments.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span className="font-semibold text-slate-900">
                        {c.authorName} ({c.authorRole})
                      </span>
                      <span className="text-slate-400 text-[10px]">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a comment or update note..."
                />
                <Button type="submit" leftIcon={<Send className="w-4 h-4" />}>
                  Post
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Help Desk Ticket"
        description="Submit a request to IT, HR, or Operations department."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>Submit Ticket</Button>
          </>
        }
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <FormField label="Subject / Brief Summary" required>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Laptop VPN Connection Timeout"
              required
            />
          </FormField>

          <FormField label="Target Department" required>
            <Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((dept) => ({
                value: dept.id,
                label: dept.name,
              }))}
            />
          </FormField>

          <FormField label="Priority" required>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'HIGH', label: 'High Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'LOW', label: 'Low Priority' },
              ]}
            />
          </FormField>

          <FormField label="Detailed Description" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Explain the issue or request in detail..."
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
