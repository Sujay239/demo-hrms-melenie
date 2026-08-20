import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Holiday } from '@/demo-data/seedData';
import { Plus, Calendar, Check, Sparkles } from 'lucide-react';

export const HolidayListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHolidayIds, setSelectedHolidayIds] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [kind, setKind] = useState<'COMMON' | 'FLEXIBLE'>('COMMON');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const holidays = mockStorage.getTenantItems<Holiday>(KEYS.HOLIDAYS, currentTenant.id);

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) {
      toast.error('Holiday name and date are required');
      return;
    }

    mockStorage.addTenantItem<Holiday>(KEYS.HOLIDAYS, {
      id: `hol-${Date.now()}`,
      tenantId: currentTenant.id,
      regionId: currentTenant.defaultRegionId,
      name,
      date,
      kind,
      status: 'ACTIVE',
    });

    toast.success(`Holiday "${name}" created!`);
    setIsModalOpen(false);
    setName('');
    setDate('');
  };

  const handleSelectFlexible = (holidayId: string) => {
    if (selectedHolidayIds.includes(holidayId)) {
      setSelectedHolidayIds(selectedHolidayIds.filter((id) => id !== holidayId));
      toast.info('Flexible holiday unselected');
    } else {
      setSelectedHolidayIds([...selectedHolidayIds, holidayId]);
      toast.success('Flexible holiday selected for calendar!');
    }
  };

  const columns: Column<Holiday>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (h) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
          {h.date}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Holiday Name',
      render: (h) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{h.name}</span>
          {h.kind === 'FLEXIBLE' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" /> FLEXIBLE
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'kind',
      header: 'Holiday Kind',
      render: (h) => (
        <Badge variant={h.kind === 'COMMON' ? 'sky' : 'amber'}>
          {h.kind === 'COMMON' ? 'Common (Company-wide)' : 'Flexible Choice'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Selection Status',
      className: 'text-right',
      render: (h) =>
        h.kind === 'FLEXIBLE' ? (
          <Button
            variant={selectedHolidayIds.includes(h.id) ? 'primary' : 'outline'}
            size="sm"
            leftIcon={selectedHolidayIds.includes(h.id) ? <Check className="w-3.5 h-3.5" /> : undefined}
            onClick={() => handleSelectFlexible(h.id)}
          >
            {selectedHolidayIds.includes(h.id) ? 'Selected' : 'Select Holiday'}
          </Button>
        ) : (
          <span className="text-xs text-slate-400 italic">Mandatory Common</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Holiday Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Region-specific common holidays and employee flexible selections for {currentTenant.name}.
          </p>
        </div>
        {isTenantAdmin && (
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Holiday
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={holidays}
        keyExtractor={(h) => h.id}
        emptyTitle="No holidays configured"
        emptyDescription="Add company holidays to populate employee regional calendars."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Company Holiday"
        description="Configure common or flexible holiday entries."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateHoliday}>Add Holiday</Button>
          </>
        }
      >
        <form onSubmit={handleCreateHoliday} className="space-y-4">
          <FormField label="Holiday Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Independence Day"
              required
            />
          </FormField>

          <FormField label="Date" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Holiday Kind" required>
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              options={[
                { value: 'COMMON', label: 'Common Holiday (All Employees)' },
                { value: 'FLEXIBLE', label: 'Flexible Holiday (Optional Selection)' },
              ]}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
