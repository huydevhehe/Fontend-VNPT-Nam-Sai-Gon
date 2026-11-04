"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyLinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
      <input readOnly value={link} className="w-full truncate bg-transparent px-2 text-sm text-slate-700 outline-none" />
      <button
        type="button"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-md bg-vnpt px-3 py-2 text-xs font-semibold text-white hover:bg-vnpt-dark"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Đã sao chép" : "Sao chép"}
      </button>
    </div>
  );
}
