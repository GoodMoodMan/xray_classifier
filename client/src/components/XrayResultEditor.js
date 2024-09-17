import React, { useState, useEffect } from 'react';

function XrayResultEditor({ xrayData, uploadImageToDataset, setCurrentComponent }) {
  const [personId, setPersonId] = useState('');
  const [finalClassification, setFinalClassification] = useState('Normal');
  const [topClassifications, setTopClassifications] = useState([]);

  useEffect(() => {
    if (xrayData) {
      setPersonId(xrayData.personId || '');
      setFinalClassification(xrayData.classification || 'Normal');
      
      // Get the top 3 highest values in classification
      if (xrayData.classification) {
        const sortedClassifications = Object.entries(xrayData.classification)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([key, value]) => ({
            name: key,
            percentage: (value * 100).toFixed(2) // Convert to percentage and format to 2 decimal places
          }));
        setTopClassifications(sortedClassifications);
      }
    }
  }, [xrayData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    
    if (typeof xrayData.imageData === 'string') {
      const byteCharacters = atob(xrayData.imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'image/png'});
      formData.append('imageData', blob, 'image.png');
    } else if (xrayData.imageData && xrayData.imageData.type === 'Buffer') {
      const blob = new Blob([new Uint8Array(xrayData.imageData.data)], {type: 'image/png'});
      formData.append('imageData', blob, 'image.png');
    }
    
    formData.append('personId', personId);
    formData.append('finalClassification', finalClassification);
    formData.append('classification', JSON.stringify(xrayData.classification));

    uploadImageToDataset(formData);
  };

  const handleCancel = () => {
    setCurrentComponent('BodyTask');
  };

  const getImageSrc = (imageData) => {
    if (typeof imageData === 'string') {
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

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Top 3 Classifications</label>
              <ul className="list-group">
                {topClassifications.map((classification, index) => (
                  <li key={index} className="list-group-item">
                    {classification.name}: {classification.percentage}%
                  </li>
                ))}
              </ul>
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
