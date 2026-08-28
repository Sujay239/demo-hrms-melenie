import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Department, Employee } from '@/demo-data/seedData';

interface DepartmentFormProps {
  initialValues?: Partial<Department>;
  tenantId: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    parentDepartmentId?: string | null;
    headEmployeeId?: string | null;
    status: 'ACTIVE' | 'INACTIVE';
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialValues,
  tenantId,
  onSubmit,
  onCancel,
  submitLabel = 'Create Department',
}) => {
  const departments = useMemo(
    () => mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, tenantId),
    [tenantId]
  );
  const employees = useMemo(
    () =>
      mockStorage
        .getTenantItems<Employee>(KEYS.EMPLOYEES, tenantId)
        .filter((e) => e.isPermanent !== false && e.employmentStatus !== 'INACTIVE'),
    [tenantId]
  );

  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [parentDepartmentId, setParentDepartmentId] = useState(initialValues?.parentDepartmentId || '');
  const [headEmployeeId, setHeadEmployeeId] = useState(initialValues?.headEmployeeId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      parentDepartmentId: parentDepartmentId || null,
      headEmployeeId: headEmployeeId || null,
      status: initialValues?.status || 'ACTIVE',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
