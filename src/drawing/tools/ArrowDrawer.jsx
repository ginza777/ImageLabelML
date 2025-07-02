// src/drawing/tools/ArrowDrawer.jsx
import React, { useState, useEffect, useContext } from "react";
import { Arrow } from "react-konva";
import { AnnotationContext } from "../../core/AnnotationContext";
import { generateId } from "../../utils/helpers";

const ArrowDrawer = ({ stageRef, annotationsLayerRef }) => {
  const {
    activeTool: currentTool,
    selectedClass: currentClass,
    imageUrl,
    addAnnotation,
  } = useContext(AnnotationContext);

  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (currentTool !== "arrow") {
      // --- TUZATISH: Cheksiz siklning oldini olish ---
      // State'ni faqat o'zgarishi kerak bo'lganda yangilaymiz
      if (isDrawing) {
        setIsDrawing(false);
      }
      if (points.length > 0) {
        setPoints([]);
      }
      return;
    }

    const stage = stageRef.current;
    const layer = annotationsLayerRef.current;
    if (!stage || !layer || !currentClass) return;

    const getBoundedRelativePos = (pos, imageNode) => {
        if (!pos || !imageNode) return { x: 0, y: 0 };
        return {
            x: Math.max(0, Math.min(pos.x, imageNode.width())),
            y: Math.max(0, Math.min(pos.y, imageNode.height())),
        };
    }

    const handleMouseDown = (e) => {
      if (e.target !== stage) return;
      setIsDrawing(true);
      const imageNode = stage.findOne(".image");
      if (!imageNode) return;
      const pos = layer.getRelativePointerPosition();
      const boundedPos = getBoundedRelativePos(pos, imageNode);
      setPoints([boundedPos.x, boundedPos.y, boundedPos.x, boundedPos.y]);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const imageNode = stage.findOne(".image");
      if (!imageNode) return;
      const pos = layer.getRelativePointerPosition();
      const boundedPos = getBoundedRelativePos(pos, imageNode);
      setPoints(p => [p[0], p[1], boundedPos.x, boundedPos.y]);
    };

    const handleMouseUp = (e) => {
      if (!isDrawing) return;
      setIsDrawing(false);
      if (Math.abs(points[0] - points[2]) < 5 && Math.abs(points[1] - points[3]) < 5) {
        setPoints([]);
        return;
      }
      const annotation = {
        id: generateId(),
        type: "arrow",
        points: points,
        class: currentClass.name,
        color: currentClass.color,
        imageId: imageUrl,
      };
      addAnnotation(annotation);
      setPoints([]);
    };

    stage.on("mousedown", handleMouseDown);
    stage.on("mousemove", handleMouseMove);
    stage.on("mouseup", handleMouseUp);

    return () => {
      stage.off("mousedown", handleMouseDown);
      stage.off("mousemove", handleMouseMove);
      stage.off("mouseup", handleMouseUp);
    };
  }, [
    currentTool,
    isDrawing,
    points,
    currentClass,
    addAnnotation,
    imageUrl,
    stageRef,
    annotationsLayerRef,
  ]);

  // Chizish jarayonida vaqtinchalik strelkani ko'rsatish
  if (points.length === 0) return null;

  return (
    <Arrow
      points={points}
      stroke={currentClass?.color || "black"}
      fill={currentClass?.color || "black"}
      strokeWidth={2}
      pointerLength={10}
      pointerWidth={10}
      listening={false}
    />
  );
};

export default ArrowDrawer;