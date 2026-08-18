import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import { ArrowLeft, ExternalLink, ShieldAlert, CheckCircle, Ban } from 'lucide-react';

export const TenantDetailPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const tenants = mockStorage.getTenants();
  const tenant = tenants.find((t) => t.id === tenantId);

  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'>(
    tenant?.status || 'ACTIVE'
  );

  if (!tenant) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Tenant Not Found</h3>
        <p className="text-sm text-slate-500">The requested tenant ID does not exist.</p>
        <Button onClick={() => navigate('/admin/tenants')}>Back to Tenants</Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'ACTIVE' | 'DEACTIVATED') => {
    mockStorage.updateTenant(tenant.id, { status: newStatus });
    setStatus(newStatus);
    toast.success(`Tenant status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <Link
          to="/admin/tenants"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tenants
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo preview on white surface */}
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xs flex items-center justify-center shrink-0">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-indigo-600 rounded-lg text-white font-bold text-lg flex items-center justify-center">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{tenant.name}</h2>
                <Badge status={status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                cyrcalur.hr/{tenant.slug}
              </p>
            </div>
          </div>

          <Link
            to={`/${tenant.slug}/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-xs"
          >
            Visit Portal <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Tenant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Tenant ID
                </span>
                <span className="font-mono text-slate-800 text-xs">{tenant.id}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Domain Slug
                </span>
                <span className="font-mono text-slate-800 text-xs">{tenant.slug}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Provisioned On
                </span>
                <span className="text-slate-800 text-xs">
                  {new Date(tenant.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Default Region
                </span>
                <span className="text-slate-800 text-xs">{tenant.defaultRegionId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Actions Card */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Lifecycle Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {status === 'ACTIVE' ? (
              <>
                <p className="text-xs text-slate-500">
                  Tenant is currently active. Deactivating will block normal portal access for tenant users.
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  leftIcon={<Ban className="w-4 h-4" />}
                  onClick={() => handleStatusChange('DEACTIVATED')}
                >
                  Deactivate Tenant
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Tenant is deactivated. Activate to restore portal access.
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleStatusChange('ACTIVE')}
                >
                  Activate Tenant
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
