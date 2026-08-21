import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Holiday, Region } from '@/demo-data/seedData';
import { Plus, Calendar, Check, Sparkles, Download } from 'lucide-react';
import { generateHolidayListPDF } from '@/utils/pdfGenerator';

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
  const isTenantAdmin = currentTenant ? mockStorage.isTenantAdminFor(currentUser, currentTenant.id) : false;

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !currentTenant) {
      toast.error('Holiday name and date are required');
      return;
    }

    mockStorage.addTenantItem<Holiday>(KEYS.HOLIDAYS, {
      id: `hol-${Date.now()}`,
      tenantId: currentTenant.id,
      regionId: currentTenant.defaultRegionId || '',
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

  const handleDownloadPDF = () => {
    if (!currentTenant) return;
    const regions = mockStorage.getTenantItems<Region>(KEYS.REGIONS, currentTenant.id);
    const defaultRegion = regions.find((r) => r.id === currentTenant.defaultRegionId) || regions[0];

    try {
      generateHolidayListPDF({
        tenant: currentTenant,
        holidays: rawHolidays,
        region: defaultRegion,
        year: new Date().getFullYear(),
      });
      toast.success('Holiday Calendar PDF downloaded!');
    } catch (err: any) {
      console.error('PDF generation error', err);
      toast.error('Failed to generate PDF');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const rawHolidays = currentTenant ? mockStorage.getTenantItems<Holiday>(KEYS.HOLIDAYS, currentTenant.id) : [];

  // Sort holidays: Upcoming/Today first (chronological ascending), Past holidays at the end
  const holidays = [...rawHolidays].sort((a, b) => {
    const isPastA = a.date < todayStr;
    const isPastB = b.date < todayStr;

    if (!isPastA && isPastB) return -1; // Upcoming first
    if (isPastA && !isPastB) return 1;  // Past at the end

    if (!isPastA && !isPastB) {
      return a.date.localeCompare(b.date); // Earliest upcoming first
    }
    return b.date.localeCompare(a.date); // Most recent past first among passed
  });

  const columns: Column<Holiday>[] = [
    {
      key: 'date',
      header: 'Holiday Date',
      render: (h) => {
        const isPast = h.date < todayStr;
        const isToday = h.date === todayStr;

        return (
          <span
            className={
              isPast
                ? 'font-mono text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 line-through decoration-slate-400'
                : isToday
                ? 'font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200'
                : 'font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100'
            }
          >
            {h.date}
          </span>
        );
      },
    },
    {
      key: 'name',
      header: 'Holiday Name',
      render: (h) => {
        const isPast = h.date < todayStr;
        const isToday = h.date === todayStr;

        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={
                isPast
                  ? 'font-semibold text-slate-400 line-through decoration-slate-400 decoration-1'
                  : isToday
                  ? 'font-bold text-slate-900'
                  : 'font-semibold text-slate-900'
              }
            >
              {h.name}
            </span>

            {isPast ? (
              <Badge variant="neutral" size="sm">
                Past Holiday
              </Badge>
            ) : isToday ? (
              <Badge variant="emerald" size="sm">
                Today 🎉
              </Badge>
            ) : (
              <Badge variant="indigo" size="sm">
                Upcoming
              </Badge>
            )}

            {h.kind === 'FLEXIBLE' && (
              <span
                className={
                  isPast
                    ? 'inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 line-through'
                    : 'inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200'
                }
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> FLEXIBLE
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'kind',
      header: 'Holiday Kind',
      render: (h) => {
        const isPast = h.date < todayStr;
        if (isPast) {
          return (
            <Badge variant="neutral" size="sm">
              {h.kind === 'COMMON' ? 'Common (Passed)' : 'Flexible (Passed)'}
            </Badge>
          );
        }
        return (
          <Badge variant={h.kind === 'COMMON' ? 'sky' : 'amber'}>
            {h.kind === 'COMMON' ? 'Common (Company-wide)' : 'Flexible Choice'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Selection Status',
      className: 'text-right',
      render: (h) => {
        const isPast = h.date < todayStr;
        if (isPast) {
          return <span className="text-xs text-slate-400 italic">Holiday Passed</span>;
        }
        return h.kind === 'FLEXIBLE' ? (
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
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Holiday Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Region-specific common holidays and employee flexible selections for {currentTenant?.name || 'this company'}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            leftIcon={<Download className="w-4 h-4 text-[#FF6900]" />}
            className="hover:border-[#FF6900] hover:text-[#FF6900]"
          >
            Download PDF
          </Button>

          {isTenantAdmin && (
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Holiday
            </Button>
          )}
        </div>
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
        description="Configure mandatory company-wide holidays or flexible floating choices for employee regional calendars."
        maxWidth="2xl"
        bodyClassName="overflow-visible min-h-[460px]"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateHoliday} className="bg-[#FF6900] hover:bg-[#E05D00] font-bold cursor-pointer">
              Add Holiday
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateHoliday} className="space-y-5 min-h-[420px] pb-6">
          {/* Quick Holiday Name Suggestions */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              {[
                // "New Year's Day",
                // "Martin Luther King Jr. Day",
                // "Memorial Day",
                // "Juneteenth",
                // "Independence Day",
                // "Labor Day",
                // "Thanksgiving Day",
                // "Christmas Day",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setName(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                    name === preset
                      ? 'bg-orange-50 text-[#FF6900] border-orange-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Holiday Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Independence Day"
                required
              />
            </FormField>

            <FormField label="Holiday Date" required>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Select holiday date"
                placement="bottom"
                required
              />
            </FormField>
          </div>

          {/* Holiday Kind Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">Holiday Category & Policy:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setKind('COMMON')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  kind === 'COMMON'
                    ? 'border-[#FF6900] bg-orange-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Common Holiday (Mandatory)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Fixed company-wide office closure applicable to all employees.
                </p>
              </div>

              <div
                onClick={() => setKind('FLEXIBLE')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  kind === 'FLEXIBLE'
                    ? 'border-amber-500 bg-amber-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Flexible / Floating Choice</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Optional floating holiday chosen by employees from available pool.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
