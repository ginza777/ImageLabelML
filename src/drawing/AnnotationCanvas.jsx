// src/drawing/AnnotationCanvas.jsx

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Circle, Transformer, Arrow, Rect } from 'react-konva';
import { useAnnotation } from '../core/AnnotationContext.jsx';
import { print_log } from '../data.js';
import PointDrawer from './tools/PointDrawer';
import ArrowDrawer from './tools/ArrowDrawer';
import BoxDrawer from './tools/BoxDrawer';

const AnnotationCanvas = () => {
  const {
    imageObject,
    imageStatus, // Xatolik sababchisi - endi bu yerda
    stageRef,
    activeTool,
    selectedClass,
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectedAnnotationId,
    setSelectedAnnotationId,
    isDrawing,
  } = useAnnotation();

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const transformerRef = useRef(null);
  const [mouseEvent, setMouseEvent] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (transformerRef.current) {
      const selectedNode = stageRef.current?.findOne('#' + selectedAnnotationId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedAnnotationId, annotations]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        e.preventDefault();
        deleteAnnotation(selectedAnnotationId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, deleteAnnotation]);

  const getImageFitSize = () => {
    if (!imageObject || !imageObject.width || size.width === 0) {
      return { width: 0, height: 0, x: 0, y: 0, scale: 1 };
    }
    const scale = Math.min(size.width / imageObject.width, size.height / imageObject.height);
    const scaledW = imageObject.width * scale;
    const scaledH = imageObject.height * scale;
    const x = (size.width - scaledW) / 2;
    const y = (size.height - scaledH) / 2;
    return { width: scaledW, height: scaledH, x, y, scale };
  };

  const imageFit = getImageFitSize();

  const handleEvent = (e) => {
    if (isDrawing && e.type !== 'mousedown') {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      setMouseEvent({ type: e.type, payload: { pos } });
      return;
    }
    if (!isDrawing) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      setMouseEvent({
        type: e.type,
        payload: { pos, empty: e.target === e.target.getStage() || e.target.name() === 'background-image' }
      });
    }
  };

  useEffect(() => {
    if (mouseEvent?.type === 'click' && mouseEvent?.payload.empty) {
      setSelectedAnnotationId(null);
    }
  }, [mouseEvent]);

  const handleDragEnd = (e) => {
    const node = e.target;
    const annId = Number(node.id());
    const annotation = annotations.find(ann => ann.id === annId);
    if (!annotation || !imageFit || imageFit.scale === 0) return;
    let newAttrs = {};
    if (annotation.tool === 'point' || annotation.tool === 'box') {
      const newPos = node.position();
      newAttrs = { x: (newPos.x - imageFit.x) / imageFit.scale, y: (newPos.y - imageFit.y) / imageFit.scale };
    } else {
      const dx = node.x(); const dy = node.y();
      const realDx = dx / imageFit.scale; const realDy = dy / imageFit.scale;
      if (annotation.tool === 'arrow') {
        newAttrs = { points: [ annotation.points[0] + realDx, annotation.points[1] + realDy, annotation.points[2] + realDx, annotation.points[3] + realDy ] };
      }
    }
    updateAnnotation({ id: annId, ...newAttrs });
    if (annotation.tool !== 'point' && annotation.tool !== 'box') {
      node.position({ x: 0, y: 0 });
    }
    stageRef.current?.batchDraw();
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const annId = Number(node.id());
    const annotation = annotations.find(ann => ann.id === annId);
    if (!annotation) return;

    const newAttrs = {
      x: (node.x() - imageFit.x) / imageFit.scale,
      y: (node.y() - imageFit.y) / imageFit.scale,
      width: (node.width() * node.scaleX()) / imageFit.scale,
      height: (node.height() * node.scaleY()) / imageFit.scale,
      rotation: node.rotation()
    };

    updateAnnotation({ id: annId, ...newAttrs });
    node.scaleX(1);
    node.scaleY(1);
  };

  const keepInBounds = (pos, node) => {
    if (!node || !imageFit) return pos;
    const box = node.getClientRect({ skipTransform: true });
    if (!box) return pos;
    const newAbsX = box.x + pos.x; const newAbsY = box.y + pos.y;
    let newX = pos.x; let newY = pos.y;
    if (newAbsX < imageFit.x) newX = pos.x + (imageFit.x - newAbsX);
    if (newAbsY < imageFit.y) newY = pos.y + (imageFit.y - newAbsY);
    if (newAbsX + box.width > imageFit.x + imageFit.width) newX = pos.x - (newAbsX + box.width - (imageFit.x + imageFit.width));
    if (newAbsY + box.height > imageFit.y + imageFit.height) newY = pos.y - (newAbsY + box.height - (imageFit.y + imageFit.height));
    return { x: newX, y: newY };
  };

  const renderActiveDrawer = () => {
    const props = { mouseEvent, imageFit };
    switch(activeTool) {
      case 'point': return <PointDrawer {...props} />;
      case 'arrow': return <ArrowDrawer {...props} />;
      case 'box': return <BoxDrawer {...props} />;
      default: return null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {(imageObject && imageObject.width > 0 && size.width > 0) ? (
        <Stage width={size.width} height={size.height} ref={stageRef} onMouseDown={handleEvent} onMouseMove={handleEvent} onMouseUp={handleEvent} onClick={handleEvent}>
          <Layer name="image-layer" listening={!isDrawing}><Image image={imageObject} name="background-image" width={imageFit.width} height={imageFit.height} x={imageFit.x} y={imageFit.y}/></Layer>
          <Layer name="points-layer" listening={!isDrawing}>{annotations.filter(a => a.tool === 'point').map(ann => <Circle key={ann.id} id={String(ann.id)} x={(ann.x * imageFit.scale) + imageFit.x} y={(ann.y * imageFit.scale) + imageFit.y} radius={5} fill={ann.fill} stroke="white" strokeWidth={ann.id === selectedAnnotationId ? 2 : 1} draggable={true} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} onClick={() => setSelectedAnnotationId(ann.id)} onTap={() => setSelectedAnnotationId(ann.id)} dragBoundFunc={(pos) => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}/>)}</Layer>
          <Layer name="arrows-layer" listening={!isDrawing}>{annotations.filter(a => a.tool === 'arrow').map(ann => { const isSelected = ann.id === selectedAnnotationId; const screenPoints = [(ann.points[0] * imageFit.scale) + imageFit.x, (ann.points[1] * imageFit.scale) + imageFit.y, (ann.points[2] * imageFit.scale) + imageFit.x, (ann.points[3] * imageFit.scale) + imageFit.y]; return <Arrow key={ann.id} id={String(ann.id)} points={screenPoints} fill={ann.fill} stroke={ann.stroke} strokeWidth={isSelected ? 4 : 2} draggable={true} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} onClick={() => setSelectedAnnotationId(ann.id)} onTap={() => setSelectedAnnotationId(ann.id)} dragBoundFunc={(pos) => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}/>;})}</Layer>
          <Layer name="boxes-layer" listening={!isDrawing}>{annotations.filter(a => a.tool === 'box').map(ann => <Rect key={ann.id} id={String(ann.id)} x={(ann.x * imageFit.scale) + imageFit.x} y={(ann.y * imageFit.scale) + imageFit.y} width={ann.width * imageFit.scale} height={ann.height * imageFit.scale} fill={ann.fill} stroke={ann.stroke} strokeWidth={ann.id === selectedAnnotationId ? 4 : 2} draggable={true} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} onClick={() => setSelectedAnnotationId(ann.id)} onTap={() => setSelectedAnnotationId(ann.id)} dragBoundFunc={(pos) => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}/>)}</Layer>
          <Layer name="drawer-layer">{renderActiveDrawer()}</Layer>
          <Layer name="transformer-layer" listening={!isDrawing}><Transformer ref={transformerRef} rotateEnabled={false} keepRatio={false} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 || newBox.x < imageFit.x || newBox.y < imageFit.y || newBox.x + newBox.width > imageFit.x + imageFit.width || newBox.y + newBox.height > imageFit.y + imageFit.height) ? oldBox : newBox} /></Layer>
        </Stage>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-lg">
          <p className="text-gray-500">{imageStatus === 'loading' ? 'Yuklanmoqda...' : 'Please upload an image to begin'}</p>
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;