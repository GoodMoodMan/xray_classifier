import React, { useState } from 'react';
import './App_comp.css';

function XRayUploader({ handleUploadImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [classification, setClassification] = useState(null);
  const [error, setError] = useState(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setClassification(null);
      setError(null);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setClassification(null);
      setError('Please select a valid image file (JPEG, PNG, GIF, BMP, or WebP).');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    try {
      await handleUploadImage(selectedFile);
      // After successful upload, you might want to get the classification from the server
      // For now, we'll just set a placeholder classification
      setClassification('Image uploaded successfully. Awaiting classification...');
    } catch (error) {
      setError('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">X-Ray Classification System</h1>
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
              Upload and Classify Image
            </button>
          </div>
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          {previewUrl && (
            <div className="mb-3">
              <img src={previewUrl} alt="Preview" className="img-fluid" />
            </div>
          )}
          {classification && (
            <div className="alert alert-info">
              Classification: {classification}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default XRayUploader;