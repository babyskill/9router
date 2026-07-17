# 🔬 Smali Reading Guide for AI

> Quick reference for interpreting Smali bytecode when reverse engineering Android apps.
> Used by the `smali-to-kotlin` skill during Steps 1-6.

---

## 📝 Smali Basics

### File Structure
```smali
.class public Lcom/example/app/MyClass;
.super Ljava/lang/Object;
.source "MyClass.java"

# interfaces
.implements Ljava/io/Serializable;

# static fields
.field private static final TAG:Ljava/lang/String; = "MyClass"

# instance fields
.field private name:Ljava/lang/String;
.field private age:I

# direct methods (constructors, static, private)
.method public constructor <init>()V
    ...
.end method

# virtual methods (public, protected, package-private)
.method public getName()Ljava/lang/String;
    ...
.end method
```

### Type Descriptors
```
V     → void
Z     → boolean
B     → byte
S     → short
C     → char
I     → int
J     → long (2 registers)
F     → float
D     → double (2 registers)
L___; → object (e.g., Ljava/lang/String;)
[     → array (e.g., [I = int[], [Ljava/lang/String; = String[])
```

### Register Naming
```
p0, p1, p2...  → parameter registers (p0 = 'this' for instance methods)
v0, v1, v2...  → local variable registers
```

---

## 🔑 Common Patterns → Kotlin Translation

### 1. String Constants & Field Access
```smali
# Smali
const-string v0, "https://api.example.com"
sput-object v0, Lcom/example/Config;->BASE_URL:Ljava/lang/String;
```
```kotlin
// Kotlin
object Config {
    const val BASE_URL = "https://api.example.com"
}
```

### 2. Method Calls
```smali
# Static method call
invoke-static {v0, v1}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I

# Virtual method call (on instance)
invoke-virtual {p0, v0}, Lcom/example/MyClass;->setName(Ljava/lang/String;)V

# Interface method call
invoke-interface {v0}, Ljava/util/List;->size()I

# Direct method call (private/constructor)
invoke-direct {p0}, Ljava/lang/Object;-><init>()V
```
```kotlin
// Kotlin equivalents
Log.d(tag, message)
myObject.setName(name)  // or myObject.name = name
list.size
super()
```

### 3. Conditionals (if-else)
```smali
# if (v0 == 0) goto :label
if-eqz v0, :cond_0

# if (v0 != v1) goto :label
if-ne v0, v1, :cond_1

# if (v0 >= v1) goto :label
if-ge v0, v1, :cond_2
```
```
Conditional opcodes:
if-eqz  → == 0        if-eq   → ==
if-nez  → != 0        if-ne   → !=
if-ltz  → < 0         if-lt   → <
if-gez  → >= 0        if-ge   → >=
if-gtz  → > 0         if-gt   → >
if-lez  → <= 0        if-le   → <=
```

### 4. Try-Catch
```smali
.method public doNetwork()V
    .registers 4
    
    :try_start_0
    # ... risky code ...
    :try_end_0
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_0
    
    goto :goto_0
    
    :catch_0
    move-exception v0
    # ... handle error ...
    
    :goto_0
    return-void
.end method
```
```kotlin
fun doNetwork() {
    try {
        // ... risky code ...
    } catch (e: IOException) {
        // ... handle error ...
    }
}
```

### 5. Loops
```smali
# for loop pattern
const/4 v0, 0x0              # i = 0

:goto_0
array-length v1, v2          # v1 = array.length
if-ge v0, v1, :cond_0        # if (i >= length) break

# ... loop body using v0 as index ...

add-int/lit8 v0, v0, 0x1     # i++
goto :goto_0

:cond_0
# ... after loop ...
```
```kotlin
for (i in array.indices) {
    // loop body
}
```

### 6. Switch/When
```smali
packed-switch v0, :pswitch_data_0

# ... default case ...
goto :goto_0

:pswitch_0    # case 0
...
:pswitch_1    # case 1
...

:pswitch_data_0
.packed-switch 0x0
    :pswitch_0
    :pswitch_1
.end packed-switch
```
```kotlin
when (value) {
    0 -> { /* case 0 */ }
    1 -> { /* case 1 */ }
    else -> { /* default */ }
}
```

### 7. Object Creation
```smali
new-instance v0, Ljava/util/ArrayList;
invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V
```
```kotlin
val list = ArrayList<Any>()
// or better: val list = mutableListOf<Any>()
```

### 8. Casting & instanceof
```smali
# instanceof
instance-of v1, v0, Ljava/lang/String;

# cast
check-cast v0, Ljava/lang/String;
```
```kotlin
if (obj is String) { ... }  // instanceof
val str = obj as String      // cast
```

---

## 🎯 High-Value Patterns to Look For

### API Endpoints
```smali
# Look for URL string concatenation
const-string v0, "/api/v1/users"
invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
```

### SharedPreferences Keys
```smali
const-string v0, "user_token"
invoke-interface {v1, v0}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
```

### Intent Actions & Extras
```smali
const-string v0, "com.example.ACTION_REFRESH"
const-string v1, "extra_user_id"
invoke-virtual {v2, v1, v3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;
```

### Database Queries
```smali
const-string v0, "SELECT * FROM users WHERE id = ?"
invoke-virtual {v1, v0, v2}, Landroid/database/sqlite/SQLiteDatabase;->rawQuery(Ljava/lang/String;[Ljava/lang/String;)Landroid/database/Cursor;
```

### Encryption Patterns
```smali
const-string v0, "AES/CBC/PKCS5Padding"
invoke-static {v0}, Ljavax/crypto/Cipher;->getInstance(Ljava/lang/String;)Ljavax/crypto/Cipher;

const-string v0, "SHA-256"
invoke-static {v0}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;
```

---

## 🔍 Obfuscation Patterns (ProGuard/R8)

### Renamed Classes
```
Original: Lcom/example/UserRepository;
Obfuscated: La/b/c;
```
**Strategy:** Follow method calls and string constants to understand purpose.

### Renamed Methods
```
Original: ->getUserProfile
Obfuscated: ->a(Ljava/lang/String;)V
```
**Strategy:** Look at parameters, return types, and what the method does internally.

### String Encryption
```smali
# Common pattern: encrypted strings decoded at runtime
invoke-static {v0}, Lcom/example/StringDecryptor;->decrypt(Ljava/lang/String;)Ljava/lang/String;
```
**Strategy:** Find the decryptor class, understand the algorithm, then decrypt all strings.

### Tips for Obfuscated Code
1. **Start from entry points** (Activities in Manifest) — these are rarely obfuscated
2. **Follow string constants** — strings reveal purpose
3. **Check annotation classes** — Retrofit/Room annotations may survive obfuscation
4. **mapping.txt** — if available in APK, use it to deobfuscate
5. **Look for SDK packages** — third-party SDKs are usually not obfuscated

---

## 📊 Register Width Rules

```
Single-width (1 register): boolean, byte, char, short, int, float, Object reference
Double-width (2 registers): long, double

Example:
.method public calc(IJLjava/lang/String;)V
    .registers 6
    # p0 = this
    # p1 = int param (I)
    # p2-p3 = long param (J) — takes 2 registers!
    # p4 = String param
```

---

*smali-reading-guide v1.0.0 — AI reference for Smali bytecode interpretation*
