import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Announcement } from '@/demo-data/seedData';
import { Megaphone, Plus, Bell, CheckCircle2 } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const announcements = mockStorage.getTenantItems<Announcement>(KEYS.ANNOUNCEMENTS, currentTenant.id);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    mockStorage.addTenantItem<Announcement>(KEYS.ANNOUNCEMENTS, {
      id: `ann-${Date.now()}`,
      tenantId: currentTenant.id,
      title,
      content,
      priority,
      publishAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      target: 'TENANT_WIDE',
      readByIds: [],
    });

    toast.success(`Announcement "${title}" broadcasted tenant-wide!`);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  const handleMarkAsRead = (annId: string) => {
    const ann = announcements.find((a) => a.id === annId);
    if (ann && !ann.readByIds.includes(currentUser.id)) {
      mockStorage.updateTenantItem<Announcement>(KEYS.ANNOUNCEMENTS, annId, {
        readByIds: [...ann.readByIds, currentUser.id],
      });
      toast.success('Marked as read');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Announcements & Notices</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Broadcast official company notices, policy updates, and operational feeds for {currentTenant.name}.
          </p>
        </div>
        {isTenantAdmin && (
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            New Announcement
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((a) => {
          const isRead = a.readByIds.includes(currentUser.id);
          return (
            <Card
              key={a.id}
              className={`border-l-4 transition-all ${
                a.priority === 'HIGH'
                  ? 'border-l-rose-500 bg-rose-50/10'
                  : 'border-l-indigo-500 bg-white'
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                      <Badge variant={a.priority === 'HIGH' ? 'rose' : 'indigo'} size="sm">
                        {a.priority} PRIORITY
                      </Badge>
                      {isRead && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Read
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Published {new Date(a.publishAt).toLocaleDateString()} • Target: {a.target}
                    </p>
                  </div>
                </div>

                {!isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(a.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-2">
                <p className="text-sm text-slate-700 leading-relaxed">{a.content}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
        description="Target tenant-wide or department-specific audience."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement}>Publish Announcement</Button>
          </>
        }
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <FormField label="Announcement Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office Closure Maintenance Notice"
              required
            />
          </FormField>

          <FormField label="Priority Level" required>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'HIGH', label: 'High Priority (Urgent)' },
                { value: 'MEDIUM', label: 'Medium Priority (Standard)' },
                { value: 'LOW', label: 'Low Priority (Information)' },
              ]}
            />
          </FormField>

          <FormField label="Announcement Content" required>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter official announcement text..."
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
