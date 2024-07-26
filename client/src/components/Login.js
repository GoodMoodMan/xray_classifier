import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './App_comp.css';

function Loginform(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const onUpdateUsername = (e) => {
    setUsername(e.target.value);
  };

  const onUpdatePassword = (e) => {
    setPassword(e.target.value);
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    props.HandleLogin(username, password);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };



  const handleResetPassword = () => {
    const isValidEmail = validateEmail(email);

    if (isValidEmail) {

      alert("A password reset link has been sent to the provided email address");
      closeModal();
    } else {
      setEmailError("Please enter a valid email address");
    }
  };

  const validateEmail = email => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  return (
    <div className="Loginform tab-content">
      <div className="container mt-5 py-3">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="mt-5">
              <h2 className="text-center mb-4 me-4 fw-bold mb-2 text-uppercase">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                <span className="login-heading ">Login</span>
              </h2>
              <form onSubmit={onSubmitForm}>
                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="form2Example1"
                    className="form-control form-control-lg"
                    value={username}
                    onChange={onUpdateUsername}
                    placeholder="Username"
                  />
                </div>
                <div className="form-outline mb-4 position-relative">
                  <div className='input-group'>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="form2Example2"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={onUpdatePassword}
                      placeholder="Password"
                    />
                    <button
                      className={`btn btn-outline-secondary ${showPassword ? "active" : ""
                        }`}
                      type="button"
                      onClick={toggleShowPassword}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                </div>
                <div className="row mb-4 align-items-center">
                  <div className="col d-flex justify-content-center">
                    
                  </div>

                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={openModal}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block mb-4"
                >
                  Sign in
                </button>
              </form>
              <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={props.HandleGuest}
                >
                  Enter as Guest
                </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show"
          tabIndex="-1"
          role="dialog"
          style={{ display: 'block' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                />
              </div>
              <div className="modal-body">
                <p>Enter your email address to reset your password:</p>
                <input
                  type="email"
                  className={`form-control mb-3 ${emailError ? 'is-invalid' : ''}`}
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loginform;
