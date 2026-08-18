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
import { Designation, Department } from '@/demo-data/seedData';
import { Plus, Search, Briefcase } from 'lucide-react';

export const DesignationListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const designations = mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, currentTenant.id);
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);

  const filtered = designations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Designation title is required');
      return;
    }

    mockStorage.addTenantItem<Designation>(KEYS.DESIGNATIONS, {
      id: `desig-${Date.now()}`,
      tenantId: currentTenant.id,
      name,
      description,
      departmentId: departmentId || null,
      status: 'ACTIVE',
    });

    toast.success(`Designation "${name}" created!`);
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const columns: Column<Designation>[] = [
    {
      key: 'name',
      header: 'Designation Title',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{d.name}</div>
            {d.description && <div className="text-xs text-slate-500">{d.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'departmentId',
      header: 'Associated Department',
      render: (d) => {
        if (!d.departmentId) return <span className="text-xs text-slate-400 italic">Company-Wide</span>;
        const dept = departments.find((p) => p.id === d.departmentId);
        return <span className="text-xs font-medium text-slate-700">{dept?.name || 'Department'}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <Badge status={d.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Designations & Job Titles</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Reference job titles and roles for {currentTenant.name}.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Designation
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <Input
            placeholder="Search designation title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(d) => d.id}
        emptyTitle="No designations found"
        emptyDescription="Create job designations to map employee roles."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Job Designation"
        description="Add a new job title to assign to employees."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDesignation}>Create Designation</Button>
          </>
        }
      >
        <form onSubmit={handleCreateDesignation} className="space-y-4">
          <FormField label="Designation Title" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role responsibilities overview"
            />
          </FormField>

          <FormField label="Department (Optional)">
            <Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              placeholder="Company-Wide (All Departments)"
              options={departments.map((dept) => ({
                value: dept.id,
                label: dept.name,
              }))}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
