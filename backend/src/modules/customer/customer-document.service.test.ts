import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const { initDatabase } = await import("../../database/db.js");
const { CustomerService } = await import("./customer.service.js");
const { config } = await import("../../config/index.js");
const {
  CustomerDocumentService,
  CustomerDocumentServiceError,
  detectDocumentKind,
} = await import("./customer-document.service.js");

await initDatabase();

function customerDocsDir(customerId: string): string {
  return path.join(config.uploadDir, "customer-docs", customerId);
}

async function createTestCustomer(suffix: string | number) {
  const customerService = new CustomerService();
  const result = await customerService.create({
    name: `KH Giấy Tờ ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
  });
  return result.customer.id as string;
}

test("detectDocumentKind nhận diện đúng 3 loại và trả null cho buffer rác", () => {
  const pdf = Buffer.from("%PDF-1.4\nrest of content");
  const docx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]); // ZIP/PK header
  const doc = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0x00, 0x00]); // OLE header
  const garbage = Buffer.from("MZ\x90\x00this is actually an exe");

  assert.equal(detectDocumentKind(pdf), "pdf");
  assert.equal(detectDocumentKind(docx), "docx");
  assert.equal(detectDocumentKind(doc), "doc");
  assert.equal(detectDocumentKind(garbage), null);
});

test("save rejects fake pdf (nội dung MZ đổi đuôi .pdf) và không để lại file trên đĩa", async () => {
  const service = new CustomerDocumentService();
  const suffix = Date.now();
  const customerId = await createTestCustomer(suffix);

  await assert.rejects(
    async () => {
      await service.save(
        customerId,
        "GPKD",
        {
          originalname: "a.pdf",
          buffer: Buffer.from("MZ\x90\x00\x03this-is-actually-an-exe-renamed"),
          mimetype: "application/pdf",
          size: 40,
        },
        "Admin"
      );
    },
    (err: any) => {
      assert.ok(err instanceof CustomerDocumentServiceError);
      assert.equal(err.status, 400);
      return true;
    }
  );

  const dir = customerDocsDir(customerId);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  assert.equal(files.length, 0, "Không được để lại file nào trên đĩa sau khi từ chối");
});

test("save stores file under random name, not the original filename", async () => {
  const service = new CustomerDocumentService();
  const suffix = Date.now();
  const customerId = await createTestCustomer(suffix);

  const pdfContent = Buffer.from("%PDF-1.4\n%nội dung giấy phép kinh doanh test\n%%EOF");
  const doc = await service.save(
    customerId,
    "GPKD",
    {
      originalname: "giay-phep-kinh-doanh.pdf",
      buffer: pdfContent,
      mimetype: "application/pdf",
      size: pdfContent.length,
    },
    "Admin"
  );

  assert.equal(doc.originalName, "giay-phep-kinh-doanh.pdf");
  assert.equal(doc.docType, "GPKD");

  const dir = customerDocsDir(customerId);
  const files = fs.readdirSync(dir);
  assert.equal(files.length, 1);
  assert.notEqual(files[0], "giay-phep-kinh-doanh.pdf");
  assert.match(files[0], /\.pdf$/);

  const fetched = await service.getFile(doc.id);
  assert.equal(fs.readFileSync(fetched.path).toString(), pdfContent.toString());
  assert.equal(fetched.originalName, "giay-phep-kinh-doanh.pdf");
});

test("remove deletes file from disk", async () => {
  const service = new CustomerDocumentService();
  const suffix = Date.now();
  const customerId = await createTestCustomer(suffix);

  const pdfContent = Buffer.from("%PDF-1.4\n%để xóa\n%%EOF");
  const doc = await service.save(
    customerId,
    "KHAC",
    {
      originalname: "khac.pdf",
      buffer: pdfContent,
      mimetype: "application/pdf",
      size: pdfContent.length,
    },
    "Admin"
  );

  const dir = customerDocsDir(customerId);
  assert.equal(fs.readdirSync(dir).length, 1);

  await service.remove(doc.id);

  assert.equal(fs.readdirSync(dir).length, 0);
  await assert.rejects(async () => {
    await service.getFile(doc.id);
  });
});

test("save rejects docType không hợp lệ", async () => {
  const service = new CustomerDocumentService();
  const suffix = Date.now();
  const customerId = await createTestCustomer(suffix);

  await assert.rejects(
    async () => {
      await service.save(
        customerId,
        "LOAI_LA",
        {
          originalname: "a.pdf",
          buffer: Buffer.from("%PDF-1.4\n"),
          mimetype: "application/pdf",
          size: 9,
        },
        "Admin"
      );
    },
    (err: any) => {
      assert.ok(err instanceof CustomerDocumentServiceError);
      assert.equal(err.status, 400);
      return true;
    }
  );
});

test("save rejects khi đuôi không khớp 3 loại cho phép", async () => {
  const service = new CustomerDocumentService();
  const suffix = Date.now();
  const customerId = await createTestCustomer(suffix);

  await assert.rejects(async () => {
    await service.save(
      customerId,
      "GPKD",
      {
        originalname: "a.exe",
        buffer: Buffer.from("MZ\x90\x00"),
        mimetype: "application/octet-stream",
        size: 4,
      },
      "Admin"
    );
  });
});
