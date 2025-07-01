import { useEffect } from 'react';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId, print_log } from '../../data.js';

const PointDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation } = useAnnotation();

  useEffect(() => {
    if (!mouseEvent || mouseEvent.type !== 'click' || !mouseEvent.payload.empty || activeTool !== 'point' || !selectedClass) return;
    const pos = mouseEvent.payload.pos;
    if (pos.x < imageFit.x || pos.x > imageFit.x + imageFit.width || pos.y < imageFit.y || pos.y > imageFit.y + imageFit.height) return;

    const xInImage = (pos.x - imageFit.x) / imageFit.scale;
    const yInImage = (pos.y - imageFit.y) / imageFit.scale;
    const newAnnotation = {
      id: generateId(),
      tool: 'point',
      class: selectedClass.name,
      x: xInImage,
      y: yInImage,
      radius: 5,
      fill: selectedClass.color
    };
    addAnnotation(newAnnotation);
    onDrawComplete();
    print_log("Point added:", { x: xInImage, y: yInImage });
  }, [mouseEvent, activeTool, selectedClass, imageFit, addAnnotation, onDrawComplete]);

  return null;
};

export default PointDrawer;