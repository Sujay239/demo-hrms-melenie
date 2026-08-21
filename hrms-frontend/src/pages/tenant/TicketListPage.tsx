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
import { Ticket, Department, Employee } from '@/demo-data/seedData';
import { Plus, Search, Ticket as TicketIcon, Send, MessageSquare, ShieldCheck, User } from 'lucide-react';

export const TicketListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newComment, setNewComment] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant.id);
  const myEmployee = employees.find(
    (e) =>
      e.email.toLowerCase() === currentUser.email.toLowerCase() ||
      e.id === currentUser.id ||
      (currentUser.name && e.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const allTickets = mockStorage.getTenantItems<Ticket>(KEYS.TICKETS, currentTenant.id);
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);

  // Role-based tickets access: If regular employee, only show tickets raised by themselves
  const accessibleTickets = isTenantAdmin
    ? allTickets
    : allTickets.filter(
        (t) =>
          t.createdById === currentUser.id ||
          t.createdById === myEmployee?.id ||
          (currentUser.name && t.createdByName?.toLowerCase() === currentUser.name.toLowerCase()) ||
          (myEmployee?.name && t.createdByName?.toLowerCase() === myEmployee.name.toLowerCase())
      );

  const filtered = accessibleTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Subject and description are required');
      return;
    }

    const dept = departments.find((d) => d.id === departmentId) || departments[0];

    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      tenantId: currentTenant.id,
      ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      subject: subject.trim(),
      description: description.trim(),
      category: 'General',
      departmentId: dept?.id || 'dept-1',
      departmentName: dept?.name || 'Operations',
      priority,
      status: 'OPEN',
      createdById: myEmployee?.id || currentUser.id,
      createdByName: myEmployee?.name || currentUser.name,
      createdAt: new Date().toISOString(),
      comments: [
        {
          id: `c-${Date.now()}`,
          authorName: 'System',
          authorRole: 'SYSTEM',
          content: 'Ticket created and assigned to support desk.',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    mockStorage.addTenantItem<Ticket>(KEYS.TICKETS, newTicket);
    mockStorage.addAuditLog('TICKET_CREATED', 'TICKET', newTicket.id);

    toast.success(`Ticket ${newTicket.ticketNumber} created successfully!`);
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
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(selectedTicket.comments || []), commentObj];
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
        <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isTenantAdmin ? 'Help Desk & Ticket Management' : 'My Support Tickets'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isTenantAdmin
              ? `Company-wide support tickets, employee inquiries, and resolution tracking for ${currentTenant.name}.`
              : 'Submit and track support requests raised by you.'}
          </p>
        </div>
        <Button
          onClick={() => {
            setDepartmentId(departments[0]?.id || '');
            setIsCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[#FF6900] hover:bg-[#E05D00] font-bold"
        >
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
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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

      <DataTable<Ticket>
        columns={columns}
        data={filtered}
        keyExtractor={(t) => t.id}
        onRowClick={(ticket) => setSelectedTicket(ticket)}
        emptyTitle={isTenantAdmin ? 'No tickets found' : 'No support tickets raised'}
        emptyDescription={
          isTenantAdmin
            ? 'No tickets found for this tenant.'
            : 'You have not raised any support tickets yet. Click "Create Ticket" to open a request.'
        }
      />

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber}`}
          description={`Created by ${selectedTicket.createdByName} on ${new Date(
            selectedTicket.createdAt
          ).toLocaleString()}`}
          maxWidth="2xl"
          footer={
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              {/* Admin status transition controls */}
              {isTenantAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                  <div className="flex gap-1">
                    {(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'] as const).map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusTransition(selectedTicket.id, status)}
                          disabled={selectedTicket.status === status}
                          className={`px-2 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                            selectedTicket.status === status
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                /* Non-admin creator can close/resolve their own ticket */
                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(selectedTicket.id, 'RESOLVED')}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="ml-auto">
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Meta header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                <Badge status={selectedTicket.status} size="sm" className="mt-1" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Priority</span>
                <span className="font-semibold text-slate-800 block mt-1">{selectedTicket.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Department</span>
                <span className="font-semibold text-slate-800 block mt-1">{selectedTicket.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Creator</span>
                <span className="font-semibold text-slate-800 block mt-1">{selectedTicket.createdByName}</span>
              </div>
            </div>

            {/* Subject and Description */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">{selectedTicket.subject}</h4>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF6900]" /> Activity & Comments Thread
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedTicket.comments || []).map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span className="font-bold text-slate-900">
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
                <Button type="submit" leftIcon={<Send className="w-4 h-4" />} className="bg-[#FF6900] hover:bg-[#E05D00]">
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
            <Button onClick={handleCreateTicket} className="bg-[#FF6900] hover:bg-[#E05D00]">
              Submit Ticket
            </Button>
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
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6900]"
              placeholder="Explain the issue or request in detail..."
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
