// miniapp/src/components/AppHeader.jsx
// ============================================================
// ProfitPadi logo header for the Mini App.
// Uses the real PNG logo from /public/logo.png.
// Responsive: compact mode for inner pages.
// ============================================================

export default function AppHeader({ compact = false }) {
  return (
    <header className="pp-header" data-compact={compact}>
      <div className="pp-header-inner">
        <img
          src="/logo.png"
          alt="ProfitPadi"
          className="pp-logo-img"
          style={{
            height:    compact ? '28px' : '36px',
            width:     'auto',
            objectFit: 'contain',
            display:   'block',
          }}
        />
      </div>
    </header>
  );
}
