import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockStorage } from '@/services/mock-storage';
import { Building2, Users2, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlatformDashboardPage: React.FC = () => {
  const tenants = mockStorage.getTenants();
  const users = mockStorage.getUsers();

  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;
  const consultants = users.filter((u) => u.role === 'CONSULTANT').length;
  const totalEmployees = tenants.reduce((acc, t) => acc + t.employeeCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">
          Super Admin platform overview and tenant lifecycle controls.
        </p>
      </div>

      {/* Metric Cards - Predefined sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tenants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{tenants.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="font-semibold text-emerald-600">{activeTenants} active</span> • {tenants.length - activeTenants} inactive
          </p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Tenants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeTenants}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">100% platform availability</p>
        </Card>

        <Card className="border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{consultants}</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <Users2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Assigned to customer tenants</p>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Managed Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalEmployees + users.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Across all customer organizations</p>
        </Card>
      </div>

      {/* Tenants Table Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Tenants</CardTitle>
            <CardContent className="p-0">
              <p className="text-xs text-slate-500 mt-0.5">Recently updated companies on Cyrcalur platform</p>
            </CardContent>
          </div>
          <Link
            to="/admin/tenants"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View All Tenants →
          </Link>
        </CardHeader>

        <div className="divide-y divide-slate-100">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                {tenant.logoUrl ? (
                  <img src={tenant.logoUrl} alt={tenant.name} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-1" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
                    {tenant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{tenant.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">cyrcalur.hr/{tenant.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge status={tenant.status} />
                <Link
                  to={`/admin/tenants/${tenant.id}`}
                  className="text-xs font-medium text-slate-600 hover:text-indigo-600 hover:underline"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
