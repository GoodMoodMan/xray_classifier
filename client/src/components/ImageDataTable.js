import React, { useState, useEffect } from 'react';

const ImageDataTable = ({ untrainedImages, fetchUntrainedImages, editImageInfo, deleteImage, downloadUntrainedImages }) => {
  useEffect(() => {
    fetchUntrainedImages();
  }, []);

  const [expandedRow, setExpandedRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedImage, setEditedImage] = useState(null);

  const classificationOptions = ['Normal', 'Pneumonia', 'COVID-19', 'Tuberculosis', 'Other'];

  const handleRowClick = (index) => {
    if (!editMode || editedImage._id !== untrainedImages[index]._id) {
      setExpandedRow(expandedRow === index ? null : index);
    }
  };

  const handleEdit = (image) => {
    setEditedImage({ ...image });
    setEditMode(true);
  };

  const handleSave = () => {
    editImageInfo(editedImage._id, {
      personId: editedImage.personId,
      finalClassification: editedImage.finalClassification
    });
    setEditMode(false);
    setEditedImage(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedImage(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImage(id);
    }
  };

  const getImageSrc = (imageData) => {
    if (imageData && imageData.type === 'Buffer' && Array.isArray(imageData.data)) {
      try {
        const uint8Array = new Uint8Array(imageData.data);
        const blob = new Blob([uint8Array], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        return url;
      } catch (error) {
        console.error('Error creating image URL:', error);
        return null;
      }
    } else {
      console.warn('Unexpected image data format:', imageData);
      return null;
    }
  };

  // New function to call the fine-tuning API
  const runFineTune = () => {
    fetch(`http://${server_ip}/finetune`, {
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fine-tune the model');
      })
      .then(data => {
        setMessage('Fine-tuning completed successfully');
        setAlertType(1); // Success
        console.log('Fine-tuning output:', data.output);
      })
      .catch(error => {
        console.error('Error during fine-tuning:', error);
        setMessage('Fine-tuning failed');
        setAlertType(0); // Failure
      });
  };

  return (
    <div>
      <div className="mb-3">
        <button 
          className="btn btn-primary" 
          onClick={downloadUntrainedImages}
        >
          Download Untrained Images
        </button>

        {/* New button to trigger fine-tuning */}
        <button 
          className="btn btn-secondary ml-2" 
          onClick={runFineTune}
        >
          Run Fine-tune
        </button>
      </div>
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            <th>Person ID</th>
            <th>Upload Date</th>
            <th>Final Classification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {untrainedImages.map((image, index) => (
            <React.Fragment key={image._id}>
              <tr onClick={() => handleRowClick(index)}>
                <td>
                  {editMode && editedImage._id === image._id
                    ? <input type="text" className="form-control" value={editedImage.personId} onChange={(e) => setEditedImage({ ...editedImage, personId: e.target.value })} />
                    : image.personId}
                </td>
                <td>{new Date(image.uploadDate).toLocaleDateString()}</td>
                <td>
                  {editMode && editedImage._id === image._id
                    ? (
                      <select 
                        className="form-control"
                        value={editedImage.finalClassification}
                        onChange={(e) => setEditedImage({ ...editedImage, finalClassification: e.target.value })}
                      >
                        {classificationOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )
                    : image.finalClassification}
                </td>
                <td>
                  {editMode && editedImage._id === image._id
                    ? (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
                      </>
                    )
                    : (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleEdit(image); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(image._id); }}>Delete</button>
                      </>
                    )}
                </td>
              </tr>
              {expandedRow === index && !editMode && (
                <tr>
                  <td colSpan="4">
                    <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
                      <img
                        src={getImageSrc(image.imageData)}
                        alt="Untrained"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImageDataTable;
