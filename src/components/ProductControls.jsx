export default function ProductControls({
  products,
  activeIds,
  activeCount,
  sceneState,
  onToggle,
  onReset,
}) {
  return (
    <section className="overlay-panel overlay-panel--modules">
      <div className="overlay-panel__header">
        <div>
          <p className="panel-kicker">Module Rail · {activeCount} deployed</p>
          <h2>Build the surrounding infrastructure.</h2>
          <p>
            Toggle product modules into the world while the core app stays fixed
            at the center.
          </p>
        </div>
        <div className="overlay-panel__badge">
          <strong>{activeCount}</strong>
          <span>live</span>
        </div>
      </div>

      <div className="control-grid">
        {products.map((product) => {
          const isActive = activeIds.includes(product.id);

          return (
            <button
              key={product.id}
              type="button"
              className={`control-button${isActive ? ' control-button--active' : ''}`}
              onClick={() => onToggle(product.id)}
              aria-pressed={isActive}
            >
              <span>{product.label}</span>
              <small>{isActive ? 'Deployed' : 'Ready'}</small>
            </button>
          );
        })}
      </div>

      <div className="overlay-panel__footer">
        <span className="overlay-panel__meta">Scene state: {sceneState}</span>
        <button
          type="button"
          className="reset-button"
          onClick={onReset}
          disabled={activeCount === 0}
        >
          Reset Modules
        </button>
      </div>
    </section>
  );
}
