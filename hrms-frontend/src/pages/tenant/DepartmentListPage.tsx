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
import { Department, Employee } from '@/demo-data/seedData';
import { Plus, Search, Building2 } from 'lucide-react';

export const DepartmentListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentDepartmentId, setParentDepartmentId] = useState('');
  const [headEmployeeId, setHeadEmployeeId] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);
  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant.id);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Department name is required');
      return;
    }

    mockStorage.addTenantItem<Department>(KEYS.DEPARTMENTS, {
      id: `dept-${Date.now()}`,
      tenantId: currentTenant.id,
      name,
      description,
      parentDepartmentId: parentDepartmentId || null,
      headEmployeeId: headEmployeeId || null,
      status: 'ACTIVE',
    });

    toast.success(`Department "${name}" created successfully!`);
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Department Name',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{d.name}</div>
            {d.description && <div className="text-xs text-slate-500">{d.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'parentDepartmentId',
      header: 'Parent Department',
      render: (d) => {
        if (!d.parentDepartmentId) return <span className="text-xs text-slate-400 italic">Root Department</span>;
        const parent = departments.find((p) => p.id === d.parentDepartmentId);
        return <span className="text-xs font-medium text-slate-700">{parent?.name || 'Parent'}</span>;
      },
    },
    {
      key: 'headEmployeeId',
      header: 'Department Head',
      render: (d) => {
        if (!d.headEmployeeId) return <span className="text-xs text-slate-400 italic">Unassigned</span>;
        const head = employees.find((e) => e.id === d.headEmployeeId);
        return <span className="text-xs font-semibold text-indigo-700">{head?.name || 'Head'}</span>;
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Departments & Hierarchy</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage corporate structure, department heads, and reporting units for {currentTenant.name}.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Department
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <Input
            placeholder="Search department name..."
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
        emptyTitle="No departments found"
        emptyDescription="Create a department to build your organizational tree."
      />

      {/* Create Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Department"
        description="Add a new structural unit within the company."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment}>Create Department</Button>
          </>
        }
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <FormField label="Department Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Engineering"
              required
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief operational focus"
            />
          </FormField>

          <FormField label="Parent Department (Optional)">
            <Select
              value={parentDepartmentId}
              onChange={(e) => setParentDepartmentId(e.target.value)}
              placeholder="None (Top Level)"
              options={departments.map((dept) => ({
                value: dept.id,
                label: dept.name,
              }))}
            />
          </FormField>

          <FormField label="Department Head (Optional)">
            <Select
              value={headEmployeeId}
              onChange={(e) => setHeadEmployeeId(e.target.value)}
              placeholder="Select Employee Head"
              options={employees.map((emp) => ({
                value: emp.id,
                label: `${emp.name} (${emp.employeeId})`,
              }))}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
