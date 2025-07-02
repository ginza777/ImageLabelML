import React, { useEffect, useContext } from 'react';
import { AnnotationContext } from '../../core/AnnotationContext';
import { generateId } from '../../utils/helpers';

const PointDrawer = ({ stageRef, annotationsLayerRef }) => {
  const { activeTool, selectedClass, imageUrl, addAnnotation, transform } = useContext(AnnotationContext);

  useEffect(() => {
    if (activeTool !== 'point') return;

    const stage = stageRef.current;
    const layer = annotationsLayerRef.current;

    if (!stage || !layer || !selectedClass || transform.scale === 0) return;

    const handleClick = (e) => {
      if (e.target !== stage) return;

      const pos = layer.getRelativePointerPosition();
      if (!pos) return;

      // Normalize coordinates to original image size
      const normalizedPos = {
        x: Math.min(Math.max(pos.x / transform.scale, 0), transform.originalWidth),
        y: Math.min(Math.max(pos.y / transform.scale, 0), transform.originalHeight),
      };

      const annotation = {
        id: generateId(),
        type: 'point',
        x: normalizedPos.x,
        y: normalizedPos.y,
        class: selectedClass.name,
        color: selectedClass.color,
        imageId: imageUrl,
      };
      addAnnotation(annotation);
    };

    stage.on('mousedown', handleClick);

    return () => {
      stage.off('mousedown', handleClick);
    };
  }, [activeTool, selectedClass, imageUrl, addAnnotation, stageRef, annotationsLayerRef, transform]);

  return null;
};

export default PointDrawer;