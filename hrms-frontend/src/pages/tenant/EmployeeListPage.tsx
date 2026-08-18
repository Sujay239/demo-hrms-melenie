import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockStorage } from '@/services/mock-storage';
import { Employee, Department, Designation } from '@/demo-data/seedData';
import { Search, Plus } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export const EmployeeListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const employees = mockStorage.getItem<Employee>('cyrcalur_employees_v1');
  const departments = mockStorage.getItem<Department>('cyrcalur_departments_v1');
  const designations = mockStorage.getItem<Designation>('cyrcalur_designations_v1');

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar src={e.avatarUrl} name={e.name} size="sm" />
          <div>
            <div className="font-semibold text-slate-900">{e.name}</div>
            <div className="text-xs text-slate-500">{e.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (e) => <span className="font-mono text-xs text-slate-700">{e.employeeId}</span>,
    },
    {
      key: 'departmentId',
      header: 'Department',
      render: (e) => {
        const dept = departments.find((d) => d.id === e.departmentId);
        return <span className="text-xs text-slate-700">{dept?.name || e.departmentId}</span>;
      },
    },
    {
      key: 'designationId',
      header: 'Designation',
      render: (e) => {
        const desig = designations.find((d) => d.id === e.designationId);
        return <span className="text-xs text-slate-700">{desig?.name || e.designationId}</span>;
      },
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      render: (e) => <Badge status={e.employmentStatus as any} />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage organizational members.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => toast.info('Employee creation form available in Phase 3 module')}
        >
          Add Employee
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <Input
            placeholder="Search by name, employee ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(e) => e.id}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          totalPages,
        }}
        onPageChange={setPage}
      />
    </div>
  );
};
