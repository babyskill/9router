---
name: godot-game-development
description: "Expert Godot 4.x game development instructions covering composition-first scene composition, static typing, signals architecture (signal up, call down), character body movement, Autoload boundaries, and performance optimization. Keywords: Godot, GDScript, Godot 4, signal, autoload, composition, CharacterBody, Resource, scene tree, static typing."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "Godot"
  - "GDScript"
  - "autoload"
  - "CharacterBody2D"
  - "CharacterBody3D"
  - "unique name"
  - "signal.connect"
---

# Godot 4.x Game Development Skill

Expert pair-programming rules and standards for building maintainable, high-performance Godot 4.x games using GDScript.

## Core Architectural Rules

### 1. "Who Owns What?" — State Encapsulation
Before defining any state variables, enforce these three answers:
- **Who owns the data?** (e.g. the `Stats` Resource owns health, NOT the visual UI code).
- **Who is allowed to change it?** (Only the owner script via a public method like `take_damage()`).
- **Who needs to know it changed?** (Other systems react exclusively by listening to signals emitted by the owner).

### 2. The Godot "Layer Cake" (Signal Up, Call Down)
Keep the scene hierarchy decoupled:
- **Call Down**: Parents reference children directly via `@onready` variables or Scene Unique Names (`%NodeName`) and call methods on them.
- **Signal Up**: Children communicate with parents/ancestors strictly by emitting signals. Children MUST NOT call `get_parent().do_something()`.
- **Global / Cross-Scene Communication**: Use a scoped Autoload signal bus (e.g. `GameBus` or `CombatBus`) for communication between distant nodes.

---

## 🐍 GDScript 2.0 (Godot 4.x) Coding Standards

### Static Typing
Always use static typing for variables, parameters, and return types. Statically typed GDScript is compiled into optimized opcodes, bypassing expensive runtime Variant lookups:
```gdscript
# Correct
var health: int = 100
@export var speed: float = 5.0

func apply_damage(amount: int) -> void:
    health = max(0, health - amount)
```

### Script Structure Order
Follow the official Godot style guide:
1. `extends`
2. `class_name`
3. `signals`
4. `enums`
5. `constants`
6. `@export` variables
7. `public` variables
8. `private` variables (prefixed with `_`)
9. `@onready` variables
10. `override` methods (`_ready()`, `_process()`, etc.)
11. `public` methods
12. `private` methods (prefixed with `_`)

---

## 🛠️ CharacterBody2D / 3D Locomotion Template

In Godot 4, `move_and_slide()` reads internal variables (like `velocity`) directly and takes no arguments.

```gdscript
class_name PlayerMovement
extends CharacterBody2D

# Expose configs to Inspector
@export var speed: float = 300.0
@export var jump_velocity: float = -400.0

# Cache gravity from project settings
var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")

# Access unique node safely
@onready var animation_player: AnimationPlayer = %AnimationPlayer

func _physics_process(delta: float) -> void:
    # 1. Apply Gravity
    if not is_on_floor():
        velocity.y += gravity * delta

    # 2. Handle Jump
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = jump_velocity

    # 3. Get Input Direction & Handle Movement
    var direction: float = Input.get_axis("move_left", "move_right")
    if direction != 0.0:
        velocity.x = direction * speed
        animation_player.play("walk")
    else:
        velocity.x = move_toward(velocity.x, 0.0, speed)
        animation_player.play("idle")

    # 4. Execute Movement (no arguments passed)
    move_and_slide()
```

---

## ⚡ Performance Optimization & Godot Guardrails

- **No `@onready` and `@export` on the same variable**:
  - NEVER combine them. Exported values are set first, then `@onready` will execute and potentially overwrite the designer's inspector input.
- **Compile-Time Signals**:
  - Always connect signals via their `Callable` properties. Never use strings.
  - **Correct**: `button.pressed.connect(_on_button_pressed)`
  - **Incorrect**: `button.connect("pressed", self, "_on_button_pressed")` (Godot 3 syntax)
- **Safe Dictionary Iteration**:
  - Never modify a Dictionary's size during iteration. Duplicate keys beforehand:
  ```gdscript
  for key in dict.keys().duplicate():
      if should_erase(key):
          dict.erase(key)
  ```
- **Caching Path Lookups**:
  - Never call `get_node()` or `$` inside `_process()` or `_physics_process()`. Cache them as `@onready var` fields.
- **Resource Duplication**:
  - When modifying shared resources (`.tres` configurations) at runtime, duplicate them first to avoid rewriting the source file on disk:
  ```gdscript
  @export var base_stats: CharacterStats
  var active_stats: CharacterStats

  func _ready() -> void:
      active_stats = base_stats.duplicate()
  ```
- **Avoid Overriding Native Methods**:
  - Do not try to override native engine functions like `queue_free()`. If you need custom cleanup, connect to the `tree_exiting` signal.
- **Safe Type Casting**:
  - Avoid hard casts that crash if the type check fails. Use `as` and check if the cast result is `null`:
  ```gdscript
  var body = collider as CharacterBody2D
  if body:
      body.apply_impulse(...)
  ```
