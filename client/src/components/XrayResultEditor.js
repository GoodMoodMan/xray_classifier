import React, { useState, useEffect } from 'react';

function XrayResultEditor({ xrayData, uploadImageToDataset, setCurrentComponent }) {
  const [personId, setPersonId] = useState('');
  const [finalClassification, setFinalClassification] = useState('Normal');
  
  useEffect(() => {
    if (xrayData) {
      setPersonId(xrayData.personId || '');
      setFinalClassification(xrayData.classification || 'Normal');
    }
  }, [xrayData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Create a new FormData object
    const formData = new FormData();
    
    // Append the image data
    if (typeof xrayData.imageData === 'string') {
      // If it's a base64 string, convert it to a Blob
      const byteCharacters = atob(xrayData.imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'image/png'});
      formData.append('imageData', blob, 'image.png');
    } else if (xrayData.imageData && xrayData.imageData.type === 'Buffer') {
      // If it's a Buffer, convert it to a Blob
      const blob = new Blob([new Uint8Array(xrayData.imageData.data)], {type: 'image/png'});
      formData.append('imageData', blob, 'image.png');
    }
    
    // Append other data
    formData.append('personId', personId);
    formData.append('finalClassification', finalClassification);
    formData.append('classification', JSON.stringify(xrayData.classification));

    // Call uploadImageToDataset with the FormData
    uploadImageToDataset(formData);
  };

  const handleCancel = () => {
    setCurrentComponent('BodyTask');
  };

  const getImageSrc = (imageData) => {
    if (typeof imageData === 'string') {
      // If imageData is already a base64 string
      return `data:image/png;base64,${imageData}`;
    } else if (imageData && imageData.type === 'Buffer' && Array.isArray(imageData.data)) {
      try {
        const uint8Array = new Uint8Array(imageData.data);
        const blob = new Blob([uint8Array], { type: 'image/png' });
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error creating image URL:', error);
        return null;
      }
    } else {
      console.warn('Unexpected image data format:', imageData);
      return null;
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Image Section */}
          <div className="col-md-6">
            <div className="mb-3">
              <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
                {xrayData && xrayData.imageData ? (
                  <img
                    src={getImageSrc(xrayData.imageData)}
                    alt="X-ray Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div>No image available</div>
                )}
              </div>
            </div>
          </div>

          {/* Classification Info */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Original Classification</label>
              <input 
                type="text" 
                className="form-control" 
                value={xrayData ? JSON.stringify(xrayData.classification) || '' : ''}
                readOnly 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="personId" className="form-label">Person ID</label>
              <input 
                type="text" 
                id="personId" 
                className="form-control" 
                value={personId} 
                onChange={(e) => setPersonId(e.target.value)} 
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="finalClassification" className="form-label">Final Classification</label>
              <select 
                id="finalClassification" 
                className="form-select" 
                value={finalClassification} 
                onChange={(e) => setFinalClassification(e.target.value)} 
                required
              >
                <option value="Normal">Normal</option>
                <option value="Pneumonia">Pneumonia</option>
                <option value="COVID-19">COVID-19</option>
                <option value="Tuberculosis">Tuberculosis</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-success me-2">
            Submit
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default XrayResultEditor;