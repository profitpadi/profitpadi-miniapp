// miniapp/src/components/Reports.jsx
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { getPnLReport, getMonthlyTrend, formatMoney } from '../api';
import dayjs from 'dayjs';

const COLORS = ['#008751','#4caf50','#81c784','#a5d6a7','#FFD700','#ff9800','#f44336','#e91e63','#9c27b0'];

export default function Reports({ user }) {
  const [report,  setReport]  = useState(null);
  const [trend,   setTrend]   = useState([]);
  const [tab,     setTab]     = useState('month'); // month | year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = dayjs().startOf('month').toISOString();
    const end   = dayjs().toISOString();
    Promise.all([getPnLReport(start, end), getMonthlyTrend(6)])
      .then(([r, t]) => { setReport(r); setTrend(t?.months || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16 }}><div className="loading-spinner" /></div>;

  const incomeData  = (report?.incomeByCategory  || []).map(c => ({ name: c.category?.replace(/_/g,' ') || 'Other', value: parseFloat(c.total) }));
  const expenseData = (report?.expenseByCategory || []).map(c => ({ name: c.category?.replace(/_/g,' ') || 'Other', value: parseFloat(c.total) }));

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📈 Reports</h2>

      {/* Summary cards */}
      <div className="stat-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {[
          { label: 'Income',   value: report?.income,       className: 'income'  },
          { label: 'Expenses', value: report?.expenses,     className: 'expense' },
          { label: 'Profit',   value: report?.grossProfit,  className: report?.isProfit ? 'income' : 'expense' },
        ].map(s => (
          <div key={s.label} className="stat-box" style={{ padding: '10px 8px' }}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.className}`} style={{ fontSize: 14 }}>{formatMoney(s.value)}</div>
          </div>
        ))}
      </div>

      {/* 6-month bar chart */}
      {trend.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Monthly Profit Trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={trend} margin={{ left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatMoney(v)} />
              <Bar dataKey="income"  fill="#008751" name="Income"  radius={[3,3,0,0]} />
              <Bar dataKey="expenses" fill="#f44336" name="Expenses" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income by category donut */}
      {incomeData.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Income by Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={incomeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {incomeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatMoney(v)} />
            </PieChart>
          </ResponsiveContainer>
          {incomeData.slice(0, 4).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(d.value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expense by category donut */}
      {expenseData.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Expenses by Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {expenseData.map((_, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatMoney(v)} />
            </PieChart>
          </ResponsiveContainer>
          {expenseData.slice(0, 4).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[(i + 4) % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(d.value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Export buttons */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--pp-hint)', marginBottom: 10 }}>
          {user?.tier === 'starter' ? '₦100 per export on free plan' : 'Export included in your plan'}
        </div>
        <div className="btn-row">
          <a href="#" className="btn btn-secondary" style={{ textDecoration: 'none' }}
            onClick={e => { e.preventDefault(); window.open(`${import.meta.env.VITE_API_URL}/reports/export/pdf`); }}>
            📄 Export PDF
          </a>
          <a href="#" className="btn btn-secondary" style={{ textDecoration: 'none' }}
            onClick={e => { e.preventDefault(); window.open(`${import.meta.env.VITE_API_URL}/reports/export/excel`); }}>
            📊 Export Excel
          </a>
        </div>
      </div>
    </div>
  );
}
