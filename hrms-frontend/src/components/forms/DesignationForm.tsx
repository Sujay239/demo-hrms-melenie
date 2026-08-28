import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Designation, Department } from '@/demo-data/seedData';

interface DesignationFormProps {
  initialValues?: Partial<Designation>;
  tenantId: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    departmentId?: string | null;
    status: 'ACTIVE' | 'INACTIVE';
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const DesignationForm: React.FC<DesignationFormProps> = ({
  initialValues,
  tenantId,
  onSubmit,
  onCancel,
  submitLabel = 'Create Designation',
}) => {
  const departments = useMemo(
    () => mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, tenantId),
    [tenantId]
  );

  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [departmentId, setDepartmentId] = useState(initialValues?.departmentId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      departmentId: departmentId || null,
      status: initialValues?.status || 'ACTIVE',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
