// src/drawing/tools/PointDrawer.jsx
import { useEffect } from 'react';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId } from '../../data';

const PointDrawer = ({ mouseEvent, imageFit, onDrawComplete }) => { // onDrawComplete ni qabul qilamiz
  const { activeTool, selectedClass, addAnnotation } = useAnnotation();

  useEffect(() => {
    if (!mouseEvent || mouseEvent.type !== 'click' || !mouseEvent.payload.empty || activeTool !== 'point') return;
    if (!selectedClass) return;

    const pos = mouseEvent.payload.pos;
    addAnnotation({
      id: generateId(),
      tool: 'point', class: selectedClass.name,
      x: (pos.x - imageFit.x) / imageFit.scale,
      y: (pos.y - imageFit.y) / imageFit.scale,
      radius: 5, fill: selectedClass.color,
    });

    onDrawComplete(); // <-- Ishimiz tugadi, xabar beramiz
  }, [mouseEvent, activeTool, selectedClass, imageFit, addAnnotation, onDrawComplete]);

  return null;
};
export default PointDrawer;