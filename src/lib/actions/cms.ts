"use server";

import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, CmsContent, CmsSectionKey, Account } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/jwt";

// ============================================================
// DEFAULT CMS DATA — Fallback when no MongoDB document exists
// ============================================================

const DEFAULT_CMS_DATA: Record<CmsSectionKey, { title: string; data: Record<string, any> }> = {
  global: {
    title: "Cấu hình chung & SEO",
    data: {
      hotline: "0904 000 000",
      hotlineLabel: "Hotline Kỹ Thuật 24/7",
      zaloNumber: "0904000000",
      email: "info@osteosys.vn",
      showroomAddress: "Tòa nhà Y tế Kỹ thuật cao, Hà Nội & TP. Hồ Chí Minh",
      topBanner: {
        enabled: false,
        text: "🎉 Ưu đãi tháng 8: Miễn phí hiệu chuẩn Phantom khi thuê máy Sonost 3000 dài hạn!",
        linkUrl: "/dich-vu-cho-thue",
        linkLabel: "Xem chi tiết",
      },
      seo: {
        title: "OsteoSys — Giải pháp đo mật độ xương & cơ xương khớp B2B",
        description: "OsteoSys cung cấp hệ thống thiết bị DEXA, QUS và giải pháp tầm soát sức khỏe xương khớp chuyên nghiệp cho bệnh viện, phòng khám và doanh nghiệp tại Việt Nam.",
        ogImage: "/og-image.png",
      },
    },
  },

  home_hero: {
    title: "Trang chủ & Hero Banner",
    data: {
      badge: "MÁY ĐO LOÃNG XƯƠNG SIÊU ÂM Y KHOA",
      headline: "Chẩn đoán loãng xương chuẩn xác. An toàn tuyệt đối 0% tia X.",
      description: "Giải pháp thiết bị đo mật độ xương siêu âm gót chân Sonost 3000 (OsteoSys Korea). Thời gian đo dưới 15 giây, tích hợp máy in nhiệt, phù hợp khám lưu động và phòng khám đa khoa.",
      heroImageUrl: "/images/sonost-3000-render.png",
      cta1: { label: "Nhận Báo Giá & Tư Vấn Thuê Máy", url: "/bao-gia" },
      cta2: { label: "Xem Chi Tiết Sonost 3000", url: "/san-pham/sonost-3000" },
      pillars: [
        {
          icon: "ShieldCheck",
          title: "Độ chính xác CV < 1.5%",
          description: "Chuẩn ISCD & WHO quốc tế",
        },
        {
          icon: "Clock",
          title: "Đo nhanh < 15 giây",
          description: "Nhanh gấp 4 lần phương pháp truyền thống",
        },
        {
          icon: "ShieldCheck",
          title: "0 Rad / Không tia X",
          description: "An toàn cho phụ nữ có thai & trẻ em",
        },
      ],
      scanMetrics: [
        { label: "SOS (Vận tốc âm)", value: "1,542", unit: "m/s" },
        { label: "BUA (Độ suy giảm)", value: "68.4", unit: "dB/MHz" },
        { label: "T-score Gót chân", value: "−1.1", unit: "SD" },
      ],
    },
  },

  sonost_specs: {
    title: "Thông số kỹ thuật Sonost 3000",
    data: {
      specGroups: [
        {
          groupKey: "measurement",
          groupTitle: "Đo lường lâm sàng",
          items: [
            { label: "Vị trí đo", value: "Xương gót chân (Calcaneus)" },
            { label: "Thông số đo", value: "SOS (Vận tốc âm), BUA (Độ suy giảm), BQI (Chỉ số chất lượng xương)" },
            { label: "Kết quả đầu ra", value: "T-score, Z-score, % Young Adult, % Age-Matched" },
            { label: "Thời gian đo", value: "< 15 giây (Siêu tốc, không xâm lấn)" },
            { label: "Độ chính xác (CV)", value: "SOS ≤ 0.2%, BUA ≤ 1.5%, BQI ≤ 1.5%" },
            { label: "Công nghệ tiếp xúc", value: "Bóng dầu silicone waterless, định vị tự động" },
            { label: "Cơ sở dữ liệu tham chiếu", value: "Châu Á/Việt Nam & NHANES III/ISCD" },
          ],
        },
        {
          groupKey: "hardware",
          groupTitle: "Phần cứng & Thiết kế",
          items: [
            { label: "Đầu dò siêu âm", value: "Đầu dò đôi 0.5 MHz xuyên thấu cao" },
            { label: "Màn hình", value: "Cảm ứng màu TFT LCD 7.0 inch" },
            { label: "Máy in tích hợp", value: "Máy in nhiệt 58mm tích hợp sẵn tại mặt sau thân máy (không chiếm diện tích mặt trước, dễ dàng thay cuộn giấy in)" },
            { label: "Kết nối & I/O", value: "2x USB + 1x LAN RJ45 + RS-232C + Laser printer port" },
            { label: "Kích thước & Khối lượng", value: "300 x 620 x 390 mm / 12.0 kg" },
            { label: "Nguồn điện", value: "AC 100~240V, 50/60Hz, 130W" },
          ],
        },
        {
          groupKey: "software",
          groupTitle: "Phần mềm & Kết nối",
          items: [
            { label: "Phần mềm chẩn đoán", value: "Sonost Diagnosis Suite AI" },
            { label: "Bộ nhớ hồ sơ", value: "> 10.000 hồ sơ bệnh nhân" },
            { label: "Chuẩn kết nối", value: "DICOM 3.0 — Tích hợp PACS/HIS bệnh viện" },
            { label: "Báo cáo", value: "PDF đồ thị màu chuẩn WHO / In nhiệt tức thì" },
            { label: "Sao lưu dữ liệu", value: "Tự động sao lưu USB / Server nội bộ" },
          ],
        },
      ],
      brochureUrl: "/catalog-osteosys.pdf",
      deliverables: [
        "01 Thân máy Sonost 3000 chính hãng nguyên thùng",
        "01 Khối chuẩn Phantom Hologic định chuẩn QC",
        "05 cuộn giấy in nhiệt 58mm + 02 can gel siêu âm y tế",
      ],
    },
  },

  rental_packages: {
    title: "Bảng gói thuê máy",
    data: {
      packages: [
        {
          id: "event",
          name: "Gói Khám Đoàn / Sự Kiện",
          price: "1.500.000",
          priceUnit: "đ / ngày",
          badge: "Linh Hoạt 24h",
          isPopular: false,
          features: [
            "01 máy Sonost 3000 kiểm chuẩn sẵn sàng",
            "Kèm 02 can gel siêu âm + 05 cuộn giấy in",
            "Kỹ thuật viên giao máy & hướng dẫn tận nơi",
            "Thời gian dự phòng & hỗ trợ: 30 phút",
          ],
          ctaUrl: "/bao-gia?package=event",
        },
        {
          id: "clinic",
          name: "Gói Phòng Khám Tiêu Chuẩn",
          price: "15.000.000",
          priceUnit: "đ / tháng",
          badge: "Phổ Biến Nhất",
          isPopular: true,
          features: [
            "01 máy Sonost 3000 PRO mới 100%",
            "Hiệu chuẩn Phantom ISCD 3 tháng/lần",
            "Cấp giấy in & gel theo định mức hàng tháng",
            "Đổi máy tương đương khi có sự cố",
            "Hỗ trợ kỹ thuật 24/7 qua Hotline",
          ],
          ctaUrl: "/bao-gia?package=clinic",
        },
        {
          id: "hospital",
          name: "Gói Bệnh Viện Dài Hạn",
          price: "13.500.000",
          priceUnit: "đ / tháng",
          badge: "Tiết Kiệm 15%",
          isPopular: false,
          features: [
            "01 máy Sonost 3000 mới 100% nguyên thùng",
            "Tích hợp DICOM 3.0 / HIS / PACS bệnh viện",
            "Gel & giấy in không giới hạn định mức",
            "Bảo trì & hiệu chuẩn 100% miễn phí",
            "Chuyển quyền sở hữu máy sau 36 tháng",
          ],
          ctaUrl: "/bao-gia?package=hospital",
        },
      ],
    },
  },

  repair_services: {
    title: "Dịch vụ sửa chữa & Quy trình",
    data: {
      steps: [
        {
          stepNumber: 1,
          title: "Tiếp Nhận Yêu Cầu",
          description: "Ghi nhận mã máy, triệu chứng, địa chỉ cơ sở y tế qua Hotline hoặc Form trực tuyến.",
        },
        {
          stepNumber: 2,
          title: "Kiểm Tra & Đo BUA/SOS",
          description: "Kỹ thuật viên đo tín hiệu xung 0.5MHz, kiểm áp suất bóng dầu, phát hiện lỗi phần cứng.",
        },
        {
          stepNumber: 3,
          title: "Báo Giá Linh Kiện",
          description: "Báo giá chi tiết linh kiện thay thế chính hãng, minh bạch chi phí và thời hạn bảo hành.",
        },
        {
          stepNumber: 4,
          title: "Sửa Chữa & Thay Thế",
          description: "Thay thế màng bóng dầu, bo nguồn, máy in nhiệt, đầu dò siêu âm theo đúng quy chuẩn.",
        },
        {
          stepNumber: 5,
          title: "Hiệu Chuẩn Phantom ISCD",
          description: "Kiểm định sai số với khối chuẩn Phantom, dán tem chất lượng QC và xuất biên bản kiểm định.",
        },
      ],
      commonFaults: [
        {
          title: "Nhiễu tín hiệu BUA / SOS",
          description: "Suy hao đầu dò siêu âm hoặc bóng khí trong màng bóng dầu silicone.",
        },
        {
          title: "Màng bóng dầu bị xẹp / không căng",
          description: "Kẹt van khí hoặc chai cứng silicon sau thời gian sử dụng lâu.",
        },
        {
          title: "Lỗi in nhiệt hoặc không kết nối PACS",
          description: "Kẹt trục cuốn 58mm hoặc sai cấu hình IP DICOM 3.0 trên mạng LAN.",
        },
      ],
      warrantyCommitment: "Bảo hành chính hãng 12 tháng cho tất cả linh kiện thay thế. Cam kết máy hoạt động ổn định sau sửa chữa hoặc đổi máy miễn phí.",
    },
  },

  faqs: {
    title: "Câu hỏi thường gặp (FAQs)",
    data: {
      items: [
        {
          question: "Máy Sonost 3000 có an toàn cho phụ nữ mang thai không?",
          answer: "Hoàn toàn an toàn. Sonost 3000 sử dụng sóng siêu âm (0% tia X), không phát xạ ion hóa, an toàn tuyệt đối cho phụ nữ mang thai, trẻ em và người cao tuổi.",
        },
        {
          question: "Thời gian đo mật độ xương bằng Sonost 3000 mất bao lâu?",
          answer: "Mỗi phép đo chỉ mất dưới 15 giây. Bệnh nhân chỉ cần đặt gót chân vào khay đo, thoa gel siêu âm và chờ kết quả in tự động.",
        },
        {
          question: "Kết quả T-score từ Sonost 3000 có được chấp nhận tại bệnh viện không?",
          answer: "Có. Sonost 3000 tuân thủ tiêu chuẩn ISCD và WHO, kết quả T-score/Z-score được chấp nhận tại tất cả bệnh viện và cơ sở y tế tại Việt Nam.",
        },
        {
          question: "Chi phí thuê máy Sonost 3000 cho phòng khám là bao nhiêu?",
          answer: "Gói thuê phòng khám tiêu chuẩn có giá từ 15.000.000 đ/tháng, bao gồm máy mới 100%, hiệu chuẩn Phantom 3 tháng/lần, gel & giấy in, hỗ trợ kỹ thuật 24/7.",
        },
        {
          question: "Sonost 3000 có tích hợp được với hệ thống PACS/HIS bệnh viện không?",
          answer: "Có. Sonost 3000 hỗ trợ chuẩn DICOM 3.0, kết nối trực tiếp với hệ thống PACS/HIS/RIS qua cổng LAN RJ45 hoặc USB.",
        },
        {
          question: "Quy trình hiệu chuẩn Phantom ISCD được thực hiện như thế nào?",
          answer: "Kỹ thuật viên OsteoSys sẽ sử dụng khối chuẩn Phantom Hologic để kiểm tra sai số đo. Hệ số biến thiên CV phải đạt < 1.0% theo tiêu chuẩn ISCD. Kết quả được ghi nhận vào biên bản kiểm định y tế.",
        },
      ],
    },
  },

  clinical_evidence: {
    title: "Tiêu chuẩn & Bằng chứng lâm sàng",
    data: {
      standards: [
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
      ],
      badges: ["ISCD 2023", "WHO T-score", "DICOM 3.0", "IEC 60601-1", "ISO 13485"],
    },
  },
};

// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Get CMS content for a specific section.
 * Falls back to DEFAULT_CMS_DATA if no MongoDB document exists.
 */
export async function getCmsContent(sectionKey: CmsSectionKey): Promise<{ title: string; data: Record<string, any> }> {
  try {
    const col = await getCollection<CmsContent>(COLLECTIONS.CMS_CONTENTS);
    const doc = await col.findOne({ sectionKey });

    if (doc) {
      return { title: doc.title, data: doc.data };
    }

    // Fallback to default data
    return DEFAULT_CMS_DATA[sectionKey] || { title: sectionKey, data: {} };
  } catch (error) {
    console.error(`[CMS] Failed to fetch section "${sectionKey}":`, error);
    return DEFAULT_CMS_DATA[sectionKey] || { title: sectionKey, data: {} };
  }
}

/**
 * Get all CMS sections at once (used by admin CMS page).
 */
export async function getAllCmsContents(): Promise<Record<CmsSectionKey, { title: string; data: Record<string, any>; lastUpdatedBy?: { accountId: string; fullName: string }; updatedAt?: string }>> {
  try {
    const col = await getCollection<CmsContent>(COLLECTIONS.CMS_CONTENTS);
    const docs = await col.find({}).toArray();

    const result: Record<string, any> = {};

    // Start with defaults
    for (const key of Object.keys(DEFAULT_CMS_DATA) as CmsSectionKey[]) {
      result[key] = {
        title: DEFAULT_CMS_DATA[key].title,
        data: DEFAULT_CMS_DATA[key].data,
      };
    }

    // Override with DB values
    for (const doc of docs) {
      if (result[doc.sectionKey]) {
        result[doc.sectionKey] = {
          title: doc.title,
          data: doc.data,
          lastUpdatedBy: doc.lastUpdatedBy,
          updatedAt: doc.updatedAt?.toISOString(),
        };
      }
    }

    return result as any;
  } catch (error) {
    console.error("[CMS] Failed to fetch all sections:", error);
    // Return defaults on error
    const result: Record<string, any> = {};
    for (const key of Object.keys(DEFAULT_CMS_DATA) as CmsSectionKey[]) {
      result[key] = { title: DEFAULT_CMS_DATA[key].title, data: DEFAULT_CMS_DATA[key].data };
    }
    return result as any;
  }
}

/**
 * Update a CMS section in MongoDB.
 * Requires authenticated admin session.
 */
export async function updateCmsSection(
  sectionKey: CmsSectionKey,
  data: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Session verification
    const session = await getSessionUser();
    if (!session) {
      return { success: false, message: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." };
    }

    // 2. DB Guard — verify account exists and is active
    const accountsCol = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    const currentAccount = await accountsCol.findOne({ email: session.email });
    if (!currentAccount || currentAccount.status !== "active") {
      return { success: false, message: "Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa." };
    }

    // 3. Validate sectionKey
    const validKeys: CmsSectionKey[] = ["global", "home_hero", "sonost_specs", "rental_packages", "repair_services", "faqs", "clinical_evidence"];
    if (!validKeys.includes(sectionKey)) {
      return { success: false, message: `Section key "${sectionKey}" không hợp lệ.` };
    }

    // 4. Get section title from defaults
    const sectionTitle = DEFAULT_CMS_DATA[sectionKey]?.title || sectionKey;

    // 5. Upsert into MongoDB
    const cmsCol = await getCollection<CmsContent>(COLLECTIONS.CMS_CONTENTS);
    const now = new Date();

    await cmsCol.updateOne(
      { sectionKey },
      {
        $set: {
          sectionKey,
          title: sectionTitle,
          data,
          lastUpdatedBy: {
            accountId: currentAccount._id?.toString() || session.accountId,
            fullName: currentAccount.fullName || session.fullName,
          },
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // 6. Audit log
    await recordAuditLog({
      actor: {
        accountId: currentAccount._id?.toString(),
        email: currentAccount.email,
        fullName: currentAccount.fullName,
        role: currentAccount.role,
      },
      action: "cms.update_section",
      resource: "cms_contents",
      resourceId: sectionKey,
      resourceLabel: `Cập nhật nội dung CMS: ${sectionTitle} (${sectionKey})`,
      after: { sectionKey, dataKeys: Object.keys(data) },
      status: "success",
    });

    // 7. Cache revalidation — purge all client-facing routes
    revalidatePath("/", "layout");
    revalidatePath("/san-pham/sonost-3000");
    revalidatePath("/dich-vu-cho-thue");
    revalidatePath("/dich-vu-sua-chua");
    revalidatePath("/bao-gia");
    revalidatePath("/admin/cms");

    return { success: true, message: `Đã xuất bản nội dung "${sectionTitle}" thành công lên Website!` };
  } catch (error) {
    console.error(`[CMS] Failed to update section "${sectionKey}":`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi không xác định khi cập nhật nội dung CMS.",
    };
  }
}