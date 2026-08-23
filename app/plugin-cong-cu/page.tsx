import type { Metadata } from "next";
import { Download, ExternalLink, ShieldCheck } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import {
  ONLINE_TOOLS,
  SMARTCA_BASE_URL,
  TOOL_GROUPS,
  type ToolFile,
} from "@/content/plugin-tools";

export const metadata: Metadata = {
  title: "Plugin & Công cụ — VNPT Nam Sài Gòn",
  description:
    "Tải bộ cài plugin ký số, driver USB Token và tài liệu hướng dẫn của VNPT. File tải trực tiếp từ máy chủ VNPT.",
};

const KIND_LABEL: Record<ToolFile["kind"], string> = {
  exe: "EXE",
  pkg: "PKG",
  pdf: "PDF",
  docx: "DOCX",
  rar: "RAR",
  pptx: "PPTX",
};

export default function PluginCongCuPage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            variant="light"
            items={[{ label: "Trang chủ", href: "/" }, { label: "Plugin & Công cụ" }]}
          />
          <h1 className="mt-3">PLUGIN &amp; CÔNG CỤ</h1>
          <p className="mt-2 max-w-2xl text-white/85">
            Bộ cài plugin ký số, driver USB Token và tài liệu hướng dẫn — tải trực tiếp từ máy
            chủ VNPT để luôn nhận bản mới nhất.
          </p>
        </div>
      </section>

      {/* CÔNG CỤ TẢI VỀ */}
      <section className="mx-auto max-w-7xl space-y-10 px-6 py-12">
        {TOOL_GROUPS.map((group) => (
          <div key={group.slug}>
            <h2 className="text-slate-800">{group.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{group.desc}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.files.map((file) => (
                <a
                  key={file.path}
                  href={`${SMARTCA_BASE_URL}${file.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-4 shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                    <Download size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">
                      {file.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {KIND_LABEL[file.kind]} · smartca.vnpt.vn
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* THAO TÁC TRỰC TUYẾN */}
      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-slate-800">Thao tác trực tuyến</h2>
          <p className="mt-1 text-sm text-slate-500">
            Các thao tác thực hiện trực tiếp trên cổng SmartCA của VNPT.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ONLINE_TOOLS.map((tool) => (
              <a
                key={tool.path}
                href={`${SMARTCA_BASE_URL}${tool.path}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-vnpt/40 hover:text-vnpt"
              >
                {tool.label}
                <ExternalLink size={15} className="shrink-0 text-slate-400" />
              </a>
            ))}
          </div>

          <p className="mt-6 flex items-start gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-vnpt" />
            Chỉ tải phần mềm từ tên miền chính thức của VNPT. Nếu cần hỗ trợ cài đặt, liên hệ
            VNPT Nam Sài Gòn qua hotline 0838 999 333.
          </p>
        </div>
      </section>
    </div>
  );
}
