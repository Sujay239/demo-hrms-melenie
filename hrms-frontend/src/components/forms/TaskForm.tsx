import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { FormField } from '@/components/ui/FormField';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { TaskItem, Project, Employee } from '@/demo-data/seedData';

interface TaskFormProps {
  initialValues?: Partial<TaskItem>;
  tenantId: string;
  onSubmit: (data: {
    title: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    assignedEmployeeId?: string;
    assignedEmployeeName?: string;
    priority: TaskItem['priority'];
    dueDate: string;
    status: TaskItem['status'];
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  tenantId,
  onSubmit,
  onCancel,
  submitLabel = 'Save Task',
}) => {
  const employees = useMemo(
    () =>
      mockStorage
        .getTenantItems<Employee>(KEYS.EMPLOYEES, tenantId)
        .filter((e) => e.isPermanent !== false && e.employmentStatus !== 'INACTIVE'),
    [tenantId]
  );
  const projects = useMemo(() => mockStorage.getTenantItems<Project>(KEYS.PROJECTS, tenantId), [tenantId]);

  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [projectId, setProjectId] = useState(initialValues?.projectId || '');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(initialValues?.assignedEmployeeId || '');
  const [priority, setPriority] = useState<TaskItem['priority']>(initialValues?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '');
  const [status, setStatus] = useState<TaskItem['status']>(initialValues?.status || 'PENDING');

  // Conditional task assignee filtering
  const availableAssignees = useMemo(() => {
    if (!projectId) return employees;
    const selectedP = projects.find((p) => p.id === projectId);
    if (!selectedP || !selectedP.assignedEmployeeIds || selectedP.assignedEmployeeIds.length === 0) return employees;
    const set = new Set(selectedP.assignedEmployeeIds);
    const filtered = employees.filter((e) => set.has(e.id));
    return filtered.length > 0 ? filtered : employees;
  }, [projectId, projects, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedP = projects.find((p) => p.id === projectId);
    const selectedE = employees.find((e) => e.id === assignedEmployeeId);

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      projectId: projectId || undefined,
      projectName: selectedP ? selectedP.name : undefined,
      assignedEmployeeId: assignedEmployeeId || undefined,
      assignedEmployeeName: selectedE ? selectedE.name : undefined,
      priority,
      dueDate,
      status: status || 'PENDING',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <FormField label="Task Title" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Audit API security tokens"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Select Project (Optional)">
          <Select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setAssignedEmployeeId('');
            }}
            options={[
              { value: '', label: '🌐 None (Standalone Task)' },
              ...projects.map((p) => ({ value: p.id, label: `📁 ${p.name} (${p.code})` })),
            ]}
          />
        </FormField>

        <FormField label="Assignee Employee">
          <Select
            value={assignedEmployeeId}
            onChange={(e) => setAssignedEmployeeId(e.target.value)}
            options={[
              { value: '', label: 'Select Assignee...' },
              ...availableAssignees.map((e) => ({
                value: e.id,
                label: `${e.name} (${e.employeeId || 'EMP'})`,
              })),
            ]}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Priority Level" required>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
          />
        </FormField>

        <FormField label="Status" required>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'PENDING', label: 'PENDING' },
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
              { value: 'COMPLETED', label: 'COMPLETED' },
              { value: 'BLOCKED', label: 'BLOCKED' },
            ]}
          />
        </FormField>

        <FormField label="Due Date">
          <DatePicker value={dueDate} onChange={setDueDate} />
        </FormField>
      </div>

      <FormField label="Description & Notes">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Instructions or deliverable notes..."
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
