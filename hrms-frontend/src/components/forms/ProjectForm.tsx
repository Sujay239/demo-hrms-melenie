import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { FormField } from '@/components/ui/FormField';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Project, Employee } from '@/demo-data/seedData';

interface ProjectFormProps {
  initialValues?: Partial<Project>;
  tenantId: string;
  onSubmit: (data: {
    name: string;
    code: string;
    client?: string;
    description?: string;
    startDate: string;
    dueDate: string;
    status: Project['status'];
    assignedEmployeeIds: string[];
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialValues,
  tenantId,
  onSubmit,
  onCancel,
  submitLabel = 'Save Project',
}) => {
  const employees = useMemo(
    () =>
      mockStorage
        .getTenantItems<Employee>(KEYS.EMPLOYEES, tenantId)
        .filter((e) => e.isPermanent !== false && e.employmentStatus !== 'INACTIVE'),
    [tenantId]
  );

  const [name, setName] = useState(initialValues?.name || '');
  const [code, setCode] = useState(initialValues?.code || '');
  const [client, setClient] = useState(initialValues?.client || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [startDate, setStartDate] = useState(initialValues?.startDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '');
  const [status, setStatus] = useState<Project['status']>(initialValues?.status || 'IN_PROGRESS');
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>(initialValues?.assignedEmployeeIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      client: client.trim() || undefined,
      description: description.trim() || undefined,
      startDate,
      dueDate: dueDate || startDate,
      status,
      assignedEmployeeIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <FormField label="Project Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile App Redesign"
              required
            />
          </FormField>
        </div>
        <FormField label="Project Code" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. MOB-APP"
            maxLength={10}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Client / Department">
          <Input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="e.g. Marketing Team"
          />
        </FormField>
        <FormField label="Status" required>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'PLANNING', label: 'Planning' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ON_HOLD', label: 'On Hold' },
            ]}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start Date" required>
          <DatePicker value={startDate} onChange={setStartDate} required />
        </FormField>
        <FormField label="Due Date">
          <DatePicker value={dueDate} onChange={setDueDate} minDate={startDate} />
        </FormField>
      </div>

      <FormField label="Assigned Team Members">
        <MultiSelect
          value={assignedEmployeeIds}
          onChange={setAssignedEmployeeIds}
          options={employees.map((e) => ({
            value: e.id,
            label: `${e.name} (${e.employeeId || 'EMP'})`,
          }))}
          placeholder="Select employees..."
        />
      </FormField>

      <FormField label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Scope & objectives..."
          className="w-full min-h-20 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" className="bg-indigo-600 font-bold">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
