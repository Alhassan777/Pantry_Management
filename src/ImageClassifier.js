// src/ImageClassifier.js
import React, { useRef, useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

const ImageClassifier = ({ addItemToPantry }) => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const imageRef = useRef();

  const loadModelAndClassify = async () => {
    const model = await mobilenet.load();
    const predictions = await model.classify(imageRef.current);
    setPrediction(predictions[0]);
    addItemToPantry(predictions[0].className); // Automatically add the detected item to the pantry
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div>
      <h3>Upload an Image</h3>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <div>
          <img
            src={image}
            alt="Uploaded"
            ref={imageRef}
            onLoad={loadModelAndClassify}
            style={{ maxWidth: '300px' }}
          />
          {prediction && (
            <div>
              <h4>Prediction: {prediction.className}</h4>
              <p>Probability: {(prediction.probability * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
