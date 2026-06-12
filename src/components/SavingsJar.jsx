// miniapp/src/components/SavingsJar.jsx
import { useState, useEffect } from 'react';
import { getSavingsStatus, getSavingsHistory, addToSavings, withdrawSavings, formatMoney } from '../api';
import { showConfirm, haptic } from '../telegram';
import dayjs from 'dayjs';

export default function SavingsJar({ user }) {
  const [status,  setStatus]  = useState(null);
  const [history, setHistory] = useState([]);
  const [tab,     setTab]     = useState('overview'); // overview | history
  const [amount,  setAmount]  = useState('');
  const [mode,    setMode]    = useState(null); // 'add' | 'withdraw' | null
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    const [s, h] = await Promise.all([getSavingsStatus(), getSavingsHistory()]);
    setStatus(s);
    setHistory(h?.history || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const ok = await showConfirm(`Add ${formatMoney(amt)} to your savings jar?`);
    if (!ok) return;
    setSaving(true);
    try {
      await addToSavings(amt, 'Manual savings');
      haptic.success();
      setAmount(''); setMode(null);
      load();
    } catch { haptic.error(); }
    setSaving(false);
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const ok = await showConfirm(`Withdraw ${formatMoney(amt)} from your savings jar?`);
    if (!ok) return;
    setSaving(true);
    try {
      await withdrawSavings(amt);
      haptic.success();
      setAmount(''); setMode(null);
      load();
    } catch (e) {
      haptic.error();
      alert(e?.response?.data?.message || 'Insufficient balance');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 16 }}><div className="loading-spinner" /></div>;

  const pct = status?.progress || 0;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏦 Savings Jar</h2>

      {/* Jar balance card */}
      <div className="profit-card" style={{ marginBottom: 16 }}>
        <div className="label">Jar Balance</div>
        <div className="amount">{formatMoney(status?.balance)}</div>
        <div className="period">
          {status?.isExempt
            ? '✅ You\'re exempt — save for emergencies!'
            : `Target: ${formatMoney(status?.annualTarget)} annually`}
        </div>
      </div>

      {/* Progress bar */}
      {!status?.isExempt && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Annual Target Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? 'var(--pp-success)' : 'var(--pp-primary)' }}>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--pp-hint)', marginTop: 6 }}>
            Save {formatMoney(status?.recommended)}/month to stay on track
          </div>
        </div>
      )}

      {/* Add/Withdraw form */}
      {mode ? (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>{mode === 'add' ? '➕ Add to Jar' : '➖ Withdraw from Jar'}</div>
          <input
            className="form-input"
            type="number"
            placeholder="Amount (₦)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
            style={{ marginBottom: 12, fontSize: 20, fontWeight: 700 }}
          />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={mode === 'add' ? handleAdd : handleWithdraw} disabled={saving || !amount}>
              {saving ? '⏳' : mode === 'add' ? '✅ Add' : '✅ Withdraw'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setMode(null); setAmount(''); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="btn-row" style={{ marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={() => setMode('add')}>➕ Add to Jar</button>
          <button className="btn btn-secondary" onClick={() => setMode('withdraw')}>➖ Withdraw</button>
        </div>
      )}

      {/* History */}
      <button
        onClick={() => setTab(tab === 'history' ? 'overview' : 'history')}
        style={{ background: 'none', border: 'none', color: 'var(--pp-link)', fontSize: 13, cursor: 'pointer', marginBottom: 12 }}
      >
        {tab === 'history' ? '▲ Hide history' : '📋 View history'}
      </button>

      {tab === 'history' && (
        <div className="card">
          {history.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--pp-hint)', fontSize: 13 }}>No history yet</div>
            : history.map((h, i) => (
              <div key={i} className="tx-item">
                <div>
                  <div className="tx-desc">{h.type === 'add' ? 'Added' : 'Withdrew'}</div>
                  <div className="tx-meta">{dayjs(h.date).format('DD MMM YYYY')}{h.note ? ` • ${h.note}` : ''}</div>
                </div>
                <div className={`tx-amount ${parseFloat(h.amount) >= 0 ? 'tx-income' : 'tx-expense'}`}>
                  {parseFloat(h.amount) >= 0 ? '+' : ''}{formatMoney(Math.abs(h.amount))}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
