import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UIScaleProvider } from "@/components/providers/ui-scale-provider";
import { Toaster } from "@/components/ui/toaster";

import { getCmsContent } from "@/lib/actions/cms";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const globalContent = await getCmsContent("global");
  const seo = globalContent.data?.seo;
  const title = seo?.title || "OsteoSys — Giải pháp đo mật độ xương & cơ xương khớp B2B";
  const description =
    seo?.description ||
    "OsteoSys cung cấp hệ thống thiết bị DEXA, QUS và giải pháp tầm soát sức khỏe xương khớp chuyên nghiệp cho bệnh viện, phòng khám và doanh nghiệp tại Việt Nam.";
  const ogImage = seo?.ogImage || "/og-image.png";

  return {
    title,
    description,
    keywords:
      "DEXA scanner, đo mật độ xương, BMD, T-score, loãng xương, xương khớp, tầm soát doanh nghiệp, OsteoSys, Sonost 3000",
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

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
                  // 1. Clean attribute mutations
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

                  // 2. Early UI scale initialization to eliminate layout shift / hydration flash
                  var scale = 100;
                  var cookieMatch = document.cookie.match(new RegExp('(?:^|; )sonost_ui_scale=([^;]*)'));
                  if (cookieMatch && cookieMatch[1]) {
                    scale = parseInt(cookieMatch[1], 10);
                  } else {
                    var local = localStorage.getItem('sonost_ui_scale');
                    if (local) scale = parseInt(local, 10);
                  }
                  var scaleMap = { 85: '13.6px', 90: '14.4px', 100: '16px', 110: '17.6px', 125: '20px' };
                  if (scaleMap[scale]) {
                    document.documentElement.style.fontSize = scaleMap[scale];
                    document.documentElement.setAttribute('data-ui-scale', String(scale));
                  }
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
          <UIScaleProvider>
            <div className="min-h-screen flex flex-col">{children}</div>
            <Toaster />
          </UIScaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
