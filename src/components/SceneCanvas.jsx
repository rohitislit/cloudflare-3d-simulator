import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  MathUtils,
  PCFSoftShadowMap,
  Vector3,
} from 'three';
import ModelInstance from './ModelInstance';
import {
  ALL_MODEL_PATHS,
  BASE_PLATFORM,
  CORE_APP,
  SCENE_ITEM_MAP,
} from '../config/products';

ALL_MODEL_PATHS.forEach((modelPath) => {
  useGLTF.preload(modelPath);
});

const HERO_VIEW = 'isometric';
const DESIRED_CENTER_Y = 0.16;
const VIEWPORT_MARGIN = 0.9;
const BOUNDS_PADDING = 1.18;
const MIN_VIEW_WIDTH = 8.8;
const MIN_VIEW_HEIGHT = 6.5;
const MIN_CAMERA_DISTANCE = 10.5;
const PAN_LIMIT_SCALE = 0.2;
const TRANSITION_DAMPING = 7.2;

const VIEW_DIRECTIONS = {
  isometric: [1, 0.82, 1],
  front: [0.06, 0.24, 1],
  left: [-1, 0.22, 0.05],
  right: [1, 0.22, 0.05],
  top: [0.04, 1.55, 0.04],
};

function getZoomRange(width) {
  if (width < 700) {
    return { min: 46, max: 82 };
  }

  if (width < 1100) {
    return { min: 54, max: 96 };
  }

  return { min: 60, max: 110 };
}

function getFrameBounds(items) {
  const bounds = new Box3();

  items.forEach((item) => {
    const [x, y, z] = item.position;
    const [width, height, depth] = item.frameBox ?? [2, 2, 2];
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    bounds.expandByPoint(new Vector3(x - halfWidth, y - 0.08, z - halfDepth));
    bounds.expandByPoint(new Vector3(x + halfWidth, y + halfHeight, z + halfDepth));
  });

  return bounds;
}

function getProjectedBounds(camera, bounds) {
  const corners = [];
  const min = bounds.min;
  const max = bounds.max;

  for (const x of [min.x, max.x]) {
    for (const y of [min.y, max.y]) {
      for (const z of [min.z, max.z]) {
        corners.push(new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
      }
    }
  }

  return corners.reduce(
    (acc, corner) => ({
      minX: Math.min(acc.minX, corner.x),
      maxX: Math.max(acc.maxX, corner.x),
      minY: Math.min(acc.minY, corner.y),
      maxY: Math.max(acc.maxY, corner.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );
}

function getPresetDirection(preset) {
  const direction = VIEW_DIRECTIONS[preset] ?? VIEW_DIRECTIONS[HERO_VIEW];

  return new Vector3(...direction).normalize();
}

function getOrbitTarget(bounds) {
  const center = bounds.getCenter(new Vector3());

  return new Vector3(
    MathUtils.lerp(0, center.x, 0.18),
    Math.max(0.96, center.y + 0.18),
    MathUtils.lerp(0.04, center.z, 0.14),
  );
}

function getFocusBounds(item) {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.focusBox ?? item.frameBox ?? [2, 2, 2];
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  const bounds = new Box3();

  bounds.expandByPoint(new Vector3(x - halfWidth, y - 0.04, z - halfDepth));
  bounds.expandByPoint(new Vector3(x + halfWidth, y + halfHeight, z + halfDepth));

  return bounds;
}

function computeCameraState(camera, bounds, size, direction) {
  const target = getOrbitTarget(bounds);
  const boundsSize = bounds.getSize(new Vector3());
  const workingCamera = camera.clone();
  const orbitDirection = direction.clone().normalize();
  const distance = Math.max(MIN_CAMERA_DISTANCE, boundsSize.length() * 1.22);
  const position = target.clone().add(orbitDirection.multiplyScalar(distance));

  workingCamera.position.copy(position);
  workingCamera.near = 0.1;
  workingCamera.far = 160;
  workingCamera.up.set(0, 1, 0);
  workingCamera.lookAt(target);
  workingCamera.updateProjectionMatrix();
  workingCamera.updateMatrixWorld(true);

  const projected = getProjectedBounds(workingCamera, bounds);
  const requiredWidth = Math.max(MIN_VIEW_WIDTH, projected.maxX - projected.minX);
  const requiredHeight = Math.max(MIN_VIEW_HEIGHT, projected.maxY - projected.minY);
  const safeWidth = size.width * VIEWPORT_MARGIN;
  const safeHeight = size.height * VIEWPORT_MARGIN;
  const { min, max } = getZoomRange(size.width);
  const zoom = MathUtils.clamp(
    Math.min(
      safeWidth / (requiredWidth * BOUNDS_PADDING),
      safeHeight / (requiredHeight * BOUNDS_PADDING),
    ),
    min,
    max,
  );

  workingCamera.zoom = zoom;
  workingCamera.updateProjectionMatrix();
  workingCamera.updateMatrixWorld(true);

  const centeredProjection = getProjectedBounds(workingCamera, bounds);
  const centerX = (centeredProjection.minX + centeredProjection.maxX) / 2;
  const centerY = (centeredProjection.minY + centeredProjection.maxY) / 2;
  const cameraX = new Vector3();
  const cameraY = new Vector3();
  const cameraZ = new Vector3();

  workingCamera.matrixWorld.extractBasis(cameraX, cameraY, cameraZ);

  const compositionShift = cameraX
    .clone()
    .multiplyScalar(centerX)
    .add(cameraY.clone().multiplyScalar(centerY - DESIRED_CENTER_Y));

  return {
    position: position.add(compositionShift),
    target: target.add(compositionShift),
    zoom,
  };
}

function computeFocusCameraState(camera, item, size, direction) {
  const target = item.focusTarget
    ? new Vector3(...item.focusTarget)
    : new Vector3(item.position[0], item.position[1] + 0.85, item.position[2]);
  const focusBounds = getFocusBounds(item);
  const boundsSize = focusBounds.getSize(new Vector3());
  const workingCamera = camera.clone();
  const focusDirection = direction.clone().normalize();
  const distance = item.focusDistance ?? Math.max(5.2, boundsSize.length() * 1.9);
  const position = item.focusPosition
    ? new Vector3(...item.focusPosition)
    : target.clone().add(focusDirection.multiplyScalar(distance));

  workingCamera.position.copy(position);
  workingCamera.near = 0.1;
  workingCamera.far = 120;
  workingCamera.up.set(0, 1, 0);
  workingCamera.lookAt(target);
  workingCamera.updateProjectionMatrix();
  workingCamera.updateMatrixWorld(true);

  const projected = getProjectedBounds(workingCamera, focusBounds);
  const requiredWidth = Math.max(2.6, projected.maxX - projected.minX);
  const requiredHeight = Math.max(2.6, projected.maxY - projected.minY);
  const safeWidth = size.width * 0.84;
  const safeHeight = size.height * 0.82;
  const { min, max } = getZoomRange(size.width);
  const computedZoom = Math.min(
    safeWidth / (requiredWidth * 1.08),
    safeHeight / (requiredHeight * 1.08),
  );
  const zoom = MathUtils.clamp(
    item.focusZoom ?? computedZoom,
    Math.max(min, 82),
    max * 1.26,
  );

  return {
    position,
    target,
    zoom,
    panScale: 0.1,
  };
}

function clampControlsToBounds(controls, camera, bounds, panScale = PAN_LIMIT_SCALE) {
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const clampedTarget = controls.target.clone();

  clampedTarget.x = MathUtils.clamp(
    clampedTarget.x,
    center.x - size.x * panScale,
    center.x + size.x * panScale,
  );
  clampedTarget.z = MathUtils.clamp(
    clampedTarget.z,
    center.z - size.z * panScale,
    center.z + size.z * panScale,
  );
  clampedTarget.y = MathUtils.clamp(
    clampedTarget.y,
    Math.max(0.2, bounds.min.y + 0.12),
    bounds.max.y + 0.9,
  );

  const delta = clampedTarget.sub(controls.target);

  if (delta.lengthSq() > 0.000001) {
    controls.target.add(delta);
    camera.position.add(delta);
  }
}

function SceneCamera({
  frameBounds,
  focusItem,
  cameraCommand,
  onInteractionStart,
}) {
  const { camera, size } = useThree();
  const controlsRef = useRef(null);
  const desiredStateRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const isInitializedRef = useRef(false);

  const applyState = (state) => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    controls.target.copy(state.target);
    camera.position.copy(state.position);
    camera.zoom = state.zoom;
    camera.near = 0.1;
    camera.far = 160;
    camera.updateProjectionMatrix();
    controls.update();
  };

  const syncZoomLimits = (zoom) => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    controls.minZoom = Math.max(26, zoom * 0.52);
    controls.maxZoom = zoom * 2.2;
  };

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls || isInitializedRef.current) {
      return;
    }

    const state = computeCameraState(camera, frameBounds, size, getPresetDirection(HERO_VIEW));

    syncZoomLimits(state.zoom);
    applyState(state);
    isInitializedRef.current = true;
    isAnimatingRef.current = false;
    desiredStateRef.current = null;
  }, [camera, frameBounds, size.height, size.width]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    const state =
      cameraCommand.mode === 'focus' && focusItem
        ? computeFocusCameraState(
            camera,
            focusItem,
            size,
            new Vector3(...(focusItem.focusDirection ?? VIEW_DIRECTIONS[HERO_VIEW])).normalize(),
          )
        : computeCameraState(
            camera,
            frameBounds,
            size,
            getPresetDirection(cameraCommand.preset),
          );

    syncZoomLimits(state.zoom);
    desiredStateRef.current = state;
    isAnimatingRef.current = true;
  }, [camera, cameraCommand.nonce, focusItem?.id]);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    const handleStart = () => {
      isAnimatingRef.current = false;
      onInteractionStart?.();
    };

    controls.addEventListener('start', handleStart);

    return () => {
      controls.removeEventListener('start', handleStart);
    };
  }, [onInteractionStart]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    if (isAnimatingRef.current && desiredStateRef.current) {
      const state = desiredStateRef.current;

      controls.target.x = MathUtils.damp(controls.target.x, state.target.x, TRANSITION_DAMPING, delta);
      controls.target.y = MathUtils.damp(controls.target.y, state.target.y, TRANSITION_DAMPING, delta);
      controls.target.z = MathUtils.damp(controls.target.z, state.target.z, TRANSITION_DAMPING, delta);
      camera.position.x = MathUtils.damp(camera.position.x, state.position.x, TRANSITION_DAMPING, delta);
      camera.position.y = MathUtils.damp(camera.position.y, state.position.y, TRANSITION_DAMPING, delta);
      camera.position.z = MathUtils.damp(camera.position.z, state.position.z, TRANSITION_DAMPING, delta);
      camera.zoom = MathUtils.damp(camera.zoom, state.zoom, TRANSITION_DAMPING, delta);
      camera.updateProjectionMatrix();

      const positionSettled = camera.position.distanceToSquared(state.position) < 0.0004;
      const targetSettled = controls.target.distanceToSquared(state.target) < 0.0004;
      const zoomSettled = Math.abs(camera.zoom - state.zoom) < 0.02;

      if (positionSettled && targetSettled && zoomSettled) {
        applyState(state);
        isAnimatingRef.current = false;
        desiredStateRef.current = null;
      }
    }

    clampControlsToBounds(
      controls,
      camera,
      focusItem ? getFocusBounds(focusItem) : frameBounds,
      focusItem ? 0.12 : PAN_LIMIT_SCALE,
    );
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.72}
      zoomSpeed={0.9}
      panSpeed={0.42}
      enablePan
      screenSpacePanning
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI - 0.28}
      zoomToCursor={false}
    />
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.72} color="#ffe8cf" />
      <hemisphereLight
        args={['#fff1dc', '#1f1611', 1.15]}
        position={[0, 10, 0]}
      />
      <directionalLight
        castShadow
        intensity={3.2}
        color="#ffd29f"
        position={[8, 12, 7]}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.00008}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <spotLight
        castShadow
        color="#ff9b4b"
        intensity={60}
        angle={0.28}
        penumbra={0.8}
        decay={1.4}
        distance={40}
        position={[-6, 11, 8]}
      />
      <directionalLight intensity={1.05} color="#ff9a4d" position={[-10, 7, -5]} />
      <directionalLight intensity={0.9} color="#f4f1ff" position={[3, 5, -10]} />
      <Environment resolution={256}>
        <Lightformer
          form="ring"
          intensity={0.65}
          color="#ff9b4b"
          position={[0, 8, -8]}
          scale={8}
          target={[0, 0, 0]}
        />
        <Lightformer
          intensity={0.5}
          color="#ffffff"
          position={[-8, 4, 6]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={0.45}
          color="#ffbb73"
          position={[9, 3, 2]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[9, 7, 1]}
        />
        <mesh scale={80}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#111111" side={1} />
        </mesh>
      </Environment>
    </>
  );
}

export default function SceneCanvas({
  activeProducts,
  cameraCommand,
  focusedItemId,
  onFocusItem,
  fullscreen = false,
  showInspector = true,
}) {
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const frameBounds = useMemo(() => {
    const frameItems = [BASE_PLATFORM, CORE_APP, ...activeProducts];

    return getFrameBounds(frameItems);
  }, [activeProducts]);
  const focusItem =
    (focusedItemId ? SCENE_ITEM_MAP[focusedItemId] : null) ??
    (cameraCommand.mode === 'focus' ? SCENE_ITEM_MAP[cameraCommand.targetId] ?? null : null);
  const interactiveItems = useMemo(
    () => [CORE_APP, ...activeProducts],
    [activeProducts],
  );
  const handleHoverChange = (itemId) => {
    setHoveredItemId((current) => (current === itemId ? current : itemId));
  };

  const handleFocusRequest = (itemId) => {
    onFocusItem?.(itemId);
  };

  return (
    <div className={`scene-canvas${fullscreen ? ' scene-canvas--fullscreen' : ''}`}>
      <div className="scene-canvas__viewport">
        <Canvas
          orthographic
          shadows
          style={{ width: '100%', height: '100%' }}
          dpr={[1.1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          camera={{ near: 0.1, far: 160 }}
          onCreated={({ gl }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.16;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = PCFSoftShadowMap;
            gl.setClearColor(new Color('#0d0d0f'), 1);
          }}
        >
          <color attach="background" args={['#0d0d0f']} />
          <fog attach="fog" args={['#0d0d0f', 13, 24]} />
          <SceneCamera
            frameBounds={frameBounds}
            focusItem={focusItem}
            cameraCommand={cameraCommand}
            onInteractionStart={() => {
              if (typeof document !== 'undefined') {
                document.body.style.cursor = '';
              }
            }}
          />
          <SceneLighting />

          <group>
            <ModelInstance {...BASE_PLATFORM} />
            {interactiveItems.map((item) => (
              <ModelInstance
                key={item.id}
                {...item}
                animateIn
                floatAmplitude={item.id === 'core-app' ? 0.012 : 0.018}
                interactive
                isHovered={hoveredItemId === item.id}
                isFocused={focusItem?.id === item.id}
                showLabel={hoveredItemId === item.id && focusItem?.id !== item.id}
                showFocusCallout={false}
                hoverEnabled
                clickEnabled
                onHoverChange={handleHoverChange}
                onSelect={handleFocusRequest}
              />
            ))}
          </group>

          <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
            <circleGeometry args={[12.5, 96]} />
            <meshStandardMaterial color="#101010" metalness={0.16} roughness={0.96} />
          </mesh>

          <ContactShadows
            opacity={0.56}
            blur={1.8}
            scale={23}
            far={18}
            resolution={2048}
            color="#020202"
            position={[0, 0.01, 0]}
          />
        </Canvas>
      </div>
      {showInspector && focusItem ? (
        <div className="scene-inspector" aria-live="polite">
          <span className="scene-inspector__kicker">Selected structure</span>
          <strong>{focusItem.title ?? focusItem.label}</strong>
          {focusItem.productLabel ? (
            <span className="scene-inspector__meta">{focusItem.productLabel}</span>
          ) : null}
          <p>{focusItem.whatItDoes}</p>
        </div>
      ) : null}
    </div>
  );
}
