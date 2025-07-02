// src/components/ImageLoader.jsx
import React, { useRef, useEffect } from 'react';
import Konva from 'konva';
import useImage from 'use-image';

function ImageLoader({ imageUrl, stageRef }) {
  const [image] = useImage(imageUrl);
  const layerRef = useRef(null);

  useEffect(() => {
    if (image && stageRef.current && layerRef.current) {
      const stage = stageRef.current;

      const layer = layerRef.current;
      layer.destroyChildren();

      const img = new Konva.Image({
        image: image,
        name: 'image-layer',
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
        listening: false,
      });

      layer.add(img);
      stage.batchDraw();
    }
  }, [image, stageRef]);

  return <Layer ref={layerRef} />;
}

export default ImageLoader;
