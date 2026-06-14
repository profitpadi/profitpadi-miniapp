// miniapp/src/App.jsx
import { useState, useEffect } from 'react';
import { authenticate } from './api';
import { initTelegram, getTelegramUser } from './telegram';
import Dashboard    from './components/Dashboard';
import AddIncome    from './components/AddIncome';
import AddExpense   from './components/AddExpense';
import Reports      from './components/Reports';
import Compliance   from './components/Compliance';
import Invoices     from './components/Invoices';
import SavingsJar   from './components/SavingsJar';
import Upgrade      from './components/Upgrade';
import Settings     from './components/Settings';
import AppHeader    from './components/AppHeader';
import './styles/theme.css';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Home',      icon: '🏠' },
  { id: 'reports',    label: 'Reports',   icon: '📈' },
  { id: 'compliance', label: 'Govt',      icon: '📋' },
  { id: 'savings',    label: 'Savings',   icon: '🏦' },
  { id: 'settings',   label: 'Settings',  icon: '⚙️' },
];

export default function App() {
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        initTelegram();
        let authData;
for (let i = 0; i < 3; i++) {
  try {
    authData = await authenticate();
    break;
  } catch {
    if (i < 2) await new Promise(r => setTimeout(r, 1000));
  }
}
if (!authData) throw new Error('Auth failed after retries');
setUser(authData.user);
      } catch (e) {
        // In development without Telegram, create a mock user
        if (import.meta.env.DEV) {
          setUser({ name: 'Test User', tier: 'starter', language: 'english', telegramId: '12345' });
        } else {
          setError('Failed to authenticate. Please open ProfitPadi from Telegram.');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const navigate = (p) => setPage(p);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="loading-spinner" />
      <div style={{ fontSize: 14, color: 'var(--pp-hint)' }}>Loading ProfitPadi...</div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Authentication Error</div>
        <div style={{ fontSize: 13, color: 'var(--pp-hint)' }}>{error}</div>
      </div>
    </div>
  );

  const sharedProps = { user, onNavigate: navigate };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard    {...sharedProps} />;
      case 'income':        return <AddIncome    onSuccess={() => navigate('dashboard')} onCancel={() => navigate('dashboard')} />;
      case 'expense':       return <AddExpense   onSuccess={() => navigate('dashboard')} onCancel={() => navigate('dashboard')} />;
      case 'reports':       return <Reports      {...sharedProps} />;
      case 'compliance':    return <Compliance   {...sharedProps} />;
      case 'invoices':      return <Invoices     {...sharedProps} />;
      case 'savings':       return <SavingsJar   {...sharedProps} />;
      case 'upgrade':       return <Upgrade      {...sharedProps} />;
      case 'settings':      return <Settings     {...sharedProps} onSave={u => setUser(prev => ({ ...prev, ...u }))} />;
      default:              return <Dashboard    {...sharedProps} />;
    }
  };

  const mainNavPages = ['dashboard','reports','compliance','savings','settings'];
  const showBottomNav = mainNavPages.includes(page);

  // Pages that show the full header vs compact
  const compactHeaderPages = ['income','expense','invoices','upgrade'];

  return (
    <div className="app-container">
      <AppHeader compact={compactHeaderPages.includes(page)} />
      {renderPage()}

      {showBottomNav && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
