import React, { useState, useEffect, useRef } from 'react';
import { Rect } from 'react-konva';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import { generateId, print_log } from '../../data.js';

const BoxDrawer = ({ mouseEvent, imageFit, selectedClass, onDrawComplete }) => {
  const { activeTool, addAnnotation, setIsDrawing } = useAnnotation();
  const [newBox, setNewBox] = useState(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (activeTool !== 'box' || !mouseEvent || !imageFit || imageFit.scale === 0 || !selectedClass) {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        setNewBox(null);
        print_log("Box drawing cancelled: invalid state");
      }
      return;
    }

    const { type, payload } = mouseEvent;
    const pos = payload.pos;
    let currentXInImage = (pos.x - imageFit.x) / imageFit.scale;
    let currentYInImage = (pos.y - imageFit.y) / imageFit.scale;
    currentXInImage = Math.max(0, Math.min(currentXInImage, imageFit.width / imageFit.scale));
    currentYInImage = Math.max(0, Math.min(currentYInImage, imageFit.height / imageFit.scale));

    if (type === 'mousedown' && payload.empty && pos.x >= imageFit.x && pos.x <= imageFit.x + imageFit.width && pos.y >= imageFit.y && pos.y <= imageFit.y + imageFit.height) {
      isDrawingRef.current = true;
      setIsDrawing(true);
      startPointRef.current = { x: currentXInImage, y: currentYInImage };
      setNewBox({
        x: currentXInImage,
        y: currentYInImage,
        width: 0,
        height: 0,
        fill: `${selectedClass.color}4D`,
        stroke: selectedClass.color,
        strokeWidth: 2
      });
      print_log("Box drawing started:", { x: currentXInImage, y: currentYInImage });
    } else if (type === 'mousemove' && isDrawingRef.current && newBox) {
      const startX = startPointRef.current.x;
      const startY = startPointRef.current.y;
      const newWidth = currentXInImage - startX;
      const newHeight = currentYInImage - startY;
      const x = newWidth < 0 ? currentXInImage : startX;
      const y = newHeight < 0 ? currentYInImage : startY;
      setNewBox({
        ...newBox,
        x, y,
        width: Math.abs(newWidth),
        height: Math.abs(newHeight)
      });
    } else if (type === 'mouseup' && isDrawingRef.current && newBox) {
      isDrawingRef.current = false;
      setIsDrawing(false);
      const minSizeInImage = 5 / imageFit.scale;
      const startX = startPointRef.current.x;
      const startY = startPointRef.current.y;
      const finalX = Math.max(0, Math.min(Math.min(startX, currentXInImage), imageFit.width / imageFit.scale));
      const finalY = Math.max(0, Math.min(Math.min(startY, currentYInImage), imageFit.height / imageFit.scale));
      const finalWidth = Math.min(Math.abs(currentXInImage - startX), imageFit.width / imageFit.scale - finalX);
      const finalHeight = Math.min(Math.abs(currentYInImage - startY), imageFit.height / imageFit.scale - finalY);

      if (finalWidth > minSizeInImage && finalHeight > minSizeInImage) {
        const newAnnotation = {
          id: generateId(),
          tool: 'box',
          class: selectedClass.name,
          x: finalX,
          y: finalY,
          width: finalWidth,
          height: finalHeight,
          fill: `${selectedClass.color}4D`,
          stroke: selectedClass.color,
          strokeWidth: 2
        };
        addAnnotation(newAnnotation);
        print_log("Box added:", { x: finalX, y: finalY, width: finalWidth, height: finalHeight });
      }
      setNewBox(null);
      onDrawComplete();
    }
  }, [mouseEvent, activeTool, selectedClass, imageFit, addAnnotation, setIsDrawing, onDrawComplete]);

  if (newBox && selectedClass && imageFit && imageFit.scale > 0) {
    return (
      <Rect
        x={(newBox.x * imageFit.scale) + imageFit.x}
        y={(newBox.y * imageFit.scale) + imageFit.y}
        width={newBox.width * imageFit.scale}
        height={newBox.height * imageFit.scale}
        fill={newBox.fill}
        stroke={newBox.stroke}
        strokeWidth={newBox.strokeWidth}
      />
    );
  }
  return null;
};

export default BoxDrawer;