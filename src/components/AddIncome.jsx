// miniapp/src/components/AddIncome.jsx
import { useState } from 'react';
import { createTransaction, formatMoney } from '../api';
import { showConfirm, haptic } from '../telegram';

export default function AddIncome({ onSuccess, onCancel }) {
  const [amount, setAmount]      = useState('');
  const [desc,   setDesc]        = useState('');
  const [cat,    setCat]         = useState('sales');
  const [client, setClient]      = useState('');
  const [saving, setSaving]      = useState(false);
  const [error,  setError]       = useState('');

  const CATEGORIES = [
    { id: 'sales', label: '🛒 Sales' }, { id: 'service', label: '🔧 Service' },
    { id: 'salary', label: '💼 Salary' }, { id: 'client_payment', label: '🤝 Client Payment' },
    { id: 'freelance', label: '💻 Freelance' }, { id: 'commission', label: '📊 Commission' },
    { id: 'tip_dash', label: '💝 Tip/Dash' }, { id: 'other_income', label: '💰 Other' }
  ];

  const handleSubmit = async () => {
    const amt = parseFloat(amount.replace(/[₦,]/g, ''));
    if (!amt || amt <= 0) { setError('Please enter a valid amount'); return; }

    const confirmed = await showConfirm(`Record income of ${formatMoney(amt)}?`);
    if (!confirmed) return;

    setSaving(true); setError('');
    try {
      await createTransaction({ type: 'income', amount: amt, description: desc, category: cat, client });
      haptic.success();
      onSuccess?.({ amount: amt, type: 'income' });
    } catch (e) {
      setError(e.response?.data?.error || 'Error saving. Please try again.');
      haptic.error();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', marginRight: 10 }}>◀️</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>💰 Record Income</h2>
      </div>

      {error && <div style={{ background: '#ffebee', color: 'var(--pp-danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Amount (₦)</label>
        <input className="form-input" type="number" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" style={{ fontSize: 22, fontWeight: 700 }} />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ padding: '6px 12px', borderRadius: 999, border: '1.5px solid', borderColor: cat === c.id ? 'var(--pp-primary)' : 'transparent', background: cat === c.id ? 'var(--pp-primary-light)' : 'var(--pp-secondary-bg)', fontSize: 13, cursor: 'pointer', color: cat === c.id ? 'var(--pp-primary)' : 'var(--pp-text)', fontWeight: cat === c.id ? 600 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description (optional)</label>
        <input className="form-input" type="text" placeholder="e.g. sold bags of rice" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Client name (optional)</label>
        <input className="form-input" type="text" placeholder="e.g. Emeka Chukwu" value={client} onChange={e => setClient(e.target.value)} />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !amount}>
        {saving ? '⏳ Saving...' : '✅ Record Income'}
      </button>
    </div>
  );
}
