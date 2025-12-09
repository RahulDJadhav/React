import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = ({ token, onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}resetPassword.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        onSuccess(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4">Reset Your Password</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3 position-relative">
              <label className="form-label">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '70%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                }}
              />
            </div>

            <div className="mb-3 position-relative">
              <label className="form-label">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '70%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                }}
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;