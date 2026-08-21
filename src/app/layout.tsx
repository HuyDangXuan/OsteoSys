import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OsteoSys — Giải pháp đo mật độ xương & cơ xương khớp B2B",
  description:
    "OsteoSys cung cấp hệ thống thiết bị DEXA, QUS và giải pháp tầm soát sức khỏe xương khớp chuyên nghiệp cho bệnh viện, phòng khám và doanh nghiệp tại Việt Nam.",
  keywords:
    "DEXA scanner, đo mật độ xương, BMD, T-score, loãng xương, xương khớp, tầm soát doanh nghiệp, OsteoSys",
  openGraph: {
    title: "OsteoSys — Chuẩn xác lâm sàng. Mọi lần đo.",
    description:
      "Hệ thống đo mật độ xương độ chính xác CV < 1.0%, chuẩn ISCD, tích hợp DICOM 3.0 cho bệnh viện và doanh nghiệp.",
    type: "website",
    locale: "vi_VN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="bg-white text-slate-900 antialiased">
        {/* Direction contract — Clinical Report Substrate · seed 037c3ae6 · model-pick
            THESIS: OsteoSys reads as a clinical diagnostic instrument, not a medtech brochure.
            OWN-WORLD: White coated-paper substrate; hairline rule grid; clinical blue (#0284c7) as sole accent.
            STORY: See real scan data → understand precision → explore specs → select B2B package → inquire.
            FIRST VIEWPORT: DEXA scan exhibit (left 58%) + headline + BMD/T-score rows + dual CTA (right 42%).
            FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
                    the verdict, DESIGN.md, and every shipping raster carrying its provenance. */}
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
