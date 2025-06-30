// src/drawing/tools/PolygonDrawer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Line, Circle } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId } from '../../data';

const PolygonDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation, setIsDrawing } = useAnnotation();
  const [points, setPoints] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isDrawing = points.length > 0;

  const finalizePolygon = useCallback((isClosed) => {
    if (points.length < 3) { setPoints([]); setIsDrawing(false); return; }
    const realPoints = points.flatMap(p => [ (p.x - imageFit.x) / imageFit.scale, (p.y - imageFit.y) / imageFit.scale ]);
    addAnnotation({
      id: generateId(), tool: 'polygon', class: selectedClass.name, points: realPoints,
      closed: isClosed, fill: `${selectedClass.color}4D`, stroke: selectedClass.color, strokeWidth: 2,
    });
    setPoints([]);
    setIsDrawing(false);
    onDrawComplete(); // <-- Ishimiz tugadi, xabar beramiz
  }, [points, imageFit, selectedClass, addAnnotation, setIsDrawing, onDrawComplete]);

  // ... (useEffect'lar va boshqa qismlar avvalgidek qoladi) ...

  return null; // JSX qismi to'liq avvalgidek
};
export default PolygonDrawer;