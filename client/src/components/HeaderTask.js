import React from 'react'

import './App_comp.css';
 
function HeaderTask(props) {

  const Handle_Logoff = () => {
    props.HandleLogoff();
  }
  // BOOTSTRAP TEMPLATE NAVBAR

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
      <button className="nav-item nav-link nav-button" style={{cursor:"pointer"}} onClick={Handle_Logoff}>Log Off</button>
      </div>
    </div>
    </div>
  </nav>
  </div>
  )
}

 
export default HeaderTask;