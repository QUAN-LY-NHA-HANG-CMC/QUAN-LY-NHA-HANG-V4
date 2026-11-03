import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    C_NAVY = RGBColor(15, 23, 42)       # #0F172A
    C_SLATE = RGBColor(30, 41, 59)      # #1E293B
    C_ORANGE = RGBColor(230, 81, 0)     # #E65100
    C_ORANGE_LIGHT = RGBColor(254, 243, 199) # #FEF3C7
    C_AMBER = RGBColor(217, 119, 6)     # #D97706
    C_GREEN = RGBColor(5, 150, 105)     # #059669
    C_BG_LIGHT = RGBColor(248, 250, 252)# #F8FAFC
    C_CARD_BG = RGBColor(255, 255, 255) # White
    C_BORDER = RGBColor(226, 232, 240)  # #E2E8F0
    C_TEXT_DARK = RGBColor(15, 23, 42)  # #0F172A
    C_TEXT_MUTED = RGBColor(100, 116, 139) # #64748B
    C_WHITE = RGBColor(255, 255, 255)

    def add_header(slide, title_text, category_text="QUÁN MỘC POS · BÁO CÁO TỔNG KẾT & THUYẾT TRÌNH DỰ ÁN"):
        # Header banner
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = category_text.upper()
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = title_text
        p2.font.size = Pt(22)
        p2.font.bold = True
        p2.font.color.rgb = C_NAVY
        p2.space_before = Pt(4)

    def add_card(slide, left, top, width, height, bg_color=C_CARD_BG, border_color=C_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
        return shape

    # ==========================================
    # SLIDE 1: BÌA TRÌNH CHIẾU
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_NAVY
    bg1.line.fill.background()

    # Title box
    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.333), Inches(3.2))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "🍲 HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN TẠI BÀN QR"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    p = tf1.add_paragraph()
    p.text = "QUÁN MỘC POS"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(10)

    p = tf1.add_paragraph()
    p.text = "Giải pháp chuyển đổi số toàn diện: E-Menu QR không chạm, Điều phối bếp KDS thời gian thực,\nQuản lý ca & quỹ đối soát minh bạch, POS thanh toán Napas VietQR động"
    p.font.size = Pt(15)
    p.font.color.rgb = RGBColor(203, 213, 225)
    p.space_before = Pt(12)

    # 4 metrics badges
    badges = [
        ("140", "User Stories (100%)"),
        ("4 Sprint", "Agile / Scrum"),
        ("5 Thành viên", "Phối hợp kỹ thuật"),
        ("58/58 Tests", "Kiểm thử tự động đạt 100%")
    ]
    for idx, (b_val, b_lbl) in enumerate(badges):
        bx = Inches(1.0 + idx * 2.85)
        by = Inches(4.3)
        bw = Inches(2.7)
        bh = Inches(1.1)
        c = add_card(s1, bx, by, bw, bh, bg_color=C_SLATE, border_color=C_AMBER)
        tb = s1.shapes.add_textbox(bx + Inches(0.15), by + Inches(0.15), bw - Inches(0.3), bh - Inches(0.3))
        ftb = tb.text_frame
        ftb.word_wrap = True
        p_val = ftb.paragraphs[0]
        p_val.text = b_val
        p_val.font.size = Pt(20)
        p_val.font.bold = True
        p_val.font.color.rgb = C_WHITE
        p_lbl = ftb.add_paragraph()
        p_lbl.text = b_lbl
        p_lbl.font.size = Pt(11)
        p_lbl.font.color.rgb = RGBColor(148, 163, 184)

    # Footer team
    fbox = s1.shapes.add_textbox(Inches(1.0), Inches(6.0), Inches(11.333), Inches(0.8))
    ftff = fbox.text_frame
    p_f = ftff.paragraphs[0]
    p_f.text = "Nhóm phát triển: Đinh Long Nhật (PM/Backend) · Minh (Backend) · Phát (Database) · Phong (Frontend) · Quân (Frontend UI/UX)"
    p_f.font.size = Pt(12)
    p_f.font.color.rgb = RGBColor(226, 232, 240)
    p_f2 = ftff.add_paragraph()
    p_f2.text = "Ngày báo cáo: 04/11/2026 · Phiên bản: Sprint 4 Release · Trạng thái: Sẵn sàng triển khai thực tế"
    p_f2.font.size = Pt(11)
    p_f2.font.color.rgb = RGBColor(148, 163, 184)
    p_f2.space_before = Pt(4)

    # ==========================================
    # SLIDE 2: BÀI TOÁN THỰC TẾ & MỤC TIÊU DỰ ÁN
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Vì sao cần Quán Mộc POS? Bài toán Vận hành & Giải pháp")

    # Left: Vấn đề cũ
    add_card(s2, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.1), bg_color=RGBColor(254, 242, 242), border_color=RGBColor(254, 202, 202))
    t1 = s2.shapes.add_textbox(Inches(1.1), Inches(1.9), Inches(5.0), Inches(4.7))
    tf = t1.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "❌ ĐIỂM NGHẼN VẬN HÀNH TRUYỀN THỐNG"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(185, 28, 28)

    issues = [
        "Thực khách chờ đợi: Mất 10-15 phút chờ nhân viên mang menu giấy, vẫy tay gọi thêm món hoặc xin tính tiền nhiều lần trong giờ cao điểm.",
        "Order miệng sai sót: Nhân viên ghi tay dễ nhầm món, sót món hoặc quên ghi chú khẩu vị (ít cay, không hành, ít đá).",
        "Nhà bếp quá tải: Order giấy bám dầu mỡ, thất lạc; không quản lý được thứ tự ưu tiên ai gọi trước nấu trước (FIFO); báo hết món chậm chễ.",
        "Thu ngân thất thoát: Chuyển bàn, ghép bàn, tách hóa đơn tính nhẩm thủ công; kết ca mất 1-2 tiếng đếm tiền và đối soát phiếu thu chi."
    ]
    for issue in issues:
        p = tf.add_paragraph()
        p.text = "• " + issue
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # Right: Giải pháp Quán Mộc POS
    add_card(s2, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.1), bg_color=RGBColor(240, 253, 244), border_color=RGBColor(187, 247, 208))
    t2 = s2.shapes.add_textbox(Inches(7.1), Inches(1.9), Inches(5.1), Inches(4.7))
    tf2 = t2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "💡 GIẢI PHÁP ĐỘT PHÁ CỦA QUÁN MỘC POS"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_GREEN

    solutions = [
        "E-Menu QR không chạm: Khách quét mã tại bàn, mở ngay thực đơn điện tử trên điện thoại, không cần cài app, không đăng ký tài khoản.",
        "Điều phối bếp KDS Real-time: Đơn món từ bàn bắn trực tiếp xuống màn hình bếp dưới 100ms; tự động gom món cùng loại và cảnh báo chờ lâu.",
        "POS Thu ngân & VietQR động: Tự động gom món thành 1 hóa đơn, nhúng mã Napas VietQR chính xác số tiền và mã hóa đơn chống nhầm lẫn.",
        "Đối soát ca quỹ & Analytics: Quản lý ca làm việc, đối soát chênh lệch két tiền mặt tự động; Dashboard doanh thu và phản hồi sao trực quan."
    ]
    for sol in solutions:
        p = tf2.add_paragraph()
        p.text = "✔ " + sol
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 3: TỔNG QUAN 140 CHỨC NĂNG QUA 4 SPRINT
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "140 Chức Năng Hoàn Thiện Qua 4 Sprint Agile/Scrum")

    sprint_boxes = [
        ("Sprint 1 · Nền tảng & Cấu hình", "44 User Stories · 100% Hoàn thành", [
            "Tài khoản, hồ sơ nhân sự & phân quyền RBAC",
            "Quản lý Khu vực & Sơ đồ bàn ăn",
            "Khởi tạo URL & xuất mã QR định danh bàn",
            "Quản lý danh mục & thực đơn món ăn",
            "Cấu hình thông tin quán, thuế VAT, nhật ký hệ thống"
        ], C_SLATE),
        ("Sprint 2 · E-Menu QR & Đặt món", "34 User Stories · 100% Hoàn thành", [
            "Trải nghiệm khách hàng quét QR mở E-Menu",
            "Tìm kiếm món, lọc danh mục, xem chi tiết",
            "Giỏ hàng động & tùy chọn khẩu vị chi tiết",
            "Kiểm tra giá Server-side chống gian lận",
            "Đặt món an toàn bằng Database Transaction",
            "Theo dõi trạng thái đơn món thời gian thực"
        ], C_ORANGE),
        ("Sprint 3 · Bếp KDS & Thu ngân", "32 User Stories · 100% Hoàn thành", [
            "Màn hình Điều phối Bếp (KDS) chuẩn FIFO",
            "Gom nhóm món cùng loại & Báo hết món",
            "Sơ đồ bàn POS: Chuyển bàn & Ghép bàn nguyên tử",
            "Chương trình khuyến mãi & Giảm giá hóa đơn",
            "Tạm tính hóa đơn kèm thuế VAT 8%",
            "Thanh toán Napas VietQR động & Tiền mặt"
        ], C_AMBER),
        ("Sprint 4 · Ca quỹ, Báo cáo & Đánh giá", "30 User Stories · 100% Hoàn thành", [
            "Mở ca, ghi nhận phiếu thu/chi & kết ca đối soát",
            "Dashboard phân tích doanh thu theo chu kỳ",
            "Báo cáo Top món bán chạy & Khung giờ vàng",
            "Hệ thống Đánh giá 1-5 sao & Phản hồi khách hàng",
            "Xuất dữ liệu hóa đơn ra file CSV UTF-8 BOM",
            "Chuyên biệt hóa phân quyền 5 vai trò"
        ], C_GREEN)
    ]

    for idx, (sp_title, sp_sub, items, color) in enumerate(sprint_boxes):
        bx = Inches(0.8 + idx * 2.95)
        by = Inches(1.8)
        bw = Inches(2.8)
        bh = Inches(5.1)
        add_card(s3, bx, by, bw, bh, bg_color=C_CARD_BG, border_color=color)

        tb = s3.shapes.add_textbox(bx + Inches(0.15), by + Inches(0.15), bw - Inches(0.3), bh - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = sp_title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = sp_sub
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_MUTED
        p.space_before = Pt(3)

        for item in items:
            p = tf.add_paragraph()
            p.text = "• " + item
            p.font.size = Pt(11)
            p.font.color.rgb = C_TEXT_DARK
            p.space_before = Pt(6)

    # ==========================================
    # SLIDE 4: KIẾN TRÚC HỆ THỐNG & TECH STACK
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Kiến Trúc Hệ Thống 3 Tầng & Ngăn Xếp Công Nghệ")

    layers = [
        ("TẦNG 1: GIAO DIỆN CLIENT (SPA)", "Vanilla ES6+ · HTML5 · CSS3 Custom Properties · Mobile Responsive", [
            "📱 Thực khách E-Menu: Giao diện web mobile tối ưu mượt mà, không cài app.",
            "💁 Phục vụ: Sơ đồ bàn, xác nhận bưng món ăn ra bàn.",
            "🍳 Bếp KDS: Màn hình điều phối chế biến hàng đợi FIFO.",
            "💼 POS Thu ngân: Quản lý bàn, in tạm tính, VietQR, mở/kết ca.",
            "👑 Quản trị Admin: Dashboard thống kê, thực đơn, nhân sự, cấu hình."
        ]),
        ("TẦNG 2: XỬ LÝ TRUNG TÂM (BACKEND & REAL-TIME)", "Node.js v24 · Express.js 5 · Socket.io 4.8 · JWT · bcryptjs", [
            "20 Router nghiệp vụ RESTful API chuẩn hóa phản hồi { ok, data, msg }.",
            "Socket.io Event Gateway: Phân kênh (Rooms) bảo mật giữa Bếp, Thu ngân và từng Bàn ăn.",
            "Cơ chế Middleware: RBAC 5 vai trò, Rate Limiting (300 req/min), CORS bảo mật.",
            "Database Transaction Manager: Đảm bảo nguyên tử tính khi đặt món, chuyển bàn, thanh toán."
        ]),
        ("TẦNG 3: LƯU TRỮ CƠ SỞ DỮ LIỆU", "SQLite 3 (WAL Mode) · better-sqlite3 · 29 Bảng Quan Hệ", [
            "Write-Ahead Logging (WAL): Đọc và ghi đồng thời không khóa nghẽn cơ sở dữ liệu.",
            "29 Bảng chuẩn hóa 3NF: Lưu vết toàn bộ tài khoản, bàn, đơn, bếp, hóa đơn, ca quỹ, đánh giá.",
            "14 Chỉ mục (Indexes): Tối ưu hóa truy vấn tổng hợp Dashboard và báo cáo tốc độ < 15ms."
        ])
    ]

    for idx, (ltitle, lsub, litems) in enumerate(layers):
        by = Inches(1.8 + idx * 1.75)
        add_card(s4, Inches(0.8), by, Inches(11.733), Inches(1.6), bg_color=C_CARD_BG, border_color=C_BORDER)
        tb = s4.shapes.add_textbox(Inches(1.0), by + Inches(0.12), Inches(11.3), Inches(1.35))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = ltitle + "  |  " + lsub
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        for item in litems:
            p = tf.add_paragraph()
            p.text = "• " + item
            p.font.size = Pt(11)
            p.font.color.rgb = C_TEXT_DARK
            p.space_before = Pt(3)

    # ==========================================
    # SLIDE 5: ĐỘI NGŨ 5 THÀNH VIÊN & PHÂN CÔNG
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Đội Ngũ 5 Thành Viên & Phân Công Nhiệm Vụ Agile/Scrum")

    members = [
        ("Đinh Long Nhật", "Nhóm trưởng / PM & Real-time Architect", [
            "Kiến trúc Backend Express 5 & Socket.io",
            "Bảo mật xác thực JWT, RBAC 5 vai trò",
            "Bộ API Thống kê Analytics & Dashboard",
            "Thiết lập CI/CD, chuẩn hóa tài liệu & 58 tests"
        ], C_ORANGE),
        ("Minh", "Backend & API Developer", [
            "20 cụm RESTful API nghiệp vụ",
            "Quản lý Nhân sự, Khu vực, Bàn & Mã QR",
            "Module Thực đơn, Ca làm việc & Phiếu thu chi",
            "Hệ thống Đánh giá sao & Xuất báo cáo CSV"
        ], C_SLATE),
        ("Phát", "Database & Systems Engineer", [
            "Thiết kế bản vẽ ERD 29 bảng chuẩn 3NF",
            "Cấu hình SQLite WAL mode chịu tải cao",
            "Transactions nguyên tử: Chuyển/Ghép bàn, Thanh toán",
            "Tối ưu 14 Composite Indexes cho Aggregation"
        ], C_AMBER),
        ("Phong", "Frontend Engineer (Admin/POS/KDS)", [
            "Khung giao diện Single Page Application (SPA)",
            "Màn hình Sơ đồ bàn POS tương tác cao",
            "Màn hình Điều phối bếp (KDS) thời gian thực",
            "Giao diện Quản lý Ca làm việc & Thống kê"
        ], C_GREEN),
        ("Quân", "Frontend & UI/UX Developer (Client)", [
            "Trải nghiệm khách hàng E-Menu QR di động",
            "Giỏ hàng & popup tùy chọn khẩu vị chi tiết",
            "Theo dõi đơn món Real-time & VietQR Napas",
            "Popup Đánh giá 5 sao & Phản hồi thực khách"
        ], RGBColor(14, 116, 144))
    ]

    for idx, (mname, mrole, mtasks, mcolor) in enumerate(members):
        bx = Inches(0.8 + idx * 2.36)
        by = Inches(1.8)
        bw = Inches(2.25)
        bh = Inches(5.1)
        add_card(s5, bx, by, bw, bh, bg_color=C_CARD_BG, border_color=mcolor)

        tb = s5.shapes.add_textbox(bx + Inches(0.12), by + Inches(0.15), bw - Inches(0.24), bh - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = mname
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = mcolor

        p = tf.add_paragraph()
        p.text = mrole
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_MUTED
        p.space_before = Pt(3)

        p = tf.add_paragraph()
        p.text = "Đóng góp: 100%"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_GREEN
        p.space_before = Pt(3)

        for task in mtasks:
            p = tf.add_paragraph()
            p.text = "• " + task
            p.font.size = Pt(10)
            p.font.color.rgb = C_TEXT_DARK
            p.space_before = Pt(5)

    # ==========================================
    # SLIDE 6: DÒNG CHẢY DỮ LIỆU & KẾ THỪA 4 SPRINT
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Dòng Chảy Dữ Liệu & Kế Thừa Liên Thông Giữa 4 Sprint")

    steps_flow = [
        ("1. Nền tảng (Sprint 1)", "Cấu hình bàn, nhân sự, menu", "Khởi tạo 12 bảng CSDL, gán mã QR cho từng bàn, thiết lập menu giá gốc và các vai trò vận hành."),
        ("2. Gọi món (Sprint 2)", "E-Menu QR & Giỏ hàng", "Khách quét QR kế thừa mã bàn từ S1, chọn món từ menu S1, tạo đơn bằng Transaction ghi nhận vào CSDL."),
        ("3. Chế biến & POS (Sprint 3)", "Bếp KDS & Hóa đơn", "Bếp kế thừa đơn đặt món từ S2 để nấu; Thu ngân gom đơn thành hóa đơn, tạo VietQR thanh toán và đóng bàn."),
        ("4. Đối soát & Báo cáo (Sprint 4)", "Ca quỹ, Analytics & Đánh giá", "Kế thừa toàn bộ hóa đơn từ S3 để kết ca đối soát tiền mặt, tổng hợp Dashboard doanh thu và nhận đánh giá từ khách.")
    ]

    for idx, (stitle, ssub, sdesc) in enumerate(steps_flow):
        by = Inches(1.8 + idx * 1.3)
        add_card(s6, Inches(0.8), by, Inches(11.733), Inches(1.15), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s6.shapes.add_textbox(Inches(1.1), by + Inches(0.12), Inches(11.1), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"{stitle}  ➔  {ssub}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = sdesc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(4)

    # ==========================================
    # SLIDE 7: CHI TIẾT SPRINT 1 & SPRINT 2
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Chi Tiết Sprint 1 & Sprint 2: Nền Tảng POS & E-Menu QR")

    # Sprint 1 Card
    add_card(s7, Inches(0.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=C_CARD_BG, border_color=C_SLATE)
    tb = s7.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.3), Inches(4.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "SPRINT 1: NỀN TẢNG, PHÂN QUYỀN & QUẢN TRỊ"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_SLATE

    sp1_items = [
        "Xác thực & RBAC: Đăng nhập băm bcryptjs, cấp phát JWT Token 24h, bảo vệ 5 vai trò.",
        "Sơ đồ bàn & Mã QR: Quản lý khu vực/tầng, bàn ăn; tự động sinh mã QR SVG/PNG định danh theo từng bàn.",
        "Quản lý thực đơn: CRUD danh mục, món ăn, giá bán, tùy chọn kích cỡ (Size), topping và upload ảnh.",
        "Cấu hình & Logs: Cấu hình tên quán, địa chỉ, hotline, mật khẩu Wifi, thuế VAT và nhật ký kiểm toán."
    ]
    for it in sp1_items:
        p = tf.add_paragraph()
        p.text = "✔ " + it
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # Sprint 2 Card
    add_card(s7, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=C_CARD_BG, border_color=C_ORANGE)
    tb2 = s7.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "SPRINT 2: E-MENU QR KHÁCH HÀNG & ĐẶT MÓN REAL-TIME"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_ORANGE

    sp2_items = [
        "E-Menu QR di động: Quét mã QR mở ngay giao diện web, tự nhận diện số bàn và khu vực.",
        "Giỏ hàng & Khẩu vị: Lưu giỏ hàng tạm, tùy chỉnh khẩu vị, ghi chú gia vị từng món ăn.",
        "Chống gian lận giá: Server tự tra cứu giá gốc từ bảng thuc_don, chặn sửa đổi payload từ Client.",
        "Đặt món Transaction: Đảm bảo nguyên tử tính khi ghi đơn, tích lũy hóa đơn và bắn socket tới Bếp.",
        "Theo dõi đơn trực tiếp: Khách theo dõi tiến độ nấu món trên điện thoại theo thời gian thực."
    ]
    for it in sp2_items:
        p = tf2.add_paragraph()
        p.text = "✔ " + it
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 8: CHI TIẾT SPRINT 3 & SPRINT 4
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Chi Tiết Sprint 3 & Sprint 4: Điều Phối KDS, Ca Quỹ & Analytics")

    # Sprint 3 Card
    add_card(s8, Inches(0.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=C_CARD_BG, border_color=C_AMBER)
    tb = s8.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.3), Inches(4.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "SPRINT 3: ĐIỀU PHỐI BẾP (KDS), POS & VIETQR"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    sp3_items = [
        "Màn hình KDS Bếp: Hàng đợi FIFO, cảnh báo đơn chờ lâu (>15 phút), gom nhóm món cùng loại.",
        "Báo hết món tại Bếp: Đầu bếp chủ động tắt món tạm hết, đồng bộ ngay lập tức lên E-Menu khách.",
        "Vận hành Sơ đồ bàn: Hỗ trợ Chuyển bàn và Ghép bàn nguyên tử, không thất lạc món đã gọi.",
        "Khuyến mãi & Tạm tính: Áp mã giảm giá Voucher, tự động tính thuế VAT 8% và in phiếu tạm tính.",
        "Napas VietQR Động: Tạo mã QR chuyển khoản chính xác số tiền và cú pháp mã hóa đơn."
    ]
    for it in sp3_items:
        p = tf.add_paragraph()
        p.text = "✔ " + it
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # Sprint 4 Card
    add_card(s8, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), bg_color=C_CARD_BG, border_color=C_GREEN)
    tb2 = s8.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "SPRINT 4: CA QUỸ, BÁO CÁO DOANH THU & ĐÁNH GIÁ"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_GREEN

    sp4_items = [
        "Quản lý Ca & Quỹ thu ngân: Mở ca, lập phiếu thu chi tiền mặt, kết ca đối soát chênh lệch tự động.",
        "Dashboard Thống kê: Biểu đồ doanh thu ngày/tuần/tháng, tỷ trọng thanh toán Tiền mặt vs QR.",
        "Báo cáo chuyên sâu: Xếp hạng Top 10 món bán chạy, khung giờ vàng đông khách, tỷ lệ món hủy.",
        "Đánh giá & Phản hồi: Thực khách chấm 1-5 sao sau bữa ăn; quản lý có mẫu phản hồi nhanh.",
        "Xuất dữ liệu CSV: Xuất toàn bộ danh sách hóa đơn ra file Excel/CSV chuẩn mã hóa UTF-8 BOM."
    ]
    for it in sp4_items:
        p = tf2.add_paragraph()
        p.text = "✔ " + it
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 9: KẾT QUẢ SO VỚI PRODUCT BACKLOG
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Nghiệm Thu Toàn Diện: 140/140 User Stories Hoàn Thành (100%)")

    # Top summary cards
    scards = [
        ("140 / 140", "User Stories hoàn thành", C_GREEN),
        ("400 / 400", "Story Points hoàn thành", C_ORANGE),
        ("29 Bảng", "Cơ sở dữ liệu SQLite chuẩn hóa", C_NAVY),
        ("58 / 58", "Tests tự động đạt 100% PASS", C_AMBER)
    ]
    for idx, (cval, clbl, ccol) in enumerate(scards):
        bx = Inches(0.8 + idx * 2.95)
        add_card(s9, bx, Inches(1.7), Inches(2.8), Inches(1.2), bg_color=C_CARD_BG, border_color=ccol)
        tb = s9.shapes.add_textbox(bx + Inches(0.15), Inches(1.8), Inches(2.5), Inches(1.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = cval
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = ccol
        p2 = tf.add_paragraph()
        p2.text = clbl
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED

    # Table breakdown
    table_shape = s9.shapes.add_table(5, 5, Inches(0.8), Inches(3.2), Inches(11.733), Inches(3.6))
    table = table_shape.table
    table.columns[0].width = Inches(2.5)
    table.columns[1].width = Inches(4.5)
    table.columns[2].width = Inches(1.5)
    table.columns[3].width = Inches(1.5)
    table.columns[4].width = Inches(1.733)

    headers = ["Giai đoạn", "Phạm vi chức năng chính", "Số US", "Story Points", "Nghiệm thu"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_SLATE
        for p in cell.text_frame.paragraphs:
            p.font.bold = True
            p.font.size = Pt(12)
            p.font.color.rgb = C_WHITE

    row_data = [
        ("Sprint 1", "Tài khoản, Phân quyền RBAC, Sơ đồ bàn, Mã QR, Thực đơn, Cấu hình", "44 US", "122 SP", "100% Hoàn thành"),
        ("Sprint 2", "E-Menu QR khách hàng, Giỏ hàng, Đặt món an toàn, Theo dõi đơn real-time", "34 US", "96 SP", "100% Hoàn thành"),
        ("Sprint 3", "Điều phối Bếp KDS, Vận hành bàn, Khuyến mãi, POS & Napas VietQR", "32 US", "100 SP", "100% Hoàn thành"),
        ("Sprint 4", "Quản lý Ca & Quỹ, Analytics Dashboard, Đánh giá sao, Xuất CSV, Tối ưu", "30 US", "82 SP", "100% Hoàn thành")
    ]
    for r_idx, r_val in enumerate(row_data):
        for c_idx, val in enumerate(r_val):
            cell = table.cell(r_idx + 1, c_idx)
            cell.text = val
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(11)
                p.font.color.rgb = C_TEXT_DARK
                if c_idx == 4:
                    p.font.bold = True
                    p.font.color.rgb = C_GREEN

    # ==========================================
    # SLIDE 10: VÒNG ĐỜI VẬN HÀNH KHÉP KÍN
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Vòng Đời Vận Hành Khép Kín 5 Bước Tại Nhà Hàng")

    wf_steps = [
        ("1. ĐÓN TIẾP & QR", "Phục vụ mở bàn · Khách quét mã QR", "Khách hàng ngồi vào bàn, quét mã QR trên bàn để mở thực đơn điện tử ngay lập tức."),
        ("2. ĐẶT MÓN TỨC THỜI", "Tùy chỉnh khẩu vị · Gửi đơn", "Khách chọn món, thêm ghi chú gia vị, bấm gửi order. Server kiểm tra giá và tạo đơn an toàn."),
        ("3. ĐIỀU PHỐI BẾP (KDS)", "Nhận đơn <100ms · Chuẩn FIFO", "Bếp nhận đơn qua socket, bấm nấu món. Khi nấu xong, hệ thống báo phục vụ bưng món."),
        ("4. TẠM TÍNH & VIETQR", "Áp mã Voucher · Quét VietQR", "Khách bấm xin thanh toán, Thu ngân in tạm tính và mở mã VietQR động để khách chuyển khoản."),
        ("5. ĐÁNH GIÁ & ĐỐI SOÁT", "Chấm 5 sao ⭐ · Kết ca & Báo cáo", "Khách gửi đánh giá sao; Thu ngân kết ca đối soát két tiền mặt; Quản lý xem Dashboard doanh thu.")
    ]

    for idx, (wtitle, wsub, wdesc) in enumerate(wf_steps):
        bx = Inches(0.8 + idx * 2.36)
        by = Inches(1.8)
        bw = Inches(2.25)
        bh = Inches(5.1)
        add_card(s10, bx, by, bw, bh, bg_color=C_CARD_BG, border_color=C_ORANGE)

        tb = s10.shapes.add_textbox(bx + Inches(0.12), by + Inches(0.15), bw - Inches(0.24), bh - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"BƯỚC {idx+1}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p = tf.add_paragraph()
        p.text = wtitle
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_before = Pt(4)

        p = tf.add_paragraph()
        p.text = wsub
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_MUTED
        p.space_before = Pt(4)

        p = tf.add_paragraph()
        p.text = wdesc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(10)

    # ==========================================
    # SLIDE 11: ĐIỂM NHẤN 1: E-MENU QR & GIỎ HÀNG
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Điểm Nhấn 1: E-Menu QR & Giỏ Hàng Chống Gian Lận Giá")

    hl1_cards = [
        ("Trải nghiệm Zero-App", "Quét QR là dùng ngay", "Khách hàng dùng camera điện thoại hoặc Zalo quét mã QR tại bàn là mở ngay E-Menu. Không bắt buộc tải app nặng máy, không yêu cầu đăng ký tài khoản phiền toái."),
        ("Chống gian lận giá Server-side", "Bảo vệ doanh thu nhà hàng", "Dù người dùng am hiểu công nghệ cố tình chỉnh sửa giá tiền gửi lên qua DevTools, Backend luôn truy vấn giá gốc từ bảng thuc_don trong CSDL để tính toán."),
        ("Cá nhân hóa khẩu vị món", "Chi tiết đến từng gia vị", "Hỗ trợ chọn kích cỡ (Size S/M/L), thêm topping, ghi chú gia vị chuyên biệt ('Ít cay', 'Không hành', 'Trà sen vàng 50% đường 70% đá') theo đúng sở thích khách hàng."),
        ("Đặt món nguyên tử (Atomic)", "Tránh trùng lặp đơn hàng", "Gửi đơn hàng bằng Database Transaction, tự động gắn với phiên bàn (Session) đang mở, chống ghi đè hoặc mất mát dữ liệu khi nhiều người cùng đặt.")
    ]

    for idx, (htitle, hsub, hdesc) in enumerate(hl1_cards):
        col = idx % 2
        row = idx // 2
        bx = Inches(0.8 + col * 5.95)
        by = Inches(1.8 + row * 2.6)
        add_card(s11, bx, by, Inches(5.75), Inches(2.35), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s11.shapes.add_textbox(bx + Inches(0.2), by + Inches(0.2), Inches(5.35), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = htitle + "  |  " + hsub
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p = tf.add_paragraph()
        p.text = hdesc
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 12: ĐIỂM NHẤN 2: ĐIỀU PHỐI BẾP (KDS)
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Điểm Nhấn 2: Hệ Thống Điều Phối Bếp (KDS) Thời Gian Thực")

    hl2_cards = [
        ("Chuẩn FIFO & Cảnh báo thời gian", "Không sót đơn, không nguội món", "Các món ăn được sắp xếp theo đúng thứ tự đặt trước nấu trước. Thẻ món hiển thị bộ đếm thời gian thực từ lúc nhận đơn; tự động đổi màu cảnh báo vàng/đỏ khi chờ quá 15 phút."),
        ("Gom nhóm món cùng loại", "Tối ưu công suất nấu nướng", "Hệ thống tự động gom tổng số lượng các bàn đang cùng gọi 1 món (VD: Bàn 2 gọi 2 dĩa bò, Bàn 5 gọi 1 dĩa bò -> Gom thành 3 dĩa) giúp đầu bếp chế biến 1 mẻ tiết kiệm thời gian."),
        ("Báo hết món tức thời", "Chặn ngay từ phía khách hàng", "Khi hết nguyên liệu, đầu bếp chỉ cần 1 cú chạm trên KDS để 'Báo hết món'. Món ăn sẽ tự động chuyển sang trạng thái Tạm hết trên toàn bộ điện thoại khách đang xem menu."),
        ("Đồng bộ liên thông Phục vụ", "Chuông báo rung khi nấu xong", "Khi bếp bấm 'Hoàn thành món', tín hiệu WebSockets lập tức gửi đến màn hình Phục vụ kèm số bàn để nhân viên đến bưng món ăn ngay khi còn nóng sốt.")
    ]

    for idx, (htitle, hsub, hdesc) in enumerate(hl2_cards):
        col = idx % 2
        row = idx // 2
        bx = Inches(0.8 + col * 5.95)
        by = Inches(1.8 + row * 2.6)
        add_card(s12, bx, by, Inches(5.75), Inches(2.35), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s12.shapes.add_textbox(bx + Inches(0.2), by + Inches(0.2), Inches(5.35), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = htitle + "  |  " + hsub
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_AMBER

        p = tf.add_paragraph()
        p.text = hdesc
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 13: ĐIỂM NHẤN 3: POS THU NGÂN & VIETQR
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "Điểm Nhấn 3: POS Thu Ngân, VietQR Động & Đối Soát Ca Quỹ")

    hl3_cards = [
        ("Thanh toán Napas VietQR Động", "Chuẩn mã QR ngân hàng quốc gia", "Sinh mã QR chứa sẵn số tài khoản quán, số tiền cần trả sau chiết khấu và nội dung chuyển khoản theo mã hóa đơn. Khách quét app ngân hàng là chuyển khoản 1 chạm, chuẩn xác 100%."),
        ("Vận hành bàn linh hoạt (Transaction)", "Chuyển bàn & Ghép bàn an toàn", "Khách đổi chỗ hoặc gộp nhóm được xử lý bằng Database Transaction nguyên tử. Dữ liệu các món ăn, ghi chú và tạm tính chuyển dời hoàn hảo, không thất lạc hay tính thừa."),
        ("Quản lý Ca & Quỹ minh bạch", "Đối soát két tiền mặt tự động", "Bắt buộc thu ngân nhập tiền mặt đầu ca; ghi nhận từng phiếu thu chi tiền mặt phát sinh trong ca; khi kết ca hệ thống tự tính số tiền chênh lệch giữa máy tính và thực tế đếm."),
        ("Hóa đơn tạm tính & Thuế VAT 8%", "Minh bạch chi phí bữa ăn", "Tự động tích lũy các đợt gọi món trong suốt bữa ăn thành 1 bảng kê duy nhất; áp mã giảm giá hợp lệ và tính thuế VAT chuẩn hóa theo quy định nhà nước.")
    ]

    for idx, (htitle, hsub, hdesc) in enumerate(hl3_cards):
        col = idx % 2
        row = idx // 2
        bx = Inches(0.8 + col * 5.95)
        by = Inches(1.8 + row * 2.6)
        add_card(s13, bx, by, Inches(5.75), Inches(2.35), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s13.shapes.add_textbox(bx + Inches(0.2), by + Inches(0.2), Inches(5.35), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = htitle + "  |  " + hsub
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_GREEN

        p = tf.add_paragraph()
        p.text = hdesc
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 14: ĐIỂM NHẤN 4: BÁO CÁO DOANH THU & ĐÁNH GIÁ
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "Điểm Nhấn 4: Báo Cáo Doanh Thu Analytics & Đánh Giá Sao")

    hl4_cards = [
        ("Dashboard Doanh thu đa chiều", "Nắm bắt tình hình kinh doanh tức thì", "Biểu đồ trực quan theo ngày, tuần, tháng; thống kê doanh thu thực tế, số lượng hóa đơn, số bàn đang phục vụ và tỷ trọng thanh toán Tiền mặt vs Chuyển khoản QR."),
        ("Top món & Khung giờ cao điểm", "Tối ưu thực đơn và nhân sự", "Xếp hạng Top 10 món ăn bán chạy nhất theo số lượng và doanh thu; phân tích khung giờ vàng khách đông nhất trong ngày để bố trí nhân viên phục vụ và bếp hợp lý."),
        ("Kiểm soát tỷ lệ hủy món", "Giảm thiểu lãng phí nguyên liệu", "Theo dõi chi tiết số lượng và nguyên nhân các đơn hủy hoặc món hủy; hỗ trợ chủ quán kiểm soát thất thoát và nâng cao quy trình phục vụ của nhân viên."),
        ("Hệ thống Đánh giá sao & Xuất CSV", "Lắng nghe phản hồi thực tế", "Khách hàng chấm 1-5 sao và gửi nhận xét chất lượng phục vụ sau bữa ăn. Quản lý có mẫu phản hồi nhanh; hỗ trợ xuất toàn bộ báo cáo doanh thu ra file CSV chuẩn UTF-8 BOM.")
    ]

    for idx, (htitle, hsub, hdesc) in enumerate(hl4_cards):
        col = idx % 2
        row = idx // 2
        bx = Inches(0.8 + col * 5.95)
        by = Inches(1.8 + row * 2.6)
        add_card(s14, bx, by, Inches(5.75), Inches(2.35), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s14.shapes.add_textbox(bx + Inches(0.2), by + Inches(0.2), Inches(5.35), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = htitle + "  |  " + hsub
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_SLATE

        p = tf.add_paragraph()
        p.text = hdesc
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)

    # ==========================================
    # SLIDE 15: ĐIỂM NHẤN KỸ THUẬT NỔI BẬT
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, "Điểm Nhấn Kỹ Thuật: Toàn Vẹn Dữ Liệu & Khả Năng Phòng Thủ")

    tech_points = [
        ("Database Transactions Nguyên Tử", "Bảo vệ 100% tính toàn vẹn dữ liệu tài chính", "Mọi thao tác liên quan đến tiền bạc, đặt món, chuyển bàn, ghép bàn và thanh toán đều được bọc trong Database Transaction. Khi xảy ra xung đột hoặc lỗi mạng, hệ thống tự động Rollback toàn bộ, không sinh rác dữ liệu."),
        ("Kiến trúc WebSockets Phân Kênh (Rooms)", "Bảo mật và tối ưu lưu lượng mạng", "Phân chia không gian sự kiện độc lập: Room 'bep' chỉ gửi đơn cho đầu bếp; Room 'thu_ngan' nhận yêu cầu tính tiền; Room 'ban_{id}' chỉ gửi thông báo cho đúng bàn đó, ngăn chặn rò rỉ dữ liệu giữa các bàn."),
        ("SQLite WAL Mode & Composite Indexes", "Hiệu năng đọc/ghi song song cực cao", "Kích hoạt chế độ Write-Ahead Logging (WAL) giúp tiến trình đọc thống kê báo cáo chạy song song với tiến trình ghi hóa đơn thu ngân mà không khóa cơ sở dữ liệu (Zero lock contention). 14 chỉ mục tối ưu truy vấn <15ms."),
        ("Khả Năng Tự Phục Hồi & Tự Phòng Thủ", "Auto-reconnect & Error Boundaries", "Client tích hợp thuật toán Exponential Backoff tự động kết nối lại socket khi mạng chập chờn; Router Frontend có Error Boundary bắt lỗi promise; Backend bắt lỗi EADDRINUSE hướng dẫn giải phóng cổng 3001.")
    ]

    for idx, (ttitle, tsub, tdesc) in enumerate(tech_points):
        by = Inches(1.8 + idx * 1.3)
        add_card(s15, Inches(0.8), by, Inches(11.733), Inches(1.15), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s15.shapes.add_textbox(Inches(1.1), by + Inches(0.12), Inches(11.1), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"{ttitle}  —  {tsub}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = tdesc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(4)

    # ==========================================
    # SLIDE 16: BA HỢP ĐỒNG KỸ THUẬT (CONTRACTS)
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, "Ba Hợp Đồng Kỹ Thuật (Contracts) Giữa Các Phân Hệ")

    contracts = [
        ("HỢP ĐỒNG 1: DATABASE ↔ BACKEND", "Phát (Database) ↔ Nhật & Minh (Backend)", [
            "Khóa chính tự tăng: id INTEGER PRIMARY KEY AUTOINCREMENT.",
            "Thời gian chuẩn ISO: YYYY-MM-DD HH:mm:ss.",
            "ENUM chuẩn hóa: Trạng thái bàn (trong, dang_dung, cho_thanh_toan, tam_khoa); Trạng thái món (cho_che_bien, dang_nau, da_nau_xong, da_phuc_vu, da_huy).",
            "Mọi hàm từ 2 bảng trở lên bắt buộc thực thi trong Transaction."
        ], C_ORANGE),
        ("HỢP ĐỒNG 2: API ↔ FRONTEND", "Minh & Nhật (Backend) ↔ Phong & Quân (Frontend)", [
            "Định dạng JSON chuẩn hóa: { ok: true/false, data: { ... }, msg: '...' }.",
            "Mã HTTP chuẩn: 200 (Thành công), 201 (Tạo mới), 400 (Sai tham số), 401 (Hết hạn Token -> Chuyển hướng đăng nhập), 403 (Trái quyền), 404 (Không tìm thấy).",
            "Mọi truy vấn phân trang trả về cấu trúc { danhSach: [], tongSo: N }."
        ], C_AMBER),
        ("HỢP ĐỒNG 3: REAL-TIME EVENT HUB ↔ CLIENT", "Nhật (Architect) ↔ Phong & Quân (Frontend)", [
            "Sự kiện don_moi_gui_bep: Gửi danh sách món mới tới Room 'bep'.",
            "Sự kiện cap_nhat_trang_thai_mon: Báo trạng thái nấu cho Bếp và Khách.",
            "Sự kiện mon_da_phuc_vu: Báo nhân viên phục vụ đã bưng món lên bàn.",
            "Sự kiện yeu_cau_thanh_toan: Rung chuông quầy thu ngân kèm số bàn.",
            "Sự kiện thanh_toan_hoan_tat: Giải phóng bàn và kích hoạt form đánh giá."
        ], C_GREEN)
    ]

    for idx, (ctitle, cparties, citems, ccol) in enumerate(contracts):
        bx = Inches(0.8 + idx * 3.95)
        by = Inches(1.8)
        bw = Inches(3.8)
        bh = Inches(5.1)
        add_card(s16, bx, by, bw, bh, bg_color=C_CARD_BG, border_color=ccol)

        tb = s16.shapes.add_textbox(bx + Inches(0.15), by + Inches(0.15), bw - Inches(0.3), bh - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = ctitle
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = ccol

        p = tf.add_paragraph()
        p.text = cparties
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_MUTED
        p.space_before = Pt(3)

        for item in citems:
            p = tf.add_paragraph()
            p.text = "• " + item
            p.font.size = Pt(11)
            p.font.color.rgb = C_TEXT_DARK
            p.space_before = Pt(8)

    # ==========================================
    # SLIDE 17: KỊCH BẢN LIVE DEMO QUY TRÌNH 5 BƯỚC
    # ==========================================
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, "Kịch Bản Live Demo Thực Tế (Quy Trình Khép Kín 7 Phút)")

    demo_steps = [
        ("Bước 1 (1.0 phút)", "Mở ca thu ngân & Khởi tạo bàn", "Thu ngân 'thungan' mở ca với 1.000.000đ tiền két. Phục vụ 'phucvu' mở Bàn 3 đón khách."),
        ("Bước 2 (1.5 phút)", "Khách quét QR gọi món tại bàn", "Khách quét mã Bàn 3, chọn 'Bò nướng tảng Quán Mộc' và 'Trà sen vàng (Ít đá)', bấm Đặt món."),
        ("Bước 3 (1.5 phút)", "Điều phối bếp KDS Real-time", "Màn hình KDS nhận chuông đơn mới. Bếp bấm 'Nấu món' ➔ Khách thấy 'Đang nấu' ➔ Bếp bấm 'Xong'."),
        ("Bước 4 (1.5 phút)", "Áp Voucher & Thanh toán VietQR", "Khách xin tính tiền. Thu ngân áp mã 'QUANMOC10' (-10%), mở mã VietQR động để khách quét thanh toán."),
        ("Bước 5 (1.5 phút)", "Đánh giá sao & Kết ca đối soát", "Khách chấm 5 sao ⭐; Thu ngân kết ca đối soát két tiền mặt; Quản lý mở Dashboard xem doanh thu cập nhật tức thì.")
    ]

    for idx, (dtitle, dsub, ddesc) in enumerate(demo_steps):
        by = Inches(1.8 + idx * 1.02)
        add_card(s17, Inches(0.8), by, Inches(11.733), Inches(0.92), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s17.shapes.add_textbox(Inches(1.1), by + Inches(0.08), Inches(11.1), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"{dtitle}  —  {dsub}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = ddesc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(3)

    # ==========================================
    # SLIDE 18: KẾT QUẢ KIỂM THỬ TỰ ĐỘNG
    # ==========================================
    s18 = prs.slides.add_slide(blank_layout)
    add_header(s18, "Kết Quả Kiểm Thử Tự Động: 58/58 Tests PASS (100%)")

    # Metrics
    tmetrics = [
        ("58", "Ca kiểm thử tự động", C_GREEN),
        ("100%", "Tỷ lệ vượt qua (Pass)", C_ORANGE),
        ("0", "Lỗi tồn đọng (Fail/Skip)", C_AMBER),
        ("20.8s", "Thời gian chạy toàn bộ Suite", C_NAVY)
    ]
    for idx, (mval, mlbl, mcol) in enumerate(tmetrics):
        bx = Inches(0.8 + idx * 2.95)
        add_card(s18, bx, Inches(1.7), Inches(2.8), Inches(1.1), bg_color=C_CARD_BG, border_color=mcol)
        tb = s18.shapes.add_textbox(bx + Inches(0.15), Inches(1.78), Inches(2.5), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = mval
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = mcol
        p2 = tf.add_paragraph()
        p2.text = mlbl
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED

    # Test suites breakdown
    suites = [
        ("Xác thực, Bảo mật & Phân quyền", "Kiểm tra băm mật khẩu bcryptjs, sinh và giải mã JWT token, kiểm soát quyền truy cập 5 vai trò.", "100% PASS"),
        ("Cơ sở dữ liệu & Database Transactions", "Kiểm tra toàn vẹn 29 bảng, transaction đặt món, chuyển bàn, ghép bàn, thanh toán và khóa phiên.", "100% PASS"),
        ("KDS Bếp & WebSockets Room Routing", "Kiểm tra định tuyến sự kiện real-time, hàng đợi FIFO, thông báo hai chiều Bếp - Thu ngân - Bàn.", "100% PASS"),
        ("Ca làm việc, Analytics & Xuất Báo cáo CSV", "Kiểm tra logic mở/kết ca, đối soát quỹ, tính toán doanh thu, top món và xuất file CSV UTF-8 BOM.", "100% PASS")
    ]
    for idx, (stitle, sdesc, sstatus) in enumerate(suites):
        by = Inches(3.0 + idx * 1.05)
        add_card(s18, Inches(0.8), by, Inches(11.733), Inches(0.95), bg_color=C_CARD_BG, border_color=C_BORDER)

        tb = s18.shapes.add_textbox(Inches(1.1), by + Inches(0.1), Inches(9.5), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = stitle
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p2 = tf.add_paragraph()
        p2.text = sdesc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(3)

        # Status badge
        tb_st = s18.shapes.add_textbox(Inches(10.8), by + Inches(0.2), Inches(1.5), Inches(0.6))
        tf_st = tb_st.text_frame
        p_st = tf_st.paragraphs[0]
        p_st.text = "✔ " + sstatus
        p_st.font.size = Pt(12)
        p_st.font.bold = True
        p_st.font.color.rgb = C_GREEN

    # ==========================================
    # SLIDE 19: ĐÓNG GÓP TỪNG THÀNH VIÊN
    # ==========================================
    s19 = prs.slides.add_slide(blank_layout)
    add_header(s19, "Đánh Giá Đóng Góp Của 5 Thành Viên (Đều Đạt 100%)")

    # Table of 5 members
    tshape = s19.shapes.add_table(6, 4, Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0))
    tbl = tshape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(2.3)
    tbl.columns[2].width = Inches(5.733)
    tbl.columns[3].width = Inches(1.5)

    headers = ["Thành viên", "Vai trò chính", "Đóng góp nổi bật qua 4 Sprint", "Đánh giá"]
    for i, h in enumerate(headers):
        cell = tbl.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_SLATE
        for p in cell.text_frame.paragraphs:
            p.font.bold = True
            p.font.size = Pt(12)
            p.font.color.rgb = C_WHITE

    m_data = [
        ("Đinh Long Nhật", "PM / Backend & Real-time", "Kiến trúc Backend Express 5 + WebSockets, bảo mật JWT/RBAC, module Analytics Dashboard, CI/CD và bộ 58 automated tests.", "100% Xuất sắc"),
        ("Minh", "Backend Developer", "Xây dựng 20 cụm RESTful API nghiệp vụ, phân hệ Quản lý Ca & Quỹ thu ngân, module Đánh giá sao, xuất dữ liệu CSV UTF-8 BOM.", "100% Xuất sắc"),
        ("Phát", "Database Engineer", "Thiết kế ERD 29 bảng chuẩn 3NF, cấu hình SQLite WAL mode chịu tải cao, lập trình các Database Transactions phức tạp chống thất thoát.", "100% Xuất sắc"),
        ("Phong", "Frontend Developer", "Thiết kế bộ khung SPA giao diện đẹp mắt, màn hình Sơ đồ bàn POS, màn hình Điều phối bếp KDS chuẩn nhà hàng, Quản lý ca và Thống kê.", "100% Xuất sắc"),
        ("Quân", "Frontend & UI/UX", "Tối ưu trải nghiệm khách hàng quét QR trên di động, giỏ hàng chống gian lận giá, tích hợp VietQR Napas chuẩn quốc gia và màn hình theo dõi đơn.", "100% Xuất sắc")
    ]
    for r_idx, r_val in enumerate(m_data):
        for c_idx, val in enumerate(r_val):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell.text = val
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(11)
                p.font.color.rgb = C_TEXT_DARK
                if c_idx == 3:
                    p.font.bold = True
                    p.font.color.rgb = C_GREEN

    # ==========================================
    # SLIDE 20: HẠN CHẾ, HƯỚNG PHÁT TRIỂN & CẢM ƠN
    # ==========================================
    s20 = prs.slides.add_slide(blank_layout)
    bg20 = s20.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg20.fill.solid()
    bg20.fill.fore_color.rgb = C_NAVY
    bg20.line.fill.background()

    # Left: Hạn chế & Hướng phát triển
    t_left = s20.shapes.add_textbox(Inches(1.0), Inches(1.0), Inches(5.5), Inches(5.5))
    tf_l = t_left.text_frame
    tf_l.word_wrap = True

    p = tf_l.paragraphs[0]
    p.text = "HẠN CHẾ & HƯỚNG PHÁT TRIỂN TƯƠNG LAI"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    p = tf_l.add_paragraph()
    p.text = "Hạn chế hiện tại:"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(8)

    limits = [
        "Chưa tích hợp Webhook biến động số dư ngân hàng tự động (vẫn cần nhân viên xác nhận giao dịch).",
        "In ấn nhiệt trực tiếp ESC/POS qua cổng USB/LAN cần cài đặt thêm driver trên máy trạm quầy."
    ]
    for l in limits:
        p = tf_l.add_paragraph()
        p.text = "• " + l
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(203, 213, 225)
        p.space_before = Pt(4)

    p = tf_l.add_paragraph()
    p.text = "Định hướng phát triển Sprint tiếp theo:"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(10)

    plans = [
        "Tích hợp Webhook Ngân hàng (SePay / VietQR Pro) tự động đóng hóa đơn ngay khi nhận tiền.",
        "Hỗ trợ lệnh in nhiệt trực tiếp ESC/POS xuống máy in bill quầy và máy in phiếu bếp qua TCP/IP.",
        "Ứng dụng AI thông minh gợi ý món ăn kèm (AI Food Recommendation) tăng giá trị đơn hàng.",
        "Hệ thống tích điểm thành viên (CRM Loyalty) gửi voucher sinh nhật tự động qua Zalo ZNS."
    ]
    for pl in plans:
        p = tf_l.add_paragraph()
        p.text = "✔ " + pl
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(203, 213, 225)
        p.space_before = Pt(4)

    # Right: Lời cảm ơn & Q&A
    add_card(s20, Inches(7.0), Inches(1.5), Inches(5.3), Inches(4.8), bg_color=C_SLATE, border_color=C_AMBER)
    t_right = s20.shapes.add_textbox(Inches(7.3), Inches(1.8), Inches(4.7), Inches(4.2))
    tf_r = t_right.text_frame
    tf_r.word_wrap = True

    p = tf_r.paragraphs[0]
    p.text = "NHÓM QUÁN MỘC POS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    p = tf_r.add_paragraph()
    p.text = "XIN CHÂN THÀNH CẢM ƠN!"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(8)

    p = tf_r.add_paragraph()
    p.text = "Hệ thống Quản lý Nhà hàng & Gọi món QR (Quán Mộc POS) đã hoàn thành toàn diện 100% mục tiêu sau 4 Sprint phát triển.\n\nNhóm rất mong nhận được những nhận xét, góp ý quý báu từ Quý Thầy Cô và Hội Đồng Đánh Giá để hoàn thiện dự án hơn nữa!"
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(226, 232, 240)
    p.space_before = Pt(12)

    p = tf_r.add_paragraph()
    p.text = "💬 Q & A (HỎI & ĐÁP)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_ORANGE
    p.space_before = Pt(16)

    # Save presentation
    output_path = os.path.join(os.path.dirname(__file__), "taiLieu", "thuyetTrinhDuAn.pptx")
    prs.save(output_path)
    print(f"SUCCESS: Saved presentation to {output_path}")

if __name__ == "__main__":
    create_presentation()
