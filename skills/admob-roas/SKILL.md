---
name: admob-roas
description: When the user wants to implement AdMob ROAS tracking, track ad impressions to Firebase, or optimize in-app ad revenue events in Native Android (Kotlin) or iOS (Swift). Also use when the user mentions "tROAS", "ad_impression", "OnPaidEventListener", "paidEventHandler", or "admob ROAS event".
metadata:
  version: 1.0.0
---

# ROAS Event Tracking cho AdMob (Native Android & iOS)

You are an expert in mobile app analytics and AdMob monetization. Your goal is to help the user implement ROAS event tracking (`ad_impression`) for AdMob in Native Android (Kotlin) and iOS (Swift).

> **🎯 Mục tiêu**: Đảm bảo Firebase Analytics nhận được sự kiện `ad_impression` kèm theo giá trị doanh thu (`value`, `currency`) mỗi khi quảng cáo hiển thị. Điều này **bắt buộc** để Google Ads / Facebook Ads có thể chạy tROAS (Target Return On Ad Spend) campaign.

---

## 1. Yêu Cầu Cốt Lõi (Requirements)

Khi AI Agent được giao nhiệm vụ tích hợp quảng cáo (AdMob) vào dự án Native Android (Kotlin) hoặc iOS (Swift), **LUÔN** phải đảm bảo:
- SDK `Firebase Analytics` đã được cài đặt và khởi tạo.
- Bắt sự kiện **OnPaidEventListener** (Android) hoặc **paidEventHandler** (iOS) trên TẤT CẢ các loại quảng cáo: Banner, Interstitial, Rewarded, AppOpen, Native.
- Convert chuẩn xác giá trị vi mô (`valueMicros` / `NSDecimalNumber`) ra giá trị thập phân thực.
- Bắn event `ad_impression` về Firebase.

---

## 2. Standard Pattern: Android (Kotlin)

### Bước 1: Tạo Helper/Tracker Class

Tạo file `RoasTracker.kt` ở package data/analytics:

```kotlin
import android.os.Bundle
import com.google.android.gms.ads.AdValue
import com.google.android.gms.ads.AdapterResponseInfo
import com.google.firebase.analytics.FirebaseAnalytics

object RoasTracker {
    fun trackAdMobImpression(
        firebaseAnalytics: FirebaseAnalytics, 
        adValue: AdValue, 
        responseInfo: AdapterResponseInfo?, 
        adFormat: String
    ) {
        val valueMicros = adValue.valueMicros
        val currencyCode = adValue.currencyCode
        val valueDouble = valueMicros / 1_000_000.0 // Convert sang dạng float/double
        
        val bundle = Bundle().apply {
            putString(FirebaseAnalytics.Param.AD_PLATFORM, "admob")
            putString(FirebaseAnalytics.Param.AD_SOURCE, responseInfo?.adSourceName ?: "AdMob")
            putString(FirebaseAnalytics.Param.AD_FORMAT, adFormat)
            putDouble(FirebaseAnalytics.Param.VALUE, valueDouble)
            putString(FirebaseAnalytics.Param.CURRENCY, currencyCode)
        }
        
        firebaseAnalytics.logEvent(FirebaseAnalytics.Event.AD_IMPRESSION, bundle)
    }
}
```

### Bước 2: Tích hợp vào Ad Lifecycle

**Ví dụ với AppOpenAd / InterstitialAd:**
```kotlin
interstitialAd?.onPaidEventListener = OnPaidEventListener { adValue ->
    RoasTracker.trackAdMobImpression(
        firebaseAnalytics = FirebaseAnalytics.getInstance(context),
        adValue = adValue,
        responseInfo = interstitialAd?.responseInfo?.loadedAdapterResponseInfo,
        adFormat = "interstitial"
    )
}
```

---

## 3. Standard Pattern: iOS (Swift)

### Bước 1: Tạo Helper/Tracker Struct

Tạo file `RoasTracker.swift`:

```swift
import Foundation
import FirebaseAnalytics
import GoogleMobileAds

struct RoasTracker {
    static func trackAdMobImpression(
        adValue: GADAdValue, 
        responseInfo: GADAdNetworkResponseInfo?, 
        adFormat: String
    ) {
        let value = adValue.value.doubleValue
        let currency = adValue.currencyCode
        
        Analytics.logEvent(AnalyticsEventAdImpression, parameters: [
            AnalyticsParameterAdPlatform: "admob",
            AnalyticsParameterAdSource: responseInfo?.adNetworkClassName ?? "AdMob",
            AnalyticsParameterAdFormat: adFormat,
            AnalyticsParameterValue: value,
            AnalyticsParameterCurrency: currency
        ])
    }
}
```

### Bước 2: Tích hợp vào Ad Lifecycle

**Ví dụ với GADRewardedAd:**
```swift
rewardedAd?.paidEventHandler = { [weak rewardedAd] adValue in
    guard let ad = rewardedAd else { return }
    RoasTracker.trackAdMobImpression(
        adValue: adValue,
        responseInfo: ad.responseInfo?.loadedAdNetworkResponseInfo,
        adFormat: "rewarded"
    )
}
```

---

## 4. Kiểm tra Validation

Một luồng ROAS hợp lệ phải có đủ các yếu tố sau:
1. Bạn phải đăng ký `OnPaidEventListener` NGAY SAU KHI Ad báo quá trình load thành công (trong `onAdLoaded`).
2. Log output phải hiển thị event `ad_impression` trong Logcat (hoặc Xcode console) qua chế độ `-enable_core_ads` hoặc Firebase Verbose logging `adb shell setprop log.tag.FA VERBOSE`.
3. Kiểm tra các event onboarding `tutorial_begin` và `tutorial_complete` để đảm bảo luồng cài đặt và sử dụng ứng dụng được tracking liên kết.
