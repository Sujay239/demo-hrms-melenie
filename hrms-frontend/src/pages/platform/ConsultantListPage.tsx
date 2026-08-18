import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { mockStorage } from '@/services/mock-storage';
import { Users2, CheckCircle2 } from 'lucide-react';

export const ConsultantListPage: React.FC = () => {
  const users = mockStorage.getUsers();
  const tenants = mockStorage.getTenants();

  const consultants = users.filter((u) => u.role === 'CONSULTANT');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Consultant Management</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          View external consultants and their assigned customer tenant organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultants.map((c) => {
          const assignedTenants = tenants.filter((t) =>
            c.assignedTenantIds?.includes(t.id)
          );

          return (
            <Card key={c.id} className="space-y-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={c.avatarUrl} name={c.name} size="md" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </div>
                </div>
                <Badge status={c.status} />
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Tenants ({assignedTenants.length})
                </div>

                {assignedTenants.length > 0 ? (
                  <div className="space-y-2">
                    {assignedTenants.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {t.name}
                        </div>
                        <span className="font-mono text-slate-400">cyrcalur.hr/{t.slug}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No assigned tenants.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
