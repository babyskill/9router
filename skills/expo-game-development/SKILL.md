---
name: expo-game-development
description: "Expert Expo React Native game development instructions covering canvas rendering (Skia, WebGL), performance/rendering optimization (avoiding React state triggers in game tick loop), sound effects (expo-av), gesture detection, and EAS build limit optimizations. Keywords: Expo, React Native, Skia, Three.js, expo-gl, gesture, game loop, requestAnimationFrame, expo-av, EAS build."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "Expo game"
  - "React Native Skia"
  - "expo-gl"
  - "three.js"
  - "requestAnimationFrame"
  - "expo-av"
  - "GestureHandler"
---

# Expo Game Development Skill

Expert pair-programming rules and standards for building high-performance 2D/3D games on mobile using Expo and React Native.

## Core Architectural Rules

### 1. Game Tick vs React Render Loop
- **Critical Performance Rule**: NEVER bind high-frequency variables (like entity positions, physics vectors, or timers) directly to React component state. Changing state causes a full React render tree pass, dragging frame rates down to < 10 FPS.
- **The Pattern**: Store game state, positions, and physics vectors inside `useRef()` objects. Run a standard JavaScript game loop via `requestAnimationFrame` that updates these references and draws them to the screen directly via Canvas/WebGL commands.

### 2. High-Performance Canvas Rendering
- **2D Games**: Prefer **React Native Skia** (`@shopify/react-native-skia`). Use declarative components for static elements, and use Imperative Canvas Drawing (via Skia's `useCanvasRef` and manual drawing operations) for high-entity games (e.g. bullet hells, match-3 particle effects).
- **3D Games**: Use **Expo GL** (`expo-gl`) paired with **Three.js** (`three`) and `@react-three/fiber` for hardware-accelerated 3D rendering.

---

## ⏰ Game Loop & State Template (Skia Canvas)

```tsx
import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useCanvasRef, createPicture } from '@shopify/react-native-skia';

export const GameScreen = () => {
  const canvasRef = useCanvasRef();
  const gameLoopId = useRef<number>(0);
  
  // Game state stored inside useRef to prevent component re-renders
  const entityState = useRef({
    x: 50,
    y: 50,
    vx: 2,
    vy: 2,
    radius: 20,
  });

  const updatePhysics = () => {
    const state = entityState.current;
    
    // Physics bounds update
    state.x += state.vx;
    state.y += state.vy;
    
    if (state.x - state.radius < 0 || state.x + state.radius > 300) state.vx *= -1;
    if (state.y - state.radius < 0 || state.y + state.radius > 500) state.vy *= -1;
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw frame imperatively
    const paint = canvas.createPaint();
    paint.setColor(canvas.Color('blue'));
    
    canvas.clear(canvas.Color('white'));
    canvas.drawCircle(entityState.current.x, entityState.current.y, entityState.current.radius, paint);
  };

  const tick = () => {
    updatePhysics();
    renderCanvas();
    gameLoopId.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    // Start game loop
    gameLoopId.current = requestAnimationFrame(tick);
    
    return () => {
      // Clean up game loop on unmount
      cancelAnimationFrame(gameLoopId.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={styles.canvas} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvas: { width: 300, height: 500 },
});
```

---

## ⚡ Input & Audio Optimization

### Low-Latency Sound Effects
Use `expo-av` for audio. Pre-load sound effects into memory in advance to avoid latency delays when firing weapons or triggering UI sounds:

```typescript
import { Audio } from 'expo-av';

let sfxPlayer: Audio.Sound | null = null;

export const loadSoundEffects = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('./assets/sfx/explosion.mp3'),
    { shouldPlay: false }
  );
  sfxPlayer = sound;
};

export const playExplosionSFX = async () => {
  if (sfxPlayer) {
    await sfxPlayer.replayAsync(); // Replay immediately without reloading
  }
};
```

### Gestures & Touch Input
Use `@gesture-handler` (React Native Gesture Handler) instead of `PanResponder`. React Native Gesture Handler executes gesture tracking on the UI native thread rather than blocking the JS thread.

---

## 📦 Asset Management & Preloading
Prevent game-start stuttering by preloading all assets during an initial Loading Screen:

```typescript
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

export const loadAllResourcesAsync = async () => {
  const imageAssets = Asset.loadAsync([
    require('./assets/sprites/player.png'),
    require('./assets/sprites/enemy.png'),
  ]);
  
  const fontAssets = Font.loadAsync({
    'GameFont': require('./assets/fonts/PressStart2P.ttf'),
  });

  await Promise.all([imageAssets, fontAssets]);
};
```

---

## 🚀 EAS Build Optimization Rules
When ready to build or compile standalone binaries of your Expo game:
- Always consult the `expo-build-optimizer` skill rules.
- Read EAS build counts from `.project-identity` to check monthly quotas.
- Prefer local building with `eas build -p [platform] --profile production --local` to conserve server-side credits.
