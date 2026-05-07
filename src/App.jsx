import { useState } from 'react';
import SceneCanvas from './components/SceneCanvas';
import ProductControls from './components/ProductControls';
import InfoPanel from './components/InfoPanel';
import { DEFAULT_INFO, PRODUCT_CONFIG, SCENE_ITEM_MAP } from './config/products';

const VIEW_PRESETS = [
  { id: 'isometric', label: 'Isometric' },
  { id: 'front', label: 'Front' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'top', label: 'Top' },
];

export default function App() {
  const [activeProductIds, setActiveProductIds] = useState([]);
  const [focusedSceneItemId, setFocusedSceneItemId] = useState(null);
  const [activeViewPreset, setActiveViewPreset] = useState('isometric');
  const [cameraCommand, setCameraCommand] = useState({
    mode: 'preset',
    preset: 'isometric',
    targetId: null,
    nonce: 0,
  });

  const activeProducts = activeProductIds
    .map((productId) => PRODUCT_CONFIG.find((product) => product.id === productId) ?? null)
    .filter(Boolean);
  const focusedSceneItem =
    (focusedSceneItemId ? SCENE_ITEM_MAP[focusedSceneItemId] : null) ?? null;
  const deployedCount = activeProducts.length;
  const sceneState =
    deployedCount === 0
      ? 'Core Only'
      : deployedCount === PRODUCT_CONFIG.length
        ? 'Full Stack'
        : 'Growing';
  const handleToggleProduct = (productId) => {
    const isActive = activeProductIds.includes(productId);
    const nextActiveIds = isActive
      ? activeProductIds.filter((id) => id !== productId)
      : [...activeProductIds, productId];

    setActiveProductIds(nextActiveIds);

    if (isActive) {
      if (focusedSceneItemId === productId) {
        setFocusedSceneItemId(null);
        setActiveViewPreset('isometric');
        setCameraCommand((current) => ({
          mode: 'preset',
          preset: 'isometric',
          targetId: null,
          nonce: current.nonce + 1,
        }));
      }
      return;
    }
  };

  const handleReset = () => {
    setActiveProductIds([]);
    setFocusedSceneItemId(null);
    setActiveViewPreset('isometric');
    setCameraCommand((current) => ({
      mode: 'preset',
      preset: 'isometric',
      targetId: null,
      nonce: current.nonce + 1,
    }));
  };

  const handleCameraPreset = (preset) => {
    setFocusedSceneItemId(null);
    setActiveViewPreset(preset);
    setCameraCommand((current) => ({
      mode: 'preset',
      preset,
      targetId: null,
      nonce: current.nonce + 1,
    }));
  };

  const handleResetView = () => {
    setFocusedSceneItemId(null);
    setActiveViewPreset('isometric');
    setCameraCommand((current) => ({
      mode: 'preset',
      preset: 'isometric',
      targetId: null,
      nonce: current.nonce + 1,
    }));
  };

  const handleFocusSceneItem = (itemId) => {
    setFocusedSceneItemId(itemId);
    setCameraCommand((current) => ({
      mode: 'focus',
      preset: current.preset,
      targetId: itemId,
      nonce: current.nonce + 1,
    }));
  };

  const handleResetFocus = () => {
    setFocusedSceneItemId(null);
    setActiveViewPreset('isometric');
    setCameraCommand((current) => ({
      mode: 'preset',
      preset: 'isometric',
      targetId: null,
      nonce: current.nonce + 1,
    }));
  };

  return (
    <div className="immersive-app">
      <div className="immersive-scene-layer">
        <SceneCanvas
          activeProducts={activeProducts}
          cameraCommand={cameraCommand}
          focusedItemId={focusedSceneItemId}
          onFocusItem={handleFocusSceneItem}
          fullscreen
          showInspector={false}
        />
      </div>

      <div className="immersive-vignette" aria-hidden="true" />

      <header className="immersive-header">
        <div className="immersive-brand-panel">
          <span className="brand-mark">Cloudflare 3D Simulator</span>
          <p>Shared Cloudflare ecosystem simulation</p>
        </div>

        <div className="immersive-header__chips">
          <article className="overlay-chip">
            <span>Scene</span>
            <strong>{sceneState}</strong>
          </article>
          <article className="overlay-chip">
            <span>Deployed</span>
            <strong>{deployedCount}</strong>
          </article>
        </div>
      </header>

      <aside className="immersive-left-rail">
        <ProductControls
          products={PRODUCT_CONFIG}
          activeIds={activeProductIds}
          activeCount={deployedCount}
          sceneState={sceneState}
          onToggle={handleToggleProduct}
          onReset={handleReset}
        />
      </aside>

      <section className="immersive-camera-panel" aria-label="Camera controls">
        <div className="overlay-panel overlay-panel--camera">
          <div className="overlay-panel__header overlay-panel__header--stacked">
            <div>
              <p className="panel-kicker">View Controls</p>
              <h2>Explore the world</h2>
            </div>
          </div>

          <div className="scene-view-controls" aria-label="Camera views">
            {VIEW_PRESETS.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`scene-view-button${activeViewPreset === view.id ? ' scene-view-button--active' : ''}`}
                onClick={() => handleCameraPreset(view.id)}
              >
                {view.label}
              </button>
            ))}
            <button
              type="button"
              className="scene-view-button scene-view-button--ghost"
              onClick={handleResetView}
            >
              Reset View
            </button>
          </div>

          <span className="scene-toolbar__hint">
            Drag to rotate · Scroll to zoom · Right-drag to pan
          </span>
        </div>
      </section>

      {focusedSceneItem ? (
        <aside className="immersive-info-rail">
          <InfoPanel
            activeProducts={activeProducts}
            focusedItem={focusedSceneItem ?? DEFAULT_INFO}
            totalProducts={PRODUCT_CONFIG.length}
            onResetFocus={handleResetFocus}
          />
        </aside>
      ) : null}
    </div>
  );
}
