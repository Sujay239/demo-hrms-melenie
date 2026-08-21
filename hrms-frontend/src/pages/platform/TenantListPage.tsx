import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { mockStorage } from "@/services/mock-storage";
import { Tenant } from "@/demo-data/seedData";
import { Plus, Search, ExternalLink } from "lucide-react";

export const TenantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const allTenants = mockStorage.getTenants();

  const filteredTenants = allTenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredTenants.length / pageSize) || 1;
  const paginatedTenants = filteredTenants.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Company / Tenant",
      render: (t) => (
        <div className="flex items-center gap-3">
          {t.logoUrl ? (
            <img
              src={t.logoUrl}
              alt={t.name}
              className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {t.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-xs text-slate-400 font-mono">
              Peopleworkplaces.hr/{t.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <Badge status={t.status} />,
    },
    {
      key: "consultantCount",
      header: "Consultants",
      render: (t) => (
        <span className="text-xs font-medium text-slate-700">
          {t.consultantCount} assigned
        </span>
      ),
    },
    {
      key: "employeeCount",
      header: "Employees",
      render: (t) => (
        <span className="text-xs font-medium text-slate-700">
          {t.employeeCount} active
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created On",
      render: (t) => (
        <span className="text-xs text-slate-500">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (t) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/${t.slug}/dashboard`}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Visit Portal <ExternalLink className="w-3 h-3" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/tenants/${t.id}`)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tenants & Companies
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage customer tenant lifecycle and consultant assignments.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/tenants/new")}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Company / Tenant
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by company name or domain slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "DEACTIVATED", label: "Deactivated" },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedTenants}
        keyExtractor={(t) => t.id}
        pagination={{
          page,
          pageSize,
          total: filteredTenants.length,
          totalPages,
        }}
        onPageChange={setPage}
        onRowClick={(t) => navigate(`/admin/tenants/${t.id}`)}
        emptyTitle="No tenants found"
        emptyDescription="Try clearing search filters or create a new tenant."
        emptyAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/tenants/new")}
          >
            Create Tenant
          </Button>
        }
      />
    </div>
  );
};
