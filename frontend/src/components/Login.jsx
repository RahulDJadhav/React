import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AddButton from './AddButton';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
  const API_BASE = 'http://localhost/taskly/taskly/backend/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsPasswordMatch(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    fetch(`${API_BASE}loginUser.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userRole", data.user.role);
          onLogin();
        } else {
          setError(data.message || 'Login failed');
        }
      })
      .catch(() => setError('Something went wrong.'));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setIsPasswordMatch(false);
      setError('Passwords do not match!');
      return;
    }

    fetch(`${API_BASE}signupUser.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          setIsSignup(false); // Switch to login form after successful signup
          setError('');
        } else {
          setError(data.message || 'Signup failed');
        }
      })
      .catch(() => setError('Something went wrong.'));
  };

  return (
    <div className={styles.container}> {/* Using a main container style */}
      <div className={styles.leftPanel}> {/* Left panel for branding/info */}
        <div className="text-center">
          <img
            src="/xts_white.png"
            alt="Logo"
            style={{ width: 300, height: 100, marginBottom: 24 }}
          />
          <h1 className="display-5 fw-bold mb-3">Welcome to Taskly</h1>
          <p className="lead">Your ultimate task management solution.</p>
        </div>
      </div>

      <div className={styles.rightPanel}> {/* Right panel for login/signup form */}
        <div className={styles.card}> {/* Card for the form */}
          <div className="text-center mb-4">
            <h3 className={styles.heading}>
              {isSignup ? 'Create Account' : 'Login'}
            </h3>
            <p className={styles.subText}>
              {isSignup
                ? 'Start your journey with Taskly'
                : 'Login to manage your tasks'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className={styles.form}
          >
            {isSignup && (
              <div className="mb-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Username'
                  required
                  className="form-control"
                />
              </div>
            )}

            <div className="mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Email'
                required
                className="form-control"
              />
            </div>

            {/* <div className="mb-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
                required
                className="form-control"
              />
            </div> */}
            <div className="mb-3" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="form-control"
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                }}
              />
            </div>

            {/* {isSignup && (
              <div className="mb-3">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    confirmPassword
                      ? isPasswordMatch
                        ? styles.match
                        : styles.mismatch
                      : 'form-control'
                  }
                  placeholder='Confirm Password'
                  required
                />
                {!isPasswordMatch && <p className={styles.error}>Passwords do not match!</p>}
              </div>
            )} */}
            {isSignup && (
              <div className="mb-3" style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    confirmPassword
                      ? isPasswordMatch
                        ? styles.match
                        : styles.mismatch
                      : 'form-control'
                  }
                  placeholder="Confirm Password"
                  required
                />
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#888',
                  }}
                />
                {!isPasswordMatch && <p className={styles.error}>Passwords do not match!</p>}
              </div>
            )}


            <AddButton
              type="submit"
              text={isSignup ? 'Sign Up' : 'Login'}
              className="btn w-100 py-2 fw-bold"
              style={{
                backgroundColor: '#4d46e1',
                borderRadius: '8px',
                color: 'white',
              }}
            />

            <div className="text-center mt-3">
              <span
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError(''); // Clear errors when toggling form
                  setIsPasswordMatch(true);
                  setName(''); // Clear form fields on toggle
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className={styles.toggleLink}
              >
                {isSignup
                  ? 'Already have an account? Login'
                  : 'Create a new account'}
              </span>
            </div>

            {!isSignup && (
              <div className="text-center mt-2">
                <a
                  href="#"
                  className={styles.toggleLink}
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
