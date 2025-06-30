// src/drawing/tools/BoxDrawer.jsx
import React, { useState, useEffect } from 'react';
import { Rect } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId } from '../../data.js';

const BoxDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation, setIsDrawing } = useAnnotation();
  const [newBox, setNewBox] = useState(null);

  useEffect(() => {
    if (activeTool !== 'box' || !mouseEvent) return;
    const { type, payload } = mouseEvent; const pos = payload.pos;
    if (type === 'mousedown' && payload.empty) {
      if (!selectedClass) return;
      setIsDrawing(true);
      setNewBox({ x: pos.x, y: pos.y, width: 0, height: 0, fill: `${selectedClass.color}4D`, stroke: selectedClass.color, strokeWidth: 2, startX: pos.x, startY: pos.y });
    } else if (type === 'mousemove' && newBox) {
      setNewBox({ ...newBox, x: Math.min(newBox.startX, pos.x), y: Math.min(newBox.startY, pos.y), width: Math.abs(pos.x - newBox.startX), height: Math.abs(pos.y - newBox.startY) });
    } else if (type === 'mouseup' && newBox) {
      setIsDrawing(false);
      if (newBox.width > 3 && newBox.height > 3) {
        addAnnotation({
          id: generateId(), tool: 'box', class: selectedClass.name,
          x: (newBox.x - imageFit.x) / imageFit.scale, y: (newBox.y - imageFit.y) / imageFit.scale,
          width: newBox.width / imageFit.scale, height: newBox.height / imageFit.scale,
          fill: `${selectedClass.color}4D`, stroke: selectedClass.color, strokeWidth: 2,
        });
      }
      setNewBox(null);
      onDrawComplete(); // <-- Ishimiz tugadi, xabar beramiz
    }
  }, [mouseEvent]);

  if (newBox) return <Rect {...newBox} />;
  return null;
};
export default BoxDrawer;