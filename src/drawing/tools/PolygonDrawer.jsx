import React, { useState, useEffect, useContext } from 'react';
import { Line, Circle } from 'react-konva';
import { AnnotationContext } from '../../core/AnnotationContext';
import { generateId } from '../../utils/helpers';

const PolygonDrawer = ({ stageRef, annotationsLayerRef }) => {
  const { activeTool, selectedClass, imageUrl, addAnnotation, isDrawing, setIsDrawing, transform } = useContext(
    AnnotationContext
  );
  const [points, setPoints] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (activeTool !== 'polygon') {
      setPoints([]);
      if (isDrawing) setIsDrawing(false);
    }
  }, [activeTool, isDrawing, setIsDrawing]);

  useEffect(() => {
    const stage = stageRef.current;
    const layer = annotationsLayerRef.current;
    if (!stage || !layer || activeTool !== 'polygon' || transform.scale === 0) return;

    const getBoundedPos = (pos) => ({
      x: Math.min(Math.max(pos.x, 0), transform.originalWidth * transform.scale),
      y: Math.min(Math.max(pos.y, 0), transform.originalHeight * transform.scale),
    });

    const finishDrawing = () => {
      if (points.length <= 4) {
        setIsDrawing(false);
        setPoints([]);
        return;
      }
      const finalPoints = points
        .flat()
        .map((p, i) => Math.min(Math.max(p / transform.scale, 0), i % 2 === 0 ? transform.originalWidth : transform.originalHeight));
      const annotation = {
        id: generateId(),
        type: 'polygon',
        points: finalPoints,
        class: selectedClass.name,
        color: selectedClass.color,
        imageId: imageUrl,
      };
      addAnnotation(annotation);
      setIsDrawing(false);
      setPoints([]);
    };

    const handleClick = (e) => {
      if (e.target !== stage) return;
      const pos = getBoundedPos(layer.getRelativePointerPosition() || { x: 0, y: 0 });
      if (isDrawing && points.length > 4 && Math.hypot(points[0] - pos.x, points[1] - pos.y) < 10) {
        finishDrawing();
      } else {
        if (!isDrawing) setIsDrawing(true);
        setPoints((prev) => [...prev, pos.x, pos.y]);
      }
    };

    const handleMouseMove = () => {
      if (isDrawing) {
        setMousePos(getBoundedPos(layer.getRelativePointerPosition() || { x: 0, y: 0 }));
      }
    };

    const handleFinishEvent = () => {
      if (isDrawing && activeTool === 'polygon') {
        finishDrawing();
      }
    };

    stage.on('click', handleClick);
    stage.on('mousemove', handleMouseMove);
    document.addEventListener('finish-polygon', handleFinishEvent);

    return () => {
      stage.off('click', handleClick);
      stage.off('mousemove', handleMouseMove);
      document.removeEventListener('finish-polygon', handleFinishEvent);
    };
  }, [activeTool, points, isDrawing, selectedClass, imageUrl, addAnnotation, setIsDrawing, stageRef, annotationsLayerRef, transform]);

  if (activeTool !== 'polygon' || points.length === 0) return null;

  const flattenedPoints = isDrawing ? [...points, mousePos.x, mousePos.y] : points;

  return (
    <React.Fragment>
      <Line
        points={flattenedPoints}
        stroke={selectedClass?.color || 'white'}
        strokeWidth={2}
        closed={!isDrawing}
        fill={!isDrawing ? selectedClass?.color + '55' : undefined}
        listening={false}
      />
      {isDrawing &&
        points.map((_, i) =>
          i % 2 === 0 ? (
            <Circle
              key={i}
              x={points[i]}
              y={points[i + 1]}
              radius={i === 0 ? 6 : 4}
              fill={selectedClass?.color || 'white'}
              listening={false}
            />
          ) : null
        )}
    </React.Fragment>
  );
};

export default PolygonDrawer;