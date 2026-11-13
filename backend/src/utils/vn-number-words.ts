const DIGIT_WORDS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readThreeDigits(val: number, hasHigherGroup: boolean): string {
  const h = Math.floor(val / 100);
  const t = Math.floor((val % 100) / 10);
  const u = val % 10;

  const parts: string[] = [];

  if (h > 0) {
    parts.push(`${DIGIT_WORDS[h]} trăm`);
  } else if (hasHigherGroup) {
    parts.push("không trăm");
  }

  if (t === 0) {
    if (u > 0) {
      if (h > 0 || hasHigherGroup) {
        parts.push(`linh ${DIGIT_WORDS[u]}`);
      } else {
        parts.push(DIGIT_WORDS[u]);
      }
    }
  } else if (t === 1) {
    if (u === 0) {
      parts.push("mười");
    } else if (u === 1) {
      parts.push("mười một");
    } else if (u === 4) {
      parts.push("mười bốn");
    } else if (u === 5) {
      parts.push("mười lăm");
    } else {
      parts.push(`mười ${DIGIT_WORDS[u]}`);
    }
  } else {
    // t >= 2
    const tenWord = `${DIGIT_WORDS[t]} mươi`;
    if (u === 0) {
      parts.push(tenWord);
    } else if (u === 1) {
      parts.push(`${tenWord} mốt`);
    } else if (u === 4) {
      parts.push(`${tenWord} tư`);
    } else if (u === 5) {
      parts.push(`${tenWord} lăm`);
    } else {
      parts.push(`${tenWord} ${DIGIT_WORDS[u]}`);
    }
  }

  return parts.join(" ");
}

const SCALE_WORDS = [
  "",
  "nghìn",
  "triệu",
  "tỷ",
  "nghìn tỷ",
  "triệu tỷ",
  "tỷ tỷ",
];

/**
 * Đọc số tiền thành chữ tiếng Việt.
 * - Làm tròn về số nguyên đồng.
 * - Chữ cái đầu viết hoa.
 * - Các nhóm (tỷ, triệu, nghìn, đơn vị) khác 0 nối bằng ", ".
 * - Kết thúc bằng " đồng".
 * - Số âm hoặc NaN -> ném Error.
 */
export function numberToVietnameseWords(amount: number): string {
  if (
    typeof amount !== "number" ||
    Number.isNaN(amount) ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error("Số tiền không hợp lệ");
  }

  const rounded = Math.round(amount);
  if (rounded === 0) {
    return "Không đồng";
  }

  // Chia thành các nhóm 3 chữ số từ phải sang trái
  const groups: number[] = [];
  let temp = BigInt(rounded);
  while (temp > 0n) {
    groups.push(Number(temp % 1000n));
    temp = temp / 1000n;
  }

  const parts: string[] = [];
  let hasHigherGroup = false;

  for (let i = groups.length - 1; i >= 0; i--) {
    const val = groups[i];
    if (val === 0) {
      continue;
    }

    const words = readThreeDigits(val, hasHigherGroup);
    const scale = SCALE_WORDS[i] ?? "";
    const groupText = scale ? `${words} ${scale}` : words;
    parts.push(groupText);
    hasHigherGroup = true;
  }

  const joined = parts.join(", ") + " đồng";
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}
