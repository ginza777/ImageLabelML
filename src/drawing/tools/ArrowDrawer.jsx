// src/drawing/tools/ArrowDrawer.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Arrow } from 'react-konva';
import { AnnotationContext } from '../../core/AnnotationContext';
import { generateId } from '../../utils/helpers';

const ArrowDrawer = ({ stageRef, annotationsLayerRef }) => {
  const { activeTool: currentTool, selectedClass: currentClass, imageUrl, addAnnotation, transform } = useContext(
    AnnotationContext
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (currentTool !== 'arrow') {
      if (isDrawing) setIsDrawing(false);
      if (points.length > 0) setPoints([]);
      return;
    }

    const stage = stageRef.current;
    const layer = annotationsLayerRef.current;
    if (!stage || !layer || !currentClass || transform.scale === 0) return;

    // CONTAINERNING HAQIQIY O'LCHAMLARINI OLISH
    // Stage o'zining container elementining o'lchamlariga moslashadi
    const containerWidth = stage.width(); // Stage ning joriy kengligi
    const containerHeight = stage.height(); // Stage ning joriy balandligi

    const getBoundedPos = (pos) => ({
      // Chegaralarni rasmning scaled o'lchamlari o'rniga,
      // Konva Stage ning to'liq o'lchamlariga moslab o'zgartiramiz.
      x: Math.min(Math.max(pos.x, 0), containerWidth),
      y: Math.min(Math.max(pos.y, 0), containerHeight),
    });

    const handleMouseDown = (e) => {
      if (e.target !== stage) return;
      setIsDrawing(true);
      const pos = getBoundedPos(layer.getRelativePointerPosition() || { x: 0, y: 0 });
      setPoints([pos.x, pos.y, pos.x, pos.y]);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const pos = getBoundedPos(layer.getRelativePointerPosition() || { x: 0, y: 0 });
      setPoints((p) => [p[0], p[1], pos.x, pos.y]);
    };

    const handleMouseUp = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      if (Math.abs(points[0] - points[2]) < 5 && Math.abs(points[1] - points[3]) < 5) {
        setPoints([]);
        return;
      }
      // Annotatsiya punktlarini normalizatsiya qilishda ham chegara originalWidth/Height bo'yicha qolsin
      // Chunki annotatsiyalar har doim asl rasm o'lchamlariga nisbatan saqlanadi
      const normalizedPoints = points.map((p, i) =>
        Math.min(Math.max((p - transform.x) / transform.scale, 0), i % 2 === 0 ? transform.originalWidth : transform.originalHeight)
      );
      const annotation = {
        id: generateId(),
        type: 'arrow',
        points: normalizedPoints,
        class: currentClass.name,
        color: currentClass.color,
        imageId: imageUrl,
      };
      addAnnotation(annotation);
      setPoints([]);
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
    };
  }, [currentTool, isDrawing, points, currentClass, addAnnotation, imageUrl, stageRef, annotationsLayerRef, transform]);

  if (points.length === 0) return null;

  return (
    <Arrow
      points={points}
      stroke={currentClass?.color || 'black'}
      fill={currentClass?.color || 'black'}
      strokeWidth={2}
      pointerLength={10}
      pointerWidth={10}
      listening={false}
    />
  );
};

export default ArrowDrawer;