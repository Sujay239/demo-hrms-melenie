import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { mockStorage, KEYS } from "@/services/mock-storage";
import { Region } from "@/demo-data/seedData";
import { RegionForm } from "@/components/forms/RegionForm";
import { Plus, Search, Globe } from "lucide-react";

export const RegionListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const regions = mockStorage.getTenantItems<Region>(
    KEYS.REGIONS,
    currentTenant.id,
  );

  const filtered = regions.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.countryCode.toLowerCase().includes(search.toLowerCase()) ||
      r.timeZone.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleStatus = (region: Region) => {
    const newStatus = region.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    mockStorage.updateTenantItem<Region>(KEYS.REGIONS, region.id, {
      status: newStatus,
    });
    toast.success(`Region status updated to ${newStatus}`);
    // Force rerender
    setSearch((s) => s);
  };

  const columns: Column<Region>[] = [
    {
      key: "name",
      header: "Region Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{r.name}</div>
            <div className="text-xs text-slate-400 font-mono">
              Locale: {r.locale}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "countryCode",
      header: "Country Code",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {r.countryCode}
        </span>
      ),
    },
    {
      key: "timeZone",
      header: "IANA Time Zone",
      render: (r) => (
        <span className="font-mono text-xs text-slate-600">{r.timeZone}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => toggleStatus(r)}>
          {r.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Regions & Localizations
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure regional settings, IANA time zones, and holiday calendars
            for {currentTenant.name}.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Region
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <Input
            placeholder="Search region name, country code, or time zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        emptyTitle="No regions found"
        emptyDescription="Create a region to associate employees, time zones, and holiday policies."
        emptyAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            Create Region
          </Button>
        }
      />

      {/* Create Region Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Tenant Region"
        description="Specify local region parameters for time zone and date formatting."
      >
        <RegionForm
          tenantId={currentTenant.id}
          onSubmit={(formData) => {
            mockStorage.addTenantItem<Region>(KEYS.REGIONS, {
              id: `region-${Date.now()}`,
              tenantId: currentTenant.id,
              ...formData,
            });
            toast.success(`Region "${formData.name}" created successfully!`);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
          submitLabel="Create Region"
        />
      </Modal>
    </div>
  );
};
