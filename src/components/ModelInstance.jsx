import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { Box3, Color, MathUtils, Vector3 } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const HOVER_TINT = new Color('#ff9a4b');
const HOVER_COLOR_MIX = 0.08;
const FOCUS_COLOR_MIX = 0.05;
const EMISSIVE_MAX = 0.36;

function ModelStatus({ label, position, scale, status, tone = 'loading' }) {
  const resolvedScale = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <group position={position} scale={resolvedScale}>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.15, 0.9, 1.15]} />
        <meshStandardMaterial
          color={tone === 'error' ? '#f97316' : '#93c5fd'}
          metalness={0.15}
          roughness={0.45}
          wireframe={tone !== 'error'}
        />
      </mesh>
      <Html center position={[0, 1.35, 0]}>
        <div className={`scene-status scene-status--${tone}`}>
          <strong>{label}</strong>
          <span>{status}</span>
        </div>
      </Html>
    </group>
  );
}

function LoadedModel({
  id,
  label,
  title,
  whatItDoes,
  modelPath,
  position,
  rotation,
  scale,
  animateIn = false,
  floatAmplitude = 0,
  interactive = false,
  isHovered = false,
  isFocused = false,
  showLabel = false,
  showFocusCallout = false,
  labelOffset = [0, 1.8, 0],
  hoverEnabled = true,
  clickEnabled = true,
  onHoverChange,
  onSelect,
}) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef(null);
  const materialBindingsRef = useRef([]);
  const pointerDownRef = useRef(null);

  const preparedScene = useMemo(() => {
    const instance = clone(scene);
    const box = new Box3().setFromObject(instance);
    const center = new Vector3();

    box.getCenter(center);

    instance.position.x -= center.x;
    instance.position.y -= box.min.y;
    instance.position.z -= center.z;

    instance.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.sceneItemId = id;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMaterials = materials.map((material) => {
        if (!material) {
          return material;
        }

        const clonedMaterial = material.clone();
        const baseColor = clonedMaterial.color?.clone?.() ?? new Color('#ffffff');
        const baseEmissive = clonedMaterial.emissive?.clone?.() ?? new Color('#000000');
        const baseEmissiveIntensity = clonedMaterial.emissiveIntensity ?? 0;

        clonedMaterial.envMapIntensity = 1.2;
        clonedMaterial.userData = {
          ...clonedMaterial.userData,
          baseColor,
          baseEmissive,
          baseEmissiveIntensity,
        };
        clonedMaterial.needsUpdate = true;

        materialBindingsRef.current.push(clonedMaterial);

        return clonedMaterial;
      });

      child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
    });

    return instance;
  }, [id, scene]);

  const resolvedScale = Array.isArray(scale) ? scale : [scale, scale, scale];
  const [baseX, baseY, baseZ] = position;
  const entryProgressRef = useRef(animateIn ? 0 : 1);
  const entryTargetRef = useRef(animateIn ? 0 : 1);
  const highlightStrengthRef = useRef(0);

  const getPointerPoint = (event) => {
    const sourceEvent = event?.nativeEvent ?? event?.sourceEvent ?? event;

    return {
      x: sourceEvent?.clientX ?? 0,
      y: sourceEvent?.clientY ?? 0,
    };
  };

  useEffect(() => {
    entryProgressRef.current = animateIn ? 0 : 1;
    entryTargetRef.current = 1;
  }, [animateIn, modelPath]);

  useEffect(() => {
    return () => {
      materialBindingsRef.current.forEach((material) => {
        material.dispose?.();
      });
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    entryProgressRef.current = MathUtils.damp(
      entryProgressRef.current,
      entryTargetRef.current,
      animateIn ? 4.8 : 10,
      delta,
    );

    const progress = entryProgressRef.current;
    const entryLift = animateIn ? (1 - progress) * 0.55 : 0;
    const drift =
      floatAmplitude > 0
        ? Math.sin(state.clock.elapsedTime * 1.1 + baseX * 0.55 + baseZ * 0.4) *
          floatAmplitude *
          progress
        : 0;
    const resolvedEntryScale = 0.84 + progress * 0.16;
    const targetHighlight = isHovered ? 1 : isFocused ? 0.72 : 0;

    highlightStrengthRef.current = MathUtils.damp(
      highlightStrengthRef.current,
      targetHighlight,
      8.6,
      delta,
    );

    groupRef.current.position.set(baseX, baseY - entryLift + drift, baseZ);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    groupRef.current.scale.set(
      resolvedScale[0] * resolvedEntryScale,
      resolvedScale[1] * resolvedEntryScale,
      resolvedScale[2] * resolvedEntryScale,
    );

    materialBindingsRef.current.forEach((material) => {
      const { baseColor, baseEmissive, baseEmissiveIntensity } = material.userData;
      const highlightStrength = highlightStrengthRef.current;
      const colorMix =
        highlightStrength * (isHovered ? HOVER_COLOR_MIX : FOCUS_COLOR_MIX);

      if (material.color && baseColor) {
        material.color.copy(baseColor).lerp(HOVER_TINT, colorMix);
      }

      if (material.emissive && baseEmissive) {
        material.emissive.copy(baseEmissive).lerp(HOVER_TINT, highlightStrength * 0.68);
        material.emissiveIntensity =
          baseEmissiveIntensity + highlightStrength * EMISSIVE_MAX;
      }
    });
  });

  const handlePointerOver = (event) => {
    if (!interactive || !hoverEnabled) {
      return;
    }

    event.stopPropagation();
    onHoverChange?.(id);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (event) => {
    if (!interactive || !hoverEnabled) {
      return;
    }

    event.stopPropagation();
    onHoverChange?.(null);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = '';
    }
  };

  const handlePointerDown = (event) => {
    if (!interactive || !clickEnabled) {
      return;
    }

    event.stopPropagation();
    pointerDownRef.current = getPointerPoint(event);
  };

  const handleClick = (event) => {
    if (!interactive || !clickEnabled) {
      return;
    }

    const pointerDown = pointerDownRef.current;
    const pointerUp = getPointerPoint(event);

    if (event.delta > 6) {
      return;
    }

    if (pointerDown) {
      const distance = Math.hypot(
        pointerUp.x - pointerDown.x,
        pointerUp.y - pointerDown.y,
      );

      if (distance > 6) {
        return;
      }
    }

    event.stopPropagation();
    onSelect?.(id);
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={resolvedScale}>
      <primitive
        object={preparedScene}
        dispose={null}
        userData={{ label }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      />
      {showLabel ? (
        <Html center position={labelOffset}>
          <div className="scene-tooltip">{label}</div>
        </Html>
      ) : null}
      {showFocusCallout ? (
        <Html center position={[labelOffset[0], labelOffset[1] + 1.05, labelOffset[2]]}>
          <div className="scene-focus-callout">
            <strong>{title ?? label}</strong>
            <p>{whatItDoes}</p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function ModelInstance(props) {
  const { label, position, scale } = props;

  return (
    <ModelErrorBoundary
      fallback={
        <ModelStatus
          label={label}
          position={position}
          scale={scale}
          status="Model unavailable"
          tone="error"
        />
      }
    >
      <Suspense
        fallback={
          <ModelStatus
            label={label}
            position={position}
            scale={scale}
            status="Loading model"
          />
        }
      >
        <LoadedModel {...props} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
