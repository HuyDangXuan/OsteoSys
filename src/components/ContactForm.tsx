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
  "Hệ thống DEXA DXA-Pro 7000",
  "Thiết bị QUS SoundBone Q3",
  "Phần mềm OsteoSys AI Suite",
  "Dịch vụ tầm soát lưu động",
  "Hợp đồng bảo trì dài hạn",
  "Tư vấn tổng thể giải pháp",
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
    // Simulate network request — replace with real API call
    await new Promise((r) => setTimeout(r, 1600));
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
          className="text-sm font-medium text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-[#0284c7]">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  const inputClass = (hasError?: string) =>
    `w-full px-3 py-2.5 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 transition-colors ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 hover:border-slate-300 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
    } outline-none`;

  if (status === "success") {
    return (
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border border-slate-200 rounded p-10 flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#0284c7]/10 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-[#0284c7]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Yêu cầu đã được ghi nhận
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-[38ch] mx-auto">
                Chuyên viên tư vấn OsteoSys sẽ liên hệ với{" "}
                <strong>{form.contact}</strong> trong vòng{" "}
                <strong>24 giờ làm việc</strong> qua số{" "}
                <span className="font-mono-data">{form.phone}</span>.
              </p>
            </div>
            <a
              href="/catalog-osteosys.pdf"
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
            >
              <Download size={14} />
              Tải bộ Catalog kỹ thuật (PDF)
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 items-start">

          {/* Left — context */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-widest text-[#0284c7] mb-3">
              Tư vấn B2B
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4 text-balance">
              Nhận tư vấn giải pháp phù hợp
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Điền thông tin bên dưới — chuyên viên y tế của OsteoSys sẽ liên hệ
              để tư vấn giải pháp phù hợp với quy mô và nhu cầu cụ thể của đơn vị
              bạn trong vòng 24 giờ làm việc.
            </p>

            {/* Contact commitments */}
            {[
              "Tư vấn miễn phí, không ràng buộc",
              "Demo thiết bị tại cơ sở theo lịch hẹn",
              "Báo giá chi tiết theo nhu cầu thực tế",
              "Thông tin được bảo mật tuyệt đối",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 mb-3 last:mb-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0" />
                <p className="text-sm text-slate-600">{item}</p>
              </div>
            ))}

            <div className="mt-8 p-4 bg-white border border-slate-200 rounded">
              <p className="text-xs text-slate-500 mb-1">Hotline kỹ thuật</p>
              <a
                href="tel:+84904000000"
                className="font-mono-data text-lg font-semibold text-slate-900 hover:text-[#0284c7] transition-colors"
              >
                0904 000 000
              </a>
              <p className="text-xs text-slate-400 mt-1">Thứ 2–6, 8:00–17:30</p>
            </div>
          </div>

          {/* Right — form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-slate-200 rounded p-6 sm:p-8 flex flex-col gap-5"
          >
            {/* Row 1 */}
            <div className="grid sm:grid-cols-2 gap-5">
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

              <Field id="orgName" label="Tên đơn vị / Bệnh viện" required error={errors.orgName}>
                <input
                  id="orgName"
                  type="text"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  placeholder="VD: Bệnh viện Đại học Y Hà Nội"
                  className={inputClass(errors.orgName)}
                />
              </Field>
            </div>

            {/* Row 2 */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field id="contact" label="Người liên hệ" required error={errors.contact}>
                <input
                  id="contact"
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="Họ và tên"
                  className={inputClass(errors.contact)}
                />
              </Field>

              <Field id="phone" label="Số điện thoại" required error={errors.phone}>
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
            <div className="grid sm:grid-cols-2 gap-5">
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
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Mô tả nhu cầu, số lượng thiết bị, thời điểm triển khai dự kiến..."
                className={`${inputClass()} resize-none`}
              />
            </Field>

            {/* Privacy notice */}
            <p className="text-xs text-slate-400 leading-relaxed">
              Thông tin của bạn được bảo mật và chỉ sử dụng để liên hệ tư vấn theo
              yêu cầu. OsteoSys cam kết không chia sẻ dữ liệu với bên thứ ba.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center justify-center gap-2 py-3 bg-[#0284c7] text-white text-sm font-semibold rounded hover:bg-[#0369a1] disabled:opacity-70 transition-colors duration-150"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  Gửi yêu cầu tư vấn
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
