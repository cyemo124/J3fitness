import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, formData);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Password</h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              className="form-input"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center mt-4">
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
