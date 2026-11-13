import { todayVn } from "../../utils/date-vn.js";
import { ReminderSettingsService } from "./reminder-settings.service.js";
import { ReminderRunner } from "./reminder-runner.js";

const TICK_INTERVAL_MS = 10 * 60 * 1000; // 10 phút
const INITIAL_DELAY_MS = 60 * 1000; // 1 phút sau khởi động

const vnTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function currentTimeVn(now: Date): string {
  return vnTimeFormatter.format(now);
}

/**
 * Một lần kiểm tra: nếu nhắc hết hạn đang bật, giờ VN hiện tại đã tới hoặc
 * qua `runTime`, và hôm nay (giờ VN) chưa chạy (`lastRunDate !== today`) thì
 * chạy `ReminderRunner.run()`. Dùng riêng cho test (gọi trực tiếp với `now`
 * giả) và cho `setInterval` thật.
 */
export async function reminderSchedulerTick(now: () => Date = () => new Date()): Promise<void> {
  try {
    const settings = await ReminderSettingsService.get();
    if (!settings.enabled) return;

    const current = now();
    const today = todayVn(current);
    if (settings.lastRunDate === today) return;

    const currentTime = currentTimeVn(current);
    if (currentTime < settings.runTime) return;

    await ReminderRunner.run(today);
  } catch (error) {
    console.error("[ReminderScheduler] Lỗi khi kiểm tra/chạy nhắc hết hạn:", error);
  }
}

/**
 * Khởi động bộ hẹn giờ trong tiến trình: kiểm tra mỗi 10 phút (+ 1 lần sau
 * khởi động 1 phút). Không dùng thư viện cron ngoài — chỉ `setInterval`.
 * Không chạy khi `NODE_ENV === 'test'` để tránh ảnh hưởng test khác.
 */
export function startReminderScheduler(now: () => Date = () => new Date()): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  setTimeout(() => {
    void reminderSchedulerTick(now);
  }, INITIAL_DELAY_MS);

  setInterval(() => {
    void reminderSchedulerTick(now);
  }, TICK_INTERVAL_MS);
}
