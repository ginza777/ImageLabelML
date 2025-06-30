// src/drawing/tools/BoxDrawer.jsx

import React, { useState, useEffect } from 'react';
import { Rect } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';

const BoxDrawer = ({ mouseEvent, imageFit }) => {
  const { activeTool, selectedClass, addAnnotation, setIsDrawing } = useAnnotation();
  const [newBox, setNewBox] = useState(null);

  useEffect(() => {
    if (activeTool !== 'box' || !mouseEvent) return;

    const { type, payload } = mouseEvent;
    const pos = payload.pos;

    if (type === 'mousedown' && payload.empty) {
      if (!selectedClass) {
        alert("To'rtburchak chizish uchun, iltimos, avval biror sinf tanlang.");
        return;
      }
      setIsDrawing(true);
      setNewBox({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: `${selectedClass.color}4D`, // 30% shaffoflik bilan
        stroke: selectedClass.color,
        strokeWidth: 2,
      });
    } else if (type === 'mousemove' && newBox) {
      const startX = newBox.startX || newBox.x;
      const startY = newBox.startY || newBox.y;

      setNewBox({
        ...newBox,
        startX: startX,
        startY: startY,
        x: Math.min(startX, pos.x),
        y: Math.min(startY, pos.y),
        width: Math.abs(pos.x - startX),
        height: Math.abs(pos.y - startY),
      });
    } else if (type === 'mouseup' && newBox) {
      setIsDrawing(false);

      if (newBox.width < 3 || newBox.height < 3) {
        setNewBox(null);
        return;
      }

      // Haqiqiy koordinatalarni hisoblash
      const realX = (newBox.x - imageFit.x) / imageFit.scale;
      const realY = (newBox.y - imageFit.y) / imageFit.scale;
      const realWidth = newBox.width / imageFit.scale;
      const realHeight = newBox.height / imageFit.scale;

      addAnnotation({
        id: Date.now(),
        tool: 'box',
        class: selectedClass.name,
        x: realX,
        y: realY,
        width: realWidth,
        height: realHeight,
        fill: `${selectedClass.color}4D`,
        stroke: selectedClass.color,
        strokeWidth: 2,
      });

      setNewBox(null);
    }
  }, [mouseEvent]);

  if (newBox) {
    return <Rect {...newBox} />;
  }

  return null;
};

export default BoxDrawer;