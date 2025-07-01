import React, { useEffect, useRef } from 'react';
import { Line, Circle } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId, print_log } from '../../data.js';

const PolygonDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation, setIsDrawing, setActiveTool } = useAnnotation();
  const pointsRef = useRef([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);

  const finalizePolygon = (isClosed) => {
    if (pointsRef.current.length < 3) {
      pointsRef.current = [];
      mousePosRef.current = { x: 0, y: 0 };
      isDrawingRef.current = false;
      setIsDrawing(false);
      onDrawComplete();
      print_log("Polygon chizish bekor qilindi: yetarlicha nuqta yo‘q");
      return;
    }
    const realPoints = pointsRef.current.flatMap(p => [p.x, p.y]);
    const newAnnotation = {
      id: generateId(),
      tool: 'polygon',
      class: selectedClass.name,
      points: realPoints,
      closed: isClosed,
      fill: `${selectedClass.color}4D`,
      stroke: selectedClass.color,
      strokeWidth: 2
    };
    addAnnotation(newAnnotation);
    pointsRef.current = [];
    mousePosRef.current = { x: 0, y: 0 };
    isDrawingRef.current = false;
    setIsDrawing(false);
    setActiveTool('select');
    onDrawComplete();
    print_log("Polygon qo‘shildi:", { isClosed, points: realPoints });
  };

  useEffect(() => {
    if (activeTool !== 'polygon' || !mouseEvent || !imageFit || imageFit.scale === 0 || !selectedClass) {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        pointsRef.current = [];
        mousePosRef.current = { x: 0, y: 0 };
        print_log("Polygon chizish bekor qilindi: noto‘g‘ri holat");
      }
      return;
    }

    const { type, payload } = mouseEvent;
    const pos = payload.pos;
    const currentXInImage = Math.max(0, Math.min((pos.x - imageFit.x) / imageFit.scale, imageFit.width / imageFit.scale));
    const currentYInImage = Math.max(0, Math.min((pos.y - imageFit.y) / imageFit.scale, imageFit.height / imageFit.scale));

    if (type === 'mousedown' && payload.empty && pos.x >= imageFit.x && pos.x <= imageFit.x + imageFit.width && pos.y >= imageFit.y && pos.y <= imageFit.y + imageFit.height) {
      if (!isDrawingRef.current) {
        isDrawingRef.current = true;
        setIsDrawing(true);
      }
      if (pointsRef.current.length >= 3 && Math.sqrt(Math.pow(currentXInImage - pointsRef.current[0].x, 2) + Math.pow(currentYInImage - pointsRef.current[0].y, 2)) < (15 / imageFit.scale)) {
        finalizePolygon(true);
      } else {
        pointsRef.current = [...pointsRef.current, { x: currentXInImage, y: currentYInImage }];
        mousePosRef.current = { x: currentXInImage, y: currentYInImage };
        print_log("Polygon nuqtasi qo‘shildi:", { x: currentXInImage, y: currentYInImage });
      }
    } else if (type === 'mousemove' && isDrawingRef.current) {
      mousePosRef.current = { x: currentXInImage, y: currentYInImage };
    } else if (type === 'dblclick' && isDrawingRef.current) {
      finalizePolygon(true);
    } else if (type === 'contextmenu' && isDrawingRef.current) {
      finalizePolygon(false);
      payload.evt.preventDefault();
      print_log("Polygon o‘ng sichqoncha bilan yakunlandi");
    }
  }, [mouseEvent, activeTool, selectedClass, imageFit, setIsDrawing, setActiveTool, onDrawComplete]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        pointsRef.current = [];
        mousePosRef.current = { x: 0, y: 0 };
        setActiveTool('select');
        onDrawComplete();
        print_log("Polygon chizish Escape tugmasi orqali bekor qilindi");
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onDrawComplete, setIsDrawing, setActiveTool]);

  if (!selectedClass || activeTool !== 'polygon') return null;

  const displayPoints = pointsRef.current.flatMap(p => [(p.x * imageFit.scale) + imageFit.x, (p.y * imageFit.scale) + imageFit.y]);
  const currentLinePoints = displayPoints.concat([(mousePosRef.current.x * imageFit.scale) + imageFit.x, (mousePosRef.current.y * imageFit.scale) + imageFit.y]);

  return (
    <>
      {pointsRef.current.length >= 1 && (
        <Line
          points={currentLinePoints}
          stroke={selectedClass.color}
          strokeWidth={2}
          closed={false}
          fillEnabled={false}
        />
      )}
      {pointsRef.current.map((p, index) => (
        <Circle
          key={index}
          x={(p.x * imageFit.scale) + imageFit.x}
          y={(p.y * imageFit.scale) + imageFit.y}
          radius={5}
          fill={index === 0 ? selectedClass.color : "white"}
          stroke={selectedClass.color}
          strokeWidth={2}
        />
      ))}
    </>
  );
};

export default PolygonDrawer;