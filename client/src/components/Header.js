import React from 'react'
import './App_comp.css';

 
function Header(props) {

  const HandleTab_SignUp = () => {
    props.setCurr_tab(2);
  }
  
  const HandleTab_LogIn = () => {
    props.setCurr_tab(1);
  }
  // BOOTSTRAP TEMPLATE NAVBAR

  if (props.curr_tab === 1) {
    return (
      <div>
        
        <nav className="navbar navbar-expand-lg navbar-dark text-uppercase" id='mainNav'>
          <div className="container">
          <span className="navbar-brand">Task Manager</span>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          <button className="nav-item nav-link border border-white rounded nav-button" style={{cursor:"pointer"}} onClick={HandleTab_LogIn}>Log In <span className="sr-only">(current)</span></button>
          <button className="nav-item nav-link nav-button" style={{cursor:"pointer"}} onClick={HandleTab_SignUp}>Sign Up</button>
        </div>
      </div>
      </div>
    </nav>
    </div>
    )
  }
  else {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark text-uppercase" id='mainNav'>
        <div className="container">
          <span className="navbar-brand">Task Manager</span>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          <button className="nav-item nav-link nav-button" style={{cursor:"pointer"}} onClick={HandleTab_LogIn}>Log In</button>
          <button className="nav-item nav-link border border-white rounded nav-button" style={{cursor:"pointer"}} onClick={HandleTab_SignUp}>Sign Up <span className="sr-only">(current)</span></button>
        </div>
      </div>
      </div>
    </nav>
    </div>
    )

  }
}

 
export default Header;