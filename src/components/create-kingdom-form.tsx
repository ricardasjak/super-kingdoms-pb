import React, { useState } from 'react';
import {
  Crown,
  Globe2,
  Sparkles,
  Bot,
  Shuffle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/use-auth.hook';
import { useKingdom } from '../hooks/use-kingdom.hook';
import {
  PLANET_TYPES,
  RACE_TYPES,
  PLANET_INFO,
  RACE_INFO,
  generateRandomBotName,
  type PlanetType,
  type RaceType,
} from '../constants/game.constants';

interface CreateKingdomFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Subordinate bots toggle (disabled per request to create a single kd; code preserved)
const ENABLE_CONNECTED_BOTS = false;

export const CreateKingdomForm: React.FC<CreateKingdomFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { createKingdom, isCreating } = useKingdom();

  const [kdName, setKdName] = useState('');
  const [rulerName, setRulerName] = useState(user?.name || user?.email?.split('@')[0] || '');
  const [planetType, setPlanetType] = useState<PlanetType>('Terra Form');
  const [raceType, setRaceType] = useState<RaceType>('Terran');

  // Subordinate bots list (preserved for when feature is re-enabled)
  const [botNames, setBotNames] = useState<string[]>(() => {
    return Array.from({ length: 5 }, () => generateRandomBotName());
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const randomizeBots = () => {
    const prefix = kdName.trim() || undefined;
    setBotNames(Array.from({ length: 5 }, () => generateRandomBotName(prefix)));
  };

  const updateBotName = (index: number, val: string) => {
    setBotNames((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!kdName.trim()) {
      setError('Please provide a name for your Kingdom.');
      return;
    }
    if (!rulerName.trim()) {
      setError('Please provide a Ruler Name.');
      return;
    }

    try {
      await createKingdom({
        kdName: kdName.trim(),
        rulerName: rulerName.trim(),
        planetType,
        raceType,
        botNames: ENABLE_CONNECTED_BOTS ? botNames.map((n) => n.trim()).filter(Boolean) : [],
      });

      setSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to establish kingdom';
      setError(msg);
    }
  };

  const selectedPlanetInfo = PLANET_INFO[planetType];
  const selectedRaceInfo = RACE_INFO[raceType];

  return (
    <form onSubmit={handleSubmit} className="card create-kd-form-card">
      <div className="create-kd-header">
        <div className="create-kd-icon-wrap">
          <Crown size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h2 className="create-kd-title">Found Your Kingdom</h2>
          <p className="create-kd-desc">
            Stake your sovereign claim, declare your ruler title, and dispatch your expansion fleet.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-feedback error" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="form-feedback success" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={18} />
          <span>Kingdom successfully established! Initializing stellar sector...</span>
        </div>
      )}

      {/* Main Identity Fields */}
      <div className="form-grid-2">
        <div className="form-group">
          <label htmlFor="kdName" className="form-label">
            Kingdom / Empire Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
          </label>
          <div className="input-with-icon">
            <Globe2 size={18} className="input-icon" />
            <input
              id="kdName"
              type="text"
              className="form-input"
              placeholder="e.g. Nova Avalon, Zenith Empire"
              value={kdName}
              onChange={(e) => setKdName(e.target.value)}
              disabled={isCreating || success}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rulerName" className="form-label">
            Ruler Name / Title <span style={{ color: 'var(--accent-rose)' }}>*</span>
          </label>
          <div className="input-with-icon">
            <Crown size={18} className="input-icon" />
            <input
              id="rulerName"
              type="text"
              className="form-input"
              placeholder="e.g. Emperor Sean, Sovereign Vael"
              value={rulerName}
              onChange={(e) => setRulerName(e.target.value)}
              disabled={isCreating || success}
              required
            />
          </div>
        </div>
      </div>

      {/* Planet & Race Selection */}
      <div className="form-grid-2" style={{ marginTop: '1rem' }}>
        {/* Planet Type */}
        <div className="form-group">
          <label htmlFor="planetType" className="form-label">
            Home Planet Type
          </label>
          <select
            id="planetType"
            className="form-input"
            value={planetType}
            onChange={(e) => setPlanetType(e.target.value as PlanetType)}
            disabled={isCreating || success}
          >
            {PLANET_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="selection-preview-box">
            <div className="selection-preview-badge" style={{ borderColor: selectedPlanetInfo.badgeColor, color: selectedPlanetInfo.badgeColor }}>
              {planetType}
            </div>
            <p className="selection-preview-desc">{selectedPlanetInfo.description}</p>
          </div>
        </div>

        {/* Race Type */}
        <div className="form-group">
          <label htmlFor="raceType" className="form-label">
            Primary Species / Race
          </label>
          <select
            id="raceType"
            className="form-input"
            value={raceType}
            onChange={(e) => setRaceType(e.target.value as RaceType)}
            disabled={isCreating || success}
          >
            {RACE_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="selection-preview-box">
            <div className="selection-preview-badge" style={{ borderColor: '#6366f1', color: '#818cf8' }}>
              {raceType} &bull; {selectedRaceInfo.trait}
            </div>
            <p className="selection-preview-desc">{selectedRaceInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Starting Assets Overview */}
      <div className="starter-perks-box">
        <div className="starter-perks-header">
          <Sparkles size={16} color="var(--accent-secondary)" />
          <span>Standard Colonial Starter Pack</span>
        </div>
        <div className="starter-perks-grid">
          <div className="starter-perk-item">
            <span className="starter-num">250</span>
            <span className="starter-lbl">Acres Land</span>
          </div>
          <div className="starter-perk-item">
            <span className="starter-num">2,250</span>
            <span className="starter-lbl">Citizens</span>
          </div>
          <div className="starter-perk-item">
            <span className="starter-num">$300,000</span>
            <span className="starter-lbl">Credits</span>
          </div>
          <div className="starter-perk-item">
            <span className="starter-num">10,000</span>
            <span className="starter-lbl">MWh Power</span>
          </div>
          <div className="starter-perk-item">
            <span className="starter-num">200 Sol</span>
            <span className="starter-lbl">Garrison</span>
          </div>
          <div className="starter-perk-item">
            <span className="starter-num">300 Sci</span>
            <span className="starter-lbl">Research Core</span>
          </div>
        </div>
      </div>

      {/* Subordinate Bot Kingdoms (hidden per user request, code preserved) */}
      {ENABLE_CONNECTED_BOTS && (
        <div className="subordinate-bots-section">
          <div className="subordinate-bots-header">
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="var(--accent-secondary)" />
                Subordinate Protectorate Kingdoms (5 Bots)
              </h4>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                5 vassal realms will be generated under your political sphere of influence.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={randomizeBots}
              disabled={isCreating || success}
            >
              <Shuffle size={14} />
              <span>Randomize Names</span>
            </button>
          </div>

          <div className="bots-input-grid">
            {botNames.map((botName, i) => (
              <div key={i} className="bot-input-group">
                <span className="bot-index-badge">#{i + 1}</span>
                <input
                  type="text"
                  className="form-input bot-input"
                  value={botName}
                  onChange={(e) => updateBotName(i, e.target.value)}
                  placeholder={`Subordinate #${i + 1}`}
                  disabled={isCreating || success}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Actions */}
      <div className="create-kd-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isCreating || success}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isCreating || success}
          style={{ flex: 1 }}
        >
          {isCreating ? (
            <>
              <div className="spinner-small" />
              <span>Establishing Sovereignty...</span>
            </>
          ) : (
            <>
              <Crown size={18} />
              <span>Establish Kingdom</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
