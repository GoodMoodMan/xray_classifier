import React, { useState } from 'react';
import './App_comp.css';

function BodyTask({ handleUploadImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  const [personId, setPersonId] = useState('');
  const [classification, setClassification] = useState('');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedImage(null);
      setError(null);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadedImage(null);
      setError('Please select a valid image file (JPEG, PNG, GIF, BMP, or WebP).');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }
  
    if (!personId) {
      setError('Please enter a Person ID.');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('personId', personId);
  
      // You can remove the classification field from here if it's not relevant at this stage
      // formData.append('classification', classification);
  
      const result = await handleUploadImage(formData);
      setUploadedImage(result);
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
            <label htmlFor="personId" className="form-label">Person ID</label>
            <input 
              type="text" 
              className="form-control" 
              id="personId"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              placeholder="Enter Person ID"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="classification" className="form-label">Classification</label>
            <input 
              type="text" 
              className="form-control" 
              id="classification"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              placeholder="Enter Classification"
            />
          </div>
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
              disabled={!selectedFile || !personId}
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
          {uploadedImage && (
            <div className="mt-4">
              <h3>Uploaded Image Information</h3>
              <ul className="list-group">
                <li className="list-group-item">ID: {uploadedImage._id}</li>
                <li className="list-group-item">Person ID: {uploadedImage.personId}</li>
                <li className="list-group-item">Content Type: {uploadedImage.contentType}</li>
                <li className="list-group-item">Size: {uploadedImage.size} bytes</li>
                <li className="list-group-item">Upload Date: {new Date(uploadedImage.uploadDate).toLocaleString()}</li>
                <li className="list-group-item">
                  Classification: 
                  <pre>{JSON.stringify(uploadedImage.classification, null, 2)}</pre>
                </li>
                <li className="list-group-item">Analysis Status: {uploadedImage.analysis}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BodyTask;