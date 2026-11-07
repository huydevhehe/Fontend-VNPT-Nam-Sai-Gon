"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { safeRedirectTarget, storeRef } from "@/lib/referral";

export default function RefRedirectPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params?.code;

  useEffect(() => {
    if (typeof code === "string") {
      try {
        storeRef(decodeURIComponent(code));
      } catch {
        // Mã sai định dạng URL: bỏ qua, vẫn chuyển hướng.
      }
    }
    const to = new URLSearchParams(window.location.search).get("to");
    router.replace(safeRedirectTarget(to));
  }, [code, router]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 text-center text-sm text-slate-500">
      Đang chuyển hướng...
    </div>
  );
}
