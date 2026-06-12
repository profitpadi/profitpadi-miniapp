// miniapp/src/components/AddExpense.jsx
import { useState } from 'react';
import { createTransaction, formatMoney } from '../api';
import { showConfirm, haptic } from '../telegram';

export default function AddExpense({ onSuccess, onCancel }) {
  const [amount,  setAmount]  = useState('');
  const [desc,    setDesc]    = useState('');
  const [cat,     setCat]     = useState('cost_of_goods');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const CATEGORIES = [
    { id: 'cost_of_goods',        label: '📦 Stock/Goods' },
    { id: 'raw_materials',        label: '🥬 Raw Materials' },
    { id: 'transport_logistics',  label: '🚗 Transport' },
    { id: 'rent_expense',         label: '🏪 Rent' },
    { id: 'utilities',            label: '💡 Utilities' },
    { id: 'generator',            label: '⚡ Generator' },
    { id: 'communication',        label: '📱 Airtime/Data' },
    { id: 'marketing_advertising',label: '📢 Marketing' },
    { id: 'salary_wages',         label: '👥 Staff Pay' },
    { id: 'bank_charges',         label: '🏦 Bank Charges' },
    { id: 'equipment_tools',      label: '🔨 Equipment' },
    { id: 'other_expense',        label: '💸 Other' },
  ];

  const handleSubmit = async () => {
    const amt = parseFloat(amount.replace(/[₦,]/g, ''));
    if (!amt || amt <= 0) { setError('Please enter a valid amount'); return; }

    const confirmed = await showConfirm(`Record expense of ${formatMoney(amt)}?`);
    if (!confirmed) return;

    setSaving(true); setError('');
    try {
      await createTransaction({ type: 'expense', amount: amt, description: desc, category: cat });
      haptic.success();
      onSuccess?.({ amount: amt, type: 'expense' });
    } catch (e) {
      setError(e.response?.data?.message || 'Error saving. Please try again.');
      haptic.error();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', marginRight: 10 }}>◀️</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>💸 Record Expense</h2>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: 'var(--pp-danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Amount (₦)</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 3500"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          inputMode="decimal"
          style={{ fontSize: 22, fontWeight: 700 }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                padding: '6px 12px', borderRadius: 999, border: '1.5px solid',
                borderColor: cat === c.id ? 'var(--pp-danger)' : 'transparent',
                background: cat === c.id ? '#ffebee' : 'var(--pp-secondary-bg)',
                fontSize: 13, cursor: 'pointer',
                color: cat === c.id ? 'var(--pp-danger)' : 'var(--pp-text)',
                fontWeight: cat === c.id ? 600 : 400
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description (optional)</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. bought tomatoes and peppers"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
      </div>

      <button
        className="btn btn-danger"
        onClick={handleSubmit}
        disabled={saving || !amount}
        style={{ marginTop: 8 }}
      >
        {saving ? '⏳ Saving...' : '✅ Record Expense'}
      </button>
    </div>
  );
}
