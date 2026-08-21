import { CheckCircle2 } from "lucide-react";

const metrics = [
  {
    value: "< 1.0",
    unit: "%",
    label: "Độ chính xác CV",
    note: "In vivo precision",
  },
  {
    value: "≈ 60",
    unit: "s",
    label: "Thời gian quét",
    note: "Spine & Femur AP",
  },
  {
    value: "DICOM 3.0",
    unit: "",
    label: "Chuẩn kết nối",
    note: "HIS / RIS / PACS",
  },
  {
    value: "24/7",
    unit: "",
    label: "Hỗ trợ kỹ thuật",
    note: "Hotline chuyên môn",
  },
];

export default function MetricsStrip() {
  return (
    <section
      id="metrics"
      className="bg-slate-50 border-y border-slate-200"
      aria-label="Thông số kỹ thuật nổi bật"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col gap-1 px-6 py-6 hover:bg-white transition-colors duration-150"
            >
              <div className="flex items-baseline gap-1">
                <span className="font-mono-data tabular-nums text-2xl font-semibold text-[#0284c7] leading-none">
                  {m.value}
                </span>
                {m.unit && (
                  <span className="font-mono-data text-sm text-slate-500">
                    {m.unit}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800">{m.label}</p>
              <p className="text-xs text-slate-400">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
