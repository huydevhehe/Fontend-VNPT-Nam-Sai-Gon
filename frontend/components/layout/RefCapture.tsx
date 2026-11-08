"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { storeRef } from "@/lib/referral";

/** Đọc `?ref=<mã>` trên mọi trang công khai và lưu lại để gắn vào lead khi khách gửi form. */
export default function RefCapture() {
  const pathname = usePathname();

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      storeRef(ref);
    }
  }, [pathname]);

  return null;
}
