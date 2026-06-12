// miniapp/src/components/Upgrade.jsx
import { useState, useEffect } from 'react';
import { getTiers, initiateUpgrade, formatMoney } from '../api';
import { haptic } from '../telegram';

const TIER_FEATURES = {
  trader:       { emoji: '🛒', highlights: ['Unlimited transactions','Auto-categorization','Monthly P&L','Free monthly PDF export','All 5 languages','₦200 referral bonus'] },
  professional: { emoji: '💼', highlights: ['Everything in Trader','Invoice creation & tracking','WHT tracking','Receipt OCR capture','Unlimited exports','₦300 referral bonus'] },
  business:     { emoji: '🏢', highlights: ['Everything in Professional','VAT tracking & returns','Payroll (10 staff)','3-user access','Bank statement upload','₦500 referral bonus'] },
  accountant:   { emoji: '📊', highlights: ['Everything in Business','Manage 50 clients','Client dashboard','Auto monthly reports','White-label option','Revenue sharing'] },
};

export default function Upgrade({ user }) {
  const [selected, setSelected] = useState(null);
  const [period,   setPeriod]   = useState('monthly');
  const [tiers,    setTiers]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(false);

  useEffect(() => {
    getTiers().then(d => { setTiers(d.tiers || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handlePay = async () => {
    if (!selected) return;
    setPaying(true);
    try {
      const result = await initiateUpgrade(selected, period);
      if (result.paymentUrl) {
        haptic.medium();
        window.open(result.paymentUrl, '_blank');
      }
    } catch (e) {
      alert('Error generating payment link. Please try again.');
    }
    setPaying(false);
  };

  if (loading) return <div style={{ padding: 16 }}><div className="loading-spinner" /></div>;

  const tierList = Object.entries(TIER_FEATURES).filter(([id]) => id !== user?.tier);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>⭐ Upgrade Plan</h2>
      <p style={{ fontSize: 13, color: 'var(--pp-hint)', marginBottom: 16 }}>Current: <strong>{(user?.tier || 'starter').charAt(0).toUpperCase() + (user?.tier || 'starter').slice(1)}</strong></p>

      {/* Billing toggle */}
      <div style={{ display: 'flex', background: 'var(--pp-secondary-bg)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
        {['monthly','annual'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: period === p ? 'var(--pp-primary)' : 'transparent',
              color: period === p ? 'white' : 'var(--pp-hint)' }}>
            {p === 'monthly' ? 'Monthly' : 'Annual (save ~20%)'}
          </button>
        ))}
      </div>

      {/* Tier cards */}
      {tierList.map(([id, info]) => {
        const price    = tiers[id]?.price?.[period] || 0;
        const isSelected = selected === id;
        return (
          <div key={id} onClick={() => { setSelected(id); haptic.light(); }}
            className="card"
            style={{ border: `2px solid ${isSelected ? 'var(--pp-primary)' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{info.emoji} {tiers[id]?.label || id}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--pp-primary)' }}>
                ₦{(price || 0).toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--pp-hint)' }}>/{period === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>
            {info.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: 'var(--pp-primary)', fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 13 }}>{h}</span>
              </div>
            ))}
            {isSelected && (
              <div style={{ marginTop: 6, padding: '4px 10px', background: 'var(--pp-primary)', borderRadius: 6, display: 'inline-block', color: 'white', fontSize: 12, fontWeight: 600 }}>
                ✓ Selected
              </div>
            )}
          </div>
        );
      })}

      {selected && (
        <button className="btn btn-primary" onClick={handlePay} disabled={paying} style={{ marginTop: 8 }}>
          {paying ? '⏳ Opening payment...' : `💳 Pay ₦${((tiers[selected]?.price?.[period]) || 0).toLocaleString()} — Upgrade Now`}
        </button>
      )}

      <div style={{ fontSize: 11, color: 'var(--pp-hint)', textAlign: 'center', marginTop: 12 }}>
        Secure payment via Flutterwave. Plan activates automatically after payment.
      </div>
    </div>
  );
}
