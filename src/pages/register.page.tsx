import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/use-auth.hook';
import { ClientResponseError } from 'pocketbase';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !passwordConfirm) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        passwordConfirm,
        name: name.trim() || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof ClientResponseError) {
        if (err.status === 0) {
          setError(
            'Cannot connect to PocketBase server. Please ensure the backend is running.'
          );
        } else if (err.data && typeof err.data === 'object' && 'data' in err.data) {
          // PocketBase detailed field validation errors
          const fieldErrors = (err.data as { data: Record<string, { message: string }> }).data;
          const firstField = Object.keys(fieldErrors)[0];
          if (firstField && fieldErrors[firstField]?.message) {
            setError(`${firstField}: ${fieldErrors[firstField].message}`);
          } else {
            setError(err.message || 'Registration failed. Please review your input.');
          }
        } else {
          setError(err.message || 'Registration failed.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="card">
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p>Register a new user in your PocketBase database</p>
        </div>

        {error && (
          <div className="form-feedback error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate={false}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              <span>Full Name (Optional)</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                id="register-name"
                name="name"
                type="text"
                className="input-control"
                placeholder="Arthur Pendragon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              <span>Email Address *</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                id="register-email"
                name="email"
                type="email"
                className="input-control"
                placeholder="arthur@camelot.realm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              <span>Password * (min 8 chars)</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="new-password"
                name="new-password"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-confirm">
              <span>Confirm Password *</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password-confirm"
                name="password-confirm"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: '1rem' }}
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="auth-footer-prompt">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
};
