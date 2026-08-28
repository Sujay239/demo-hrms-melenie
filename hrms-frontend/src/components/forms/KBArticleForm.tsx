import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { KBArticle, KBAttachment, Department } from '@/demo-data/seedData';
import {
  ShieldCheck,
  Globe,
  Lock,
  Paperclip,
  UploadCloud,
  Eye,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
} from 'lucide-react';

interface KBArticleFormProps {
  initialValues?: Partial<KBArticle>;
  tenantId: string;
  onSubmit: (data: {
    title: string;
    categoryId: string;
    categoryName: string;
    content: string;
    tags: string[];
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    targetDepartmentId: string | null;
    targetDepartmentName: string | null;
    attachments: KBAttachment[];
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const KBArticleForm: React.FC<KBArticleFormProps> = ({
  initialValues,
  tenantId,
  onSubmit,
  onCancel,
  submitLabel = 'Publish Article',
}) => {
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, tenantId);

  const [title, setTitle] = useState(initialValues?.title || '');
  const [categoryName, setCategoryName] = useState(initialValues?.categoryName || 'Company Policies');
  const [content, setContent] = useState(initialValues?.content || '');
  const [tagsInput, setTagsInput] = useState(
    initialValues?.tags?.join(', ') || 'guide, policy, step-by-step'
  );
  const [audienceScope, setAudienceScope] = useState<'COMPANY_WIDE' | 'DEPARTMENT_SPECIFIC'>(
    initialValues?.targetDepartmentId && initialValues.targetDepartmentId !== 'ALL'
      ? 'DEPARTMENT_SPECIFIC'
      : 'COMPANY_WIDE'
  );
  const [targetDepartmentId, setTargetDepartmentId] = useState(
    initialValues?.targetDepartmentId || departments[0]?.id || ''
  );
  const [attachments, setAttachments] = useState<KBAttachment[]>(initialValues?.attachments || []);
  const [previewAtt, setPreviewAtt] = useState<KBAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const selectedDept =
      audienceScope === 'DEPARTMENT_SPECIFIC'
        ? departments.find((d) => d.id === targetDepartmentId) || departments[0]
        : null;

    onSubmit({
      title: title.trim(),
      categoryId: `cat-${Date.now()}`,
      categoryName: categoryName.trim() || 'Company Policies',
      content: content.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'PUBLISHED',
      targetDepartmentId: selectedDept ? selectedDept.id : null,
      targetDepartmentName: selectedDept ? selectedDept.name : null,
      attachments: attachments,
    });
  };

  // Tenant name for display purposes
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.id === tenantId) || tenants[0];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                Visible to all employees across every department in {currentTenant?.name || 'your company'}.
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
                        onClick={() => setPreviewAtt(att)}
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

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-[#FF6900] hover:bg-[#E05D00] font-bold cursor-pointer">
            {submitLabel}
          </Button>
        </div>
      </form>

      {/* Attachment Preview Overlay */}
      {previewAtt && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewAtt(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Preview: {previewAtt.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {previewAtt.type.toUpperCase()} File • Size: {previewAtt.size} • Uploaded:{' '}
                  {new Date(previewAtt.uploadedAt).toLocaleDateString('en-US')}
                </p>
              </div>
              <button
                onClick={() => setPreviewAtt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewAtt.type === 'image' && previewAtt.dataUrl ? (
              <img
                src={previewAtt.dataUrl}
                alt={previewAtt.name}
                className="w-full rounded-xl border border-slate-200"
              />
            ) : previewAtt.type === 'pdf' && previewAtt.dataUrl ? (
              <iframe
                src={previewAtt.dataUrl}
                title={previewAtt.name}
                className="w-full h-[60vh] rounded-xl border border-slate-200"
              />
            ) : (
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <FileSpreadsheet className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">{previewAtt.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Preview not available for this file type. Click download to view.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
