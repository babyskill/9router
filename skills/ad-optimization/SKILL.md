---
name: ad-optimization
description: Tự động phân tích, đề xuất thiết kế hướng chuyển đổi (ROAS), tối ưu layout, tốc độ hiển thị và cơ chế preload quảng cáo khi phát hiện tích hợp Ads.
---

# Skill: Ad Optimization & Creative Generator (ROAS-First)

Skill này giúp AI tự động phân tích và đưa ra các đề xuất/thiết kế tối ưu khi ứng dụng tích hợp quảng cáo (Banner, Interstitial, Native, Paywall).

---

## 📖 Hướng Dẫn Từng Bước (Implementation Guide)

### 1. Tối ưu Hiển thị & Tránh giật lag (Layout & CLS)
*   **Bắt buộc xác định kích thước trước:** Luôn đặt kích thước cố định (`frame` trên iOS, `modifier.size` trên Android) cho khung chứa quảng cáo. Không để kích thước dynamic từ 0 lên X khi ad tải xong để tránh CLS.
*   **Hiển thị Shimmer/Blur Placeholder:** Tạo placeholder với hiệu ứng shimmer trong lúc tải. Nếu ad load thất bại, tự động collapse (thu nhỏ về 0) hoặc hiển thị House Ad (quảng cáo nội bộ khuyến khích mua Premium).
*   **Safe Area & Accidental Clicks:** Đặt quảng cáo cách xa các nút điều hướng tối thiểu 8dp/8px. Cấm đè lên các nút hệ thống hoặc thanh kéo vuốt.

### 2. Tối ưu Tốc độ & Luồng (Performance & Threading)
*   **Khởi tạo bất đồng bộ (Async Init):** Chạy các hàm init của SDK Ads (`MobileAds.initialize` / `GADMobileAds.sharedInstance().start`) trên luồng phụ hoặc chạy song song để không block màn hình khởi động (Splash Screen).
*   **Timeout & Fallback:** Giới hạn thời gian load quảng cáo tối đa 5 giây. Nếu quá thời gian, hủy request và hiển thị giao diện mặc định (hoặc Placeholder).

### 3. Cơ chế Tải trước & Caching (Preloading & Caching)
*   **Mô hình AdPool/Queue:** Duy trì một Singleton AdManager để lưu trữ các quảng cáo đã được load sẵn.
*   **Preload Trigger:** Kích hoạt tải trước quảng cáo chuyển tiếp (Interstitial) hoặc quảng cáo mở ứng dụng (App Open) tại các thời điểm màn hình trung gian hoặc khi người dùng đang thực hiện một luồng tác vụ dài (ví dụ: đang xử lý hình ảnh, đang load dữ liệu).

### 4. Tối ưu hóa Chuyển đổi & ROAS
*   **Đề xuất 3 biến thể sáng tạo (Creative/Copy Variations):**
    1.  *Góc tiếp cận A (Pain Point):* Giải quyết trực tiếp vấn đề của người dùng.
    2.  *Góc tiếp cận B (Convenience/Speed):* Nhấn mạnh tốc độ và sự dễ dàng.
    3.  *Góc tiếp cận C (Scarcity/Urgency):* Đánh vào sự khan hiếm (Offer giới hạn).
*   **Conversion Event Tracking:** Tự động chèn mã sự kiện đo lường tỷ lệ CTR và Conversion:
    *   `ad_impression_real`: Ghi nhận khi ad hiển thị đủ 1 giây và chiếm tối thiểu 50% diện tích màn hình.
    *   `ad_click`: Ghi nhận khi người dùng chạm vào ad.
    *   `ad_conversion`: Ghi nhận khi người dùng hoàn thành hành động mong muốn (ví dụ: đăng ký subscription sau khi xem ad).

---

## 💻 Mã Nguồn Tham Khảo (Code Examples)

### SwiftUI (iOS) - Singleton AdManager hỗ trợ Preload & Cache

```swift
import GoogleMobileAds
import Combine

class AdManager: NSObject, GADFullScreenContentDelegate {
    static let shared = AdManager()
    
    private var interstitialAd: GADInterstitialAd?
    private var isAdLoading = false
    private let adUnitID = "ca-app-pub-3940256099942544/4411468910" // Test ID
    
    private override init() {
        super.init()
    }
    
    // Tải trước quảng cáo ở Background
    func preloadInterstitial() {
        guard interstitialAd == nil, !isAdLoading else { return }
        
        isAdLoading = true
        let request = GADRequest()
        
        GADInterstitialAd.load(withAdUnitID: adUnitID, request: request) { [weak self] ad, error in
            self?.isAdLoading = false
            if let error = error {
                print("⚠️ Fail to preload ad: \(error.localizedDescription)")
                return
            }
            self?.interstitialAd = ad
            self?.interstitialAd?.fullScreenContentDelegate = self
            print("✅ Preload ad success!")
        }
    }
    
    // Hiển thị quảng cáo ngay lập tức từ Cache
    func showInterstitial(from rootViewController: UIViewController, completion: @escaping () -> Void) {
        if let ad = interstitialAd {
            ad.present(fromRootViewController: rootViewController)
            // Kích hoạt sự kiện tracking ROAS
            trackEvent("ad_impression_real", parameters: ["type": "interstitial"])
            completion()
        } else {
            print("⚠️ Ad not ready. Loading fallbacks.")
            preloadInterstitial()
            completion() // Chạy tiếp luồng app mà không bắt user đợi
        }
    }
    
    // MARK: - GADFullScreenContentDelegate
    func adDidDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        interstitialAd = nil
        preloadInterstitial() // Nạp sẵn ad tiếp theo ngay lập tức
    }
}
```

### Jetpack Compose (Android) - Ad Banner Box tránh CLS & Retry Logic

```kotlin
@Composable
fun OptimizedBannerAd(
    adUnitId: String,
    modifier: Modifier = Modifier
) {
    var isAdLoaded by remember { mutableStateOf(false) }
    var isLoadFailed by remember { mutableStateOf(false) }
    var retryCount by remember { mutableStateOf(0) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(if (isLoadFailed) 0.dp else 50.dp) // Auto-collapse if fail
            .background(Color.LightGray.copy(alpha = 0.2f)),
        contentAlignment = Alignment.Center
    ) {
        if (!isAdLoaded && !isLoadFailed) {
            // Shimmer Placeholder
            ShimmerLoadingPlaceholder(modifier = Modifier.fillMaxSize())
        }

        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                AdView(context).apply {
                    setAdSize(AdSize.BANNER)
                    setAdUnitId(adUnitId)
                    adListener = object : AdListener() {
                        override fun onAdLoaded() {
                            isAdLoaded = true
                            isLoadFailed = false
                            trackEvent("ad_impression_real", mapOf("type" to "banner"))
                        }

                        override fun onAdFailedToLoad(error: LoadAdError) {
                            if (retryCount < 3) {
                                retryCount++
                                // Exponential backoff retry
                                val delayMs = (2000L * Math.pow(2.0, retryCount.toDouble())).toLong()
                                postDelayed({ loadAd(AdRequest.Builder().build()) }, delayMs)
                            } else {
                                isLoadFailed = true
                            }
                        }
                    }
                    loadAd(AdRequest.Builder().build())
                }
            }
        )
    }
}
```

---

## 📈 Quy trình kiểm tra của AI (Audit Checklist)
1. [ ] **Safe Area Check:** Quảng cáo có đè lên nút chức năng không? Cách nút điều hướng ít nhất 8px không?
2. [ ] **Main Thread Check:** Khởi tạo Ads SDK có đang làm đơ màn hình Splash không?
3. [ ] **CLS Validation:** Có đặt sẵn kích thước cho khung chứa Ads không? Giao diện có bị giật khi ad load xong không?
4. [ ] **Preload Check:** Đã gọi preload ad ở view trước đó chưa?
5. [ ] **ROAS Events:** Đã cài đặt sự kiện `ad_impression_real`, `ad_click` phục vụ đo lường ROAS chưa? Đã chuẩn bị sẵn 3 biến thể copy cho Dynamic Config chưa?
