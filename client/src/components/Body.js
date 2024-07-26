import React from 'react'

import Loginform from './Login'
import Signupform from './Signup'
import './App_comp.css';

function Alert(props) {
  if (props.alert_type === -1) {
    return (
      <div></div>
    )
  }
  else {
    return (
      <div className = {`alert ${props.alert_type === 1 ? 'alert-success' : 'alert-danger'}`} role="alert">
        {`${props.message}`}
      </div>
    )
  }
}

function Body(props) {
  
  if (props.curr_tab === 1) {
    return (
      <div id='BodyS'>
        <Loginform HandleLogin={props.HandleLogin} setMessage = {props.setMessage} setAlertType = {props.setAlertType} HandleGuest = {props.HandleGuest}></Loginform>
        <Alert message = {props.message} alert_type = {props.alert_type}></Alert>
      </div>
    );
  }
  else if (props.curr_tab === 2) {
    return (
      <div id='BodyS'>
        <Signupform HandleSignup={props.HandleSignup} setMessage = {props.setMessage} setAlertType = {props.setAlertType}></Signupform>
        <Alert message = {props.message} alert_type = {props.alert_type}></Alert>
      </div>
    )
  }
}

export default Body;