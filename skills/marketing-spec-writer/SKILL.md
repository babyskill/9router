---
name: marketing-spec-writer
description: |
  Đóng vai trò là Giám đốc Marketing (CMO) của dự án. AI tự động quét codebase, đọc project identity
  và dịch các tính năng kỹ thuật khô khan thành tài liệu Marketing Spec (Value Props, ASO, Campaign Briefs).
  Cung cấp đầu vào cực chuẩn (Prompt Ready) để đưa cho các AI Agent khác như `short-maker` làm video quảng cáo.
metadata:
  stage: workflow
  version: "1.0"
  tags: [marketing, aso, spec, content, ads, brief, strategy]
trigger: explicit
activation_keywords:
  - "/marketing"
  - "/marketing-spec"
  - "viết tài liệu marketing"
  - "tạo spec quảng cáo"
---

# 📈 Marketing Spec Writer (CMO Mode)

> **Mục tiêu**: Biến Codebase kỹ thuật thành "Vàng Marketing". Skill này chuẩn bị toàn bộ "đạn dược" (Asset Briefs, ASO, USP) để cung cấp cho các AI Agent khác (như `short-maker` làm video, hoặc AI viết bài PR) thao tác tự động.

## 🚀 Quy trình hoạt động

### Bước 1: Thu thập Context Kỹ Thuật
- Đọc file `.project-identity` và `CODEBASE.md` để hiểu "Linh hồn" và tính năng chính của App.
- (Tùy chọn) Dùng `gitnexus_query` tìm các tính năng cốt lõi hoặc các module vừa được push code gần đây nếu làm Release Marketing.

### Bước 2: Dịch Thuật Kỹ Thuật -> Lợi Ích (Tech-to-Value)
- Phân tích và chuyển đổi các Specs kỹ thuật (ví dụ: *Offline First SQLite*, *End-to-End Encryption*, *50fps Rendering*) thành User Benefits (ví dụ: *Use Anywhere, Even in the Woods*, *Your Secrets are Safe*, *Silky Smooth Experience*).

### Bước 3: Phân rã theo định dạng (Marketing Spec Generation)
Tạo file `docs/MARKETING_SPEC.md` theo template chuẩn bao gồm các phần:
1.  **Product Core Identity**: Sứ mệnh, Đối tượng mục tiêu (Persona), Tone of Voice.
2.  **App Store Optimization (ASO)**: Đề xuất Tiêu đề, Subtitle, Keywords, Description.
3.  **Unique Selling Propositions (USPs)**: 3-5 điểm ăn tiền nhất.
4.  **Campaign Angles (Góc nhìn truyền thông)**: Các kịch bản đánh vào cảm xúc (Nỗi đau - Giải pháp, hoặc Khát vọng).
5.  **AI Video Prompt (BẮT BUỘC)**: Đóng gói sẵn 1 đoạn Text để User **chỉ việc Copy-Paste vào lệnh `/short` hoặc `short-maker`** để ra lệnh làm video.

### Bước 4: Review & Chốt Hướng Đi
- Trình bày tóm tắt cho User duyệt.
- Nếu User duyệt, hướng dẫn cách sử dụng đoạn prompt đã gen để đẩy sang quy trình Video Marketing (`short-maker`).

## 🔗 Liên kết hệ sinh thái (Agent Hand-off)
Tài liệu sinh ra từ skill này được thiết kế ĐẶC BIỆT để làm mồi (Input) cho các tools khác:
- **`short-maker` (Video Ads)**: Sử dụng phần Campaign Angles và Persona để xây dựng Character và kịch bản AIDA chính xác nhất.
- **`blitz-macos` (Store Upload)**: Copy phần ASO để dán tự động lên App Store Connect.

## ⚠️ Lưu ý cho AI
- TUYỆT ĐỐI không dùng ngôn ngữ máy móc kiểu "App này dùng React Native...". Hãy dùng ngôn ngữ bán hàng, thuyết phục, đánh vào cảm xúc người dùng cuối (End-user).
- Hãy áp dụng các Framework Marketing chuẩn: AIDA (Attention - Interest - Desire - Action) hoặc PAS (Problem - Agitate - Solve).
