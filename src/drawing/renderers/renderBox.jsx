// frontend/src/drawing/renderers/RenderBox.jsx
import React, { useRef, useEffect } from 'react';
import { Rect, Text, Group } from 'react-konva'; 


export const RenderBox = ({
  annotation,
  selectedAnnotation,
  setSelectedAnnotationId,
  stageRef,
  activeTool,
  updateAnnotation,
  onDelete,
  trRef
}) => {
  // annotation ning joriy o'lchamlari va pozitsiyasi
  // Bu yerda o'lchamlar va pozitsiya obyektning joriy holatidan hisoblanadi
  const currentX = Math.min(annotation.points[0].x, annotation.points[1].x);
  const currentY = Math.min(annotation.points[0].y, annotation.points[1].y);
  const currentWidth = Math.abs(annotation.points[1].x - annotation.points[0].x);
  const currentHeight = Math.abs(annotation.points[1].y - annotation.points[0].y);

  const isSelected = selectedAnnotation && selectedAnnotation.id === annotation.id;
  const rectRef = useRef(null);

  // Transformer ning rectRef ga biriktirilishini RenderBox ichida boshqaramiz
  useEffect(() => {
    if (activeTool === 'select' && isSelected && rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      const attachedNodes = trRef.current.nodes();
      if (attachedNodes.length > 0 && attachedNodes[0].id() === annotation.id) {
        trRef.current.nodes([]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [isSelected, trRef, rectRef, activeTool, annotation.id]);


  // Drag tugagach pozitsiyani yangilash
  const handleDragEnd = (e) => {
    const node = e.target;
    // Obyektning yangi pozitsiyasi
    const newX = node.x();
    const newY = node.y();

    // Obyektning joriy (transformatsiyadan keyingi) o'lchamlari
    const currentRectWidth = node.width() * node.scaleX();
    const currentRectHeight = node.height() * node.scaleY();

    updateAnnotation({
        ...annotation,
        points: [
            { x: newX, y: newY },
            { x: newX + currentRectWidth, y: newY + currentRectHeight }
        ],
        rotation: node.rotation() // Rotationni ham yangilaymiz, garchi 0 bo'lsa ham
    });
    node.getLayer().batchDraw();
  };

  // Transform tugagach o'lcham va pozitsiyani yangilash
  const handleTransformEnd = (e) => {
    const node = rectRef.current; // Transformer targeti emas, o'z Rect referensimiz

    // Yangi o'lchamlar va pozitsiyani Konva node'sining getClientRect() orqali aniqlaymiz
    const box = node.getClientRect();

    const newX = box.x;
    const newY = box.y;
    const newWidth = box.width;
    const newHeight = box.height;
    const rotation = node.rotation(); // JORIY ROTATIONNI OLAMIZ

    // Scale va rotation ni reset qilamiz, chunki ularni points ga o'tkazdik
    node.scaleX(1);
    node.scaleY(1);
    node.rotation(0); // Buni 0 ga qaytaramiz
    node.position({ x: newX, y: newY });

    updateAnnotation({
        ...annotation,
        points: [
          { x: newX, y: newY },
          { x: newX + newWidth, y: newY + newHeight }
        ],
        rotation: rotation // rotationni update qildik
    });
    node.getLayer().batchDraw();
  };

  const handleDeleteClick = (e) => {
    e.cancelBubble = true;
    if (window.confirm("Siz ushbu annotatsiyani o'chirmoqchimisiz?")) {
        onDelete(annotation.id);
        setSelectedAnnotationId(null);
    }
  };

  return (
    <Group>
      <Rect
        id={annotation.id}
        x={currentX}
        y={currentY}
        width={currentWidth}
        height={currentHeight}
        stroke={annotation.color}
        fill={annotation.color + '40'}
        strokeWidth={2}
        draggable={activeTool === 'select'}
        ref={rectRef}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onClick={(e) => {
          e.cancelBubble = true;
          if (activeTool === 'select') {
            setSelectedAnnotationId(annotation.id);
          }
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (activeTool === 'select') {
            setSelectedAnnotationId(annotation.id);
          }
        }}
        dragBoundFunc={(pos) => {
          const currentStage = stageRef.current;
          if (!currentStage || currentStage.width() === 0 || currentStage.height() === 0) {
              return pos;
          }
          const stageWidth = currentStage.width();
          const stageHeight = currentStage.height();

          const currentRectWidth = rectRef.current ? rectRef.current.width() * rectRef.current.scaleX() : currentWidth;
          const currentRectHeight = rectRef.current ? rectRef.current.height() * rectRef.current.scaleY() : currentHeight;

          const boundedX = Math.max(0, Math.min(pos.x, stageWidth - currentRectWidth));
          const boundedY = Math.max(0, Math.min(pos.y, stageHeight - currentRectHeight));
          return { x: boundedX, y: boundedY };
        }}
      />
      {/* Class label */}
      <Text
        x={currentX + 5}
        y={currentY - 15 < 0 ? currentY + 5 : currentY - 15} 
        text={annotation.class}
        fontSize={12}
        fill={annotation.color}
        fontFamily="Arial"
        fontStyle="bold" 
        listening={false} 
      />
      {/* Delete Icon - faqat select tool tanlanganda va isSelected bo'lganda */}
      {isSelected && activeTool === 'select' && (
          <Group
              x={currentX + currentWidth - 12} 
              y={currentY - 12}
              onClick={handleDeleteClick}
              onTap={handleDeleteClick}
              hitGraphEnabled={true} 
              listening={true}
          >
              <Rect width={24} height={24} fill="white" cornerRadius={12} stroke="black" strokeWidth={1} />
              <Text text="X" x={8} y={6} fill="black" fontSize={12} fontStyle="bold" listening={false} /> 
          </Group>
      )}
    </Group>
  );
};