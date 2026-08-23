import {
  BookOpen,
  Download,
  FileArchive,
  FileCode,
  FileCog,
  FileText,
  Presentation,
  ScrollText,
  ShieldCheck,
  Usb,
  type LucideIcon,
} from "lucide-react";

import { SMARTCA_BASE_URL, TOOL_GROUPS, type ToolFile } from "@/content/plugin-tools";

const GROUP_ICONS: Record<string, LucideIcon> = {
  "plugin-ky-so": ShieldCheck,
  "driver-token": Usb,
  "huong-dan": BookOpen,
  "tich-hop": FileCode,
  "quy-che": ScrollText,
};

const KIND_ICONS: Record<ToolFile["kind"], LucideIcon> = {
  exe: FileCog,
  pkg: FileCog,
  pdf: FileText,
  docx: FileText,
  rar: FileArchive,
  pptx: Presentation,
};

const KIND_BADGES: Record<ToolFile["kind"], string> = {
  exe: "bg-blue-50 text-blue-700",
  pkg: "bg-indigo-50 text-indigo-700",
  pdf: "bg-red-50 text-red-700",
  docx: "bg-sky-50 text-sky-700",
  rar: "bg-amber-50 text-amber-700",
  pptx: "bg-orange-50 text-orange-700",
};

export default function DownloadCatalog() {
  return (
    <section id="danh-muc-tai-ve" className="scroll-mt-24 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2>DANH MỤC TẢI VỀ</h2>

        <div className="mt-6 space-y-5">
          {TOOL_GROUPS.map((group, groupIndex) => {
            const GroupIcon = GROUP_ICONS[group.slug] ?? FileText;

            return (
              <div
                key={group.slug}
                className="overflow-hidden rounded-xl border border-slate-100 shadow-sm"
              >
                <div className="grid lg:grid-cols-4">
                  <div className="flex gap-4 bg-slate-50/70 p-5 lg:flex-col lg:gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-vnpt-light text-vnpt">
                      <GroupIcon size={26} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vnpt text-xs font-semibold text-white">
                          {groupIndex + 1}
                        </span>
                        <h3 className="text-vnpt-dark">{group.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{group.desc}</p>
                      <p className="mt-3 text-xs text-slate-500">{group.files.length} file</p>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs text-slate-500">
                            <th className="px-5 py-3 font-medium">Tên file</th>
                            <th className="w-32 px-5 py-3 font-medium">Định dạng</th>
                            <th className="w-24 px-5 py-3 text-right font-medium">Tải về</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.files.map((file) => {
                            const FileIcon = KIND_ICONS[file.kind];
                            return (
                              <tr
                                key={file.path}
                                className="border-b border-slate-50 last:border-b-0"
                              >
                                <td className="px-5 py-3">
                                  <span className="flex items-center gap-2.5 text-sm text-slate-700">
                                    <FileIcon size={18} className="shrink-0 text-vnpt" />
                                    {file.label}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  <span
                                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${KIND_BADGES[file.kind]}`}
                                  >
                                    {file.kind}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <a
                                    href={encodeURI(`${SMARTCA_BASE_URL}${file.path}`)}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Tải về ${file.label}`}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-vnpt text-white transition hover:bg-vnpt-dark"
                                  >
                                    <Download size={16} />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
