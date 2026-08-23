import {
  CalendarClock,
  Download,
  ExternalLink,
  FilePen,
  FileSearch,
  Headset,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

import { ONLINE_TOOLS, SMARTCA_BASE_URL } from "@/content/plugin-tools";

const ICONS: LucideIcon[] = [Headset, KeyRound, FileSearch, Download, CalendarClock, FilePen];

export default function OnlineTools() {
  return (
    <section id="thao-tac-truc-tuyen" className="scroll-mt-24 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2>THAO TÁC TRỰC TUYẾN</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ONLINE_TOOLS.map((tool, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <a
                key={tool.path}
                href={`${SMARTCA_BASE_URL}${tool.path}`}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col items-center rounded-xl border border-slate-100 p-5 text-center shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <ExternalLink
                  size={14}
                  className="absolute top-3 right-3 text-vnpt/60 transition group-hover:text-vnpt"
                />
                <Icon size={36} strokeWidth={1.5} className="text-vnpt" />
                <span className="mt-3 text-sm font-semibold text-vnpt-dark">{tool.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
