---
name: unity-game-development
description: "Expert Unity game development instructions covering MonoBehaviour caching, ScriptableObjects architecture, memory/performance optimizations (no Update instantiations/Find), object pooling, physics FixedUpdate coordination, editor script isolation, and unity-mcp integrations. Keywords: Unity, C#, MonoBehaviour, ScriptableObject, physics, fixedUpdate, compiler directives, object pooling, mobile build, performance profiling."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "Unity"
  - "MonoBehaviour"
  - "ScriptableObject"
  - "unity game"
  - "C#"
  - "FixedUpdate"
  - "object pool"
---

# Unity Game Development Skill

Expert pair-programming rules and standards for building scalable, high-performance Unity games.

## Core Workflow

1. **Analyze Requirements** — Identify genre, target platform (mobile, console, web), target performance (30/60/120 FPS), and multiplayer requirements.
2. **Design Architecture** — Structure component relations, separate pure data configs (ScriptableObjects) from runtime execution (MonoBehaviours), and plan physics layer masks.
3. **Implement** — Build features using optimized C# patterns, caching components in `Awake()`, and managing scene hierarchies cleanly.
4. **Optimize** — Profile script CPU execution time and GPU rendering overhead.
   - ⚠️ **Validation Checkpoint**: Run Unity Profiler (CPU Usage & GPU Usage). Verify frame times stay stably $\le$ 16.6ms (60 FPS) on target hardware. Eliminate GC Allocations in hot paths.
5. **Test** — Validate multiplayer sync (latency/desync) and ensure memory footprints do not cause out-of-memory crashes on target platforms.

---

## 📐 Coding Conventions & C# Standards

- **Naming Styles**:
  - `PascalCase` for classes, methods, properties, and public fields.
  - `camelCase` for local variables and method parameters.
  - Private class fields MUST be prefixed with `m_` (e.g., `m_Speed`) or `_` (e.g., `_speed`) for immediate visibility.
- **Access Modifiers**:
  - Keep fields `private` by default. Use `[SerializeField]` to expose private fields to the Unity Inspector instead of making them `public`.
- **Component Caching**:
  - Always cache components (e.g., `Rigidbody`, `Collider`, `Animator`) in `Awake()` or `Start()`. NEVER call `GetComponent<T>()` in `Update()`, `FixedUpdate()`, or `LateUpdate()`.

---

## 🛠️ MonoBehaviour Caching & Lifecycle Template

```csharp
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement Settings")]
    [SerializeField] private float m_MoveSpeed = 5f;
    [SerializeField] private Transform m_Target;

    // Cached references
    private Rigidbody m_Rb;
    private Animator m_Animator;

    private void Awake()
    {
        // Cache references immediately
        m_Rb = GetComponent<Rigidbody>();
        m_Animator = GetComponent<Animator>();
    }

    private void Start()
    {
        // Initialize targets or lookups
        if (m_Target == null)
        {
            var playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null)
            {
                m_Target = playerObj.transform;
            }
        }
    }

    private void FixedUpdate()
    {
        if (m_Target == null) return;

        // Perform physics manipulation in FixedUpdate using fixedDeltaTime
        Vector3 direction = (m_Target.position - transform.position).normalized;
        m_Rb.MovePosition(transform.position + direction * m_MoveSpeed * Time.fixedDeltaTime);
    }

    private void OnDisable()
    {
        // Clean up coroutines, listeners, and event subscriptions to avoid memory leaks
        StopAllCoroutines();
    }
}
```

---

## 📦 Data-Driven Design with ScriptableObjects

Separate logic from static configuration data. Use `ScriptableObject` instances (`.asset` files) to store config data.

```csharp
// Configuration definition
[CreateAssetMenu(fileName = "WeaponConfig", menuName = "Configs/Weapon")]
public class WeaponConfig : ScriptableObject
{
    public string weaponName;
    public int baseDamage;
    public float fireRate;
    public GameObject projectilePrefab;
    public AudioClip fireSFX;
}

// MonoBehaviour execution
public class WeaponManager : MonoBehaviour
{
    [SerializeField] private WeaponConfig m_Config;
    private float m_NextFireTime;

    public void Fire()
    {
        if (Time.time < m_NextFireTime) return;

        // Execute behavior using config data
        Instantiate(m_Config.projectilePrefab, transform.position, transform.rotation);
        m_NextFireTime = Time.time + (1f / m_Config.fireRate);
    }
}
```

---

## ⚡ Memory & Performance Optimization

- **Zero Instantiations in Game Loop**:
  - Never call `Instantiate()`, `Destroy()`, `new List()`, or allocate arrays inside `Update()` or `FixedUpdate()`. Use **Object Pools**.
- **Avoid Raycast Allocation**:
  - Use `Physics.RaycastNonAlloc` instead of `Physics.RaycastAll` to avoid garbage collection pressure.
- **CompareTag Method**:
  - Use `other.CompareTag("Player")` instead of `other.tag == "Player"`. The latter allocates string memory under the hood.

### Object Pooling Pattern

Use Unity's built-in `UnityEngine.Pool` or a simple custom implementation:

```csharp
using System.Collections.Generic;
using UnityEngine;

public class ProjectilePool : MonoBehaviour
{
    [SerializeField] private GameObject m_Prefab;
    [SerializeField] private int m_InitialSize = 20;

    private Queue<GameObject> m_Pool = new Queue<GameObject>();

    private void Start()
    {
        for (int i = 0; i < m_InitialSize; i++)
        {
            GameObject obj = Instantiate(m_Prefab, transform);
            obj.SetActive(false);
            m_Pool.Enqueue(obj);
        }
    }

    public GameObject Get()
    {
        if (m_Pool.Count > 0)
        {
            GameObject obj = m_Pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        return Instantiate(m_Prefab); // Fallback expansion
    }

    public void ReturnToPool(GameObject obj)
    {
        obj.SetActive(false);
        m_Pool.Enqueue(obj);
    }
}
```

---

## 🔒 Editor Scripting & Conditional Compilation

Always isolate Editor-only scripts (e.g. Inspector customizations) to prevent build compile failures:
- Place Editor scripts inside a directory named `Editor/`.
- Or wrap Editor-only code blocks using compiler directives:
```csharp
#if UNITY_EDITOR
using UnityEditor;
#endif

public class CustomTool : MonoBehaviour
{
    public void ResetProgress()
    {
        // ...
    }
}

#if UNITY_EDITOR
[CustomEditor(typeof(CustomTool))]
public class CustomToolEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();
        CustomTool tool = (CustomTool)target;
        if (GUILayout.Button("Reset Progress"))
        {
            tool.ResetProgress();
        }
    }
}
#endif
```

---

## 🔌 Unity MCP Integration (Advanced)

To inspect scenes, nodes, and modify properties programmatically inside the editor:
1. Ensure the Unity Editor is running the [Unity MCP Server](https://github.com/justinpbarnett/unity-mcp).
2. Configure Cursor/Claude `mcp_config.json` with the relay connection.
3. Use the MCP tools prefixed with `mcp__unity__` to query the active hierarchy.
