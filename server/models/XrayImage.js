const mongoose = require('mongoose');

const XrayImageSchema = new mongoose.Schema({
  personId: {
    type: String,
    required: true
  },
  imageData: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  classification: {
    type: Object,
    default: {}
  },
  analysis: {
    type: String,
    default: 'Pending'
  },
  finalClassification: {
    type: String,
    enum: ['Normal', 'Pneumonia', 'COVID-19', 'Tuberculosis', 'Other'],
    required: true
  }
});

module.exports = mongoose.model('XrayImage', XrayImageSchema);