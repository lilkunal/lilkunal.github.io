# How Sky Glide was built (Sky Peck–style portfolio game)

Sky Peck (Ivan’s Patreon game) is a **Godot + full-body webcam** flyer. Your portfolio version is a **browser canvas game** with the same *feel*: spread wings, glide, painted sky — plus optional webcam via MediaPipe.

## Architecture (4 files)

| File | Job |
|------|-----|
| `js/sky-glide.js` | Game loop: physics, drawing, input, overlay UI |
| `js/sky-glide-pose.js` | Optional webcam → wing spread + pitch (MediaPipe Pose) |
| `js/game-launcher.js` | Triple-click name → pick Sky Glide or Web Swing |
| `js/game.js` | Original flap game (unchanged mechanics) |

## The game loop (every frame)

```
1. read input  → wing (0–1), pitch (-1…1)
2. step()      → update position, score, collisions
3. draw()      → paint sky, hills, rings, bird
4. requestAnimationFrame(frame)
```

This is the same pattern as Flappy Bird games, Sky Peck, and most 2D games: **update → render → repeat**.

## Physics (simplified gliding)

```javascript
lift = wingSpread * 0.22
gravity = 0.11 * (1 - wingSpread * 0.65)
velocityY += gravity - lift
angle = lerp(angle, targetPitch, 0.1)
```

- **Wing spread high** → more lift, less gravity, faster forward speed  
- **Pitch** → mouse Y, or nose vs shoulders in webcam mode  
- **Crash** → bird hits ground (`y > H - 48`)

Sky Peck uses 3D aerodynamics; this is a 2D approximation that *feels* similar.

## Webcam body control (how Sky Peck does it vs browser)

| Sky Peck (Godot) | Sky Glide (browser) |
|------------------|---------------------|
| Full skeleton tracking | MediaPipe Pose landmarks |
| Arms wide = lift | Wrist span ÷ shoulder width |
| Lean body = turn | Nose Y vs shoulder midpoint |
| Runs offline in app | Loads model from CDN when you tap “Webcam” |

Landmarks used: nose `0`, shoulders `11/12`, wrists `15/16`.

## How to extend it (learning path)

1. **Week 1 — Canvas only**  
   Change hills/clouds colors; add a new collectible type in `S.rings`.

2. **Week 2 — Feel**  
   Tune `lift`, `gravity`, `S.vx` until glide feels floaty, not twitchy.

3. **Week 3 — Webcam**  
   Enable webcam on desktop; stand back so shoulders + wrists are visible; arms out = climb.

4. **Week 4 — Sky Peck parity**  
   Add wind gusts (`S.vy += sin(world/100)*0.02`), painted landmarks, or a second bird NPC.

## Godot path (if you want the real Sky Peck stack)

1. Learn Godot 4 basics (CharacterBody2D/3D, `_physics_process`)  
2. Add **WebcamTexture** + pose plugin or UDP from Python MediaPipe  
3. Ship dev builds to Patreon like Ivan — web version stays your portfolio demo  

## Try it on your site

1. Open https://lilkunal.github.io/  
2. **Triple-click** “Kunal Varshney” in the nav (or footer hint)  
3. Choose **Sky Glide**  
4. Space / hold click to fly · **Webcam off** button for body mode (needs HTTPS + camera permission)

## Key lesson

Games are **loops + state + input**. Sky Peck’s magic is input (your body), not the engine. Start with keyboard/mouse until flying feels good, *then* map webcam to the same `wing` and `pitch` variables.
