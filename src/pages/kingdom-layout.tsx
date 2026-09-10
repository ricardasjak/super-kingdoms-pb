import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { useGameStatus } from "../hooks/use-game-status.hook";
import { useKingdomMessage } from "../context/kingdom-message.context";
import { SelfTickButton } from "../components/self-tick-button";
import {
  calculateLevel,
  calculateMaxDefPotential,
  calculateMaxOffPotential,
  calculateMinDefPotential,
  SpyReportSOK,
} from "../components/spy-report-sok";
import { AlertCircle, CheckCircle } from "lucide-react";

export const KingdomLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { kingdom, isLoading, deleteKingdom, refetch } = useKingdom();
  const { status: gameStatus, refetch: refetchStatus } = useGameStatus();
  const { message, messageType, showMessage, clearMessage } = useKingdomMessage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleQuickRelease = async () => {
    try {
      await deleteKingdom();
      navigate("/create");
    } catch (error) {
      console.error("Failed to release kingdom", error);
    }
  };

  if (isLoading) {
    return (
      <div className="card loading-placeholder" style={{ margin: "4rem auto", maxWidth: "400px", textAlign: "center" }}>
        <div className="spinner-large" />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
          Synchronizing Kingdom Telemetry...
        </p>
      </div>
    );
  }

  if (!kingdom) {
    return (
      <div className="card" style={{ maxWidth: "540px", margin: "4rem auto", textAlign: "center" }}>
        <h2>No Active Realm</h2>
        <p style={{ color: "var(--text-secondary)", margin: "1rem 0" }}>
          You do not command a kingdom in this galaxy yet.
        </p>
        <Link to="/create" className="btn btn-primary">
          Found a Kingdom
        </Link>
      </div>
    );
  }

  // Fallen Kingdom State
  if (kingdom.state === "dead") {
    const mil = kingdom.military || {
      sol: 0, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 0
    };
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "3rem", padding: "0 1rem" }}>
        <article className="card" style={{ borderColor: "var(--accent-rose)", maxWidth: "800px", margin: "0 auto 2rem" }}>
          <header style={{ backgroundColor: "rgba(244, 63, 94, 0.15)", padding: "1rem", borderRadius: "8px 8px 0 0" }}>
            <h2 style={{ margin: 0, color: "var(--accent-rose)" }}>OFFICIAL NOTICE</h2>
          </header>
          <h1 style={{ color: "var(--accent-rose)", fontSize: "2.4rem", margin: "1.5rem 0" }}>
            YOUR KINGDOM HAS FALLEN
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
            The population of <strong>{kingdom.kdName}</strong> has been completely eradicated.
            A sovereign empire cannot persist without its citizens.
          </p>
          <footer style={{ marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={handleQuickRelease}
              className="btn btn-danger btn-lg"
            >
              Abdicate & Start Over
            </button>
          </footer>
        </article>

        <div style={{ textAlign: "left", maxWidth: "800px", margin: "0 auto" }}>
          <SpyReportSOK
            kdName={kingdom.kdName}
            rulerName={kingdom.rulerName}
            planetType={kingdom.planetType}
            raceType={kingdom.raceType}
            level={calculateLevel(kingdom.land)}
            land={kingdom.land}
            networth={kingdom.nw}
            honor={0}
            money={kingdom.money}
            population={kingdom.population}
            power={kingdom.power}
            probes={kingdom.probes || 0}
            scientists={mil.sci || 0}
            maProtection={0}
            military={mil as Record<string, number>}
            maxDefPotential={calculateMaxDefPotential(mil)}
            maxOffPotential={calculateMaxOffPotential(mil)}
            minDefPotential={calculateMinDefPotential(mil)}
          />
        </div>
      </div>
    );
  }

  const isPopDying =
    (kingdom.popChange || 0) < 0 &&
    kingdom.population + 3 * (kingdom.popChange || 0) <= 0;

  const navLinks = [
    { to: "/kingdom/status", label: "Status" },
    { to: "/kingdom/growth", label: "Growth" },
    { to: "/kingdom/explore", label: "Explore" },
    { to: "/kingdom/military", label: "Military" },
    { to: "/kingdom/research", label: "Research" },
    { to: "/kingdom/targets", label: "Targets" },
    { to: "/kingdom/reports", label: "Reports" },
    { to: "/kingdom/profile", label: "Profile" },
  ];

  return (
    <div className="kingdom-shell">
      {/* ─── Kingdom Telemetry Header ─── */}
      <header className="kingdom-header">
        <div className="container">
          <div className="top-stats-nav">
            <div className="brand-container">
              <strong className="kd-name-brand">{kingdom.kdName}</strong>
              <span className="kd-ruler-sub" style={{ marginLeft: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                (Lord {kingdom.rulerName})
              </span>
            </div>

            <ul className="stats-list">
              {gameStatus && (
                <li className="game-tick-info" title="Round and Tick">
                  <strong>R{gameStatus.roundNumber}</strong>, T{gameStatus.currentTick} / {gameStatus.endTick}
                </li>
              )}
              <li className="desktop-only-stat" title="Treasury Balance">
                <span className="text-secondary">$</span> {kingdom.money.toLocaleString()}
              </li>
              <li title="Territory Land and Estimated Networth">
                <span className="text-secondary">L:</span> {kingdom.land.toLocaleString()} (
                {Math.round(kingdom.nw / 1000)}k NW)
              </li>
              <li
                className={isPopDying ? "danger-text" : ""}
                title="Sovereign Population"
              >
                <span className="text-secondary">P:</span> {kingdom.population.toLocaleString()}
                {(kingdom.popChange || 0) !== 0 && (
                  <small style={{ marginLeft: "4px", color: (kingdom.popChange || 0) > 0 ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                    ({(kingdom.popChange || 0) > 0 ? `+${kingdom.popChange}` : kingdom.popChange})
                  </small>
                )}
              </li>
              <li title="Power Storage">
                <span className="text-secondary">W:</span> {kingdom.power.toLocaleString()} MWh
              </li>
            </ul>
          </div>

          {/* Navigation bar */}
          <nav className={`main-nav ${isMenuOpen ? "open" : ""}`}>
            <div className="mobile-only-footer-stats">
              <strong>$: {kingdom.money.toLocaleString()}</strong>
            </div>

            <div className="mobile-toggle-wrap mobile-footer-toggle">
              <button
                type="button"
                className="hamburger-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle kingdom menu"
              >
                <span className={`hamburger-icon ${isMenuOpen ? "open" : ""}`} />
              </button>
            </div>

            <ul className="nav-links">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={isActive ? "active-link" : ""}
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        color: isActive ? "var(--accent-primary)" : undefined,
                        fontWeight: isActive ? 600 : undefined,
                        borderBottom: isActive ? "2px solid var(--accent-primary)" : undefined,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="nav-actions">
              <li>
                <SelfTickButton
                  newbiemode={kingdom.newbiemode}
                  gamePhase={gameStatus?.status}
                  showText={true}
                  onError={(msg) => showMessage(msg, "error")}
                  onSuccess={() => {
                    refetch();
                    refetchStatus();
                  }}
                />
              </li>
            </ul>
          </nav>
        </div>

        {/* Floating Message Notification */}
        {message && (
          <div
            className="toast-alert"
            style={{
              position: "fixed",
              top: "1.25rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              minWidth: "320px",
              maxWidth: "500px",
              padding: "0.75rem 1.25rem",
              backgroundColor: "rgba(15, 23, 42, 0.96)",
              backdropFilter: "blur(12px)",
              color:
                messageType === "error"
                  ? "var(--accent-rose)"
                  : messageType === "warning"
                  ? "var(--accent-amber)"
                  : "var(--accent-emerald)",
              border: `1px solid ${
                messageType === "error"
                  ? "var(--accent-rose)"
                  : messageType === "warning"
                  ? "var(--accent-amber)"
                  : "var(--accent-emerald)"
              }`,
              borderRadius: "8px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
            onClick={clearMessage}
          >
            {messageType === "error" ? (
              <AlertCircle size={20} />
            ) : messageType === "warning" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            <div>
              <strong>
                {messageType === "error"
                  ? "Error"
                  : messageType === "warning"
                  ? "Warning"
                  : "Success"}
                :{" "}
              </strong>
              <span>{message}</span>
            </div>
          </div>
        )}
      </header>

      {/* ─── Child Sub-Page Content ─── */}
      <main className="container" style={{ paddingBottom: "4rem" }}>
        <Outlet />
      </main>
    </div>
  );
};
