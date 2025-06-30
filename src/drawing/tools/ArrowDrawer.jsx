// src/drawing/tools/ArrowDrawer.jsx

import React, { useState, useEffect } from 'react';
import { Arrow } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';

const ArrowDrawer = ({ mouseEvent, imageFit }) => {
  const { activeTool, selectedClass, addAnnotation, setIsDrawing } = useAnnotation();
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (activeTool !== 'arrow' || !mouseEvent) return;

    const { type, payload } = mouseEvent;
    const pos = payload.pos;

    if (type === 'mousedown' && payload.empty) {
      if (!selectedClass) {
        alert("Strelka chizish uchun, iltimos, chap paneldan biror sinf tanlang.");
        return;
      }
      setIsDrawing(true); // Chizish boshlanganini Kontekstga xabar beramiz
      setPoints([pos.x, pos.y, pos.x, pos.y]);
    } else if (type === 'mousemove' && points.length > 0) {
      setPoints([points[0], points[1], pos.x, pos.y]);
    } else if (type === 'mouseup' && points.length > 0) {
      setIsDrawing(false); // Chizish tugaganini Kontekstga xabar beramiz

      const startX = (points[0] - imageFit.x) / imageFit.scale;
      const startY = (points[1] - imageFit.y) / imageFit.scale;
      const endX = (pos.x - imageFit.x) / imageFit.scale;
      const endY = (pos.y - imageFit.y) / imageFit.scale;

      if (Math.abs(startX - endX) < 3 && Math.abs(startY - endY) < 3) {
        setPoints([]);
        return;
      }

      addAnnotation({
        id: Date.now(),
        tool: 'arrow',
        class: selectedClass.name,
        points: [startX, startY, endX, endY],
        fill: selectedClass.color,
        stroke: selectedClass.color,
        strokeWidth: 4,
      });

      setPoints([]);
    }
  }, [mouseEvent]);

  if (points.length > 0) {
    return <Arrow points={points} fill={selectedClass?.color} stroke={selectedClass?.color} strokeWidth={4} />;
  }

  return null;
};

export default ArrowDrawer;