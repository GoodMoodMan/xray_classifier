import React, { useEffect, useState } from 'react';
import './App_comp.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


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

function BodyAdmin(props) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users list on initial render and every (local) users change
  useEffect(() => {
    fetch(`https://${props.server_ip}/users/admin`)
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  });

  const handleUpdate = () => {
    fetch(`https://${props.server_ip}/users/${selectedUser.username}/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: selectedUser.tasks }),
      })
        .then(response => {
          if (response.ok) {
            props.setAlert(1);
            props.setMessage("Updated User");
        
          } else {
            console.error('Failed to update task list:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
     

      fetch(`https://${props.server_ip}/users/admin`)
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };

  const handleUserSelect = (userId) => {
    const selectedUser = users.find(user => user._id === userId);
    props.setAlert(-1);
    setSelectedUser(selectedUser);
  };

  const handleTaskContentChange = (event, taskId) => {
    const updatedTasks = selectedUser.tasks.map(task => {
      if (task.id === taskId) {
        let text = event.target.value.slice(0,1000);
        return { ...task, content: text };
      }
      return task;
    });
    const updatedUser = { ...selectedUser, tasks: updatedTasks };
    setSelectedUser(updatedUser);
  };

  const handleTaskDateChange = (date, taskId) => {
    const updatedTasks = selectedUser.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, date };
      }
      return task;
    });
    const updatedUser = { ...selectedUser, tasks: updatedTasks };
    setSelectedUser(updatedUser);
  };

  const getMaxID = (taskList) => {
    var id = 0;
    var max_id = 0;
    for (const task of taskList) {
      id = parseInt(task.id.replace(/^\D+/g, ''));
      if (id > max_id) max_id = id;
    }
    return max_id;
  }

  const handleAddTask = () => {
  
    const newTaskId = "Task " + (getMaxID(selectedUser.tasks) + 1);
  
    const newTaskObj = { id: newTaskId, content: 'New Task', date: new Date()};
    const updatedTasks = [...selectedUser.tasks, newTaskObj];
    const updatedUser = { ...selectedUser, tasks: updatedTasks };
    setSelectedUser(updatedUser);
  };


  const handleDeleteTask = (taskId) => {
    const updatedTasks = selectedUser.tasks.filter(task => task.id !== taskId);
    const updatedUser = { ...selectedUser, tasks: updatedTasks };
    setSelectedUser(updatedUser);
  };

  return (
    <div className="container">
      <h3 className="text-center mt-3">All Users</h3>
      <div className="dropdown mt-3">
        <button
          className="btn btn-primary dropdown-toggle "
          type="button"
          id="userDropdown"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Select User
        </button>
        <div className="dropdown-menu " aria-labelledby="userDropdown">
          {users.map(user => (
            <button
              key={user._id}
              className="dropdown-item"
              onClick={() => handleUserSelect(user._id)}
            >
              {user.username}
            </button>
          ))}
        </div>
      </div>
      {selectedUser && (
        <div className="mt-3">
          <h4 className="text-center">User: {selectedUser.username}</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <input
                        type="text"
                        value={task.content}
                        onChange={event => handleTaskContentChange(event, task.id)}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <DatePicker
                        selected={new Date(task.date)}
                        onChange={date => handleTaskDateChange(date, task.id)}
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="btn btn-primary btn-sm "
            onClick={handleAddTask}
          >
            Add Task
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={handleUpdate}
            disabled={!selectedUser || !selectedUser.tasks}
          >
            Update
          </button>
        </div>
      )}
      <div className='mt-4'></div>
      <Alert message = {props.message} alert_type = {props.alert_type}></Alert>
    </div>
  );
}

export default BodyAdmin;
