---
name: 3D preview compatibility
description: Browser rendering constraints for interactive 3D cube previews in this project.
---

Interactive 3D previews in Replit's sandboxed browser may not be able to create a WebGL context. Catch renderer initialization failures and provide a CSS 3D fallback that preserves visible stickers, drag rotation, and layer-turn playback; otherwise a cube viewer can break the whole app.

**Why:** the preview browser failed to create WebGL, so the initial viewer raised an error before it could render.

**How to apply:** use a non-WebGL renderer fallback for any interactive 3D cube viewer in this project.
