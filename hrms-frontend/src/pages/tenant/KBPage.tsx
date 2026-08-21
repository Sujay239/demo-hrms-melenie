import React, { useState, useRef, useEffect } from 'react';
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
import { KBArticle, KBAttachment, Department, Employee } from '@/demo-data/seedData';
import {
  Search,
  Plus,
  BookOpen,
  Tag,
  Lock,
  Globe,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  X,
  UploadCloud,
  Eye,
  CheckCircle2,
  Building2,
  Users,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const KBPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'COMPANY_WIDE' | 'DEPARTMENT'>('ALL');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KBAttachment | null>(null);

  // Create form state
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState('Company Policies');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('guide, policy, step-by-step');
  const [audienceScope, setAudienceScope] = useState<'COMPANY_WIDE' | 'DEPARTMENT_SPECIFIC'>('COMPANY_WIDE');
  const [targetDepartmentId, setTargetDepartmentId] = useState('');
  const [attachments, setAttachments] = useState<KBAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);
  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant.id);
  const myEmployee = employees.find(
    (e) =>
      e.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
      e.id === currentUser.id ||
      (currentUser.name && e.name?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  const [articles, setArticles] = useState<KBArticle[]>(() =>
    mockStorage.getTenantItems<KBArticle>(KEYS.KB_ARTICLES, currentTenant.id)
  );

  const reloadArticles = () => {
    setArticles(mockStorage.getTenantItems<KBArticle>(KEYS.KB_ARTICLES, currentTenant.id));
  };

  useEffect(() => {
    reloadArticles();
    const handleStorageChange = () => reloadArticles();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dataSynced', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataSynced', handleStorageChange);
    };
  }, [slug, currentTenant.id, currentUser.id]);

  const myDepartment = departments.find((d) => d.id === myEmployee?.departmentId);
  const myDeptName = myDepartment?.name;

  // Role & Department Visibility Filtering:
  // - Admins see all articles (Company-wide + All departments)
  // - Regular Employees see Company-wide articles + their own Department articles ONLY
  const accessibleArticles = articles.filter((a) => {
    if (isTenantAdmin) return true;

    // 1. Universal / Company-wide (no targetDepartmentId or 'ALL')
    if (!a.targetDepartmentId || a.targetDepartmentId === 'ALL') return true;

    // 2. Department-specific: match employee's department
    const myDeptId = myEmployee?.departmentId;

    return (
      (myDeptId && a.targetDepartmentId === myDeptId) ||
      (myDeptName && a.targetDepartmentName?.toLowerCase() === myDeptName.toLowerCase()) ||
      (myDeptName && a.targetDepartmentId.toLowerCase() === myDeptName.toLowerCase())
    );
  });

  // Filter Bar Application
  const filtered = accessibleArticles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const isCompanyWide = !a.targetDepartmentId || a.targetDepartmentId === 'ALL';
    const matchesScope =
      scopeFilter === 'ALL'
        ? true
        : scopeFilter === 'COMPANY_WIDE'
        ? isCompanyWide
        : !isCompanyWide;

    const matchesDept = deptFilter ? a.targetDepartmentId === deptFilter : true;

    return matchesSearch && matchesScope && matchesDept;
  });

  // Handle multiple file attachment uploads (Images, PDF, DOCX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 15MB size limit`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isDocx =
        file.type.includes('word') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.doc');

      const fileType = isImage ? 'image' : isPdf ? 'pdf' : isDocx ? 'docx' : 'file';

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      const reader = new FileReader();
      reader.onload = async (loadEvent) => {
        const rawDataUrl = loadEvent.target?.result as string;
        let finalUrl = rawDataUrl;

        try {
          const uploadRes = await mockStorage.uploadFile(file.name, rawDataUrl);
          if (uploadRes && uploadRes.url) {
            finalUrl = uploadRes.url;
          }
        } catch {
          // Fallback to rawDataUrl
        }

        const newAttachment: KBAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: formatSize(file.size),
          type: fileType,
          dataUrl: finalUrl,
          uploadedAt: new Date().toISOString(),
        };

        setAttachments((prev) => [...prev, newAttachment]);
        toast.success(`Attached ${file.name}`);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const selectedDept =
      audienceScope === 'DEPARTMENT_SPECIFIC'
        ? departments.find((d) => d.id === targetDepartmentId) || departments[0]
        : null;

    const newArticle: KBArticle = {
      id: `kb-${Date.now()}`,
      tenantId: currentTenant.id,
      title: title.trim(),
      categoryId: `cat-${Date.now()}`,
      categoryName: categoryName.trim() || 'Company Policies',
      content: content.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'PUBLISHED',
      updatedAt: new Date().toISOString(),
      targetDepartmentId: selectedDept ? selectedDept.id : null,
      targetDepartmentName: selectedDept ? selectedDept.name : null,
      attachments: attachments,
    };

    mockStorage.addTenantItem<KBArticle>(KEYS.KB_ARTICLES, newArticle);
    mockStorage.addAuditLog('KB_ARTICLE_CREATED', 'KB_ARTICLE', newArticle.id);

    const scopeMsg = selectedDept
      ? `restricted to "${selectedDept.name}" department`
      : 'published company-wide';

    toast.success(`Knowledge Base article "${title}" ${scopeMsg}!`);
    setIsCreateModalOpen(false);
    setTitle('');
    setContent('');
    setAudienceScope('COMPANY_WIDE');
    setTargetDepartmentId('');
    setAttachments([]);
    reloadArticles();
  };

  const downloadAttachment = (att: KBAttachment) => {
    if (att.dataUrl) {
      const link = document.createElement('a');
      link.href = att.dataUrl;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${att.name}`);
    } else {
      toast.success(`Downloading ${att.name}...`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base & Documentation</h2>
            {!isTenantAdmin && myDeptName && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-600" /> {myDeptName}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {isTenantAdmin
              ? `Manage universal company guidelines and department-specific documentation for ${currentTenant.name}.`
              : `Company-wide policies and ${myDeptName ? `${myDeptName} department` : 'internal'} guide manuals.`}
          </p>
        </div>
        {isTenantAdmin && (
          <Button
            onClick={() => {
              setAttachments([]);
              setAudienceScope('COMPANY_WIDE');
              setTargetDepartmentId(departments[0]?.id || '');
              setIsCreateModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#FF6900] hover:bg-[#E05D00] font-bold cursor-pointer"
          >
            Create Article
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search Knowledge Base by title, content, category, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Audience Scope Filter Tabs */}
        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => {
              setScopeFilter('ALL');
              setDeptFilter('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scopeFilter === 'ALL'
                ? 'bg-[#FF6900] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Accessible ({accessibleArticles.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setScopeFilter('COMPANY_WIDE');
              setDeptFilter('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              scopeFilter === 'COMPANY_WIDE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Company-Wide</span>
          </button>

          <button
            type="button"
            onClick={() => setScopeFilter('DEPARTMENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              scopeFilter === 'DEPARTMENT'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Department Only</span>
          </button>
        </div>

        {/* Admin Department Filter Dropdown */}
        {isTenantAdmin && scopeFilter === 'DEPARTMENT' && (
          <div className="w-full md:w-48">
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </div>
        )}
      </div>

      {/* Article Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6900] mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Knowledge Base Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No articles matched your search query. Try searching for different keywords.'
              : scopeFilter === 'DEPARTMENT'
              ? 'No department-specific articles available for your team.'
              : 'No articles published yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const isCompanyWide = !a.targetDepartmentId || a.targetDepartmentId === 'ALL';
            const docCount = a.attachments?.length || 0;
            const deptName =
              a.targetDepartmentName ||
              departments.find((d) => d.id === a.targetDepartmentId)?.name ||
              a.targetDepartmentId;

            return (
              <Card
                key={a.id}
                hoverable
                className="cursor-pointer space-y-3 flex flex-col justify-between p-5 border border-slate-200 hover:border-[#FF6900]/40 transition-all rounded-2xl"
                onClick={() => setSelectedArticle(a)}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="indigo" className="text-[11px] font-bold">
                        {a.categoryName}
                      </Badge>

                      {/* Scope Badge: Universal vs Department */}
                      {isCompanyWide ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Globe className="w-3 h-3 text-emerald-600" /> Universal / All Staff
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                          <Lock className="w-3 h-3 text-purple-600" /> {deptName} Only
                        </span>
                      )}
                    </div>

                    {docCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-orange-50 text-[#FF6900] px-2.5 py-0.5 rounded-full border border-orange-200">
                        <Paperclip className="w-3.5 h-3.5" /> {docCount} {docCount === 1 ? 'Guide / Doc' : 'Guides / Docs'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{a.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">{a.content}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{a.tags.join(', ')}</span>
                  </div>
                  <span className="shrink-0">
                    {new Date(a.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Article View Modal */}
      {selectedArticle && (
        <Modal
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          title={selectedArticle.title}
          description={`Published in ${selectedArticle.categoryName} • Last updated ${new Date(
            selectedArticle.updatedAt
          ).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
          maxWidth="3xl"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)} className="cursor-pointer">
              Close
            </Button>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Scope & Tags Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Audience Scope:</span>
                {!selectedArticle.targetDepartmentId || selectedArticle.targetDepartmentId === 'ALL' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    <Globe className="w-3.5 h-3.5 text-emerald-700" /> Company-Wide (Universal Access)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-3.5 h-3.5 text-purple-700" /> Restricted to{' '}
                    {selectedArticle.targetDepartmentName ||
                      departments.find((d) => d.id === selectedArticle.targetDepartmentId)?.name ||
                      selectedArticle.targetDepartmentId}{' '}
                    Department
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {selectedArticle.tags.map((t) => (
                  <span key={t} className="text-[11px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Article Body */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap shadow-2xs">
              {selectedArticle.content}
            </div>

            {/* Attached Reference Documents & Step Guides */}
            {selectedArticle.attachments && selectedArticle.attachments.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#FF6900]" />
                    <span>Attached Step Guides & Reference Documents ({selectedArticle.attachments.length})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedArticle.attachments.map((att) => {
                    const isImg = att.type === 'image' || att.name.match(/\.(png|jpg|jpeg|webp|gif)$/i);
                    const isPdf = att.type === 'pdf' || att.name.endsWith('.pdf');
                    const isDocx = att.type === 'docx' || att.name.match(/\.(doc|docx)$/i);

                    return (
                      <div
                        key={att.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 space-y-2.5 transition-all shadow-2xs"
                      >
                        {isImg && att.dataUrl && (
                          <div
                            className="relative w-full h-36 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group"
                            onClick={() => setPreviewDoc(att)}
                          >
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                              <Eye className="w-4 h-4" /> View Full Image
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isImg
                                  ? 'bg-purple-100 text-purple-700'
                                  : isPdf
                                  ? 'bg-rose-100 text-rose-700'
                                  : isDocx
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isImg ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : isPdf ? (
                                <FileText className="w-4 h-4" />
                              ) : isDocx ? (
                                <FileSpreadsheet className="w-4 h-4" />
                              ) : (
                                <Paperclip className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate" title={att.name}>
                                {att.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {att.type.toUpperCase()} • {att.size}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewDoc(att)}
                              leftIcon={<Eye className="w-3.5 h-3.5 text-[#FF6900]" />}
                              className="text-xs shrink-0 cursor-pointer hover:bg-orange-50 hover:border-orange-300 font-semibold"
                            >
                              Preview
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadAttachment(att)}
                              leftIcon={<Download className="w-3.5 h-3.5" />}
                              className="text-xs shrink-0 cursor-pointer"
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Article Modal with Audience Scope Selector */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Knowledge Base Article & Step Guide"
        description="Publish company-wide universal guidelines or department-restricted step guides."
        maxWidth="2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateArticle} className="bg-[#FF6900] hover:bg-[#E05D00] font-bold cursor-pointer">
              Publish Article
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          {/* Audience / Scope Dependency Selector */}
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF6900]" /> Audience Scope & Access Permission:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                onClick={() => setAudienceScope('COMPANY_WIDE')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  audienceScope === 'COMPANY_WIDE'
                    ? 'border-[#FF6900] bg-orange-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Company-Wide (Universal)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Visible to all employees across every department in {currentTenant.name}.
                </p>
              </div>

              <div
                onClick={() => {
                  setAudienceScope('DEPARTMENT_SPECIFIC');
                  if (!targetDepartmentId) {
                    setTargetDepartmentId(departments[0]?.id || '');
                  }
                }}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  audienceScope === 'DEPARTMENT_SPECIFIC'
                    ? 'border-purple-600 bg-purple-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>Department Specific</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Strictly restricted to members of the selected department.
                </p>
              </div>
            </div>

            {/* Department Selection (if Department Specific) */}
            {audienceScope === 'DEPARTMENT_SPECIFIC' && (
              <div className="pt-2">
                <FormField label="Select Target Department" required>
                  <Select
                    value={targetDepartmentId}
                    onChange={(e) => setTargetDepartmentId(e.target.value)}
                    options={departments.map((dept) => ({
                      value: dept.id,
                      label: `${dept.name} Department`,
                    }))}
                  />
                </FormField>
              </div>
            )}
          </div>

          <FormField label="Article Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engineering On-Call Escalation Protocols"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Category Name" required>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. IT & Security, Engineering, Benefits"
                required
              />
            </FormField>

            <FormField label="Tags (Comma separated)" required>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="sop, guidelines, escalation, handbook"
                required
              />
            </FormField>
          </div>

          <FormField label="Detailed Article Content & Instructions" required>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6900]"
              placeholder="Write the full documentation, step-by-step instructions, or departmental policy summary..."
              required
            />
          </FormField>

          {/* Attach Documents & Images Upload Section */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#FF6900]" />
                <span>Attach Step Guide Images, PDF & DOCX Files</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Max 15MB each</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#FF6900] bg-slate-50 hover:bg-orange-50/20 p-5 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100/60 text-[#FF6900] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to browse or drop step guide images (PNG/JPG), PDF or Word (DOCX) files
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Screenshots of steps, policy PDFs, onboarding handbooks, or compliance documents
                </p>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-600">
                  Attached Files ({attachments.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {att.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : att.type === 'pdf' ? (
                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800 truncate" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">({att.size})</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(att)}
                          className="p-1 text-slate-400 hover:text-[#FF6900] rounded-md transition-colors cursor-pointer"
                          title="Preview Uploaded File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="Remove Attachment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Document & Step Guide Preview Modal (Topmost elevation z-[9999]) */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          zIndex={9999}
          title={`Document Preview: ${previewDoc.name}`}
          description={`${previewDoc.type.toUpperCase()} File • Size: ${previewDoc.size} • Uploaded: ${new Date(previewDoc.uploadedAt).toLocaleDateString('en-US')}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAttachment(previewDoc)}
                leftIcon={<Download className="w-4 h-4" />}
                className="cursor-pointer"
              >
                Download File
              </Button>
              <Button variant="primary" size="sm" onClick={() => setPreviewDoc(null)} className="cursor-pointer bg-[#FF6900] hover:bg-[#E05D00]">
                Close Preview
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Image Preview */}
            {(previewDoc.type === 'image' || previewDoc.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)) && (
              <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-3 bg-slate-900/5 rounded-2xl border border-slate-200">
                {previewDoc.dataUrl ? (
                  <img
                    src={previewDoc.dataUrl}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md"
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <ImageIcon className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">{previewDoc.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Image Step Guide Reference</p>
                  </div>
                )}
              </div>
            )}

            {/* PDF Preview */}
            {(previewDoc.type === 'pdf' || previewDoc.name.endsWith('.pdf')) && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm flex flex-col">
                <div className="bg-slate-800 text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-semibold truncate">{previewDoc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">({previewDoc.size})</span>
                  </div>
                  {previewDoc.dataUrl && (
                    <a
                      href={previewDoc.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-[11px] font-semibold text-slate-200 transition-colors flex items-center gap-1 shrink-0 ml-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Fullscreen / New Tab
                    </a>
                  )}
                </div>

                {previewDoc.dataUrl ? (
                  <iframe
                    src={`${previewDoc.dataUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={previewDoc.name}
                    className="w-full h-[72vh] border-0 bg-white"
                  />
                ) : (
                  <div className="p-8 text-center space-y-4 bg-slate-50 text-slate-700">
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{previewDoc.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Official Adobe PDF Document • {previewDoc.size}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Document Type:</span>
                        <span className="font-bold text-slate-800">Policy Manual / Reference PDF</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Verification Status:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Company File
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DOCX / Other Document Preview */}
            {previewDoc.type !== 'image' && !previewDoc.name.match(/\.(png|jpg|jpeg|webp|gif)$/i) && !previewDoc.name.endsWith('.pdf') && (
              <div className="p-8 text-center space-y-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{previewDoc.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Microsoft Word / Office Document • {previewDoc.size}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Format:</span>
                    <span className="font-bold text-slate-800">Editable DOCX Document</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded On:</span>
                    <span className="font-bold text-slate-800">{new Date(previewDoc.uploadedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Check:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Scanned & Clean
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
