import React, { useState } from 'react';

const ResetPasswordDemo = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleRequestReset = async () => {
    try {
      const response = await fetch(`${API_BASE}requestPasswordReset.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(JSON.stringify(data, null, 2));
      if (data.token) {
        setToken(data.token);
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleTestReset = () => {
    if (token) {
      window.open(`${window.location.origin}?token=${token}`, '_blank');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Reset Password Demo</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to test"
                />
              </div>
              <button 
                className="btn btn-primary mb-3" 
                onClick={handleRequestReset}
                disabled={!email}
              >
                Request Password Reset
              </button>
              
              {token && (
                <div className="mb-3">
                  <button 
                    className="btn btn-success" 
                    onClick={handleTestReset}
                  >
                    Test Reset Link (Opens in new tab)
                  </button>
                </div>
              )}
              
              {message && (
                <div className="alert alert-info">
                  <pre>{message}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordDemo;