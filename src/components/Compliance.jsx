// miniapp/src/components/Compliance.jsx
import { useState, useEffect } from 'react';
import { getComplianceAssessment, getFilingGuide, formatMoney } from '../api';

export default function Compliance({ user, onNavigate }) {
  const [data,    setData]    = useState(null);
  const [guide,   setGuide]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview'); // overview | guide | deadlines

  useEffect(() => {
    getComplianceAssessment()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadGuide = async (type) => {
    const g = await getFilingGuide(type);
    setGuide(g);
    setTab('guide');
  };

  if (loading) return <div style={{ padding: 16 }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>📋 Govt Obligations</h2>
      <p style={{ fontSize: 13, color: 'var(--pp-hint)', marginBottom: 16 }}>No surprises — just preparation.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['overview','guide','deadlines'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
              background: tab === t ? 'var(--pp-primary)' : 'var(--pp-secondary-bg)',
              color: tab === t ? 'white' : 'var(--pp-text)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && data && (
        <>
          {/* Exemption status */}
          {data.isFullyExempt ? (
            <div className="exempt-badge" style={{ marginBottom: 16 }}>
              🎉 FULLY EXEMPT
              <div className="sub">Your income is below the ₦12M threshold — zero obligation!</div>
            </div>
          ) : (
            <div className="card" style={{ borderLeft: '4px solid var(--pp-warning)' }}>
              <div style={{ fontSize: 13, color: 'var(--pp-hint)', marginBottom: 4 }}>Estimated Annual Obligation</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{formatMoney(data.presumptiveTax?.taxAmount)}</div>
              <div style={{ fontSize: 12, color: 'var(--pp-hint)', marginTop: 4 }}>1% of gross annual turnover • Save {formatMoney(data.monthlySavingsRecommended)}/month</div>
            </div>
          )}

          {/* TIN warning */}
          {!user?.hasTIN && (
            <div className="card" style={{ borderLeft: '4px solid var(--pp-danger)', background: '#fff5f5' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pp-danger)', marginBottom: 4 }}>⚠️ No TIN Detected</div>
              <div style={{ fontSize: 12 }}>Without a TIN, any WHT deducted from your payments is DOUBLED. Get your free TIN at firs.gov.ng</div>
            </div>
          )}

          {/* Next steps */}
          {data.nextSteps?.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Your Next Steps</div>
              {data.nextSteps.slice(0, 4).map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--pp-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.action}</div>
                    <div style={{ fontSize: 12, color: 'var(--pp-hint)', marginTop: 2 }}>{s.why}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <button className="btn btn-primary" onClick={() => onNavigate('savings')} style={{ marginBottom: 10 }}>🏦 Add to Savings Jar</button>
          <button className="btn btn-secondary" onClick={() => loadGuide('tin')}>📋 How to Get TIN (Free)</button>
        </>
      )}

      {tab === 'guide' && guide && (
        <div>
          <button onClick={() => setTab('overview')} style={{ background: 'none', border: 'none', color: 'var(--pp-link)', fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>◀️ Back</button>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{guide.title}</h3>
          {guide.disclaimer && (
            <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#7B5800', lineHeight: 1.5 }}>
              {guide.disclaimer}
            </div>
          )}
          {guide.steps?.map(s => (
            <div key={s.step} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pp-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.action}</div>
                  <div style={{ fontSize: 13, color: 'var(--pp-hint)', marginTop: 4 }}>{s.detail}</div>
                </div>
              </div>
            </div>
          ))}
          {guide.authority && <div style={{ fontSize: 12, color: 'var(--pp-hint)', marginTop: 8 }}>Authority: {guide.authority} • Cost: {guide.cost}</div>}
        </div>
      )}

      {tab === 'deadlines' && (
        <div>
          {[
            { label: 'PIT Annual Return',  date: 'March 31',  authority: 'NRS (formally FIRS)/State IRS' },
            { label: 'CAC Annual Return',  date: 'June 30',   authority: 'CAC' },
            { label: 'VAT Monthly Return', date: '21st/month',authority: 'NRS (formally FIRS) (if VAT registered)' },
            { label: 'PAYE Remittance',    date: '10th/month',authority: 'State IRS (if you have staff)' },
          ].map(d => (
            <div key={d.label} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.label}</div>
                <div style={{ fontSize: 12, color: 'var(--pp-hint)' }}>{d.authority}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pp-primary)' }}>{d.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
