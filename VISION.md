# Dino GE Vision: The Next Level

This document outlines the strategic roadmap for evolving the **Dino Game Engine (Dino GE)** from a functional prototype into a robust, developer-friendly framework capable of supporting commercial-quality 2D web games.

## Phase 1: Architectural Overhaul (The Foundation)
*   **Entity Component System (ECS) (Completed):** Transitioned from strict inheritance to a pure composition-based model. `GameObject` now acts as a thin entity wrapper providing direct access to core components like `TransformComponent`, `TagComponent`, and `BoundsComponent`. Logic decoupled into `System` architecture (e.g., `PhysicsSystem`, `RenderingSystem`).
*   **Scene Graph Hierarchy (Completed):** Integrated into `TransformComponent` to allow hierarchical propagation of transformations (position, rotation, scale) down the tree.
*   **Event System / PubSub (Completed):** Decoupled systems using a global event bus (`Engine.on/emit`). Implemented `EventBusComponent` for local entity events. Refactored examples to use event-driven architecture.

## Phase 2: High-Performance Rendering & Physics
*   **Advanced Rendering Backend:** Explore WebGL or WebGPU rendering (potentially utilizing a lightweight wrapper or custom batching) to enable hardware acceleration, thousands of sprites, and custom shaders.
*   **Advanced Physics (Completed):** Upgraded from basic AABB overlapping to a robust impulse-based resolution system with support for restitution (bounciness) and positional correction to prevent jitter.
*   **Spatial Partitioning:** Implement a QuadTree or Spatial Hash grid to reduce collision checks from O(n²) complexity to manageable levels for large scenes.

## Phase 3: Asset Pipeline & Ecosystem
*   **Texture Atlas Support:** Support JSON-based texture atlases (e.g., from TexturePacker) to load single large spritesheets and slice them dynamically, saving memory and draw calls.
*   **Tiled Map Editor Integration:** Expand the `Tilemap` class to natively parse and render JSON exports from the industry-standard Tiled map editor.
*   **Audio Engine:** Build a Web Audio API wrapper featuring channels (BGM, SFX, UI), spatial audio, volume panning, and dynamic loading.

## Phase 4: Developer Experience & Tooling
*   **Visual Inspector:** Expand the Playground's UI to include a visual Scene Explorer and Property Inspector where users can select objects and tweak their properties live.
*   **CLI Scaffolding:** Create a tool (e.g., `create-dino-ge-game`) to instantly scaffold a new project with Webpack/Vite, TypeScript, and the engine pre-configured.
*   **NPM Publishing:** Package the engine for distribution so developers can simply `npm install dino-ge`.
