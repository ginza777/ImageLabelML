import React, { useState, useEffect } from 'react';
import { Arrow } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId, print_log } from '../../data.js';

const ArrowDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation, setIsDrawing } = useAnnotation();
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (activeTool !== 'arrow' || !mouseEvent || !selectedClass) return;
    const { type, payload } = mouseEvent;
    const pos = payload.pos;
    let x = Math.max(imageFit.x, Math.min(pos.x, imageFit.x + imageFit.width));
    let y = Math.max(imageFit.y, Math.min(pos.y, imageFit.y + imageFit.height));

    if (type === 'mousedown' && payload.empty && x === pos.x && y === pos.y) {
      setIsDrawing(true);
      setPoints([x, y, x, y]);
      print_log("Arrow drawing started:", { x, y });
    } else if (type === 'mousemove' && points.length > 0) {
      setPoints([points[0], points[1], x, y]);
    } else if (type === 'mouseup' && points.length > 0) {
      setIsDrawing(false);
      const [startX, startY, endX, endY] = [
        (points[0] - imageFit.x) / imageFit.scale,
        (points[1] - imageFit.y) / imageFit.scale,
        (x - imageFit.x) / imageFit.scale,
        (y - imageFit.y) / imageFit.scale
      ];
      if (Math.abs(startX - endX) > 3 || Math.abs(startY - endY) > 3) {
        const newAnnotation = {
          id: generateId(),
          tool: 'arrow',
          class: selectedClass.name,
          points: [startX, startY, endX, endY],
          fill: selectedClass.color,
          stroke: selectedClass.color,
          strokeWidth: 4
        };
        addAnnotation(newAnnotation);
        print_log("Arrow added:", { startX, startY, endX, endY });
      }
      setPoints([]);
      onDrawComplete();
    }
  }, [mouseEvent, activeTool, selectedClass, imageFit, addAnnotation, setIsDrawing, onDrawComplete]);

  if (points.length > 0) {
    return <Arrow points={points} fill={selectedClass?.color} stroke={selectedClass?.color} strokeWidth={4} />;
  }
  return null;
};

export default ArrowDrawer;