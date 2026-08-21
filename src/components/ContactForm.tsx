"use client";

import { useState, useRef } from "react";
import { ChevronRight, CheckCircle2, Download, Loader2 } from "lucide-react";

type FormData = {
  orgType: string;
  orgName: string;
  contact: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
};

const initialForm: FormData = {
  orgType: "",
  orgName: "",
  contact: "",
  phone: "",
  email: "",
  interest: "",
  message: "",
};

const ORG_TYPES = [
  "Bệnh viện công",
  "Bệnh viện tư",
  "Phòng khám đa khoa",
  "Trung tâm chẩn đoán hình ảnh",
  "Doanh nghiệp (khám tầm soát)",
  "Tổ chức khác",
];

const INTERESTS = [
  "Thuê máy Sonost 3000 (0đ vốn)",
  "Mua máy Sonost 3000 PRO",
  "Hệ thống DEXA DXA-Pro 7000",
  "Bảo dưỡng & Kiểm chuẩn ISCD",
  "Gói khám lưu động doanh nghiệp",
  "Tư vấn tổng thể giải pháp y tế",
];

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.orgType) e.orgType = "Vui lòng chọn loại hình đơn vị";
    if (!form.orgName.trim()) e.orgName = "Tên đơn vị không được để trống";
    if (!form.contact.trim()) e.contact = "Vui lòng nhập tên người liên hệ";
    if (!/^(\+84|0)[3-9]\d{8}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Số điện thoại không hợp lệ";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.interest) e.interest = "Vui lòng chọn giải pháp quan tâm";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1400));
    setStatus("success");
  }

  function Field({
    id,
    label,
    required,
    children,
    error,
  }: {
    id: string;
    label: string;
    required?: boolean;
    children: React.ReactNode;
    error?: string;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-[#0284c7] dark:text-cyan-400">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  const inputClass = (hasError?: string) =>
    `w-full px-3.5 py-2.5 text-xs rounded-md bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#0284c7] dark:focus:border-cyan-400 focus:ring-2 focus:ring-[#0284c7]/10 dark:focus:ring-cyan-500/20"
    } outline-none transition-colors`;

  if (status === "success") {
    return (
      <section id="contact" className="py-20 bg-slate-50 dark:bg-[#0b0f17] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 flex flex-col items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Yêu cầu đã được ghi nhận thành công
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-[38ch] mx-auto">
                Chuyên viên tư vấn OsteoSys sẽ liên hệ với{" "}
                <strong className="text-slate-900 dark:text-white">{form.contact}</strong> trong vòng{" "}
                <strong>24 giờ làm việc</strong> qua số{" "}
                <span className="font-mono-data text-[#0284c7] dark:text-cyan-400 font-bold">{form.phone}</span>.
              </p>
            </div>
            <a
              href="/catalog-osteosys.pdf"
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download size={14} />
              Tải bộ Catalog kỹ thuật Sonost 3000 (PDF)
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-slate-50 dark:bg-[#0b0f17] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 items-start">

          {/* Left — context */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0284c7] dark:text-cyan-400 font-mono-data">
              Tư vấn B2B &amp; Báo giá Thiết bị
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
              Nhận tư vấn giải pháp phù hợp
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              Điền thông tin bên dưới — chuyên viên kỹ thuật y sinh của OsteoSys sẽ liên hệ
              để tư vấn giải pháp đo mật độ xương phù hợp nhất trong vòng 24 giờ.
            </p>

            {/* Contact commitments */}
            <div className="space-y-2.5 pt-2">
              {[
                "Tư vấn miễn phí, không ràng buộc điều kiện",
                "Demo máy Sonost 3000 tận nơi theo lịch hẹn",
                "Báo giá chiết khấu đặc biệt theo gói thuê/mua",
                "Bảo mật tuyệt đối thông tin phòng khám & bệnh viện",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0284c7] dark:bg-cyan-400 shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Hotline Kỹ Thuật 24/7</p>
              <a
                href="tel:+84904000000"
                className="font-mono-data text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-[#0284c7] dark:hover:text-cyan-400 transition-colors"
              >
                0904 000 000
              </a>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Thứ 2 – Thứ 7, 8:00 – 18:00</p>
            </div>
          </div>

          {/* Right — form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col gap-4 shadow-2xs backdrop-blur-md"
          >
            {/* Row 1 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="orgType" label="Loại hình đơn vị" required error={errors.orgType}>
                <select
                  id="orgType"
                  value={form.orgType}
                  onChange={(e) => setForm({ ...form, orgType: e.target.value })}
                  className={inputClass(errors.orgType)}
                >
                  <option value="">Chọn loại hình...</option>
                  {ORG_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field id="orgName" label="Tên cơ sở / Bệnh viện" required error={errors.orgName}>
                <input
                  id="orgName"
                  type="text"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  placeholder="VD: Bệnh viện Đa khoa Hà Đông"
                  className={inputClass(errors.orgName)}
                />
              </Field>
            </div>

            {/* Row 2 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="contact" label="Người liên hệ" required error={errors.contact}>
                <input
                  id="contact"
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="BS. Nguyễn Văn A / Trưởng khoa"
                  className={inputClass(errors.contact)}
                />
              </Field>

              <Field id="phone" label="Số điện thoại di động" required error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0901 234 567"
                  className={inputClass(errors.phone)}
                />
              </Field>
            </div>

            {/* Row 3 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="email" label="Email công vụ" required error={errors.email}>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ten@benhvien.vn"
                  className={inputClass(errors.email)}
                />
              </Field>

              <Field id="interest" label="Giải pháp quan tâm" required error={errors.interest}>
                <select
                  id="interest"
                  value={form.interest}
                  onChange={(e) => setForm({ ...form, interest: e.target.value })}
                  className={inputClass(errors.interest)}
                >
                  <option value="">Chọn giải pháp...</option>
                  {INTERESTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Message */}
            <Field id="message" label="Yêu cầu cụ thể (không bắt buộc)">
              <textarea
                id="message"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Mô tả nhu cầu: số lượng máy, thời điểm cần giao hoặc yêu cầu demo..."
                className={`${inputClass()} resize-none`}
              />
            </Field>

            {/* Privacy notice */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Thông tin được bảo mật theo tiêu chuẩn y tế và chỉ sử dụng cho mục đích tư vấn kỹ thuật.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center justify-center gap-2 py-3 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-md shadow-sm disabled:opacity-70 transition-colors"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                <>
                  Gửi Yêu Cầu Báo Giá &amp; Tư Vấn
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
