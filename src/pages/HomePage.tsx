import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '../context/useAuth';
import { checkPbHealth, type PbHealthStatus, POCKETBASE_URL } from '../lib/pocketbase';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [pbHealth, setPbHealth] = useState<PbHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    checkPbHealth().then((status) => {
      if (mounted) {
        setPbHealth(status);
        setIsChecking(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={16} />
          <span>React + React Router + PocketBase</span>
        </div>

        <h1 className="hero-title">Welcome to Super Kingdoms</h1>

        <p className="hero-subtitle">
          A lightweight, reactive full-stack starter with client-side routing,
          secure state management, and an embedded PocketBase backend.
        </p>

        {!isAuthenticated ? (
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">
              <LogIn size={20} />
              <span>Log In</span>
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              <UserPlus size={20} />
              <span>Register New User</span>
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <button
              type="button"
              onClick={logout}
              className="btn btn-danger btn-lg"
            >
              <LogIn size={20} style={{ transform: 'rotate(180deg)' }} />
              <span>Sign Out ({user?.email})</span>
            </button>
          </div>
        )}
      </section>

      {/* Authenticated Dashboard View */}
      {isAuthenticated && user ? (
        <div className="card profile-dashboard">
          <div className="profile-header">
            <div className="profile-avatar">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>Welcome back, {user.name || 'User'}!</h2>
              <p>You are authenticated via PocketBase auth collection.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div className="detail-row">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">{user.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            {user.name && (
              <div className="detail-row">
                <span className="detail-label">Display Name:</span>
                <span className="detail-value">{user.name}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Account Created:</span>
              <span className="detail-value">
                {user.created ? new Date(user.created).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Auth Session:</span>
              <span
                className="detail-value"
                style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}
              >
                Active &amp; Valid
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Unauthenticated Action Cards */
        <div className="actions-grid">
          <Link to="/login" className="action-card">
            <div className="card-icon-bubble">
              <LogIn size={24} />
            </div>
            <h2 className="card-title">Log In</h2>
            <p className="card-desc">
              Already have an account? Sign in with your registered email and password
              to resume your session.
            </p>
            <div className="card-cta">
              <span>Go to Login</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          <Link to="/register" className="action-card">
            <div className="card-icon-bubble" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
              <UserPlus size={24} />
            </div>
            <h2 className="card-title">Register New User</h2>
            <p className="card-desc">
              Create a fresh user record in your PocketBase database with email
              and secure password verification.
            </p>
            <div className="card-cta" style={{ color: 'var(--accent-secondary)' }}>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}

      {/* Backend Status Callout */}
      <div className="backend-banner">
        <div className="backend-banner-left">
          <Database size={20} color="var(--accent-primary)" />
          <div>
            <span>Backend Server: </span>
            <code className="backend-url-code">{POCKETBASE_URL}</code>
            <span style={{ marginLeft: '0.75rem' }}>
              {isChecking ? (
                'Checking connection...'
              ) : pbHealth?.isOnline ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} /> Connected
                </span>
              ) : (
                <span style={{ color: 'var(--accent-amber)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={15} /> Server unreachable (Make sure PocketBase is running)
                </span>
              )}
            </span>
          </div>
        </div>
        {!pbHealth?.isOnline && !isChecking && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Start PocketBase: <code className="backend-url-code">./pocketbase serve</code>
          </div>
        )}
      </div>
    </div>
  );
};
