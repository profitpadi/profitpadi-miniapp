// miniapp/src/components/Settings.jsx
import { useState } from 'react';
import { updateAccount, formatMoney } from '../api';
import { haptic } from '../telegram';
import dayjs from 'dayjs';

const LANGUAGES = [
  { id: 'english', label: '🇬🇧 English' },
  { id: 'pidgin',  label: '🇳🇬 Pidgin English' },
  { id: 'yoruba',  label: 'Yorùbá' },
  { id: 'hausa',   label: 'Hausa' },
  { id: 'igbo',    label: 'Igbo' },
];

const STATES = ['AB','AD','AK','AN','BA','BY','BE','BO','CR','DE','EB','ED','EK','EN','GO','IM','JI','KD','KN','KT','KB','KO','KW','LA','NA','NI','OG','ON','OS','OY','PL','RI','SO','TA','YO','ZA','FC'];
const STATE_NAMES = { AB:'Abia',AD:'Adamawa',AK:'Akwa Ibom',AN:'Anambra',BA:'Bauchi',BY:'Bayelsa',BE:'Benue',BO:'Borno',CR:'Cross River',DE:'Delta',EB:'Ebonyi',ED:'Edo',EK:'Ekiti',EN:'Enugu',GO:'Gombe',IM:'Imo',JI:'Jigawa',KD:'Kaduna',KN:'Kano',KT:'Katsina',KB:'Kebbi',KO:'Kogi',KW:'Kwara',LA:'Lagos',NA:'Nasarawa',NI:'Niger',OG:'Ogun',ON:'Ondo',OS:'Osun',OY:'Oyo',PL:'Plateau',RI:'Rivers',SO:'Sokoto',TA:'Taraba',YO:'Yobe',ZA:'Zamfara',FC:'FCT Abuja' };

export default function Settings({ user, onSave }) {
  const [name,    setName]    = useState(user?.name || '');
  const [bizName, setBizName] = useState(user?.businessName || '');
  const [lang,    setLang]    = useState(user?.language || 'english');
  const [state,   setState]   = useState(user?.state || '');
  const [tin,     setTin]     = useState(user?.tinNumber || '');
  const [hasTIN,  setHasTIN]  = useState(user?.hasTIN || false);
  const [isCAC,   setIsCAC]   = useState(user?.isCACRegistered || false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAccount({ name, business_name: bizName, language: lang, state, hasTIN, tinNumber: tin, isCACRegistered: isCAC });
      haptic.success();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave?.({ name, language: lang, state });
    } catch { haptic.error(); }
    setSaving(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>⚙️ Settings</h2>

      {/* Account info */}
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 700, color: 'var(--pp-hint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Profile</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Business Name (optional)</label>
          <input className="form-input" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Emeka Ventures" />
        </div>
      </div>

      {/* Language */}
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 700, color: 'var(--pp-hint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Language</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => setLang(l.id)}
              style={{ padding: '8px 14px', borderRadius: 999, border: '1.5px solid', cursor: 'pointer',
                borderColor: lang === l.id ? 'var(--pp-primary)' : 'transparent',
                background:  lang === l.id ? 'var(--pp-primary-light)' : 'var(--pp-secondary-bg)',
                color:       lang === l.id ? 'var(--pp-primary)' : 'var(--pp-text)',
                fontWeight:  lang === l.id ? 600 : 400, fontSize: 14 }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* State */}
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 700, color: 'var(--pp-hint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>State</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <select className="form-input" value={state} onChange={e => setState(e.target.value)}>
          <option value="">Select your state</option>
          {STATES.map(s => <option key={s} value={s}>{STATE_NAMES[s]}</option>)}
        </select>
      </div>

      {/* Government / Compliance */}
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 700, color: 'var(--pp-hint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Compliance</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>I have a TIN</div>
            <div style={{ fontSize: 12, color: 'var(--pp-hint)' }}>Prevents WHT from doubling</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
            <input type="checkbox" checked={hasTIN} onChange={e => setHasTIN(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: hasTIN ? 'var(--pp-primary)' : '#ccc', transition: '0.2s' }}>
              <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: hasTIN ? 23 : 3, transition: '0.2s' }} />
            </span>
          </label>
        </div>
        {hasTIN && (
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">TIN Number</label>
            <input className="form-input" value={tin} onChange={e => setTin(e.target.value)} placeholder="Enter your TIN" />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>CAC Registered</div>
            <div style={{ fontSize: 12, color: 'var(--pp-hint)' }}>Business registered with CAC</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
            <input type="checkbox" checked={isCAC} onChange={e => setIsCAC(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: isCAC ? 'var(--pp-primary)' : '#ccc', transition: '0.2s' }}>
              <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: isCAC ? 23 : 3, transition: '0.2s' }} />
            </span>
          </label>
        </div>
      </div>

      {/* Account info */}
      <div className="card" style={{ marginBottom: 20, background: 'var(--pp-primary-light)' }}>
        <div style={{ fontSize: 13, color: 'var(--pp-primary)', fontWeight: 600, marginBottom: 8 }}>Account Info</div>
        <div style={{ fontSize: 13 }}>Plan: <strong>{(user?.tier || 'starter').charAt(0).toUpperCase() + (user?.tier || 'starter').slice(1)}</strong></div>
        <div style={{ fontSize: 13 }}>Wallet: <strong>{formatMoney(user?.walletBalance)}</strong></div>
        <div style={{ fontSize: 13 }}>Referral code: <strong>{user?.referralCode || '—'}</strong></div>
        {user?.tierExpiry && <div style={{ fontSize: 12, color: 'var(--pp-hint)' }}>Expires: {dayjs(user.tierExpiry).format('DD MMM YYYY')}</div>}
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Settings'}
      </button>

      {/* Legal links */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--pp-border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pp-hint)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Legal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '📄 Privacy Policy',   href: '/privacy'    },
            { label: '📋 Terms of Service', href: '/terms'      },
            { label: '⚠️ Disclaimer Policy', href: '/disclaimer' },
          ].map(({ label, href }) => (
            <a key={href} href={`${import.meta.env.VITE_API_URL || ''}${href}`}
               target="_blank" rel="noopener noreferrer"
               style={{ fontSize: 13, color: 'var(--pp-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              {label}
              <span style={{ fontSize: 11, color: 'var(--pp-hint)' }}>↗</span>
            </a>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--pp-hint)', marginTop: 14, lineHeight: 1.5 }}>
          ProfitPadi is a bookkeeping software tool — not a bank, accountant, tax advisor, or financial institution. All estimates are for planning purposes only.
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--pp-hint)', textAlign: 'center', marginTop: 16 }}>
        ✓ Official ProfitPadi — We never ask for your PIN
      </div>
    </div>
  );
}
