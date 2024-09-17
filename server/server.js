const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/User');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const XrayImage = require('./models/XrayImage');

const { spawn } = require('child_process');

const fs = require('fs').promises;
const os = require('os');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json());

const mongoURI = "mongodb+srv://test:ljR36wHjImUdTaad@cluster0.flnm2su.mongodb.net/xray?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    },
  });

async function classifyXRay(imageBuffer) {
  const tempFilePath = path.join(os.tmpdir(), `temp_image_${Date.now()}.jpg`);
  
  try {
    await fs.writeFile(tempFilePath, imageBuffer);
    console.log(`Temporary file created at: ${tempFilePath}`);

    await fs.access(tempFilePath);
    console.log('Temporary file exists and is accessible');

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('py', [
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

app.post('/validate-and-classify', upload.single('image'), async (req, res) => {
  console.log('Received validate and classify request');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ 
      message: 'No file uploaded', 
      isValid: false, 
      classification: null
    });
  }

  try {
    console.log('Starting image classification...');
    const classification = await classifyXRay(req.file.buffer);
    console.log('Classification completed:', classification);

    res.json({
      message: 'X-ray classified successfully',
      isValid: classification.is_xray,
      classification: classification.chest_conditions
    });
  } catch (error) {
    console.error('Error during classification:', error);
    res.status(500).json({
      message: 'Error during classification',
      isValid: false,
      classification: null,
      error: error.toString()
    });
  }
});


app.post('/upload-to-dataset', upload.single('imageData'), async (req, res) => {
  console.log('Received upload to dataset request');
  console.log('Request body:', req.body);
  console.log('File:', req.file);

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!req.body.personId || !req.body.finalClassification || !req.body.classification) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'Person ID, final classification, and classification are required' });
  }

  try {
    const newXrayImage = new XrayImage({
      personId: req.body.personId,
      imageData: req.file.buffer,
      contentType: req.file.mimetype,
      size: req.file.size,
      classification: JSON.parse(req.body.classification),
      analysis: 'Untrained',
      finalClassification: req.body.finalClassification,
      uploadDate: new Date()
    });

    console.log('Saving X-ray image to database...');
    await newXrayImage.save();
    console.log('X-ray image saved successfully');

    res.json({
      message: 'X-ray uploaded to dataset successfully',
      file: {
        filename: req.file.originalname,
        id: newXrayImage._id
      }
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({
      message: 'Error processing upload',
      error: error.toString()
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

app.get('/untrained-images', async (req, res) => {
  try {
    const untrainedImages = await XrayImage.find({ analysis: 'Untrained' });
    res.json(untrainedImages);
  } catch (error) {
    console.error('Error fetching untrained images:', error);
    res.status(500).json({ error: 'Failed to fetch untrained images' });
  }
});

app.put('/images/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const updatedInfo = req.body;

  try {
    // Validate imageId
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    const updatedImage = await XrayImage.findByIdAndUpdate(imageId, updatedInfo, { new: true });
    if (!updatedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(updatedImage);
  } catch (error) {
    console.error('Error updating image information:', error);
    res.status(500).json({ error: 'Failed to update image information', details: error.message });
  }
});

// New route: Delete image from the dataset
app.delete('/images/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const deletedImage = await XrayImage.findByIdAndDelete(imageId);
    if (!deletedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});






module.exports = app