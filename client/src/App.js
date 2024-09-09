
import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Body from './components/Body';
import HeaderTask from './components/HeaderTask';
import BodyTask from './components/BodyTask';
import BodyAdmin from './components/BodyAdmin';
import ImageDataTable from './components/ImageDataTable';

const server_ip = 'localhost:3000';




function App() {

  const [true_username, setUsername] = useState("");
  const [loggedin, setLoggedin] = useState(false);
  const [curr_tab, setCurr_tab] = useState(1);
  const [tasks, setTasks] = useState([
    { id: 'task-1', content: 'Task 1', date: new Date() },
    { id: 'task-2', content: 'Task 2', date: new Date() },
    { id: 'task-3', content: 'Task 3', date: new Date() },
  ]);

  const [message, setMessage] = useState('');
  const [alert_type, setAlertType] = useState(-1);

  const [guest, setGuest] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [untrainedImages, setUntrainedImages] = useState([]);



  // every change to current tab, reset alert
  useEffect(() => {
    setAlertType(-1);
  }, [curr_tab])

  const HandleLogin = (username, password) => {
  
    fetch(`http://${server_ip}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
      .then(response => {

        // Handle the response from the server
        if (response.status === 200) {
          // Login successful
          
          return response.json(); // Parse the response body as JSON
        } else if (response.status === 401) {
          // Invalid password
          setMessage('Wrong Password');
          setAlertType(0);
          throw new Error('Wrong password');
        } else if (response.status === 404) {
          // User not found
          setMessage('User not found');
          setAlertType(0);
          throw new Error('User not found');
        } else {
          // Other errors
          console.error('Error occurred:', response.statusText);
          throw new Error('Error occurred');
        }
      })
      .then(data => {
        // Access the parsed data

        setUsername(username);
        setAdmin(data.admin);
        console.log("Admin status:", data.admin);
        
        setLoggedin(true);
        setTasks(data.tasks);
       

      })
      .catch(error => {
        console.error('Error occurred:', error);
      });
  };

  // SERVER SIGNUP
  const HandleSignup = (username, email, password, confirmPassword) => {
    if (username.trim() === '') {
      setMessage('Username cannot be empty!');
      setAlertType(0);
      return;
    }

    if (password.trim() === '') {
      setMessage('Password cannot be empty!');
      setAlertType(0);
      return;
    }

    if (username.includes(' ')) {
      setMessage('Username cannot contain spaces!');
      setAlertType(0);
      return;
    }

    if (username.length >=20) {
      setMessage('Username must not exceed 20 characters!');
      setAlertType(0);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      setAlertType(0);
      return;
    }

    const validateEmail = email => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    };
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      setMessage('Please enter a valid email address');
      setAlertType(0);
      return;
    }


    fetch(`http://${server_ip}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password })
    })
      .then(response => {
        // Handle the response from the server
        if (response.status === 200) {
          // Signup successful
          setMessage('Signup Successful');
          setAlertType(1);

          return response.json(); // Parse the response body as JSON
        } else if (response.status === 401) {
          // Username Taken
          setMessage('Username Already Taken');
          setAlertType(0);
          throw new Error('Username Taken');
        } else {
          // Other errors

          console.error('Error occurred:', response.statusText);
          throw new Error('Error occurred');
        }
      })
      .catch(error => {
        console.error('Error occurred:', error);
      });
  }

  const HandleLogoff = () => {
    setLoggedin(false);
    setGuest(false);
    setAdmin(false);
    setUsername("");
    setTasks([
      { id: 'task-1', content: 'Task 1', date: new Date() },
      { id: 'task-2', content: 'Task 2', date: new Date() },
      { id: 'task-3', content: 'Task 3', date: new Date() },
    ]);
    setMessage('');
    setAlertType(-1);
    setCurr_tab(1);
  };


  const HandleGuest = () => {
    setLoggedin(true);
    setGuest(true);
  }

  const handleUploadImage = (formData) => {
    // Log each entry, including files, but files might not log as expected
    formData.forEach((value, key) => {
      if (key === 'image') {
        console.log(`${key}: [File name: ${value.name}, Type: ${value.type}]`); // Logging file details
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  
    fetch(`http://${server_ip}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        setMessage('Image uploaded and classified successfully');
        setAlertType(1);
        console.log('Upload response:', data);
        return data;
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to upload or classify image');
        setAlertType(0);
        throw error;
      });
  };
  
  const fetchUntrainedImages = () => {
    fetch(`http://${server_ip}/untrained-images`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch untrained images');
      })
      .then(data => {
        setUntrainedImages(data);
      })
      .catch(error => {
        console.error('Error fetching untrained images:', error);
        setMessage('Failed to fetch untrained images');
        setAlertType(0);
      });
  };

  // 2. Edit image information
  const editImageInfo = (imageId, updatedInfo) => {
    fetch(`http://${server_ip}/images/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedInfo)
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to update image information');
      })
      .then(data => {
        setMessage('Image information updated successfully');
        setAlertType(1);
        // Update the untrainedImages state with the new information
        setUntrainedImages(prevImages => 
          prevImages.map(img => img._id === imageId ? { ...img, ...updatedInfo } : img)
        );
      })
      .catch(error => {
        console.error('Error updating image information:', error);
        setMessage('Failed to update image information');
        setAlertType(0);
      });
  };

  // 3. Delete image from the dataset
  const deleteImage = (imageId) => {
    fetch(`http://${server_ip}/images/${imageId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          setMessage('Image deleted successfully');
          setAlertType(1);
          // Remove the deleted image from the untrainedImages state
          setUntrainedImages(prevImages => prevImages.filter(img => img._id !== imageId));
        } else {
          throw new Error('Failed to delete image');
        }
      })
      .catch(error => {
        console.error('Error deleting image:', error);
        setMessage('Failed to delete image');
        setAlertType(0);
      });
  };

  if (!loggedin) {
    return (
      <div className="App">
        <Header curr_tab={curr_tab} setCurr_tab={setCurr_tab}></Header>
        <Body HandleSignup={HandleSignup} curr_tab={curr_tab} setCurr_tab={setCurr_tab} HandleLogin={HandleLogin}
          message={message} alert_type={alert_type} HandleGuest={HandleGuest}></Body>

      </div>
    );
  }

  else {
    if (admin) {
      console.log("Rendering admin page");
      return (
        <div className="App">
          <HeaderTask HandleLogoff={HandleLogoff}></HeaderTask>
          <ImageDataTable 
            untrainedImages={untrainedImages}
            fetchUntrainedImages={fetchUntrainedImages}
            editImageInfo={editImageInfo}
            deleteImage={deleteImage}
            server_ip={server_ip}
          ></ImageDataTable>
        </div>
      );
    }
    else {
      return (
        <div className="App">
          <HeaderTask HandleLogoff={HandleLogoff}></HeaderTask>
          <BodyTask handleUploadImage={handleUploadImage}></BodyTask>
        </div>
      );
    }
  }
}

export default App;

