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
import { Megaphone, Plus, Bell, CheckCircle2, Inbox, Eye, CheckCheck, RotateCcw } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'UNREAD' | 'READ'>('UNREAD');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    mockStorage.getTenantItems<Announcement>(KEYS.ANNOUNCEMENTS, currentTenant.id)
  );

  const reloadAnnouncements = () => {
    setAnnouncements(mockStorage.getTenantItems<Announcement>(KEYS.ANNOUNCEMENTS, currentTenant.id));
  };

  const unreadAnnouncements = announcements.filter(
    (a) => !a.readByIds?.includes(currentUser.id)
  );
  const readAnnouncements = announcements.filter(
    (a) => a.readByIds?.includes(currentUser.id)
  );

  const displayedAnnouncements = activeTab === 'UNREAD' ? unreadAnnouncements : readAnnouncements;

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      tenantId: currentTenant.id,
      title: title.trim(),
      content: content.trim(),
      priority,
      publishAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      target: 'TENANT_WIDE',
      readByIds: [currentUser.id], // Creator automatically marks their own as read
    };

    mockStorage.addTenantItem<Announcement>(KEYS.ANNOUNCEMENTS, newAnn);
    mockStorage.addAuditLog('ANNOUNCEMENT_CREATED', 'ANNOUNCEMENT', newAnn.id);

    toast.success(`Announcement "${title}" broadcasted tenant-wide!`);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    reloadAnnouncements();
  };

  const handleMarkAsRead = (annId: string, titleStr: string) => {
    const ann = announcements.find((a) => a.id === annId);
    if (ann) {
      const updatedReadIds = Array.from(new Set([...(ann.readByIds || []), currentUser.id]));
      mockStorage.updateTenantItem<Announcement>(KEYS.ANNOUNCEMENTS, annId, {
        readByIds: updatedReadIds,
      });
      toast.success(`Marked "${titleStr}" as read and moved to Read tab`);
      reloadAnnouncements();
    }
  };

  const handleMarkAsUnread = (annId: string, titleStr: string) => {
    const ann = announcements.find((a) => a.id === annId);
    if (ann) {
      const updatedReadIds = (ann.readByIds || []).filter((id) => id !== currentUser.id);
      mockStorage.updateTenantItem<Announcement>(KEYS.ANNOUNCEMENTS, annId, {
        readByIds: updatedReadIds,
      });
      toast.success(`Moved "${titleStr}" back to Unread tab`);
      reloadAnnouncements();
    }
  };

  const handleMarkAllAsRead = () => {
    unreadAnnouncements.forEach((a) => {
      const updatedReadIds = Array.from(new Set([...(a.readByIds || []), currentUser.id]));
      mockStorage.updateTenantItem<Announcement>(KEYS.ANNOUNCEMENTS, a.id, {
        readByIds: updatedReadIds,
      });
    });
    toast.success('All announcements marked as read!');
    reloadAnnouncements();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Announcements & Notices</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Broadcast official company notices, policy updates, and operational feeds for {currentTenant.name}.
          </p>
        </div>
        {isTenantAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#FF6900] hover:bg-[#E05D00] font-bold cursor-pointer"
          >
            New Announcement
          </Button>
        )}
      </div>

      {/* Tabs Bar: Unread vs Read */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('UNREAD')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'UNREAD'
                ? 'bg-[#FF6900] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Unread</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'UNREAD'
                  ? 'bg-white/20 text-white'
                  : unreadAnnouncements.length > 0
                  ? 'bg-orange-100 text-[#FF6900]'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {unreadAnnouncements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('READ')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'READ'
                ? 'bg-[#FF6900] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Read</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'READ'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {readAnnouncements.length}
            </span>
          </button>
        </div>

        {activeTab === 'UNREAD' && unreadAnnouncements.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
            className="text-xs font-semibold cursor-pointer"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Announcements List / Feed */}
      <div className="space-y-4">
        {displayedAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6900] mx-auto flex items-center justify-center">
              {activeTab === 'UNREAD' ? <CheckCircle2 className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeTab === 'UNREAD' ? 'All Caught Up!' : 'No Read Announcements'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'UNREAD'
                ? 'You have read all official company announcements and broadcast updates.'
                : 'Announcements you mark as read will appear here for future reference.'}
            </p>
          </div>
        ) : (
          displayedAnnouncements.map((a) => {
            const isRead = a.readByIds?.includes(currentUser.id);
            return (
              <Card
                key={a.id}
                className={`border-l-4 transition-all ${
                  a.priority === 'HIGH'
                    ? 'border-l-rose-500 bg-rose-50/10'
                    : a.priority === 'MEDIUM'
                    ? 'border-l-[#FF6900] bg-white'
                    : 'border-l-sky-500 bg-white'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        a.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-orange-100 text-[#FF6900]'
                      }`}
                    >
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                        <Badge
                          variant={a.priority === 'HIGH' ? 'rose' : a.priority === 'MEDIUM' ? 'amber' : 'sky'}
                          size="sm"
                        >
                          {a.priority} PRIORITY
                        </Badge>
                        {isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Read
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Published {new Date(a.publishAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • Audience: {a.target.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {!isRead ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(a.id, a.title)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        className="text-xs font-semibold cursor-pointer border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50"
                      >
                        Mark as Read
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsUnread(a.id, a.title)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
                        className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Mark as Unread"
                      >
                        Mark Unread
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-2">
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                    {a.content}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Official Announcement"
        description="Publish a notice to all company employees across departments."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} className="bg-[#FF6900] hover:bg-[#E05D00] cursor-pointer">
              Publish Announcement
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <FormField label="Announcement Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Company Townhall & Strategic Roadmap"
              required
            />
          </FormField>

          <FormField label="Priority Level" required>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'HIGH', label: 'High Priority (Urgent & Important)' },
                { value: 'MEDIUM', label: 'Medium Priority (Standard Notice)' },
                { value: 'LOW', label: 'Low Priority (General Information)' },
              ]}
            />
          </FormField>

          <FormField label="Announcement Content" required>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6900]"
              placeholder="Enter official announcement text..."
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
