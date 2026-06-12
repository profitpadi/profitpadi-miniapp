// miniapp/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getDailyTotals, getMonthlyTrend, getRecentTransactions, formatMoney } from '../api';

export default function Dashboard({ user, onNavigate }) {
  const [daily,  setDaily]  = useState(null);
  const [trend,  setTrend]  = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDailyTotals(),
      getMonthlyTrend(6),
      getRecentTransactions(8)
    ]).then(([d, t, r]) => {
      setDaily(d);
      setTrend(t?.months || []);
      setRecent(r?.transactions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 60 }} />
    </div>
  );

  const profit      = daily?.profit || 0;
  const isPositive  = profit >= 0;

  return (
    <div style={{ padding: 16 }}>
      {/* Today's Profit Card */}
      <div className="profit-card">
        <div className="label">Today's Profit</div>
        <div className="amount">{formatMoney(Math.abs(profit))}</div>
        <div className="period">{isPositive ? '📈 Profitable day!' : '📉 Loss today'}</div>
      </div>

      {/* Income / Expense row */}
      <div className="stat-row">
        <div className="stat-box income">
          <div className="stat-label">Income</div>
          <div className="stat-value">{formatMoney(daily?.income)}</div>
        </div>
        <div className="stat-box expense">
          <div className="stat-label">Expenses</div>
          <div className="stat-value">{formatMoney(daily?.expenses)}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="btn-row" style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => onNavigate('income')}>💰 Add Income</button>
        <button className="btn btn-secondary" onClick={() => onNavigate('expense')}>💸 Add Expense</button>
      </div>

      {/* 6-month trend chart */}
      {trend?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">6-Month Trend</span>
            <span style={{ fontSize: 12, color: 'var(--pp-hint)' }}>Profit</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={trend} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="profit" fill="var(--pp-primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent transactions */}
      {recent.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions</span>
            <button onClick={() => onNavigate('transactions')} style={{ background: 'none', border: 'none', color: 'var(--pp-link)', fontSize: 12, cursor: 'pointer' }}>See all</button>
          </div>
          {recent.map(tx => (
            <div key={tx.id} className="tx-item">
              <div>
                <div className="tx-desc">{tx.description || tx.category?.replace(/_/g,' ') || 'Transaction'}</div>
                <div className="tx-meta">{tx.category?.replace(/_/g,' ')} • {new Date(tx.date).toLocaleDateString('en-GB')}</div>
              </div>
              <div className={`tx-amount ${tx.type === 'income' ? 'tx-income' : 'tx-expense'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier badge */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <span className={`tier-badge tier-${user?.tier || 'starter'}`}>
          {(user?.tier || 'starter').charAt(0).toUpperCase() + (user?.tier || 'starter').slice(1)} Plan
        </span>
        {user?.tier === 'starter' && (
          <button onClick={() => onNavigate('upgrade')} style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: 'var(--pp-link)', fontSize: 13, cursor: 'pointer' }}>
            ⭐ Upgrade for unlimited features
          </button>
        )}
      </div>
    </div>
  );
}
