import { DEFAULT_INFO } from '../config/products';

export default function InfoPanel({
  activeProducts,
  focusedItem,
  totalProducts,
  onResetFocus,
}) {
  const activeCount = activeProducts.length;
  const hasActiveModules = activeCount > 0;
  const hasFocusedModule = Boolean(focusedItem?.id);
  const displayProduct = focusedItem ?? DEFAULT_INFO;
  const sceneState =
    activeCount === 0
      ? 'Base platform + core app'
      : activeCount === totalProducts
        ? 'Full ecosystem deployed'
        : 'Shared ecosystem expanding';

  return (
    <section className={`overlay-panel overlay-panel--info${hasFocusedModule ? ' overlay-panel--focused' : ''}`}>
      <div className="overlay-panel__header">
        <div>
          <p className="panel-kicker">{hasFocusedModule ? 'Focused Module' : 'Ecosystem Briefing'}</p>
          <h2>{displayProduct.title}</h2>
          <p>
            {hasFocusedModule
              ? 'Inspect the focused structure in detail, then return to the ecosystem view when you are done.'
              : hasActiveModules
                ? 'Selected modules are live in the shared world. Toggle more products to keep growing the system.'
                : 'Deploy product modules into the world to build a shared Cloudflare ecosystem around the fixed core app.'}
          </p>
        </div>
        {hasFocusedModule ? (
          <button type="button" className="info-action" onClick={onResetFocus}>
            Back to ecosystem
          </button>
        ) : null}
      </div>

      <div className="info-block">
        <h3>{hasFocusedModule ? 'Capability' : 'Selected modules'}</h3>
        <div className="info-chip-row">
          {hasFocusedModule && displayProduct.productLabel ? (
            <span className="info-chip">{displayProduct.productLabel}</span>
          ) : hasActiveModules ? (
            activeProducts.map((product) => (
              <span key={product.id} className="info-chip">
                {product.label}
              </span>
            ))
          ) : (
            <span className="info-chip info-chip--muted">Core app only</span>
          )}
        </div>
      </div>

      <div className="info-block">
        <h3>{hasFocusedModule ? 'What it does' : 'World state'}</h3>
        <p>{displayProduct.whatItDoes}</p>
      </div>

      <div className="info-block">
        <h3>{hasFocusedModule ? 'What it could unlock' : 'What grows next'}</h3>
        <p>{displayProduct.whatItCouldUnlock}</p>
      </div>

      <div className="info-metric-grid info-metric-grid--compact">
        <div className="info-status">
          <span>Deployed modules</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="info-status">
          <span>Current scene state</span>
          <strong>{sceneState}</strong>
        </div>
        <div className="info-status">
          <span>Current focus</span>
          <strong>{hasFocusedModule ? displayProduct.label : 'Ecosystem'}</strong>
        </div>
      </div>
    </section>
  );
}
