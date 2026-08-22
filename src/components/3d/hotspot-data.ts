export interface HotspotData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  shortDesc: string;
  longDesc: string;
  badge: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  specs: Array<{ label: string; value: string }>;
  clinicalAdvantages: string[];
}

export const SONOST_HOTSPOTS: HotspotData[] = [
  {
    id: "transducer",
    number: 1,
    title: "Vùng Đầu Dò Siêu Âm Calcaneus Đôi",
    subtitle: "Dual 0.5 MHz Waterless Transducers",
    shortDesc: "Đo siêu âm gót chân không xâm lấn, tần số 0.5MHz, CV < 1.5%",
    longDesc:
      "Cặp đầu dò siêu âm công nghệ cao tiếp xúc trực tiếp hai bên xương gót chân Calcaneus thông qua màng dầu silicone đàn hồi không cần đổ nước (Waterless). Tần số siêu âm trung tâm 0.5MHz cho độ xuyên thấu tối ưu, hạn chế tối đa suy hao tín hiệu.",
    badge: "Độ chính xác CV ≤ 0.2%",
    position: [-1.15, 0.45, 0.0],
    cameraPosition: [-2.6, 1.4, 1.5],
    cameraTarget: [-0.8, 0.35, 0.0],
    specs: [
      { label: "Tần số trung tâm", value: "0.5 MHz ± 5%" },
      { label: "Phương thức tiếp xúc", value: "Bóng silicone chứa dầu chuyên dụng (Waterless)" },
      { label: "Vị trí khảo sát", value: "Xương gót chân (Calcaneus bone)" },
      { label: "Độ chính xác lặp lại (CV)", value: "SOS ≤ 0.2%, BUA ≤ 1.5%, BQI ≤ 1.5%" },
      { label: "An toàn sinh học", value: "100% Sóng siêu âm — Tuyệt đối Không tia X" },
    ],
    clinicalAdvantages: [
      "Khảo sát mật độ xương bè gót chân (xương xốp có tốc độ chuyển hóa nhanh nhất cơ thể)",
      "Không gây tích lũy phóng xạ, an toàn tuyệt đối cho thai phụ, người cao tuổi và trẻ nhỏ",
      "Tiết kiệm chi phí vận hành: Không cần thay nước hay bảo trì hệ thống thủy lực phức tạp",
    ],
  },
  {
    id: "foot_cradle",
    number: 2,
    title: "Khay Định Vị Chân & Đệm Silicon Khử Trùng",
    subtitle: "Ergonomic Foot Positioning Cradle",
    shortDesc: "Miếng đệm silicon khử trùng, điều chỉnh linh hoạt theo kích cỡ bàn chân",
    longDesc:
      "Khay đặt chân thiết kế công thái học theo giải phẫu bàn chân người Châu Á, trang bị miếng đệm silicon y tế kháng khuẩn có thể tháo rời vệ sinh nhanh chóng giữa các lượt đo. Hệ thống thanh căn chỉnh định vị gót chân chuẩn xác giúp kết quả đo lặp lại có độ tin cậy cao.",
    badge: "Silicone Y Tế Kháng Khuẩn",
    position: [0.0, 0.38, 0.55],
    cameraPosition: [0.3, 2.3, 2.2],
    cameraTarget: [0.0, 0.25, 0.35],
    specs: [
      { label: "Chất liệu đệm", value: "Medical Grade Silicone kháng khuẩn chuẩn ISO 10993" },
      { label: "Kích cỡ bàn chân", value: "Tự động tương thích từ size trẻ em đến người lớn" },
      { label: "Cơ chế định vị", value: "Thanh trượt định tâm gót chân đa hướng" },
      { label: "Quy trình vệ sinh", value: "Tháo lắp khử trùng bằng cồn y tế trong 10 giây" },
    ],
    clinicalAdvantages: [
      "Đảm bảo góc tiếp xúc chuẩn 90 độ giữa đầu dò và xương gót",
      "Hạn chế tối đa sai số định vị do bệnh nhân cử động",
      "Đạt tiêu chuẩn kiểm soát nhiễm khuẩn bệnh viện nghiêm ngặt",
    ],
  },
  {
    id: "screen",
    number: 3,
    title: "Màn Hình Cảm Ứng Màu TFT LCD 7.0-inch",
    subtitle: "High-Resolution Clinical Color Touchscreen",
    shortDesc: "Hiển thị trực quan chỉ số T-score, Z-score, BQI, SOS, BUA và đồ thị xương",
    longDesc:
      "Màn hình màu TFT LCD 7.0-inch độ phân giải cao góc nhìn nghiêng công thái học 35 độ, hiển thị tức thì biểu đồ phân loại mật độ xương theo chuẩn WHO (Xanh: Bình thường, Vàng: Thiếu xương, Đỏ: Loãng xương). Giao diện tiếng Việt & tiếng Anh trực quan, thao tác chạm mượt mà.",
    badge: "Chuẩn Chẩn Đoán WHO / ISCD",
    position: [0.0, 1.32, -0.68],
    cameraPosition: [0.0, 2.2, 0.7],
    cameraTarget: [0.0, 0.85, -0.65],
    specs: [
      { label: "Kích thước màn hình", value: "7.0 inch TFT Color LCD Touchscreen" },
      { label: "Các chỉ số đo", value: "T-score, Z-score, SOS (m/s), BUA (dB/MHz), BQI" },
      { label: "Cơ sở dữ liệu tham chiếu", value: "Dân số Châu Á / Việt Nam & Quốc tế (ISCD/NHANES)" },
      { label: "Bộ nhớ lưu trữ", value: "Hơn 10.000 hồ sơ bệnh nhân kèm lịch sử theo dõi" },
      { label: "Thời gian xử lý", value: "Tính toán và phân loại kết quả < 1 giây" },
    ],
    clinicalAdvantages: [
      "Bác sĩ và bệnh nhân dễ dàng đọc hiểu kết quả nhờ đồ thị màu trực quan",
      "Tích hợp thuật toán AI hỗ trợ phân tầng nguy cơ gãy xương trong 10 năm",
      "Vận hành độc lập Standalone, không bắt buộc phải kết nối máy tính cồng kềnh",
    ],
  },
  {
    id: "printer",
    number: 4,
    title: "Máy in nhiệt tích hợp mặt sau (Rear Thermal Printer 58mm)",
    subtitle: "Rear Panel Integrated 58mm High-Speed Printer",
    shortDesc: "Khe in và khoang nạp giấy in nhiệt nằm gọn ở mặt lưng máy, giúp bề mặt thao tác phía trước tinh giản, in phiếu kết quả T-score / Z-score tức thì trong < 15 giây",
    longDesc:
      "Bộ máy in nhiệt tốc độ cao khổ 58mm được tích hợp khéo léo ngay tại mặt sau (Rear Panel) của thân máy Sonost 3000. Thiết kế đặt phía sau giúp khoang điều khiển và màn hình cảm ứng phía trước luôn gọn gàng, hạn chế kẹt giấy và cho phép bác sĩ dễ dàng thay lắp cuộn giấy in mới chỉ với 1 thao tác nhấn mở nắp.",
    badge: "Mặt sau • In tức thì < 15s",
    position: [0.0, 0.76, -1.82],
    cameraPosition: [0.0, 1.3, -3.4],
    cameraTarget: [0.0, 0.65, -1.2],
    specs: [
      { label: "Khổ giấy in", value: "Giấy in nhiệt y tế tiêu chuẩn 58mm" },
      { label: "Vị trí lắp đặt", value: "Mặt sau thân máy (Rear Panel - Thiết kế công thái học)" },
      { label: "Tốc độ in", value: "In toàn bộ phiếu kết quả & đồ thị trong 8 - 12 giây" },
      { label: "Cơ chế thay giấy", value: "Nắp mở One-Touch Drop-in Roll phía sau" },
      { label: "Cổng kết nối kèm theo", value: "Cổng nguồn AC, công tắc I/O, cổng LAN RJ45, USB 2.0" },
    ],
    clinicalAdvantages: [
      "Giải phóng 100% không gian bảng điều khiển mặt trước cho màn hình cảm ứng 7.0 inch",
      "Dễ dàng thay cuộn giấy in nhiệt 58mm từ phía sau mà không chạm vào vùng gót chân bệnh nhân",
      "Tối ưu cho khám sức khỏe đoàn thể lưu động với thao tác in và xé phiếu nhanh chóng",
    ],
  },
];
