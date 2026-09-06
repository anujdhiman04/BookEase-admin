import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate, useLocation, Link } from 'react-router-dom';
import { adminApi } from './api';
import type { AdminOverview, AdminProvider, AdminService, AdminUser, CategoryFee } from './types';

const TABS = [
  { to: '/overview', label: 'Dashboard' },
  { to: '/users', label: 'Customers' },
  { to: '/providers', label: 'Providers' },
  { to: '/fees', label: 'Categories' },
  { to: '/catalog', label: 'Bookings' },
  { to: '/overview', label: 'Analytics' },
];

function useSession() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('orbit_admin_token') ?? '');
  const update = (next: string) => {
    setToken(next);
    if (next) localStorage.setItem('orbit_admin_token', next);
    else localStorage.removeItem('orbit_admin_token');
  };
  return { token, setToken: update };
}

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [phone, setPhone] = useState('+919931000001');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [devCode, setDevCode] = useState<string>('');
  const [error, setError] = useState('');

  return (
    <div className="login-shell">
      <div className="panel">
        <h1>BookEase Admin</h1>
        <p>Local-only dashboard for BookEase API.</p>
        {step === 'phone' ? (
          <>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
            <button
              onClick={async () => {
                try {
                  setError('');
                  const res = await adminApi.requestOtp(phone);
                  setDevCode(res._devCode ?? '');
                  setStep('code');
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Request OTP
            </button>
          </>
        ) : (
          <>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter OTP" />
            {!!devCode && <small>Dev OTP: {devCode}</small>}
            <button
              onClick={async () => {
                try {
                  setError('');
                  const res = await adminApi.verifyOtp(phone, code);
                  onLogin(res.token);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Sign In
            </button>
          </>
        )}
        {!!error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

function DashboardLayout({ token, onLogout }: { token: string; onLogout: () => void }) {
  const location = useLocation();
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">Booking Central</div>
          <div className="brand-subtitle">Enterprise Admin</div>
        </div>
        {TABS.map((tab) => (
          <Link key={tab.to} to={tab.to} className={location.pathname === tab.to ? 'active' : ''}>
            {tab.label}
          </Link>
        ))}
        <div className="sidebar-footer">
          <button>Generate Report</button>
          <button className="ghost">Help Center</button>
          <button className="ghost" onClick={onLogout}>Logout</button>
        </div>
      </aside>
      <main className="content">
        <header className="topbar panel">
          <input placeholder="Search data..." />
          <div className="topbar-actions">
            <button className="secondary">Last 30 Days</button>
            <button>Download Report</button>
          </div>
        </header>
        <Outlet context={{ token }} />
        <footer className="app-footer panel">© 2024 Booking Central Enterprise. All rights reserved.</footer>
      </main>
    </div>
  );
}

function OverviewPage({ token }: { token: string }) {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    adminApi
      .overview(token)
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, [token]);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading overview...</p>;
  return (
    <>
      <h2>Global Overview Dashboard</h2>
      <p>Real-time performance monitoring and ecosystem health.</p>
      <div className="metrics">
        <Metric title="Users" value={data.cards.users} />
        <Metric title="Providers" value={data.cards.providers} />
        <Metric title="Services" value={data.cards.services} />
        <Metric title="Bookings" value={data.cards.bookings} />
        <Metric title="Revenue" value={`₹${(data.cards.totalRevenueCents / 100).toLocaleString('en-IN')}`} />
      </div>
      <div className="panel">
        <h3>Booking Status</h3>
        <div className="status-grid">
          {Object.entries(data.bookingStatus).map(([status, count]) => (
            <div className="pill" key={status}>
              <span>{status}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h3>Recent Platform Activity</h3>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>User/Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>New booking confirmed</td><td>Customer 3</td><td>Completed</td></tr>
            <tr><td>Provider payout issued</td><td>Provider Hub 2</td><td>Completed</td></tr>
            <tr><td>Verification request</td><td>Provider Hub 7</td><td>Pending</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsersPage({ token }: { token: string }) {
  const [rows, setRows] = useState<AdminUser[]>([]);
  useEffect(() => {
    adminApi.users(token).then(setRows);
  }, [token]);
  return (
    <>
      <div className="metrics">
        <Metric title="Total Customers" value={rows.length} />
        <Metric title="Active Accounts" value={rows.filter((r) => r.accountStatus === 'active').length} />
        <Metric title="Pending Verification" value={rows.filter((r) => r.accountStatus !== 'active').length} />
      </div>
      <SimpleTable title="Customer Management" rows={rows.map((u) => [u.name, u.phone, u.role, u.accountStatus, 'View'])} headers={['Name', 'Phone', 'Role', 'Status', 'Actions']} />
    </>
  );
}

function ProvidersPage({ token }: { token: string }) {
  const [rows, setRows] = useState<AdminProvider[]>([]);
  useEffect(() => {
    adminApi.providers(token).then(setRows);
  }, [token]);
  return (
    <>
      <div className="metrics">
        <Metric title="Verified Providers" value={rows.filter((r) => r.isActive).length} />
        <Metric title="Pending Reviews" value={Math.max(0, Math.floor(rows.length / 4))} />
        <Metric title="Suspended Accounts" value={rows.filter((r) => !r.isActive).length} />
      </div>
      <SimpleTable title="Provider Management Console" rows={rows.map((p) => [p.name, p.category, p.address, p.isActive ? 'Verified' : 'Suspended', 'Review'])} headers={['Name', 'Category', 'Location', 'Status', 'Actions']} />
    </>
  );
}

function CatalogPage({ token }: { token: string }) {
  const [rows, setRows] = useState<AdminService[]>([]);
  useEffect(() => {
    adminApi.services(token).then(setRows);
  }, [token]);
  return (
    <>
      <div className="metrics">
        <Metric title="Live Services" value={rows.filter((r) => r.isActive).length} />
        <Metric title="Avg Duration" value={`${Math.round(rows.reduce((a, b) => a + b.durationMinutes, 0) / Math.max(1, rows.length))} min`} />
        <Metric title="Avg Price" value={`₹${Math.round(rows.reduce((a, b) => a + b.priceCents, 0) / Math.max(1, rows.length) / 100).toLocaleString('en-IN')}`} />
      </div>
      <SimpleTable title="Global Service Catalog" rows={rows.map((s) => [s.name, `${s.durationMinutes} min`, `₹${(s.priceCents / 100).toLocaleString('en-IN')}`, s.isActive ? 'Active' : 'Hidden'])} headers={['Service', 'Duration', 'Price', 'State']} />
    </>
  );
}

function FeesPage({ token }: { token: string }) {
  const [cfg, setCfg] = useState<{ defaultPlatformFeePercent: number; categories: CategoryFee[] } | null>(null);
  useEffect(() => {
    adminApi.categoriesFees(token).then(setCfg);
  }, [token]);
  if (!cfg) return <p>Loading config...</p>;
  return (
    <div className="panel">
      <h2>Categories & Fees</h2>
      <p>Default platform fee: {cfg.defaultPlatformFeePercent}%</p>
      <SimpleTable
        title="Category fee configuration"
        headers={['Category', 'Fee %', 'State']}
        rows={cfg.categories.map((c) => [c.label, `${c.feePercent}%`, c.isActive ? 'Active' : 'Inactive'])}
      />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SimpleTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <div className="table-controls">
        <select>
          <option>All Categories</option>
          <option>Salon</option>
          <option>Health</option>
          <option>Tech</option>
        </select>
        <select>
          <option>Status: All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, 200).map((row, i) => (
            <tr key={i}>
              {row.map((cell, c) => {
                const normalized = cell.toLowerCase();
                const badgeClass =
                  normalized.includes('active') || normalized.includes('verified') || normalized.includes('completed')
                    ? 'badge badge-success'
                    : normalized.includes('pending')
                      ? 'badge badge-warning'
                      : normalized.includes('suspended') || normalized.includes('hidden') || normalized.includes('inactive')
                        ? 'badge badge-danger'
                        : '';
                return (
                  <td key={`${i}-${c}`}>
                    {badgeClass ? <span className={badgeClass}>{cell}</span> : cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AppRouter() {
  const navigate = useNavigate();
  const { token, setToken } = useSession();
  if (!token) return <LoginScreen onLogin={(next) => { setToken(next); navigate('/overview'); }} />;
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout token={token} onLogout={() => setToken('')} />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage token={token} />} />
        <Route path="/providers" element={<ProvidersPage token={token} />} />
        <Route path="/users" element={<UsersPage token={token} />} />
        <Route path="/catalog" element={<CatalogPage token={token} />} />
        <Route path="/fees" element={<FeesPage token={token} />} />
      </Route>
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
