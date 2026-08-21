import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Radio, ShieldCheck } from "lucide-react";

const footerNav = [
  {
    heading: "Thiết bị & Sản phẩm",
    links: [
      { label: "Máy Sonost 3000 (Siêu âm gót chân)", href: "/san-pham/sonost-3000" },
      { label: "Thông số kỹ thuật Sonost 3000", href: "/san-pham/sonost-3000" },
      { label: "Vật tư Gel siêu âm & Giấy in", href: "/bao-gia?service=supplies" },
      { label: "Hệ thống DEXA Central DXA-Pro", href: "/bao-gia?product=dxa-7000" },
    ],
  },
  {
    heading: "Dịch vụ B2B",
    links: [
      { label: "Dịch vụ Cho thuê máy Sonost 3000", href: "/dich-vu-cho-thue" },
      { label: "Sửa chữa & Hiệu chuẩn Phantom", href: "/dich-vu-sua-chua" },
      { label: "Khám sức khỏe đoàn doanh nghiệp", href: "/dich-vu-cho-thue" },
      { label: "Yêu cầu báo giá chi tiết B2B", href: "/bao-gia" },
    ],
  },
  {
    heading: "Cổng Hệ Thống",
    links: [
      { label: "Đăng nhập Cổng Đối tác Y tế", href: "/login" },
      { label: "Đăng ký Tài khoản Bệnh viện", href: "/register" },
      { label: "Quản trị Admin Dashboard", href: "/admin" },
      { label: "Tài liệu kỹ thuật Sonost 3000 (PDF)", href: "/san-pham/sonost-3000" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      id="about"
      className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs"
      aria-label="Footer OsteoSys"
    >
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0284c7] rounded flex items-center justify-center text-white shrink-0 shadow-sm">
                <Radio size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="text-white font-bold text-base tracking-tight block leading-none">
                  OsteoSys Sonost 3000
                </span>
                <span className="text-slate-500 text-xs mt-0.5 block">
                  Thiết bị đo loãng xương siêu âm gót chân
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Giải pháp chẩn đoán mật độ xương y khoa chuyên nghiệp từ OsteoSys Korea cho bệnh viện, phòng khám đa khoa và chiến dịch khám lưu động tại Việt Nam.
            </p>

            {/* Contact info */}
            <div className="space-y-2 pt-1 text-slate-300">
              <a
                href="tel:0904000000"
                className="flex items-center gap-2 hover:text-[#0284c7] transition-colors"
              >
                <Phone size={13} className="text-[#0284c7]" />
                <span className="font-mono-data font-semibold">0904 000 000 (Hotline Kỹ Thuật 24/7)</span>
              </a>
              <a
                href="mailto:info@osteosys.vn"
                className="flex items-center gap-2 hover:text-[#0284c7] transition-colors"
              >
                <Mail size={13} className="text-[#0284c7]" />
                <span>info@osteosys.vn</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={13} className="text-[#0284c7] shrink-0" />
                <span>Tòa nhà Y tế Kỹ thuật cao, Hà Nội &amp; TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© {new Date().getFullYear()} OsteoSys Sonost 3000. Tiêu chuẩn Y tế Quốc tế ISCD &amp; WHO.</p>
          <div className="flex items-center gap-4">
            <Link href="/san-pham/sonost-3000" className="hover:text-slate-300 transition-colors">Thông số máy</Link>
            <Link href="/dich-vu-cho-thue" className="hover:text-slate-300 transition-colors">Cho thuê</Link>
            <Link href="/dich-vu-sua-chua" className="hover:text-slate-300 transition-colors">Bảo dưỡng</Link>
            <Link href="/bao-gia" className="hover:text-slate-300 transition-colors">Báo giá B2B</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
