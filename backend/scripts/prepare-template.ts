import fs from 'node:fs';
import path from 'node:path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

/**
 * Script prepare-template.ts:
 * Chuẩn hóa template docx đề nghị thanh toán từ file mẫu gốc sang backend/templates/de-nghi-thanh-toan.docx
 * Thay thế 13 đoạn chữ cứng thành biến docxtemplater tương ứng.
 */
export function preparePaymentRequestTemplate(
  sourcePath?: string,
  destPath?: string
): void {
  // Determine root directory
  const isInsideBackend = fs.existsSync(path.resolve(process.cwd(), 'src/server.ts'));
  const rootDir = isInsideBackend ? path.resolve(process.cwd(), '..') : process.cwd();

  const actualSource = sourcePath || path.resolve(rootDir, 'Mẫu_Thông báo_ Đề nghị thanh toán_XXXXX_Không Backgroup.docx');
  const actualDest = destPath || path.resolve(rootDir, 'backend/templates/de-nghi-thanh-toan.docx');

  if (!fs.existsSync(actualSource)) {
    throw new Error(`Source template not found at ${actualSource}`);
  }

  const destDir = path.dirname(actualDest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const content = fs.readFileSync(actualSource, 'binary');
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml')?.asText();
  if (!xml) {
    throw new Error('word/document.xml not found in template');
  }

  // 1. Số: 706 -> Số: {SoVanBan}
  const target1 = `<w:t>70</w:t></w:r><w:r w:rsidR="007059D6"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>6</w:t>`;
  const repl1 = `<w:t>{SoVanBan}</w:t>`;
  if (!xml.includes(target1)) throw new Error('Target 1 (SoVanBan) not found!');
  xml = xml.replace(target1, repl1);

  // 2. ngày 26 tháng 10 năm 2026 -> ngày {Ngay} tháng {Thang} năm {Nam}
  const target2 = `<w:r w:rsidRPr="00AD1A59"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>, ngày</w:t></w:r><w:r w:rsidRPr="00CF7489"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>2</w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>6</w:t></w:r><w:r w:rsidRPr="00AD1A59"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r w:rsidRPr="00AD1A59"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">tháng </w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>10</w:t></w:r><w:r w:rsidRPr="00AD1A59"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> năm</w:t></w:r><w:r w:rsidRPr="00AD1A59"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r w:rsidRPr="00CF7489"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>202</w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>6</w:t></w:r>`;
  const repl2 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">, ngày </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>{Ngay}</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> tháng </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>{Thang}</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> năm </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:sz w:val="26"/><w:szCs w:val="24"/></w:rPr><w:t>{Nam}</w:t></w:r>`;
  if (!xml.includes(target2)) throw new Error('Target 2 (Ngay Thang Nam) not found!');
  xml = xml.replace(target2, repl2);

  // 3. eduOffice -> {TenDichVu} (2 places: P15 & P19)
  const target3_1 = `<w:r w:rsidR="001E2372"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="28"/></w:rPr><w:t>eduOffice</w:t></w:r>`;
  const repl3_1 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="26"/><w:szCs w:val="28"/></w:rPr><w:t>{TenDichVu}</w:t></w:r>`;
  if (!xml.includes(target3_1)) throw new Error('Target 3_1 (eduOffice in P15) not found!');
  xml = xml.replace(target3_1, repl3_1);

  const target3_2 = `<w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>eduOffice</w:t></w:r>`;
  const repl3_2 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{TenDichVu}</w:t></w:r>`;
  if (!xml.includes(target3_2)) throw new Error('Target 3_2 (eduOffice in P19) not found!');
  xml = xml.replace(target3_2, repl3_2);

  // 4. TRƯỜNG TIỂU HỌC, TRUNG HỌC CƠ SỞ VÀ TRUNG HỌC PHỔ THÔNG NAM SÀI GÒN -> {TenKhachHang} (P16)
  const target4 = `<w:r w:rsidR="0053775C"><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t xml:space="preserve">TRƯỜNG </w:t></w:r><w:r w:rsidR="007059D6"><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t>TIỂU HỌC, TRUNG HỌC CƠ SỞ VÀ TRUNG HỌC PHỔ THÔNG NAM SÀI GÒN</w:t></w:r>`;
  const repl4 = `<w:r><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t>{TenKhachHang}</w:t></w:r>`;
  if (!xml.includes(target4)) throw new Error('Target 4 (TenKhachHang) not found!');
  xml = xml.replace(target4, repl4);

  // 5. 0319653211 (Mã số thuế) -> {MaSoThue} (P17)
  const target5 = `<w:r w:rsidRPr="00827E6C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Mã số thuế</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve">: </w:t></w:r><w:r w:rsidR="007059D6"><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>0319653211</w:t></w:r>`;
  const repl5 = `<w:r w:rsidRPr="00827E6C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Mã số thuế</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve">: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{MaSoThue}</w:t></w:r>`;
  if (!xml.includes(target5)) throw new Error('Target 5 (MaSoThue) not found!');
  xml = xml.replace(target5, repl5);

  // 6. 20261023/0319653211/VNPT.NSG/VNPT026696 -> {SoHopDong} (P19)
  const target6 = `<w:r w:rsidR="0053775C"><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t>2026102</w:t></w:r><w:r w:rsidR="008975AF"><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t>3</w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t>/</w:t></w:r><w:r w:rsidR="007059D6"><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>0319653211</w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t xml:space="preserve">/VNPT.NSG/VNPT026696 </w:t></w:r>`;
  const repl6 = `<w:r><w:rPr><w:rStyle w:val="fontstyle01"/></w:rPr><w:t>{SoHopDong}</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r>`;
  if (!xml.includes(target6)) throw new Error('Target 6 (SoHopDong) not found!');
  xml = xml.replace(target6, repl6);

  // 7. Năm triệu, chín trăm bốn mươi nghìn đồng -> {SoTienBangChu} (P23)
  const target7 = `<w:r w:rsidR="00205DF1"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Năm</w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> triệu</w:t></w:r><w:r w:rsidR="00551879"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve">, </w:t></w:r><w:r w:rsidR="00205DF1"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>chín</w:t></w:r><w:r w:rsidR="00BF3578"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> trăm </w:t></w:r><w:r w:rsidR="00205DF1"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>bốn</w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> mươi</w:t></w:r><w:r w:rsidR="00BF3578"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> nghìn</w:t></w:r><w:r w:rsidR="00551879"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r w:rsidRPr="008C480D"><w:rPr><w:rStyle w:val="fontstyle01"/><w:i/></w:rPr><w:t>đồng</w:t></w:r>`;
  const repl7 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{SoTienBangChu}</w:t></w:r>`;
  if (!xml.includes(target7)) throw new Error('Target 7 (SoTienBangChu) not found!');
  xml = xml.replace(target7, repl7);

  // 8. VNPT thành phố Hồ Chí Minh (sau Đơn vị thụ hưởng) -> {DonViThuHuong} (P25)
  const target8 = `<w:r w:rsidR="008536C1"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve">VNPT </w:t></w:r><w:r w:rsidR="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>thành phố</w:t></w:r><w:r w:rsidR="008536C1"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> Hồ Chí Minh</w:t></w:r>`;
  const repl8 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{DonViThuHuong}</w:t></w:r>`;
  if (!xml.includes(target8)) throw new Error('Target 8 (DonViThuHuong) not found!');
  xml = xml.replace(target8, repl8);

  // 9. 1058561111 -> {SoTaiKhoan} (P26)
  const target9 = `<w:r w:rsidR="0053775C" w:rsidRPr="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>1058561111</w:t></w:r>`;
  const repl9 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{SoTaiKhoan}</w:t></w:r>`;
  if (!xml.includes(target9)) throw new Error('Target 9 (SoTaiKhoan) not found!');
  xml = xml.replace(target9, repl9);

  // 10. TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank) -> {NganHang} (P27)
  const target10 = `<w:r w:rsidRPr="0053775C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank)</w:t></w:r>`;
  const repl10 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> {NganHang}</w:t></w:r>`;
  if (!xml.includes(target10)) throw new Error('Target 10 (NganHang) not found!');
  xml = xml.replace(target10, repl10);

  // 11. KHOA NSG -> {TenVietTatAM} NSG (P28)
  const target11 = `<w:r w:rsidR="00F74709"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>KHOA</w:t></w:r><w:r w:rsidR="008C480D" w:rsidRPr="00827E6C"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> NSG</w:t></w:r>`;
  const repl11 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{TenVietTatAM} NSG</w:t></w:r>`;
  if (!xml.includes(target11)) throw new Error('Target 11 (TenVietTatAM) not found!');
  xml = xml.replace(target11, repl11);

  // 12. Vũ Tiến Khoa – 0838.999.333 – khoavt.hcm@vnpt.vn -> {TenAM} – {SdtAM} – {EmailAM} (P30)
  const target12 = `<w:r w:rsidR="008536C1" w:rsidRPr="008536C1"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Vũ Tiến Khoa – 0838.999.333</w:t></w:r><w:r w:rsidR="00CF7489"><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve"> – khoavt.hcm@vnpt.vn</w:t></w:r>`;
  const repl12 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:i/><w:spacing w:val="-1"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>{TenAM} – {SdtAM} – {EmailAM}</w:t></w:r>`;
  if (!xml.includes(target12)) throw new Error('Target 12 (TenAM - SdtAM - EmailAM) not found!');
  xml = xml.replace(target12, repl12);

  // 13. Lê Văn Thuần -> {NguoiKy} (P45)
  const target13 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>Lê Văn Thuần</w:t></w:r>`;
  const repl13 = `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:spacing w:val="-1"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>{NguoiKy}</w:t></w:r>`;
  if (!xml.includes(target13)) throw new Error('Target 13 (NguoiKy) not found!');
  xml = xml.replace(target13, repl13);

  // Save back to zip
  zip.file('word/document.xml', xml);
  const updatedBuffer = zip.generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  fs.writeFileSync(actualDest, updatedBuffer);
  console.log(`Successfully generated template: ${actualDest}`);
}

// Execute if run directly
if (process.argv[1]?.endsWith('prepare-template.ts') || process.argv[1]?.endsWith('prepare-template.js')) {
  preparePaymentRequestTemplate();
}
