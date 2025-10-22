import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '../components/icons';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error('Please fix password requirements');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        toast.success('Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="text-center">
          <h2 className="auth-title">
            Create your account
          </h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link href="/login" className="link">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="auth-form-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="form-label">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="icon" />
                  ) : (
                    <EyeIcon className="icon" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="password-requirements">
                  <p className="requirements-title">Password requirements:</p>
                  {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character'].map((req, index) => {
                    const isValid = !passwordErrors.includes(req);
                    return (
                      <div key={index} className={`requirement-item ${isValid ? 'valid' : 'invalid'}`}>
                        <span className="requirement-icon">{isValid ? '✓' : '✗'}</span>
                        {req}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="icon" />
                  ) : (
                    <EyeIcon className="icon" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="error-text">Passwords do not match</p>
              )}
            </div>

            <div className="checkbox-group">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="form-checkbox"
                disabled={loading}
              />
              <label htmlFor="terms" className="checkbox-label">
                I agree to the{' '}
                <Link href="/terms" className="link">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="link">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || passwordErrors.length > 0}
                className={`btn-primary full-width ${(loading || passwordErrors.length > 0) ? 'disabled' : ''}`}
              >
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="auth-divider-section">
            <div className="divider">
              <div className="divider-line"></div>
              <div className="divider-text">
                <span>Already have an account?</span>
              </div>
            </div>

            <div className="secondary-action">
              <Link
                href="/login"
                className="btn-secondary full-width"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

        <div className="back-link">
          <Link
            href="/"
            className="link-subtle"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}