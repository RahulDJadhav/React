import React, { useState } from 'react';
import './DragDropComponent.css';

function DragDropComponent() {
  const [containers, setContainers] = useState({
    1: null,
    2: null,
    3: null,
    4: null
  });

  const [userImages, setUserImages] = useState([
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400'
  ]);
  const [imageCounter, setImageCounter] = useState(0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImages(prev => [...prev, event.target.result]);
        setImageCounter(prev => prev + 1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDragStart = (e, imageUrl) => {
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, containerId) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl) {
      setContainers(prev => ({
        ...prev,
        [containerId]: imageUrl
      }));
    }
  };

  const clearContainer = (containerId) => {
    setContainers(prev => ({
      ...prev,
      [containerId]: null
    }));
  };



  return (
    <div className="app">
      <div className="canvas-area">
        <h2>Canvas Area (80%)</h2>
        <div className="grid-container">
          {[1, 2, 3, 4].map(id => (
            <div
              key={id}
              className="drop-zone"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, id)}
            >
              {containers[id] ? (
                <>
                  <img 
                    src={containers[id]} 
                    alt={`Container ${id}`}
                  />
                  <button 
                    className="clear-btn"
                    onClick={() => clearContainer(id)}
                  >
                    ×
                  </button>
                </>
              ) : (
                <p>Drop image here</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="options-panel">
        <h2>Options (20%)</h2>
        <div className="image-options">
          <h3>Images</h3>
          <div className="upload-section">
            <label htmlFor="image-upload" className="upload-btn">
              + Select Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          {userImages.map((img, index) => (
            <div
              key={index}
              className="draggable-image"
              draggable
              onDragStart={(e) => handleDragStart(e, img)}
            >
              <img src={img} alt={`Sample ${index + 1}`} draggable="false" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DragDropComponent;
