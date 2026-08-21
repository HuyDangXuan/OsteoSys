import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

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
    "DEXA scanner, đo mật độ xương, BMD, T-score, loãng xương, xương khớp, tầm soát doanh nghiệp, OsteoSys, Sonost 3000",
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
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var clean = function(node) {
                    if (node && node.nodeType === 1) {
                      if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                      if (node.hasAttribute('bis_register')) node.removeAttribute('bis_register');
                    }
                  };
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes') {
                        if (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_register') {
                          m.target.removeAttribute(m.attributeName);
                        }
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          clean(m.addedNodes[j]);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    childList: true,
                    attributeFilter: ['bis_skin_checked', 'bis_register']
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-200 dark:bg-[#0b0f17] dark:text-slate-100 selection:bg-sky-200 dark:selection:bg-sky-900"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
