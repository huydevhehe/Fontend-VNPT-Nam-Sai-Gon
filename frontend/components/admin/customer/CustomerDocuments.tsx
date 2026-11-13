"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Download, Trash2, UploadCloud, FileText } from "lucide-react";
import {
  CustomerDocumentRecord,
  getCustomerDocuments,
  uploadCustomerDocument,
  deleteCustomerDocument,
  downloadCustomerDocument,
} from "@/lib/api/customers.api";
import { DocumentType } from "@/lib/crm/types/crm.types";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABEL } from "@/lib/crm/constants/org.constants";

interface CustomerDocumentsProps {
  customerId: string;
  /** Chỉ Admin được xóa giấy tờ (theo route backend requireAdmin). */
  canDelete?: boolean;
}

function formatSize(size: number | null): string {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CustomerDocuments({ customerId, canDelete }: CustomerDocumentsProps) {
  const [docs, setDocs] = useState<CustomerDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const fileInputs = useRef<Record<DocumentType, HTMLInputElement | null>>({
    GPKD: null,
    CCCD: null,
    KHAC: null,
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getCustomerDocuments(customerId);
        if (isMounted) setDocs(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách giấy tờ");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  async function reload() {
    try {
      const data = await getCustomerDocuments(customerId);
      setDocs(data);
    } catch {
      // Giữ danh sách cũ nếu reload lỗi; lỗi upload/xóa đã báo riêng.
    }
  }

  async function handleUpload(docType: DocumentType, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploadingType(docType);
    try {
      await uploadCustomerDocument(customerId, docType, file);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên giấy tờ thất bại");
    } finally {
      setUploadingType(null);
    }
  }

  async function handleDownload(doc: CustomerDocumentRecord) {
    try {
      await downloadCustomerDocument(doc.id, doc.originalName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải file thất bại");
    }
  }

  async function handleDelete(doc: CustomerDocumentRecord) {
    setError(null);
    try {
      await deleteCustomerDocument(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa giấy tờ thất bại");
    }
  }

  if (loading) {
    return <p className="text-xs text-slate-400">Đang tải danh sách giấy tờ...</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
      )}

      {DOCUMENT_TYPES.map((docType) => {
        const docsOfType = docs.filter((d) => d.docType === docType);
        return (
          <div key={docType} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-700">{DOCUMENT_TYPE_LABEL[docType]}</h5>
              <div>
                <input
                  ref={(el) => {
                    fileInputs.current[docType] = el;
                  }}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleUpload(docType, e)}
                />
                <button
                  type="button"
                  disabled={uploadingType === docType}
                  onClick={() => fileInputs.current[docType]?.click()}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-vnpt hover:border-vnpt disabled:opacity-60"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  {uploadingType === docType ? "Đang tải lên..." : "Tải lên"}
                </button>
              </div>
            </div>

            {docsOfType.length === 0 ? (
              <p className="text-[11px] text-slate-400">Chưa có file</p>
            ) : (
              <div className="space-y-1.5">
                {docsOfType.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="truncate text-xs">
                        <div className="truncate font-medium text-slate-700">{doc.originalName}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatSize(doc.size)}
                          {doc.uploadedBy ? ` · ${doc.uploadedBy}` : ""}
                          {doc.createdAt ? ` · ${doc.createdAt.slice(0, 10)}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-vnpt"
                        title="Tải về"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
