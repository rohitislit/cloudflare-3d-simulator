# Cloudflare 3D Simulator

Single-page 3D product exploration app built with React, Vite, Three.js, `@react-three/fiber`, and `@react-three/drei`.

The app presents a shared low-poly infrastructure world where a central app building stays fixed and one Cloudflare product module can be loaded around it at a time.

## Stack

- React
- Vite
- Three.js
- `@react-three/fiber`
- `@react-three/drei`

## Features

- Base platform and core app building loaded by default
- Product switching for Workers, D1, R2, Workers AI, AI Gateway, and Future Feature
- Single active module at a time
- Fixed isometric-style camera
- Soft lighting and contact shadows
- Dashboard-style dark UI shell with product controls and explanation panel
- GLB loading with loading and error fallback states

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
```

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

## Model Paths Used In App

- `/models/BASEPLATFORM.glb`
- `/models/COREAPPBUIDING.glb`
- `/models/WORKERS.glb`
- `/models/D1.glb`
- `/models/R2.glb`
- `/models/WORKERSAI.glb`
- `/models/AIGATEWAY.glb`
- `/models/SPECULATIVEMODEL.glb`

## Notes

- `COREAPPBUIDING.glb` intentionally keeps its original filename.
- Product layout, positions, scales, rotations, and copy are defined in `src/config/products.js`.
- The GitHub repo currently includes the full folder as it existed locally, including `3D MODELS/`, `PNGs of Products/`, and `pdf_work/`.

## Repository

GitHub: https://github.com/rohitislit/cloudflare-3d-simulator
