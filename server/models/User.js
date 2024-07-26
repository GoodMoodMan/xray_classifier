const mongoose = require('mongoose');


// Define the user schema
const userSchema = new mongoose.Schema({
  
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: {type: String, required: false},
  admin: {type: Boolean, required: true},
  // Additional user properties...
});

// Create the User model using the user schema
const User = mongoose.model('User', userSchema);

module.exports = User;