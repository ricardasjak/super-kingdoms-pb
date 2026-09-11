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
  Crown,
  Globe2,
  Bot,
  TrendingUp,
} from 'lucide-react';

import { useAuth } from '../context/use-auth.hook';
import { useKingdom } from '../hooks/use-kingdom.hook';
import { useGameStatus } from '../hooks/use-game-status.hook';
import { SelfTickButton } from '../components/self-tick-button';
import { BotProfileChip } from '../components/bot-profile-chip';
import { AutoBuildToggle } from '../components/auto-build-toggle';
import { KingdomCard } from '../components/kingdom-card';
import { CreateKingdomForm } from '../components/create-kingdom-form';
import { checkPbHealth, type PbHealthStatus, POCKETBASE_URL } from '../lib/pocketbase';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { kingdom, hasKingdom, isLoading: kdLoading, refetch } = useKingdom();
  const { status: gameStatus } = useGameStatus();
  const [tickError, setTickError] = useState<string | null>(null);
  const [pbHealth, setPbHealth] = useState<PbHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [inlineCreateOpen, setInlineCreateOpen] = useState<boolean>(false);

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
    <div className="home-container">
      {/* ─── UNAUTHENTICATED STATE ─── */}
      {!isAuthenticated ? (
        <>
          <section className="hero-section">
            <div className="hero-pill">
              <Sparkles size={16} />
              <span>Interstellar Tick-Based Strategy Engine</span>
            </div>

            <h1 className="hero-title">Command Your Empire Across the Cosmos</h1>

            <p className="hero-subtitle">
              Colonize alien biomes, manage sovereign economies, conduct espionage,
              and command subordinate protectorates in a persistent full-stack realm.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                <LogIn size={20} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                <UserPlus size={20} />
                <span>Register New Ruler</span>
              </Link>
            </div>
          </section>

          {/* Feature Highlights Grid */}
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Globe2 size={24} />
              </div>
              <h3>14 Planetary Biomes</h3>
              <p>
                From Mountainous and Volcanic Infernos to Mystical Lands, each planet
                shapes your empire's terrain, capacity, and energy dynamics.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                <Sparkles size={24} />
              </div>
              <h3>7 Unique Species</h3>
              <p>
                Lead the Ancients, Terran, Xivornai, Shadow, and more — each with
                specialized racial advantages in combat, science, or commerce.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Bot size={24} />
              </div>
              <h3>Vassal Protectorates</h3>
              <p>
                Every sovereign kingdom commands 5 subordinate autonomous realms
                expanding under your galactic sphere of influence.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <TrendingUp size={24} />
              </div>
              <h3>Deep Economic Simulation</h3>
              <p>
                Manage power grids, residential housing, space markets, probe factories,
                and tax income with every simulated game tick.
              </p>
            </div>
          </div>
        </>
      ) : (
        /* ─── AUTHENTICATED STATE ─── */
        <div className="auth-home-content">
          {kdLoading ? (
            <div className="card loading-placeholder">
              <div className="spinner-large" />
              <p className="text-secondary" style={{ marginTop: '1rem' }}>
                Synchronizing realm intelligence...
              </p>
            </div>
          ) : !hasKingdom ? (
            /* ─── AUTHENTICATED BUT NO KINGDOM ─── */
            <div className="no-kd-wrapper">
              <div className="card no-kd-card">
                <div className="no-kd-badge">
                  <Crown size={32} color="#f59e0b" />
                </div>
                <h2>No Sovereign Kingdom Found</h2>
                <p className="no-kd-desc">
                  Welcome, <strong>{user?.name || user?.email}</strong>. Your sovereign account is ready,
                  but you haven't founded a kingdom yet. Claim your territory and start ruling among the stars!
                </p>

                <div className="no-kd-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => setInlineCreateOpen((prev) => !prev)}
                  >
                    <Crown size={20} />
                    <span>{inlineCreateOpen ? 'Hide Founding Form' : 'Found Your Kingdom Now'}</span>
                    <ArrowRight size={18} />
                  </button>
                  <Link to="/create" className="btn btn-secondary btn-lg">
                    <span>Dedicated Creation Screen</span>
                  </Link>
                </div>
              </div>

              {/* Seamless Inline Creation Form */}
              {inlineCreateOpen && (
                <div style={{ marginTop: '2rem' }}>
                  <CreateKingdomForm
                    onSuccess={() => {
                      setInlineCreateOpen(false);
                      refetch();
                    }}
                    onCancel={() => setInlineCreateOpen(false)}
                  />
                </div>
              )}
            </div>
          ) : (
            /* ─── AUTHENTICATED WITH ACTIVE KINGDOM ─── */
            <div className="active-kd-wrapper">
              <div className="section-header-row">
                <div>
                  <h1 className="page-heading">Command Deck</h1>
                  <p className="page-subheading">
                    Live telemetry for the sovereign realm of <strong>{kingdom?.kdName}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {kingdom && (
                    <>
                      <AutoBuildToggle />
                      {kingdom.autoBuild && (
                        <BotProfileChip label={kingdom.botSettings?.label} />
                      )}
                      <SelfTickButton
                        newbiemode={kingdom.newbiemode}
                        gamePhase={gameStatus?.status}
                        className="btn-sm"
                        onError={(msg) => setTickError(msg)}
                        onSuccess={() => {
                          setTickError(null);
                          refetch();
                        }}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => refetch()}
                    title="Refresh telemetry"
                  >
                    <Sparkles size={15} />
                    <span>Refresh Telemetry</span>
                  </button>
                </div>
              </div>

              {tickError && (
                <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderColor: "var(--accent-rose)", color: "var(--accent-rose)" }}>
                  <strong>Self-tick failed:</strong> {tickError}
                </div>
              )}

              {kingdom && <KingdomCard kingdom={kingdom} onRefresh={refetch} />}
            </div>
          )}

          {/* User Account Session Info */}
          <div className="card profile-dashboard" style={{ marginTop: '2rem' }}>
            <div className="profile-header">
              <div className="profile-avatar">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <h2>Ruler Account: {user?.name || user?.email}</h2>
                <p>Authenticated via PocketBase Auth Collection</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div className="detail-row">
                <span className="detail-label">User Record ID:</span>
                <span className="detail-value">{user?.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Kingdom Status:</span>
                <span className="detail-value" style={{ color: hasKingdom ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 600 }}>
                  {hasKingdom ? `Active (${kingdom?.kdName})` : 'Unfounded'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Created:</span>
                <span className="detail-value">
                  {user?.created ? new Date(user.created).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={logout}
                className="btn btn-danger btn-sm"
              >
                <LogIn size={16} style={{ transform: 'rotate(180deg)' }} />
                <span>Sign Out ({user?.email})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backend Status Callout */}
      <div className="backend-banner" style={{ marginTop: '3rem' }}>
        <div className="backend-banner-left">
          <Database size={20} color="var(--accent-primary)" />
          <div>
            <span>PocketBase Engine: </span>
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
                  <AlertCircle size={15} /> Server unreachable (Ensure PocketBase is running)
                </span>
              )}
            </span>
          </div>
        </div>
        {!pbHealth?.isOnline && !isChecking && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Start PocketBase: <code className="backend-url-code">./pb/pocketbase serve</code>
          </div>
        )}
      </div>
    </div>
  );
};
