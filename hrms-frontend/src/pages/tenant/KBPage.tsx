import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { KBArticle } from '@/demo-data/seedData';
import { Search, Plus, BookOpen, Tag, Lock } from 'lucide-react';

export const KBPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState('Company Policies');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('policy, guidelines');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const articles = mockStorage.getTenantItems<KBArticle>(KEYS.KB_ARTICLES, currentTenant.id);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    const newArticle = mockStorage.addTenantItem<KBArticle>(KEYS.KB_ARTICLES, {
      id: `kb-${Date.now()}`,
      tenantId: currentTenant.id,
      title,
      categoryId: `cat-${Date.now()}`,
      categoryName,
      content,
      tags: tagsInput.split(',').map((t) => t.trim()),
      status: 'PUBLISHED',
      updatedAt: new Date().toISOString(),
    });

    toast.success(`Knowledge Base article "${title}" published!`);
    setIsCreateModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal policies, engineering standards, and company guides for {currentTenant.name}.
          </p>
        </div>
        {isTenantAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Create Article
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Search Knowledge Base articles by title, content, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <Card
            key={a.id}
            hoverable
            className="cursor-pointer space-y-3 flex flex-col justify-between"
            onClick={() => setSelectedArticle(a)}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="indigo">{a.categoryName}</Badge>
                {a.targetDepartmentId && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-500" /> Dept Scoped
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{a.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{a.tags.join(', ')}</span>
              </div>
              <span>{new Date(a.updatedAt).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Article View Modal */}
      {selectedArticle && (
        <Modal
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          title={selectedArticle.title}
          description={`Published in ${selectedArticle.categoryName} • Last updated ${new Date(
            selectedArticle.updatedAt
          ).toLocaleDateString()}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {selectedArticle.tags.map((t) => (
                <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  #{t}
                </span>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedArticle.content}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Article Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Knowledge Base Article"
        description="Publish company policy or technical documentation."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateArticle}>Publish Article</Button>
          </>
        }
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <FormField label="Article Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Travel & Expense Claim Guidelines"
              required
            />
          </FormField>

          <FormField label="Category Name" required>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Company Policies"
              required
            />
          </FormField>

          <FormField label="Tags (Comma separated)">
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="policy, expenses, travel"
            />
          </FormField>

          <FormField label="Article Content" required>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write Markdown or plain text guidelines here..."
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
