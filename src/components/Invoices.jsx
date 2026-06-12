// miniapp/src/components/Invoices.jsx
import { useState, useEffect } from 'react';
import { getInvoiceSummary, getUserInvoices, markInvoicePaid, formatMoney } from '../api';
import { showConfirm, haptic } from '../telegram';
import dayjs from 'dayjs';

export default function Invoices({ user, onNavigate }) {
  const [summary,  setSummary]  = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filter,   setFilter]   = useState('all'); // all | outstanding | overdue | paid
  const [loading,  setLoading]  = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, inv] = await Promise.all([
        getInvoiceSummary(),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/invoices${filter !== 'all' ? `?status=${filter === 'overdue' ? 'sent' : filter}` : ''}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem?.('pp_token') || ''}` }
        }).then(r => r.json())
      ]);
      setSummary(s);
      let list = inv.invoices || [];
      if (filter === 'overdue') list = list.filter(i => new Date(i.due_date) < new Date() && i.status === 'sent');
      setInvoices(list);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  if (user?.tier === 'starter' || user?.tier === 'trader') {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧾 Invoices</h2>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Invoice Management</div>
          <div style={{ fontSize: 13, color: 'var(--pp-hint)', marginBottom: 20 }}>Available on Professional plan (₦2,000/month)</div>
          <button className="btn btn-primary" onClick={() => onNavigate('upgrade')}>⭐ Upgrade Now</button>
        </div>
      </div>
    );
  }

  const statusColor = { draft: '#888', sent: '#1565c0', paid: '#2e7d32', overdue: '#c62828', cancelled: '#888' };
  const isOverdue = (inv) => inv.status === 'sent' && new Date(inv.due_date) < new Date();

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>🧾 Invoices</h2>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => onNavigate('invoice-create')}>+ New</button>
      </div>

      {/* Summary row */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Outstanding', value: formatMoney(summary.outstandingValue), count: summary.outstanding, color: '#1565c0' },
            { label: 'Overdue',     value: formatMoney(summary.overdueValue),     count: summary.overdue,     color: '#c62828' },
            { label: 'Paid',        value: formatMoney(summary.paidValue),        count: summary.paid,        color: '#2e7d32' },
          ].map(s => (
            <div key={s.label} className="stat-box" style={{ padding: '10px 8px' }}>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--pp-hint)' }}>{s.count} invoice{s.count !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {['all','outstanding','overdue','paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              background: filter === f ? 'var(--pp-primary)' : 'var(--pp-secondary-bg)',
              color: filter === f ? 'white' : 'var(--pp-text)' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="loading-spinner" />}

      {!loading && invoices.length === 0 && (
        <div className="empty-state">
          <span className="emoji">🧾</span>
          <p>No {filter === 'all' ? '' : filter} invoices yet.</p>
        </div>
      )}

      {invoices.map(inv => (
        <div key={inv.id} className="card" style={{ borderLeft: `4px solid ${isOverdue(inv) ? '#c62828' : statusColor[inv.status]}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{inv.client_name}</div>
              <div style={{ fontSize: 12, color: 'var(--pp-hint)', marginTop: 2 }}>{inv.invoice_number}</div>
              <div style={{ fontSize: 12, color: 'var(--pp-hint)' }}>{inv.description?.slice(0, 40)}</div>
              {inv.due_date && (
                <div style={{ fontSize: 11, marginTop: 4, color: isOverdue(inv) ? '#c62828' : 'var(--pp-hint)', fontWeight: isOverdue(inv) ? 600 : 400 }}>
                  {isOverdue(inv) ? '⚠️ Overdue: ' : 'Due: '}{dayjs(inv.due_date).format('DD MMM YYYY')}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{formatMoney(inv.net_amount || inv.amount)}</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: statusColor[inv.status] + '22', color: statusColor[inv.status], fontWeight: 600, textTransform: 'uppercase' }}>
                {isOverdue(inv) ? 'OVERDUE' : inv.status}
              </span>
            </div>
          </div>
          {(inv.status === 'sent' || isOverdue(inv)) && (
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 10, width: '100%' }}
              onClick={async () => {
                const ok = await showConfirm(`Mark invoice ${inv.invoice_number} as paid?`);
                if (!ok) return;
                await markInvoicePaid(inv.id);
                haptic.success();
                load();
              }}
            >
              ✅ Mark as Paid
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
