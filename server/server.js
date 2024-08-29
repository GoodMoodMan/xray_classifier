
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/User');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const XrayImage = require('./models/XrayImage');

const crypto = require('crypto');
const axios = require('axios');

const { spawn } = require('child_process');

const fs = require('fs').promises;
const os = require('os');


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(cors());

app.use(express.json());

const mongoURI = "mongodb+srv://test:ljR36wHjImUdTaad@cluster0.flnm2su.mongodb.net/test3?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);


const ImageSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  imageData: Buffer,
  classification: Object
});


const Image = mongoose.model('Image', ImageSchema);

const upload = multer({
  storage: multer.memoryStorage()
});

async function classifyXRay(imageBuffer) {
  const tempFilePath = path.join(os.tmpdir(), `temp_image_${Date.now()}.jpg`);
  
  try {
    await fs.writeFile(tempFilePath, imageBuffer);
    console.log(`Temporary file created at: ${tempFilePath}`);

    // Check if the file exists
    await fs.access(tempFilePath);
    console.log('Temporary file exists and is accessible');

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(__dirname, 'xray_classifier.py'),
        tempFilePath
      ]);

      let result = '';
      let debugInfo = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
        console.log('Python script output:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        debugInfo += data.toString();
        console.error('Python script error:', data.toString());
      });

      pythonProcess.on('close', async (code) => {
        console.log('Python script execution completed with code:', code);
        console.log('Full debug info:', debugInfo);
        console.log('Full result:', result);

        // Clean up the temporary file
        try {
          await fs.unlink(tempFilePath);
          console.log('Temporary file deleted');
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }

        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${debugInfo}`));
        } else {
          try {
            const parsedResult = JSON.parse(result);
            console.log('Parsed result:', parsedResult);
            resolve(parsedResult);
          } catch (e) {
            console.error('Failed to parse Python output:', result);
            reject(new Error(`Failed to parse Python output: ${result}`));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in classifyXRay:', error);
    throw error;
  }
}

// Add this new route for image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  if (req.file) {
    console.log('File received:', req.file.originalname);
    try {
      console.log('Starting image classification...');
      const classification = await classifyXRay(req.file.buffer);
      console.log('Classification completed:', classification);

      const newImage = new Image({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        imageData: req.file.buffer,
        classification: classification
      });

      console.log('Saving image to database...');
      await newImage.save();
      console.log('Image saved successfully');

      res.json({
        message: 'X-ray classified and uploaded successfully',
        file: {
          filename: req.file.originalname,
          id: newImage._id
        },
        classification: classification
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({
        message: 'Error processing upload',
        error: error.toString()
      });
    }
  } else {
    console.log('No file uploaded');
    res.status(400).json({
      message: 'No file uploaded'
    });
  }
});


// Route to retrieve an image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// login verification

app.post('/users/login', (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).json(({
      body: "OK"
    }))
  }

  const { username, password } = req.body;
  console.log(username);
  User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (password !== user.password) {
        return res.status(401).json({ error: 'Invalid password' });
      }


      res.json(user);
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


// signup user post
app.post('/users/signup', (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).json(({
      body: "OK"
    }))
  }

  const { username, email, password } = req.body;
  console.log(username);
  User.findOne({ username })
    .then(existingUser => {
      if (existingUser) {
        // Username already taken
        return res.status(401).json({ error: 'Username Taken' });
      }

      else {
        const newUser = new User({
          username: username,
          password: password,
          email: email,
          
          admin: false
        });
        newUser.save();
        return res.status(200).send('Signup Successful');
      }
    })

    .catch(error => {
      console.error('Error signing up user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    });
});


app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});


// task list update
// 
// app.put('/users/:username/tasks', (req, res) => {
//   if (req.method === 'OPTIONS') {
//     return res.status(200).json(({
//       body: "OK"
//     }))
//   }

//   const { username } = req.params;
//   const { tasks } = req.body;
//   console.log("START");
//   User.findOneAndUpdate(
//     { username: username }, // criteria to find the user
//     { $set: { tasks: tasks } }, // Update operation
//     { new: true } // Options: Return the updated document
//   )
//     .then(updatedUser => {
//       if (updatedUser) {
//         // User found and updated successfully
//         console.log('User tasks updated:', updatedUser);
//         console.log("Finish Update");
//         res.status(200).send('Task list updated successfully');
//       } else {
//         // User not found
//         console.log('User not found');
//         res.status(404).json({ error: 'User not found' });
//       }
//     })
//     .catch(error => {
//       // Error occurred
//       console.log('Error updating user tasks:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     });

// });
// GET all users for admin
app.get('/users/admin', (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).json(({
      body: "OK"
    }))
  }

  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// PUT route to update the User collection with the complete user list
// app.put('/users/admin', (req, res) => {
//   if (req.method === 'OPTIONS') {
//     return res.status(200).json({
//       body: 'OK',
//     });
//   }

//   const userList = req.body;

//   User.deleteMany({}) // Remove all existing users
//     .then(() => {
//       return User.insertMany(userList); // Insert the new user list
//     })
//     .then(() => {
//       res.status(200).send('User list updated successfully');
//     })
//     .catch(error => {
//       console.error('Error updating user list:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     });
// });




module.exports = app