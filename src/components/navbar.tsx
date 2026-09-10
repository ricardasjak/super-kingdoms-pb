import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, UserPlus, LogOut, User, Crown, Settings2 } from 'lucide-react';
import { useAuth } from '../context/use-auth.hook';
import { useKingdom } from '../hooks/use-kingdom.hook';
import { checkPbHealth, type PbHealthStatus, POCKETBASE_URL } from '../lib/pocketbase';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { hasKingdom } = useKingdom();
  const navigate = useNavigate();
  const [health, setHealth] = useState<PbHealthStatus>({
    isOnline: false,
    message: 'Connecting to PocketBase...',
  });

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const status = await checkPbHealth();
      if (isMounted) {
        setHealth(status);
      }
    };

    check();
    const interval = setInterval(check, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" className="brand-logo">
            <div className="brand-badge">
              <ShieldCheck size={22} />
            </div>
            <span>Super Kingdoms</span>
          </Link>

          {isAuthenticated && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {hasKingdom ? (
                <Link
                  to="/kingdom/status"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Crown size={15} color="var(--accent-amber)" />
                  <span>Kingdom Deck</span>
                </Link>
              ) : (
                <Link
                  to="/create"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Crown size={15} color="var(--accent-amber)" />
                  <span>Found Kingdom</span>
                </Link>
              )}

              <Link
                to="/admin"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Settings2 size={15} />
                <span>Admin</span>
              </Link>
            </nav>
          )}
        </div>

        <div className="nav-actions">
          {/* PocketBase status badge */}
          <div
            className="status-pill"
            title={`PocketBase: ${POCKETBASE_URL} (${health.message})`}
          >
            <span className={`status-dot ${health.isOnline ? 'online' : 'offline'}`} />
            <span>PB: {health.isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                <User size={15} color="var(--accent-primary)" />
                <span style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                title="Sign out"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary">
                <LogIn size={16} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="btn btn-primary">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
