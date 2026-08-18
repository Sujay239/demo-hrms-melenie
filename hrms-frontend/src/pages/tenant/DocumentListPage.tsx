import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { DocumentRecord } from '@/demo-data/seedData';
import { Upload, Search, FileText, Download, ShieldAlert, Lock } from 'lucide-react';

export const DocumentListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<DocumentRecord['category']>('EMPLOYMENT');
  const [isSensitive, setIsSensitive] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();

  const documents = mockStorage.getTenantItems<DocumentRecord>(KEYS.DOCUMENTS, currentTenant.id);

  const filtered = documents.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter ? d.category === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setFileName(file.name);
      setDocName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !fileData) {
      toast.error('Document file is required');
      return;
    }

    mockStorage.addTenantItem<DocumentRecord>(KEYS.DOCUMENTS, {
      id: `doc-${Date.now()}`,
      tenantId: currentTenant.id,
      name: docName,
      category,
      status: 'CLEAN',
      ownerType: 'EMPLOYEE',
      ownerId: currentUser.id,
      version: 1,
      fileSize: fileSize || '1.0 MB',
      mimeType: 'application/pdf',
      updatedAt: new Date().toISOString(),
      isSensitive,
    });

    mockStorage.addAuditLog('DOCUMENT_UPLOADED', 'DOCUMENT', `doc-${Date.now()}`);
    toast.success(`Document "${docName}" uploaded & validated cleanly!`);
    setIsModalOpen(false);
    setDocName('');
    setFileData(null);
  };

  const handleDownload = (doc: DocumentRecord) => {
    mockStorage.addAuditLog('DOCUMENT_DOWNLOADED', 'DOCUMENT', doc.id);
    toast.success(`Authorized short-lived download initiated for "${doc.name}"`);
  };

  const columns: Column<DocumentRecord>[] = [
    {
      key: 'name',
      header: 'Document Name',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              {d.name}
              {d.isSensitive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                  <Lock className="w-3 h-3 text-rose-500" /> SENSITIVE
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              Version v{d.version} • {d.fileSize}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (d) => <Badge variant="indigo">{d.category}</Badge>,
    },
    {
      key: 'status',
      header: 'Scan Status',
      render: (d) => <Badge status={d.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (d) => <span className="text-xs text-slate-500">{new Date(d.updatedAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (d) => (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={() => handleDownload(d)}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Document Library</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Private, versioned, malware-scanned document management for {currentTenant.name}.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Upload className="w-4 h-4" />}>
          Upload Document
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search document name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'EMPLOYMENT', label: 'Employment Contracts' },
              { value: 'IDENTIFICATION', label: 'Identification Scans' },
              { value: 'OFFER', label: 'Offer Letters' },
              { value: 'MEDICAL', label: 'Medical Records' },
              { value: 'TAX', label: 'Tax Forms' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(d) => d.id}
        emptyTitle="No documents found"
        emptyDescription="Upload employee contracts or identity records securely."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Secure Document"
        description="Private object storage upload with mandatory malware scan and audit trail."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument}>Upload Document</Button>
          </>
        }
      >
        <form onSubmit={handleCreateDocument} className="space-y-4">
          <FormField label="Document Title" required>
            <Input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Passport_Scan.pdf"
              required
            />
          </FormField>

          <FormField label="Document Category" required>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'EMPLOYMENT', label: 'Employment Contract' },
                { value: 'IDENTIFICATION', label: 'Identification (Passport / ID)' },
                { value: 'OFFER', label: 'Offer Letter' },
                { value: 'MEDICAL', label: 'Medical / Health Record' },
                { value: 'TAX', label: 'Tax Form' },
                { value: 'OTHER', label: 'Other Document' },
              ]}
            />
          </FormField>

          <FormField label="Security & Classification">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Mark as SENSITIVE (Requires explicit authorization & download audit)
            </label>
          </FormField>

          <FormField label="Select File Asset (PDF/Image up to 10MB)" required>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {fileName ? fileName : 'Click to select or drag file here'}
              </p>
              <input type="file" onChange={handleFileUpload} className="hidden" id="doc-file-input" />
              <label htmlFor="doc-file-input" className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer block mt-1">
                Browse Files
              </label>
            </div>
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
