import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { query, run } from "../../database/db.js";
import { config } from "../../config/index.js";
import { DOCUMENT_TYPES } from "../../constants/org.js";

export class CustomerDocumentServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404
  ) {
    super(message);
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXT = /\.(pdf|docx|doc)$/i;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Một số browser/OS gửi octet-stream chung cho .doc — vẫn phải qua kiểm
  // tra đuôi + magic byte ở dưới nên không mở lỗ hổng.
  "application/octet-stream",
]);

export type DocumentKind = "pdf" | "docx" | "doc";

/**
 * Nhận diện định dạng thật của file qua 4 byte đầu (magic bytes), KHÔNG tin
 * đuôi file người dùng gửi (Review Focus #2, `dot-07.md`):
 * - PDF: "%PDF" (0x25 0x50 0x44 0x46)
 * - DOCX: ZIP container, bắt đầu "PK" (0x50 0x4B)
 * - DOC: OLE Compound File, bắt đầu D0 CF 11 E0
 * Trả null nếu không khớp bất kỳ định dạng nào trong 3 loại trên.
 */
export function detectDocumentKind(head: Buffer): DocumentKind | null {
  if (head.length >= 4 && head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) {
    return "pdf";
  }
  if (head.length >= 2 && head[0] === 0x50 && head[1] === 0x4b) {
    return "docx";
  }
  if (
    head.length >= 4 &&
    head[0] === 0xd0 &&
    head[1] === 0xcf &&
    head[2] === 0x11 &&
    head[3] === 0xe0
  ) {
    return "doc";
  }
  return null;
}

function extensionKind(originalname: string): DocumentKind | null {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if (ext === ".doc") return "doc";
  return null;
}

function isValidDocType(docType: unknown): docType is (typeof DOCUMENT_TYPES)[number] {
  return typeof docType === "string" && (DOCUMENT_TYPES as readonly string[]).includes(docType);
}

export interface UploadFileInput {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface CustomerDocumentDto {
  id: string;
  customerId: string;
  docType: string;
  originalName: string;
  mime: string | null;
  size: number | null;
  uploadedBy: string | null;
  createdAt: string | null;
}

function toDto(row: any): CustomerDocumentDto {
  return {
    id: row.id,
    customerId: row.customer_id,
    docType: row.doc_type,
    originalName: row.original_name,
    mime: row.mime ?? null,
    size: row.size !== undefined && row.size !== null ? Number(row.size) : null,
    uploadedBy: row.uploaded_by ?? null,
    createdAt: row.created_at ?? null,
  };
}

export class CustomerDocumentService {
  private customerDocsDir(customerId: string): string {
    return path.join(config.uploadDir, "customer-docs", customerId);
  }

  async save(
    customerId: string,
    docType: unknown,
    file: UploadFileInput,
    uploader: string
  ): Promise<CustomerDocumentDto> {
    if (!isValidDocType(docType)) {
      throw new CustomerDocumentServiceError("Loại giấy tờ không hợp lệ", 400);
    }

    const customerRows = await query("SELECT id FROM customers WHERE id = ?", [customerId]);
    if (customerRows.length === 0) {
      throw new CustomerDocumentServiceError("Không tìm thấy khách hàng", 404);
    }

    if (!file || !file.buffer || !file.originalname) {
      throw new CustomerDocumentServiceError("Vui lòng chọn file để tải lên", 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new CustomerDocumentServiceError("File vượt quá 10 MB", 400);
    }

    const extKind = extensionKind(file.originalname);
    if (!extKind) {
      throw new CustomerDocumentServiceError("Chỉ chấp nhận file PDF, DOC hoặc DOCX", 400);
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new CustomerDocumentServiceError("Định dạng file không hợp lệ (sai MIME)", 400);
    }

    // Kiểm 4 byte đầu thật của nội dung — chặn file đổi đuôi (vd .exe -> .pdf).
    const actualKind = detectDocumentKind(file.buffer.subarray(0, 4));
    if (!actualKind || actualKind !== extKind) {
      throw new CustomerDocumentServiceError(
        "Nội dung file không khớp định dạng (file có thể đã bị đổi đuôi)",
        400
      );
    }

    const storedName = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    const dir = this.customerDocsDir(customerId);
    fs.mkdirSync(dir, { recursive: true });
    const fullPath = path.join(dir, storedName);
    fs.writeFileSync(fullPath, file.buffer);

    const id = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await run(
        `INSERT INTO customer_documents (
          id, customer_id, doc_type, original_name, stored_name, mime, size, uploaded_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          customerId,
          docType,
          file.originalname,
          storedName,
          file.mimetype,
          file.size,
          uploader || null,
          new Date().toISOString(),
        ]
      );
    } catch (error) {
      // Ghi DB lỗi thì xóa luôn file vừa viết, không để rác mồ côi trên đĩa.
      fs.rmSync(fullPath, { force: true });
      throw error;
    }

    const rows = await query<any>("SELECT * FROM customer_documents WHERE id = ?", [id]);
    return toDto(rows[0]);
  }

  async list(customerId: string): Promise<CustomerDocumentDto[]> {
    const rows = await query<any>(
      "SELECT * FROM customer_documents WHERE customer_id = ? ORDER BY created_at DESC",
      [customerId]
    );
    return rows.map(toDto);
  }

  async getFile(documentId: string): Promise<{ path: string; originalName: string; mime: string | null }> {
    const rows = await query<any>("SELECT * FROM customer_documents WHERE id = ?", [documentId]);
    if (rows.length === 0) {
      throw new CustomerDocumentServiceError("Không tìm thấy giấy tờ", 404);
    }
    const row = rows[0];
    const fullPath = path.join(this.customerDocsDir(row.customer_id), row.stored_name);
    return { path: fullPath, originalName: row.original_name, mime: row.mime ?? null };
  }

  async remove(documentId: string): Promise<void> {
    const rows = await query<any>("SELECT * FROM customer_documents WHERE id = ?", [documentId]);
    if (rows.length === 0) {
      throw new CustomerDocumentServiceError("Không tìm thấy giấy tờ", 404);
    }
    const row = rows[0];
    const fullPath = path.join(this.customerDocsDir(row.customer_id), row.stored_name);
    await run("DELETE FROM customer_documents WHERE id = ?", [documentId]);
    fs.rmSync(fullPath, { force: true });
  }
}
