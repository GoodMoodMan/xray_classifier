import React, { useState } from 'react';
import './App_comp.css';

function BodyTask({ validateAndClassifyImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError('Please select a valid image file (JPEG, PNG, GIF, BMP, or WebP).');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      await validateAndClassifyImage(formData);
      // Note: We don't need to handle the result here as it's managed in App.js
    } catch (error) {
      setError('Failed to validate or classify the image. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="mb-3">
            <input 
              type="file" 
              className="form-control" 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/gif,image/bmp,image/webp"
            />
          </div>
          <div className="mb-3">
            <button 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              Validate and Classify Image
            </button>
          </div>
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BodyTask;