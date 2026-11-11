const vnDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Trả về ngày hôm nay theo múi giờ Việt Nam (Asia/Ho_Chi_Minh) dạng YYYY-MM-DD.
 */
export function todayVn(now?: Date): string {
  return vnDateFormatter.format(now ?? new Date());
}

/**
 * Trả về tháng hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh) dạng YYYY-MM.
 */
export function currentMonthVn(now?: Date): string {
  return todayVn(now).slice(0, 7);
}
