import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';

interface TicketFormProps {
  tenantId: string;
  onSubmit: (data: {
    targetScope: 'PLATFORM_SUPER_ADMIN' | 'INTERNAL_COMPANY';
    subject: string;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    description: string;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  tenantId,
  onSubmit,
  onCancel,
  submitLabel = 'Submit Ticket',
}) => {
  const [targetScope, setTargetScope] = useState<'PLATFORM_SUPER_ADMIN' | 'INTERNAL_COMPANY'>('PLATFORM_SUPER_ADMIN');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Platform Bug / Glitch');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      targetScope,
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <FormField label="Target Recipient / Audience" required>
        <Select
          value={targetScope}
          onChange={(e) => {
            const val = e.target.value as any;
            setTargetScope(val);
            if (val === 'PLATFORM_SUPER_ADMIN') {
              setCategory('Platform Bug / Glitch');
            } else {
              setCategory('IT Support & Equipment');
            }
          }}
          options={[
            { value: 'PLATFORM_SUPER_ADMIN', label: '🐞 Report to Platform Super Admin (Software Bug, Glitch & Feature Difficulty)' },
            { value: 'INTERNAL_COMPANY', label: '🏢 Internal Company Support (Company IT & HR)' },
          ]}
        />
      </FormField>

      <FormField label="Ticket Subject / Summary" required>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={
            targetScope === 'PLATFORM_SUPER_ADMIN'
              ? 'e.g. Attendance export CSV alignment glitch'
              : 'e.g. Need VPN Access Setup'
          }
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Category" required>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={
              targetScope === 'PLATFORM_SUPER_ADMIN'
                ? [
                    { value: 'Platform Bug / Glitch', label: '🐛 Platform Bug / Glitch' },
                    { value: 'UI Difficulty', label: '🖥️ UI / Design Difficulty' },
                    { value: 'System Performance', label: '⚡ Slow Loading / Performance' },
                    { value: 'Billing & Access', label: '💳 Tenant Account & Billing' },
                  ]
                : [
                    { value: 'IT Support & Equipment', label: '💻 IT Support & Hardware' },
                    { value: 'HR & Payroll', label: '💼 HR & Payroll Query' },
                    { value: 'Facilities & Workplace', label: '🏢 Facilities & Workplace' },
                  ]
            }
          />
        </FormField>
        <FormField label="Priority Level" required>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: '🔥 Urgent (System Blocking)' },
            ]}
          />
        </FormField>
      </div>

      <FormField label="Description & Steps to Reproduce">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed context or steps to help Super Admin or IT diagnose..."
          className="w-full min-h-24 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
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
