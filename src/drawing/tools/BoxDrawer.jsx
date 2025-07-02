// src/drawing/tools/BoxDrawer.jsx
import React, { useEffect, useState, useContext, useRef } from "react"; // useRef import qilindi
import { Rect } from "react-konva";
import { AnnotationContext } from "../../core/AnnotationContext";
import { generateId } from "../../utils/helpers";

const BoxDrawer = ({ stageRef, annotationsLayerRef }) => {
  const {
    activeTool,
    selectedClass,
    imageUrl,
    addAnnotation,
  } = useContext(AnnotationContext);

  const [isDrawing, setIsDrawing] = useState(false);
  const [box, setBox] = useState(null);
  const startPointRef = useRef({ x: 0, y: 0 }); // --- TUZATISH: Boshlang'ich nuqtani saqlash uchun useRef ishlatamiz

  useEffect(() => {
    if (activeTool !== 'box') {
      setIsDrawing(false);
      setBox(null);
      return;
    }

    const stage = stageRef.current;
    const layer = annotationsLayerRef.current;
    if (!stage || !layer || !selectedClass) return;

    const handleMouseDown = (e) => {
      if (e.target !== stage) return;
      setIsDrawing(true);
      // --- TUZATISH: Boshlang'ich nuqtani ref.current ga saqlaymiz
      startPointRef.current = layer.getRelativePointerPosition() || { x: 0, y: 0 };
      setBox({ x: startPointRef.current.x, y: startPointRef.current.y, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const currentPoint = layer.getRelativePointerPosition() || { x: 0, y: 0 };
      // --- TUZATISH: ref.current dan to'g'ri boshlang'ich nuqtani olamiz
      setBox({
        x: startPointRef.current.x,
        y: startPointRef.current.y,
        width: currentPoint.x - startPointRef.current.x,
        height: currentPoint.y - startPointRef.current.y,
      });
    };

    const handleMouseUp = () => {
      if (!isDrawing || !box) return;
      setIsDrawing(false);

      if (Math.abs(box.width) < 5 || Math.abs(box.height) < 5) {
        setBox(null);
        return;
      }

      const normalizedBox = {
        x: box.width > 0 ? box.x : box.x + box.width,
        y: box.height > 0 ? box.y : box.y + box.height,
        width: Math.abs(box.width),
        height: Math.abs(box.height),
      };

      const annotation = {
        id: generateId(),
        type: "box",
        ...normalizedBox,
        class: selectedClass.name,
        color: selectedClass.color,
        imageId: imageUrl,
      };

      addAnnotation(annotation);
      setBox(null);
    };

    stage.on("mousedown", handleMouseDown);
    stage.on("mousemove", handleMouseMove);
    stage.on("mouseup", handleMouseUp);

    return () => {
      stage.off("mousedown", handleMouseDown);
      stage.off("mousemove", handleMouseMove);
      stage.off("mouseup", handleMouseUp);
    };
  }, [activeTool, isDrawing, box, selectedClass, imageUrl, addAnnotation, stageRef, annotationsLayerRef]);

  if (!box) return null;

  return (
    <Rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      stroke={selectedClass?.color || "blue"}
      strokeWidth={2}
      dash={[4, 4]}
      listening={false}
    />
  );
};

export default BoxDrawer;