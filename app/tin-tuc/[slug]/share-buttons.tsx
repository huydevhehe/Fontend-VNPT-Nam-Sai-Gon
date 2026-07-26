"use client";

// Nút chia sẻ bài viết. Bản lucide-react đang cài không có icon thương hiệu
// (Facebook/LinkedIn) nên dùng icon chung Share2/Link2 kèm aria-label phân biệt.
import { useState } from "react";
import { Link2, Share2 } from "lucide-react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function shareTo(platform: "facebook" | "linkedin") {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    const shareUrl =
      platform === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=520");
  }

  async function copyLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // trình duyệt không hỗ trợ clipboard API — bỏ qua
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Chia sẻ:</span>
      <button
        type="button"
        onClick={() => shareTo("facebook")}
        aria-label={`Chia sẻ "${title}" lên Facebook`}
        title="Chia sẻ lên Facebook"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-vnpt-light text-vnpt transition hover:bg-vnpt hover:text-white"
      >
        <Share2 size={15} />
      </button>
      <button
        type="button"
        onClick={() => shareTo("linkedin")}
        aria-label={`Chia sẻ "${title}" lên LinkedIn`}
        title="Chia sẻ lên LinkedIn"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-vnpt-light text-vnpt transition hover:bg-vnpt hover:text-white"
      >
        <Share2 size={15} />
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Sao chép liên kết bài viết"
        title="Sao chép liên kết"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-vnpt-light text-vnpt transition hover:bg-vnpt hover:text-white"
      >
        <Link2 size={15} />
      </button>
      {copied && <span className="text-xs font-medium text-emerald-600">Đã sao chép!</span>}
    </div>
  );
}
