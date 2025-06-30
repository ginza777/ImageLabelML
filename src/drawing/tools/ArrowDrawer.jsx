// src/drawing/tools/ArrowDrawer.jsx
import React, { useState, useEffect } from 'react';
import { Arrow } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId } from '../../data.js';

const ArrowDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation, setIsDrawing } = useAnnotation();
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (activeTool !== 'arrow' || !mouseEvent) return;
    const { type, payload } = mouseEvent; const pos = payload.pos;

    if (type === 'mousedown' && payload.empty) {
      if (!selectedClass) return;
      setIsDrawing(true);
      setPoints([pos.x, pos.y, pos.x, pos.y]);
    } else if (type === 'mousemove' && points.length > 0) {
      setPoints([points[0], points[1], pos.x, pos.y]);
    } else if (type === 'mouseup' && points.length > 0) {
      setIsDrawing(false);
      const [startX, startY, endX, endY] = [ (points[0] - imageFit.x) / imageFit.scale, (points[1] - imageFit.y) / imageFit.scale, (pos.x - imageFit.x) / imageFit.scale, (pos.y - imageFit.y) / imageFit.scale ];
      if (Math.abs(startX - endX) > 3 || Math.abs(startY - endY) > 3) {
        addAnnotation({
          id: generateId(), tool: 'arrow', class: selectedClass.name, points: [startX, startY, endX, endY],
          fill: selectedClass.color, stroke: selectedClass.color, strokeWidth: 4,
        });
      }
      setPoints([]);
      onDrawComplete(); // <-- Ishimiz tugadi, xabar beramiz
    }
  }, [mouseEvent]);

  if (points.length > 0) return <Arrow points={points} fill={selectedClass?.color} stroke={selectedClass?.color} strokeWidth={4} />;
  return null;
};
export default ArrowDrawer;