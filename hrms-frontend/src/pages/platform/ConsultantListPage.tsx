import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { User, Tenant } from '@/demo-data/seedData';
import {
  Users2,
  CheckCircle2,
  Plus,
  Building2,
  ExternalLink,
  ShieldCheck,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { Link } from 'react-router-dom';

export const ConsultantListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => mockStorage.getUsers());
  const [tenants, setTenants] = useState<Tenant[]>(() => mockStorage.getTenants());

  // Modals
  const [isAddConsultantModalOpen, setIsAddConsultantModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<User | null>(null);

  // Add Consultant Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  const reloadData = () => {
    setUsers(mockStorage.getUsers());
    setTenants(mockStorage.getTenants());
  };

  const consultants = users.filter((u) => u.role === 'CONSULTANT');

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setAvatarUrl('');
    setSelectedTenantIds([tenants[0]?.id || '']);
    setIsAddConsultantModalOpen(true);
  };

  const handleSaveConsultant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    const newConsultant: User = {
      id: `usr-c-${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      role: 'CONSULTANT',
      status: 'ACTIVE',
      assignedTenantIds: selectedTenantIds,
      avatarUrl: avatarUrl.trim() || undefined,
    };

    mockStorage.addUser(newConsultant);
    mockStorage.addAuditLog('CONSULTANT_CREATED', 'USER', newConsultant.id);
    toast.success(`🎉 External consultant "${name}" added successfully!`);
    setIsAddConsultantModalOpen(false);
    reloadData();
  };

  const handleOpenAssign = (c: User) => {
    setSelectedConsultant(c);
    setSelectedTenantIds(c.assignedTenantIds || []);
    setIsAssignModalOpen(true);
  };

  const handleToggleTenantAssignment = (tId: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
  };

  const handleSaveAssignments = () => {
    if (!selectedConsultant) return;

    mockStorage.updateUser(selectedConsultant.id, {
      assignedTenantIds: selectedTenantIds,
    });
    mockStorage.addAuditLog('CONSULTANT_ASSIGNMENTS_UPDATED', 'USER', selectedConsultant.id);
    toast.success(`Assigned client companies updated for ${selectedConsultant.name}!`);
    setIsAssignModalOpen(false);
    reloadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Users2 className="w-4 h-4" />
            <span>Platform Governance & Advisory Access</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Consultant Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Provision external advisors, audit consultants, and assign scoped multi-tenant company access.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
        >
          + Add Consultant
        </Button>
      </div>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultants.map((c) => {
          const assignedTenants = tenants.filter((t) =>
            c.assignedTenantIds?.includes(t.id)
          );

          return (
            <Card key={c.id} className="space-y-4 p-5">
              <CardHeader className="flex flex-row items-center justify-between p-0">
                <div className="flex items-center gap-3">
                  <Avatar src={c.avatarUrl} name={c.name} size="md" />
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </div>
                </div>
                <Badge variant={c.status === 'ACTIVE' ? 'emerald' : 'neutral'} size="sm">
                  {c.status}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 p-0 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Client Companies ({assignedTenants.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold p-1"
                    onClick={() => handleOpenAssign(c)}
                  >
                    Manage Assignments
                  </Button>
                </div>

                {assignedTenants.length > 0 ? (
                  <div className="space-y-2">
                    {assignedTenants.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 font-medium text-slate-800">
                          {t.logoUrl ? (
                            <img src={t.logoUrl} alt={t.name} className="w-5 h-5 rounded object-contain bg-white border border-slate-200" />
                          ) : (
                            <Building2 className="w-4 h-4 text-indigo-500" />
                          )}
                          <span className="font-semibold">{t.name}</span>
                        </div>
                        <Link
                          to={`/app/${t.slug}/dashboard`}
                          className="flex items-center gap-1 font-mono text-[11px] text-indigo-600 hover:underline"
                        >
                          <span>cyrcalur.hr/{t.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No client companies currently assigned to this consultant.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* ADD CONSULTANT MODAL (WIDTH 2XL)                             */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddConsultantModalOpen}
        onClose={() => setIsAddConsultantModalOpen(false)}
        maxWidth="2xl"
        title="Add External Consultant"
        description="Provision an advisory account and authorize client companies."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddConsultantModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConsultant} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Add Consultant
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveConsultant} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Consultant Full Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Mitchell"
                required
              />
            </FormField>

            <FormField label="Professional Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. j.mitchell@advisory.com"
                required
              />
            </FormField>
          </div>

          <FormField label="Avatar Image URL (Optional)">
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </FormField>

          <div className="space-y-2 pt-2">
            <span className="font-bold text-slate-700 block">Assign Client Companies:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {tenants.map((t) => {
                const isSelected = selectedTenantIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleTenantAssignment(t.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">/{t.slug}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MANAGE ASSIGNMENTS MODAL (WIDTH 2XL)                         */}
      {/* ============================================================ */}
      {selectedConsultant && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          maxWidth="2xl"
          title={`Manage Client Access for ${selectedConsultant.name}`}
          description="Grant or revoke multi-tenant organization authorization for this consultant."
          footer={
            <>
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAssignments} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Save Access Assignments
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Select all tenant companies that <strong>{selectedConsultant.name}</strong> is permitted to access:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {tenants.map((t) => {
                const isAssigned = selectedTenantIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleTenantAssignment(t.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isAssigned
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${isAssigned ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                        {isAssigned && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">/{t.slug}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
