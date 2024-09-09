import React, { useState, useEffect } from 'react';

const ImageDataTable = ({ untrainedImages, fetchUntrainedImages, editImageInfo, deleteImage }) => {
  useEffect(() => {
    fetchUntrainedImages();
  }, []);

  const [expandedRow, setExpandedRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedImage, setEditedImage] = useState(null);

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
      analysis: editedImage.classification,
      classification: editedImage.classification
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

  const getImageSrc = (binaryData) => {
    if (binaryData) {
      // Convert binary data to a Blob
      const blob = new Blob([binaryData], { type: 'image/png' }); // Adjust type if necessary

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);


      // Clean up the URL when the component unmounts
      return url;
    }
  };

  return (
    <table className="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th>Person ID</th>
          <th>Upload Date</th>
          <th>Classification</th>
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
                  ? <textarea className="form-control" value={JSON.stringify(editedImage.classification, null, 2)} onChange={(e) => setEditedImage({ ...editedImage, classification: JSON.parse(e.target.value) })}></textarea>
                  : image.classification.toString()}
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
                  <img
                    src={getImageSrc(image.imageData)}
                    alt="Untrained"
                    className="img-fluid"
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default ImageDataTable;