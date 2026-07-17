---
name: ios-app-store-audit
description: "Chuyên gia kiểm định iOS App trước khi nộp lên App Store. Quét mã nguồn, Info.plist, IAP, và UI để phát hiện sớm các vi phạm Apple Guideline."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "/ios-app-store-audit"
  - "/apple-review"
  - "kiểm tra app store"
  - "kiểm tra trước khi submit ios"
  - "preflight ios"
---

# 🍏 iOS App Store Audit (Pre-flight Checklist)

**Mục đích**: Đóng vai trò là Reviewer của Apple, skill này sẽ quét toàn bộ dự án iOS để chỉ ra những vi phạm có nguy cơ reject cao trước khi Submit.

## 🛠 Hướng dẫn thực thi (Checklist)

Khi được gọi, AI phải kiểm tra lần lượt các hạng mục sau trong codebase iOS:

### 1. Guideline 5.1 & 2.1 - Privacy & App Tracking (ATT)
- **Kiểm tra file Info.plist**: Tìm `NSUserTrackingUsageDescription`. Nếu có, yêu cầu nội dung phải chi tiết, ví dụ: *"This identifier will be used to deliver personalized ads to you."*
- **Kiểm tra Code**: Tìm `ATTrackingManager.requestTrackingAuthorization`. Đảm bảo nó được chạy ở thời điểm phù hợp (vd: sau màn hình Onboarding), không gọi quá sớm khi giao diện chưa kịp render.
- **Purpose Strings khác**: Các chuỗi `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription` phải mô tả ĐÚNG MỤC ĐÍCH và VÍ DỤ ("We need camera access to let you scan the QR code"). Tuyệt đối cấm các string hời hợt như "App needs camera".

### 2. Guideline 1.4.1 - Health & Medical Safety
Dành cho app Y Tế / Sức khoẻ:
- **Medical Disclaimer**: Yêu cầu phải có dòng chữ *"Vui lòng tham khảo ý kiến bác sĩ trước khi đưa ra bất kỳ quyết định y tế nào"* trong giao diện (hoặc ở App Store Description).
- **Citations**: Những nội dung nội bộ hoặc do AI tư vấn sức khỏe phải đi kèm trích dẫn (References / Sources).
- **Video Physical Device**: Nhắc nhở người dùng phải tự quay bằng video máy thật với luồng đo sức khoẻ để đính kèm App Review Notes.

### 3. Guideline 3.1 & 2.1 - Subscriptions & IAP
- Nhắc nhở User: "Bạn đã đính kèm In-App Purchases cùng với bản Build khi Submit chưa?"
- Yêu cầu kiểm tra màn hình bán hàng (Premium/Paywall) phải bao gồm: 
  - Nút **Restore Purchases**
  - Link **Terms of Use (EULA)**
  - Link **Privacy Policy**

### 4. Guideline 4.0 - Design (iPad Compatibility)
- Quét mã nguồn UI (SwiftUI views): Cảnh báo nếu sử dụng `.frame(width: UIScreen.main.bounds.width)`, vì nó gây rách layout trên iPad.
- Đề xuất giải pháp an toàn như `.frame(maxWidth: .infinity)` hoặc sử dụng `NavigationSplitView`.

### 5. Fake Reviewer State
- AI nhắc nhở User test kịch bản "Fresh Install" bằng cách khôi phục cài đặt gốc của App trước khi build nộp lại, vì Reviewer luôn test trên một máy hoàn toàn trắng.

## 📥 Báo cáo
In ra một báo cáo MarkDown gồm 🔴 (Lỗi Cần Sửa Gấp) và 🟡 (Cảnh Báo Cần Chú Ý), sau đó gợi ý người dùng cách chỉnh sửa từng mục.
