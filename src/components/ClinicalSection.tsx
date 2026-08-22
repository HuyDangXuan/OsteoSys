import { ShieldCheck, FlaskConical, Activity, Award } from "lucide-react";

const standards = [
  {
    icon: ShieldCheck,
    title: "Chuẩn ISCD & WHO",
    body: "Toàn bộ thiết bị OsteoSys tuân thủ hướng dẫn lâm sàng của International Society for Clinical Densitometry (ISCD) và tiêu chuẩn chẩn đoán loãng xương của WHO. T-score và Z-score được chuẩn hóa theo dữ liệu tham chiếu NHANES III.",
  },
  {
    icon: FlaskConical,
    title: "Kiểm chuẩn hàng ngày (Daily QC)",
    body: "Mỗi hệ thống DEXA đi kèm Phantom kiểm chuẩn mật độ xương chuẩn Hologic/European Spine Phantom. Quy trình Daily QC bắt buộc trước mỗi ca khám, phần mềm tự động cảnh báo khi hệ số biến thiên vượt ngưỡng cho phép.",
  },
  {
    icon: Activity,
    title: "Liều bức xạ cực thấp",
    body: "Liều bức xạ bệnh nhân khi quét cột sống chỉ ~1.4 μSv — tương đương với 1/10 liều chụp X-quang ngực thông thường. Thiết bị đạt chuẩn IEC 60601-1 và tuân thủ khuyến cáo NCRP 102 về kiểm soát liều bức xạ y tế.",
  },
  {
    icon: Award,
    title: "Đào tạo & Chứng nhận vận hành",
    body: "Đội ngũ kỹ thuật viên OsteoSys được đào tạo theo chương trình chứng nhận của ISCD. Mỗi ca lắp đặt kèm theo khóa đào tạo vận hành chuyên sâu và cấp chứng chỉ cho nhân viên kỹ thuật y tế của cơ sở.",
  },
];

interface ClinicalSectionProps {
  data?: {
    standards?: Array<{ title: string; body: string }>;
    badges?: string[];
  };
}

export default function ClinicalSection({ data }: ClinicalSectionProps) {
  const defaultBadges = ["ISCD 2023", "WHO T-score", "DICOM 3.0", "IEC 60601-1", "ISO 13485"];
  const badgesToRender = data?.badges && data.badges.length > 0 ? data.badges : defaultBadges;

  const defaultStandards = [
    {
      title: "Chuẩn ISCD & WHO",
      body: "Toàn bộ thiết bị OsteoSys tuân thủ hướng dẫn lâm sàng của International Society for Clinical Densitometry (ISCD) và tiêu chuẩn chẩn đoán loãng xương của WHO. T-score và Z-score được chuẩn hóa theo dữ liệu tham chiếu NHANES III.",
    },
    {
      title: "Kiểm chuẩn hàng ngày (Daily QC)",
      body: "Mỗi hệ thống DEXA đi kèm Phantom kiểm chuẩn mật độ xương chuẩn Hologic/European Spine Phantom. Quy trình Daily QC bắt buộc trước mỗi ca khám, phần mềm tự động cảnh báo khi hệ số biến thiên vượt ngưỡng cho phép.",
    },
    {
      title: "Liều bức xạ cực thấp",
      body: "Liều bức xạ bệnh nhân khi quét cột sống chỉ ~1.4 μSv — tương đương với 1/10 liều chụp X-quang ngực thông thường. Thiết bị đạt chuẩn IEC 60601-1 và tuân thủ khuyến cáo NCRP 102 về kiểm soát liều bức xạ y tế.",
    },
    {
      title: "Đào tạo & Chứng nhận vận hành",
      body: "Đội ngũ kỹ thuật viên OsteoSys được đào tạo theo chương trình chứng nhận của ISCD. Mỗi ca lắp đặt kèm theo khóa đào tạo vận hành chuyên sâu và cấp chứng chỉ cho nhân viên kỹ thuật y tế của cơ sở.",
    },
  ];

  const standardsToRender = data?.standards && data.standards.length > 0 ? data.standards : defaultStandards;
  const icons = [ShieldCheck, FlaskConical, Activity, Award];

  return (
    <section
      id="clinical"
      className="py-20 bg-white dark:bg-[#0b0f17] transition-colors duration-200"
      aria-label="Chuẩn lâm sàng OsteoSys"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">

          {/* Left — section label + headline */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0284c7] dark:text-cyan-400 font-mono-data mb-3">
              Chuẩn lâm sàng
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-balance">
              Độ tin cậy được xây dựng trên tiêu chuẩn y tế quốc tế
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              OsteoSys không chỉ cung cấp thiết bị — chúng tôi bảo đảm toàn bộ quy trình đo lường đạt chuẩn lâm sàng từ hiệu chuẩn đến báo cáo kết quả.
            </p>

            {/* Key compliance badges */}
            <div className="flex flex-wrap gap-2">
              {badgesToRender.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-800 text-xs font-mono-data font-medium text-slate-600 dark:text-slate-300 rounded bg-slate-50 dark:bg-slate-900"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right — standard cards */}
          <div className="flex flex-col gap-px border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            {standardsToRender.map((s, i) => {
              const Icon = icons[i % icons.length] || ShieldCheck;
              return (
                <div
                  key={s.title}
                  className={`flex gap-5 p-6 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${
                    i < standardsToRender.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                  }`}
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-sky-50 dark:bg-cyan-950/70 border border-sky-100 dark:border-cyan-900/50 flex items-center justify-center mt-0.5">
                    <Icon size={17} className="text-[#0284c7] dark:text-cyan-400" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">{s.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
