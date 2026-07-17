# iOS RE Toolchain

## Decryption & Extraction

| Tool | Purpose | Output |
|------|---------|--------|
| **frida-ios-dump** / **bagbak** | Decrypt IPA from jailbroken device | Decrypted .app bundle |
| **class-dump** / **class-dump-swift** | Extract ObjC/Swift headers | `.h` header files |
| **Hopper Disassembler** | ARM disassembly + pseudo-code | Pseudo-C / ARM ASM |
| **IDA Pro** | Advanced disassembly | Pseudo-C / ARM ASM |
| **jtool2** | Mach-O analysis, entitlements | Entitlements plist, segments |
| **plutil / plistutil** | Read binary plists | Readable plist XML |

## What we get from an IPA

```
Payload/App.app/
├── App                          # Mach-O binary (encrypted → need decrypt first)
├── Info.plist                   # App metadata (bundle ID, permissions, URL schemes)
├── Frameworks/                  # Embedded frameworks (.framework / .dylib)
│   ├── SomeSDK.framework/
│   └── libswiftCore.dylib
├── Assets.car                   # Compiled asset catalog
├── Base.lproj/                  # Storyboards / XIBs (compiled)
│   ├── Main.storyboardc/
│   └── LaunchScreen.storyboardc/
├── *.nib                        # Compiled XIB files
├── *.momd                       # Core Data models (compiled)
├── embedded.mobileprovision     # Provisioning profile
├── _CodeSignature/              # Code signing
└── [other resources: json, png, html, js, fonts...]
```
