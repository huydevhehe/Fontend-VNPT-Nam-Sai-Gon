import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const TEMPLATE_PATH = fs.existsSync(path.resolve(process.cwd(), 'backend/templates/de-nghi-thanh-toan.docx'))
  ? path.resolve(process.cwd(), 'backend/templates/de-nghi-thanh-toan.docx')
  : path.resolve(process.cwd(), 'templates/de-nghi-thanh-toan.docx');

test('payment-request docx template contains all required variables', () => {
  // Ensure template file exists
  assert.equal(fs.existsSync(TEMPLATE_PATH), true, 'Template file must exist at templates/de-nghi-thanh-toan.docx');

  const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
  const zip = new PizZip(content);
  const docXml = zip.file('word/document.xml')?.asText();

  assert.ok(docXml, 'word/document.xml must exist in template docx');

  // 1. Five pre-existing variables
  const preExistingVars = [
    '{GoiCuoc}',
    '{MaTB}',
    '{HinhThucThanhToan}',
    '{GiaTriHopDong}',
    '{MaGD}',
  ];
  for (const v of preExistingVars) {
    assert.ok(
      docXml.includes(v),
      `Pre-existing variable ${v} must be present in document.xml`
    );
  }

  // 2. Newly replaced variables
  const newVars = [
    '{SoVanBan}',
    '{Ngay}',
    '{Thang}',
    '{Nam}',
    '{TenDichVu}',
    '{TenKhachHang}',
    '{MaSoThue}',
    '{SoHopDong}',
    '{SoTienBangChu}',
    '{DonViThuHuong}',
    '{SoTaiKhoan}',
    '{NganHang}',
    '{TenVietTatAM}',
    '{TenAM}',
    '{SdtAM}',
    '{EmailAM}',
    '{NguoiKy}',
  ];
  for (const v of newVars) {
    assert.ok(
      docXml.includes(v),
      `New variable ${v} must be present in document.xml`
    );
  }

  // 3. Verify hardcoded texts were successfully replaced
  assert.equal(docXml.includes('Số:  706 /'), false, 'Hardcoded 706 must be replaced');
  assert.equal(docXml.includes('ngày 26 tháng 10 năm 2026'), false, 'Hardcoded date must be replaced');
  assert.equal(docXml.includes('eduOffice'), false, 'Hardcoded eduOffice must be replaced in both places');
  assert.equal(
    docXml.includes('TRƯỜNG TIỂU HỌC, TRUNG HỌC CƠ SỞ VÀ TRUNG HỌC PHỔ THÔNG NAM SÀI GÒN'),
    false,
    'Hardcoded school name must be replaced'
  );
  assert.equal(docXml.includes('0319653211'), false, 'Hardcoded tax code must be replaced');
  assert.equal(docXml.includes('20261023/0319653211/VNPT.NSG/VNPT026696'), false, 'Hardcoded contract number must be replaced');
  assert.equal(docXml.includes('Năm triệu, chín trăm bốn mươi nghìn đồng'), false, 'Hardcoded amount in words must be replaced');
  assert.equal(docXml.includes('1058561111'), false, 'Hardcoded bank account must be replaced');
  assert.equal(docXml.includes('KHOA NSG'), false, 'Hardcoded KHOA NSG must be replaced');
  assert.equal(docXml.includes('Vũ Tiến Khoa – 0838.999.333'), false, 'Hardcoded AM info must be replaced');
  assert.equal(docXml.includes('Lê Văn Thuần'), false, 'Hardcoded signer must be replaced');
});

test('payment-request docx template renders without docxtemplater errors', () => {
  const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  const sampleData = {
    SoVanBan: '706',
    Ngay: '26',
    Thang: '10',
    Nam: '2026',
    TenDichVu: 'Dịch vụ Kiểm thử CRM',
    TenKhachHang: 'CÔNG TY TNHH TEST CLIENT',
    MaSoThue: '0123456789',
    SoHopDong: 'HD-2026-TEST',
    SoTienBangChu: 'Mười triệu đồng',
    DonViThuHuong: 'VNPT TP.HCM',
    SoTaiKhoan: '99998888',
    NganHang: 'Vietcombank',
    TenVietTatAM: 'AN',
    TenAM: 'Nguyễn Văn An',
    SdtAM: '0901234567',
    EmailAM: 'an.nv@vnpt.vn',
    NguoiKy: 'Trần Văn Ký',
    GoiCuoc: 'Gói VIP 12M',
    MaTB: 'TB001, TB002',
    HinhThucThanhToan: 'Chuyển khoản',
    GiaTriHopDong: '10.000.000 đồng',
    MaGD: 'GD999888',
  };

  assert.doesNotThrow(() => {
    doc.render(sampleData);
  }, 'docxtemplater render must not throw syntax or tag errors');

  const renderedXml = doc.getZip().file('word/document.xml')?.asText();
  assert.ok(renderedXml, 'Rendered docx must contain document.xml');
  assert.ok(renderedXml.includes('Dịch vụ Kiểm thử CRM'), 'Rendered docx must contain replaced service name');
  assert.ok(renderedXml.includes('CÔNG TY TNHH TEST CLIENT'), 'Rendered docx must contain replaced customer name');
  assert.ok(renderedXml.includes('10.000.000 đồng'), 'Rendered docx must contain contract value');
});
