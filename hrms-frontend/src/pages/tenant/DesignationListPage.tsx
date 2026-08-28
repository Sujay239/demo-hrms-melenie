import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { mockStorage, KEYS } from "@/services/mock-storage";
import { Designation, Department } from "@/demo-data/seedData";
import { DesignationForm } from "@/components/forms/DesignationForm";
import { Plus, Search, Briefcase } from "lucide-react";

export const DesignationListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const designations = mockStorage.getTenantItems<Designation>(
    KEYS.DESIGNATIONS,
    currentTenant.id,
  );
  const departments = mockStorage.getTenantItems<Department>(
    KEYS.DEPARTMENTS,
    currentTenant.id,
  );

  const filtered = designations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<Designation>[] = [
    {
      key: "name",
      header: "Designation Title",
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{d.name}</div>
            {d.description && (
              <div className="text-xs text-slate-500">{d.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "departmentId",
      header: "Associated Department",
      render: (d) => {
        if (!d.departmentId)
          return (
            <span className="text-xs text-slate-400 italic">Company-Wide</span>
          );
        const dept = departments.find((p) => p.id === d.departmentId);
        return (
          <span className="text-xs font-medium text-slate-700">
            {dept?.name || "Department"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (d) => <Badge status={d.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Designations & Job Titles
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Reference job titles and roles for {currentTenant.name}.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Designation
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <Input
            placeholder="Search designation title..."
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
        emptyTitle="No designations found"
        emptyDescription="Create job designations to map employee roles."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Job Designation"
        description="Add a new job title to assign to employees."
      >
        <DesignationForm
          tenantId={currentTenant.id}
          onSubmit={(formData) => {
            mockStorage.addTenantItem<Designation>(KEYS.DESIGNATIONS, {
              id: `desig-${Date.now()}`,
              tenantId: currentTenant.id,
              ...formData,
            });
            toast.success(`Designation "${formData.name}" created!`);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
          submitLabel="Create Designation"
        />
      </Modal>
    </div>
  );
};
