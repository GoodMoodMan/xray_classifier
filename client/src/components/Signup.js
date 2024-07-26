import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './App_comp.css';

function Signupform(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email,setEmail] = useState('');

  const onUpdateUsername = (e) => {
    setUsername(e.target.value);
  };

  const onUpdatePassword = (e) => {
    setPassword(e.target.value);
  };

  const onUpdateConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const onUpdateEmail = (e) => {
    setEmail(e.target.value);
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    props.HandleSignup(username, email, password, confirmPassword);
  };

  return (
    <div className="Signupform tab-content">
      <div className="container mt-5 py-3">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="mt-5">
              <h2 className="text-center mb-4 me-4 fw-bold mb-2 text-uppercase">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                <span className="login-heading">Sign Up</span>
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
                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="form2Example4"
                    className="form-control form-control-lg"
                    value={email}
                    onChange={onUpdateEmail}
                    placeholder="Email"
                  />
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form2Example2"
                    className="form-control form-control-lg"
                    value={password}
                    onChange={onUpdatePassword}
                    placeholder="Password"
                  />
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form2Example3"
                    className="form-control form-control-lg"
                    value={confirmPassword}
                    onChange={onUpdateConfirmPassword}
                    placeholder="Confirm Password"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signupform;
