# Surface Brief: Landing Page & B2B Solutions Portal

## Scope
- **Surface**: Root landing page (`/`) — single long-scroll page
- **Visitor mode**: Persuade (primary) + Operate (secondary — spec lookup, solution selector)

## Audience & Job
- **Bác sĩ / Kỹ thuật viên chẩn đoán hình ảnh**: Đánh giá độ chính xác lâm sàng (CV%, T-score methodology) và thông số kỹ thuật thiết bị DEXA/QUS trước khi đề xuất mua.
- **Lãnh đạo bệnh viện / Quản lý phòng khám**: Tìm giải pháp thiết bị xương khớp, cân nhắc tổng chi phí đầu tư, dịch vụ đào tạo và bảo hành.
- **HR/EHS doanh nghiệp**: Tìm gói tầm soát sức khỏe xương khớp lưu động định kỳ cho cán bộ nhân viên.

## Primary Action & Success
- **CTA chính**: Đăng ký nhận tư vấn B2B / Demo thiết bị → Form inquiry mở ra
- **CTA phụ**: Tải Catalog kỹ thuật PDF, xem chi tiết thông số thiết bị
- **Thành công**: Visitor rời khỏi trang với hiểu biết rõ về năng lực đo lường (CV < 1%, ISCD-compliant), thiết bị phù hợp nhu cầu, và đã gửi yêu cầu tư vấn

## Section Architecture
1. **Global Nav**: Logo + Nav links (Thiết bị & Công nghệ, Giải pháp B2B, Chuẩn lâm sàng, Về OsteoSys) + Hotline số + CTA "Tư vấn B2B"
2. **Hero**: Scan DEXA exhibit (clinical) + Headline + BMD/T-score metric values + Dual CTA
3. **Clinical Metrics Strip**: CV < 1.0% · Scan 60s · DICOM 3.0 · Support 24/7
4. **Equipment Portfolio**: Central DEXA Scanner | QUS Bone Sonometer | AI Diagnostic Suite — với Spec Drawer per device
5. **B2B Solution Packages**: Tab (Cơ sở y tế) / Tab (Doanh nghiệp) — bảng quyền lợi + quy trình
6. **Clinical Evidence & Standards**: ISCD compliance, Daily QC Phantom, X-ray safety
7. **B2B Consultation Form**: Smart form với field validation, loading state, success modal + catalog link
8. **Footer**: Contacts, downloads, legal, support network

## Chosen Direction
**Clinical Report Substrate** — white coated-paper substrate, hairline rule grid dividing data regions, DEXA scan image as clinical exhibit (left), T-score / BMD values in clinical blue (#0284c7) right, radiology-report grammar throughout.

## Constraints & Anti-goals
- WCAG AA on all backgrounds
- Tables and spec drawers must be fully responsive, no horizontal scroll on mobile
- No gradient decoration, no flashy motion, no entertainment aesthetics
- Do NOT invent unverified CE/FDA certification numbers or clinical case stats
- Vietnamese primary language throughout
