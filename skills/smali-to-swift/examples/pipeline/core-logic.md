# Step 3: Core Logic & Utils Reconstruction 🧮

**Input:** Disassembly/pseudo-code for encryption, hashing, custom utils.

## Tasks

### 1. Translate ObjC/C crypto logic → Swift

Use `CryptoKit` for modern crypto (SHA256, AES-GCM, HMAC).
Use `CommonCrypto` for legacy-compatible (MD5, AES-CBC).
Preserve exact input/output signatures.

### 2. Common ObjC → Swift crypto patterns

```objc
// ObjC (class-dump + disassembly)
+ (NSString *)md5Hash:(NSString *)input;
+ (NSData *)aesEncrypt:(NSData *)data withKey:(NSString *)key;
```

```swift
// Swift
import CryptoKit
import CommonCrypto

enum CryptoUtils {
    static func md5Hash(_ input: String) -> String {
        let data = Data(input.utf8)
        var digest = [UInt8](repeating: 0, count: Int(CC_MD5_DIGEST_LENGTH))
        data.withUnsafeBytes { CC_MD5($0.baseAddress, CC_LONG(data.count), &digest) }
        return digest.map { String(format: "%02x", $0) }.joined()
    }
    
    static func aesEncrypt(data: Data, key: String) throws -> Data {
        // Implement matching original algorithm exactly
    }
}
```

### 3. Verification

XCTest unit tests with known input/output pairs.

> ⚠️ **Critical Rule:** Crypto/hash functions MUST produce identical output to the original app.
> Test with known pairs captured from the running original app.
