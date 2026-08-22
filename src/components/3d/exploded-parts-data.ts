export interface ExplodedPartData {
  id: string;
  number: number;
  name: string;
  koreanName: string;
  partNumber: string;
  category: "acoustic" | "display" | "mechanics" | "electronics" | "printer";
  badge: string;
  shortDesc: string;
  clinicalFunction: string;
  maintenanceSchedule: string;
  replacementCycle: string;
  inspectionTips: string[];
  specs: Array<{ label: string; value: string }>;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  offsetVector: [number, number, number]; // Vector direction when exploded
}

export const EXPLODED_PARTS: ExplodedPartData[] = [
  {
    id: "top_chassis",
    number: 1,
    name: "Vỏ Ốp Bảo Vệ Trên Kháng Khuẩn",
    koreanName: "상부 항균 하우징 커버",
    partNumber: "OST-CHS-3000T",
    category: "mechanics",
    badge: "Medical ABS Polymer ISO 10993",
    shortDesc: "Vỏ bảo vệ bằng nhựa y tế satin chống bám vi khuẩn, che chắn các khối linh kiện điện tử bên trong.",
    clinicalFunction:
      "Ngăn bụi bẩn, bảo vệ cấu trúc bo mạch và đầu dò khỏi tác động cơ học ngoại lực. Vật liệu phủ kháng khuẩn y tế tiêu chuẩn ISO 10993 cho phép lau chùi khử trùng liên tục bằng cồn y tế mà không gây ố vàng hay ăn mòn.",
    maintenanceSchedule: "Vệ sinh sát khuẩn bề mặt sau mỗi ca khám bệnh nhân bằng dung dịch sát khuẩn y tế chuyên dụng.",
    replacementCycle: "Bảo dưỡng trọn đời máy / Thay thế khi có va chạm nứt vỡ ngoại lực.",
    inspectionTips: [
      "Kiểm tra các ngàm cài và đệm cao su giảm chấn chống lọt nước",
      "Không dùng dung môi aceton hoặc hóa chất tẩy rửa mạnh để lau bề mặt",
      "Đảm bảo các khe tản nhiệt không bị che khuất trong quá trình vận hành",
    ],
    specs: [
      { label: "Chất liệu vỏ", value: "Medical Grade Flame-Retardant ABS Polymer" },
      { label: "Tiêu chuẩn an toàn", value: "UL94-V0 Chống cháy lan & Kháng khuẩn y tế" },
      { label: "Màu sắc hoàn thiện", value: "Clinical Satin White (#f8fafc) + Cyan Trim" },
      { label: "Trọng lượng ốp", value: "1.85 kg" },
    ],
    cameraPosition: [0, 2.5, 2.8],
    cameraTarget: [0, 1.1, 0],
    offsetVector: [0, 1.2, 0],
  },
  {
    id: "lcd_screen",
    number: 2,
    name: "Cụm Màn Hình Cảm Ứng TFT LCD 7.0-Inch & Bo Điều Khiển",
    koreanName: "7.0인치 TFT 컬러 터치스크린 모듈",
    partNumber: "OST-LCD-070T",
    category: "display",
    badge: "TFT 800x480 Color Capacitive",
    shortDesc: "Màn hình cảm ứng màu 7-inch hiển thị trực tiếp đồ thị WHO T-Score, Z-score, SOS, BUA và BQI.",
    clinicalFunction:
      "Giao diện tương tác trực tiếp của bác sĩ và kỹ thuật viên y tế. Hiển thị đồ thị ma trận phân loại mật độ xương theo chuẩn WHO (Xanh: Bình thường, Vàng: Thiếu xương, Đỏ: Loãng xương) trong thời gian thực dưới 1 giây sau khi đo.",
    maintenanceSchedule: "Hiệu chuẩn cảm ứng điện dung 6 tháng/lần qua phần mềm Sonost Diagnosis Suite.",
    replacementCycle: "5 - 7 năm hoặc sau 50.000 giờ chiếu sáng liên tục.",
    inspectionTips: [
      "Sử dụng bút cảm ứng y tế hoặc đầu ngón tay sạch, không dùng vật nhọn chạm vào màn hình",
      "Kiểm tra cáp bẹ FPC 40-pin nối từ bo LCD xuống bo mạch chủ DSP",
      "Độ sáng hiển thị duy trì tối thiểu 350 cd/m2 để đọc rõ dưới ánh đèn phòng khám",
    ],
    specs: [
      { label: "Kích thước & Độ phân giải", value: "7.0 inch TFT LCD (800 x 480 pixels)" },
      { label: "Góc nhìn công thái học", value: "Nghiêng 35 độ tối ưu cho người thao tác đứng/ngồi" },
      { label: "Thời gian đáp ứng", value: "< 10ms (Cảm ứng điện dung đa điểm)" },
      { label: "Chuẩn giao tiếp", value: "RGB 24-bit Parallel Bus" },
    ],
    cameraPosition: [0, 2.0, 1.8],
    cameraTarget: [0, 0.8, 0.3],
    offsetVector: [0, 0.9, 0.6],
  },
  {
    id: "transducers",
    number: 3,
    name: "Cặp Đầu Dò Siêu Âm Calcaneus 0.5MHz (Dual Transducers)",
    koreanName: "종골용 0.5MHz 듀얼 초음파 탐촉자",
    partNumber: "OST-TRN-050M",
    category: "acoustic",
    badge: "Center Freq 0.5MHz ± 5%",
    shortDesc: "Cặp đầu dò siêu âm tiếp xúc trực tiếp 2 bên xương gót chân Calcaneus với màng dầu silicone waterless.",
    clinicalFunction:
      "Trái tim âm học của máy Sonost 3000. Phát và thu chùm sóng siêu âm tần số 0.5MHz xuyên qua xương gót chân Calcaneus, đo lường chính xác Vận tốc âm (SOS) và Độ suy giảm dải rộng (BUA) để tính toán Chỉ số chất lượng xương (BQI).",
    maintenanceSchedule: "Kiểm tra độ đàn hồi màng bóng silicone và hiệu chuẩn độ chính xác hàng ngày bằng khối chuẩn Phantom.",
    replacementCycle: "Khuyến cáo kiểm định âm học 12 tháng/lần theo quy định thiết bị y tế.",
    inspectionTips: [
      "Bơm bổ sung gel siêu âm y tế lên bề mặt màng trước mỗi ca đo",
      "Kiểm tra màng silicone có bị rách hoặc rò rỉ dầu tiếp xúc không",
      "Đảm bảo trục dẫn hướng trượt 2 bên di chuyển êm ái, không bị kẹt cơ học",
    ],
    specs: [
      { label: "Tần số siêu âm trung tâm", value: "0.5 MHz ± 5% (Độ xuyên thấu cao)" },
      { label: "Độ chính xác biến thiên (CV)", value: "SOS ≤ 0.2%, BUA ≤ 1.5%, BQI ≤ 1.5%" },
      { label: "Vật liệu màng tiếp xúc", value: "Silicone đàn hồi ngâm dầu y tế chuyên dụng" },
      { label: "Kiểu quét siêu âm", value: "Truyền qua trực tiếp (Through-transmission)" },
    ],
    cameraPosition: [-2.4, 1.2, 1.2],
    cameraTarget: [-0.4, 0.3, 0.0],
    offsetVector: [-0.85, 0, 0],
  },
  {
    id: "foot_cradle",
    number: 4,
    name: "Khay Định Vị Gót Chân & Miếng Đệm Silicon Khử Trùng",
    koreanName: "발 위치 고정대 및 실리콘 패드",
    partNumber: "OST-PAD-SIL01",
    category: "mechanics",
    badge: "Medical Silicone Anti-Slip",
    shortDesc: "Khay đặt chân công thái học kèm đệm silicon y tế kháng khuẩn có thể tháo rời khử trùng.",
    clinicalFunction:
      "Cố định gót chân bệnh nhân ở góc chuẩn 90 độ so với trục phát sóng của đầu dò siêu âm. Tự động thích ứng với kích cỡ bàn chân từ trẻ em đến người lớn, loại trừ sai số đo do cử động lệch vị trí xương gót.",
    maintenanceSchedule: "Tháo rời đệm silicon ngâm rửa dung dịch sát khuẩn sau mỗi ngày làm việc.",
    replacementCycle: "Thay mới đệm silicon sau 12 - 18 tháng sử dụng.",
    inspectionTips: [
      "Kiểm tra độ bám dính của các chốt định vị dưới đáy khay",
      "Đảm bảo thanh trượt căn chỉnh gót chân không bị lệch tâm",
      "Lau khô hoàn toàn miếng đệm trước khi lắp lại vào thân máy",
    ],
    specs: [
      { label: "Vật liệu đệm", value: "100% Medical Grade Silicone (Độ cứng Shore A 45)" },
      { label: "Kích thước khay", value: "320 x 180 mm (Tương thích size giày 32 - 47)" },
      { label: "Khả năng chịu nhiệt", value: "Chịu nhiệt hấp tiệt trùng lên đến 134°C" },
      { label: "Cơ chế tháo lắp", value: "Khóa ngàm Snap-fit 1 chạm tháo lắp nhanh" },
    ],
    cameraPosition: [0.2, 2.2, 2.0],
    cameraTarget: [0, 0.2, 0.4],
    offsetVector: [0, -0.2, 0.8],
  },
  {
    id: "rear_printer",
    number: 5,
    name: "Bộ Máy In Nhiệt Mặt Sau 58mm & Cụm Cổng Kết Nối I/O",
    koreanName: "후면 58mm 감열식 프린터 및 I/O 모듈",
    partNumber: "OST-PRN-58R",
    category: "printer",
    badge: "Rear Mount 58mm Thermal",
    shortDesc: "Khối máy in nhiệt tốc độ cao lắp tại mặt sau máy, in phiếu kết quả và đồ thị T-Score trong < 15 giây.",
    clinicalFunction:
      "Tự động in phiếu kết quả chẩn đoán mật độ xương tức thì sau khi đo. Vị trí đặt ở mặt sau (Rear Panel) giúp mặt trước máy luôn tinh giản, không vướng víu và thay cuộn giấy in 58mm cực kỳ thuận tiện.",
    maintenanceSchedule: "Lau đầu in nhiệt bằng tăm bông cồn isopropyl 70% định kỳ hàng tháng.",
    replacementCycle: "Đầu in nhiệt tuổi thọ 100km giấy in (tương đương > 500.000 lượt khám).",
    inspectionTips: [
      "Sử dụng giấy in nhiệt y tế đúng khổ chuẩn 58mm x đường kính cuộn 40mm",
      "Không dùng vật kim loại cạo lên bề mặt thanh nhiệt gốm của đầu in",
      "Kiểm tra công tắc đóng mở nắp khoang giấy in khi máy báo lỗi Out of Paper",
    ],
    specs: [
      { label: "Công nghệ in", value: "In nhiệt trực tiếp (Direct Thermal Line Printing)" },
      { label: "Khổ giấy in", value: "58 mm (Độ rộng in hiệu dụng 48 mm)" },
      { label: "Tốc độ in phiếu", value: "50 - 70 mm/giây (In trọn phiếu trong 8 - 12s)" },
      { label: "Cổng giao tiếp tích hợp", value: "RS-232C, USB 2.0, LAN RJ45, Jack nguồn AC 3 chấu" },
    ],
    cameraPosition: [0, 1.4, -3.2],
    cameraTarget: [0, 0.6, -0.8],
    offsetVector: [0, 0.3, -1.1],
  },
  {
    id: "dsp_motherboard",
    number: 6,
    name: "Bo Mạch Chủ DSP Xử Lý Tín Hiệu Siêu Âm & Nguồn Y Tế",
    koreanName: "DSP 신호처리 메인보드 및 의료용 전원부",
    partNumber: "OST-DSP-3000M",
    category: "electronics",
    badge: "High-Speed DSP 32-bit AI Engine",
    shortDesc: "Bo mạch xử lý tín hiệu âm học DSP tốc độ cao, tính toán thuật toán SOS, BUA và BQI tức thì.",
    clinicalFunction:
      "Bộ não điện tử của Sonost 3000. Thu nhận tín hiệu sóng siêu âm từ đầu dò, khuếch đại nhiễu cực thấp, số hóa qua chip ADC 14-bit và thực thi thuật toán phân tích phổ FFT để trích xuất vận tốc âm và độ suy giảm xương.",
    maintenanceSchedule: "Kiểm tra điện áp nguồn y tế DC +5V, +12V, -12V và vệ sinh quạt tản nhiệt mỗi năm 1 lần.",
    replacementCycle: "Tuổi thọ thiết kế linh kiện y tế > 10 năm vận hành liên tục.",
    inspectionTips: [
      "Đo kiểm tra điện trở cách điện đất y tế đạt tiêu chuẩn IEC 60601-1",
      "Kiểm tra pin CMOS lưu trữ dữ liệu thời gian thực trên bo mạch",
      "Nâng cấp firmware phần mềm chẩn đoán qua cổng USB Service chuyên dụng",
    ],
    specs: [
      { label: "Bộ vi xử lý chính", value: "32-bit Digital Signal Processor (DSP) 400 MHz" },
      { label: "Bộ chuyển đổi ADC", value: "14-bit High-Speed Low-Noise ADC 40 MSPS" },
      { label: "Bộ nhớ lưu trữ hồ sơ", value: "Flash eMMC 8GB (Lưu > 10.000 ca khám kèm đồ thị)" },
      { label: "Bộ nguồn y tế tích hợp", value: "Medical Grade Switching Power Supply AC 100-240V, 130W" },
    ],
    cameraPosition: [0, 2.2, 1.4],
    cameraTarget: [0, 0.4, 0],
    offsetVector: [0, 0.45, 0],
  },
  {
    id: "base_chassis",
    number: 7,
    name: "Khung Đế Kim Loại Chịu Lực & Chân Đế Chống Rung",
    koreanName: "하부 금속 프레임 및 방진 받침대",
    partNumber: "OST-CHS-BASE01",
    category: "mechanics",
    badge: "Reinforced Alloy Chassis",
    shortDesc: "Khung kim loại hợp kim chịu tải cao, làm bệ đỡ trung tâm và hấp thụ rung chấn cơ học.",
    clinicalFunction:
      "Đảm bảo sự ổn định tuyệt đối cho toàn bộ hệ thống cơ - âm - điện tử khi bệnh nhân đặt chân lên máy. 4 chân đế cao su chống trượt hấp thụ rung chấn từ sàn nhà, ngăn ngừa sai số tín hiệu do rung động cơ học.",
    maintenanceSchedule: "Kiểm tra độ đàn hồi 4 chân đế cao su và độ phẳng bàn đặt máy.",
    replacementCycle: "Bảo dưỡng trọn đời thiết bị.",
    inspectionTips: [
      "Đặt máy trên mặt bàn phẳng, chắc chắn, chịu lực tối thiểu 20kg",
      "Điều chỉnh độ cân bằng của 4 chân cao su để máy không bị cập kê",
    ],
    specs: [
      { label: "Vật liệu khung", value: "Hợp kim nhôm đúc định hình kết hợp thép tấm gia cường" },
      { label: "Chân giảm chấn", value: "4 đệm cao su EPDM chống rung chuyên dụng y tế" },
      { label: "Khả năng chịu tải chân", value: "Chịu lực tỳ bàn chân lên đến 150 kg" },
      { label: "Tải trọng bệ máy", value: "5.2 kg" },
    ],
    cameraPosition: [2.5, 1.5, 2.5],
    cameraTarget: [0, 0.2, 0],
    offsetVector: [0, 0, 0],
  },
];
