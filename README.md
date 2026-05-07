# Cloudflare 3D Simulator

Cloudflare 3D Simulator is a single-page interactive web app for exploring how different Cloudflare products can sit around a shared application inside one low-poly infrastructure world.

The central building represents the user's core app. Around it, individual Cloudflare product modules can be activated one at a time to show how a specific capability changes the overall system story. The result is part product demo, part visual prototype, and part portfolio-ready technical visualization.

## Demo Concept

This project is designed around a simple interaction model:

- the base platform and core app are always present
- one product module can be loaded into the world at a time
- selecting a module updates both the 3D scene and the explanatory UI
- resetting returns the simulator to the base world state

The current module set includes:

- Workers
- D1
- R2
- Workers AI
- AI Gateway
- Future Feature

## Why This Project Exists

This simulator was built as an MVP to present Cloudflare infrastructure in a more visual and spatial way than a traditional dashboard or static architecture diagram.

Instead of reading a long feature list, a viewer can:

- see a shared infrastructure world
- focus on one product at a time
- understand what that product does
- understand what that product could unlock for an app

## Tech Stack

- React
- Vite
- Three.js
- `@react-three/fiber`
- `@react-three/drei`

## Features

- base platform and core app loaded by default
- product switching for Workers, D1, R2, Workers AI, AI Gateway, and Future Feature
- single active product module at a time
- fixed isometric-style camera
- soft lighting and contact shadows
- dark dashboard-inspired UI shell
- product control panel
- explanatory info panel
- GLB loading with loading and error fallback states
- config-driven scene layout for positions, scale, and copy

## Meshy AI Asset Workflow

The visual asset workflow for this project relied on Meshy AI for generated 3D and supporting product imagery.

Meshy AI was used as part of the concepting and asset generation process to quickly produce low-poly visual building blocks that could then be placed into the simulator world. That made it possible to move from abstract Cloudflare product ideas into a coherent 3D MVP much faster than building every asset manually from scratch.

In practical terms, Meshy AI helped with:

- generating low-poly style 3D assets for the infrastructure world
- speeding up visual exploration for product module concepts
- producing supporting visual references and image assets
- enabling a faster prototype loop between idea, model output, scene placement, and UI integration

This repo keeps the generated assets in the project folder and then serves the final app-facing GLBs from `public/models/`.

## Project Structure

```text
src/
  components/
    InfoPanel.jsx
    ModelInstance.jsx
    ProductControls.jsx
    SceneCanvas.jsx
  config/
    products.js
  App.jsx
  index.css
  main.jsx

public/
  models/
    AIGATEWAY.glb
    BASEPLATFORM.glb
    COREAPPBUIDING.glb
    D1.glb
    R2.glb
    SPECULATIVEMODEL.glb
    WORKERS.glb
    WORKERSAI.glb

3D MODELS/
PNGs of Products/
pdf_work/
```

## App Architecture

### `src/App.jsx`

Defines the dashboard shell, top bar, side navigation, summary cards, module list, scene container, and info layout.

### `src/components/SceneCanvas.jsx`

Creates the React Three Fiber canvas, fixed orthographic camera, environment lighting, shadows, and core scene composition.

### `src/components/ModelInstance.jsx`

Handles GLB loading, cloning, centering, shadow configuration, suspense fallback states, and load failure fallback UI.

### `src/components/ProductControls.jsx`

Renders the product module buttons and reset action.

### `src/components/InfoPanel.jsx`

Displays the active module explanation and state summary.

### `src/config/products.js`

Stores:

- model paths
- scene positions
- scales
- rotations
- labels and titles
- explanation copy for each Cloudflare product

## Model Paths Used In App

- `/models/BASEPLATFORM.glb`
- `/models/COREAPPBUIDING.glb`
- `/models/WORKERS.glb`
- `/models/D1.glb`
- `/models/R2.glb`
- `/models/WORKERSAI.glb`
- `/models/AIGATEWAY.glb`
- `/models/SPECULATIVEMODEL.glb`

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Local Development Notes

- `COREAPPBUIDING.glb` intentionally keeps its original filename.
- The final runtime GLBs are served from `public/models/`.
- Product placement and explanatory copy can be adjusted in `src/config/products.js`.
- The scene is intentionally constrained to one active module at a time for clarity.

## Repository Notes

This GitHub repo currently reflects the full local project folder as it was published, including:

- `3D MODELS/`
- `PNGs of Products/`
- `pdf_work/`
- the built `dist/` output if present in the local folder at publish time

If this repo is later cleaned up for presentation, the most likely follow-up would be trimming generated build artifacts and non-app collateral while keeping the source app and core asset folders.

## GitHub Repository

https://github.com/rohitislit/cloudflare-3d-simulator
