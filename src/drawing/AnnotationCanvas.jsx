import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image, Circle, Transformer, Arrow, Rect, Line } from 'react-konva';
import { useAnnotation } from '../core/AnnotationContext.jsx';
import PointDrawer from './tools/PointDrawer';
import ArrowDrawer from './tools/ArrowDrawer';
import BoxDrawer from './tools/BoxDrawer';
import PolygonDrawer from './tools/PolygonDrawer';
import { print_log } from '../data.js';

const AnnotationCanvas = () => {
  const {
    imageObject, imageStatus, stageRef, activeTool, selectedClass,
    annotations, updateAnnotation, deleteAnnotation,
    selectedAnnotationId, setSelectedAnnotationId, isDrawing,
    setAnnotations, clearAllAnnotations
  } = useAnnotation();

  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [mouseEvent, setMouseEvent] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width, height });
          print_log("Canvas o‘lchami o‘zgartirildi:", { width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    print_log("AnnotationCanvas: activeTool, selectedClass, imageObject", { activeTool, selectedClass, imageObject });
  }, [activeTool, selectedClass, imageObject]);

  useEffect(() => {
    if (transformerRef.current) {
      const selectedNode = stageRef.current?.findOne('#' + selectedAnnotationId);
      if (selectedNode && selectedNode.getAttr('data-tool') === 'box') {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
        print_log("Transformer boxga ulandi:", { id: selectedAnnotationId });
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedAnnotationId, annotations]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId && !e.shiftKey) {
        e.preventDefault();
        deleteAnnotation(selectedAnnotationId);
        print_log("Annotatsiya o‘chirildi:", { id: selectedAnnotationId });
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && e.shiftKey) {
        e.preventDefault();
        if (window.confirm("Barcha annotatsiyalarni o‘chirishni xohlaysizmi?")) {
          clearAllAnnotations();
          print_log("Barcha annotatsiyalar Shift+Delete orqali o‘chirildi");
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, deleteAnnotation, clearAllAnnotations]);

  const getImageFitSize = useCallback(() => {
    if (!imageObject || !imageObject.width || size.width === 0) {
      print_log("getImageFitSize: imageObject yoki size mavjud emas", { imageObject, size });
      return { width: 0, height: 0, x: 0, y: 0, scale: 1 };
    }
    const scale = Math.min(size.width / imageObject.width, size.height / imageObject.height);
    const scaledW = imageObject.width * scale;
    const scaledH = imageObject.height * scale;
    const x = (size.width - scaledW) / 2;
    const y = (size.height - scaledH) / 2;
    print_log("getImageFitSize:", { width: scaledW, height: scaledH, x, y, scale });
    return { width: scaledW, height: scaledH, x, y, scale };
  }, [imageObject, size]);

  const imageFit = getImageFitSize();

  const handleEvent = (e) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) {
      print_log("handleEvent: Sichqoncha pozitsiyasi topilmadi");
      return;
    }
    const isEmptyClick = e.target === e.target.getStage() || e.target.name() === 'image-layer';
    setMouseEvent({ type: e.type, payload: { pos, empty: isEmptyClick } });
    // print_log("Sichqoncha hodisasi:", { type: e.type, pos, empty: isEmptyClick });
  };

  useEffect(() => {
    if (mouseEvent?.type === 'click' && mouseEvent?.payload.empty && activeTool === 'select') {
      setSelectedAnnotationId(null);
      print_log("Bo‘sh joy bosilganda annotatsiya tanlovi bekor qilindi");
    }
  }, [mouseEvent, activeTool, setSelectedAnnotationId]);

  const keepInBounds = (pos, node) => {
    if (!node || !imageFit) return pos;
    const box = node.getClientRect({ skipTransform: true });
    let newX = pos.x;
    let newY = pos.y;
    if (box.x + newX < imageFit.x) newX = imageFit.x - box.x;
    if (box.y + newY < imageFit.y) newY = imageFit.y - box.y;
    if (box.x + newX + box.width > imageFit.x + imageFit.width) newX = imageFit.x + imageFit.width - box.x - box.width;
    if (box.y + newY + box.height > imageFit.y + imageFit.height) newY = imageFit.y + imageFit.height - box.y - box.height;
    return { x: newX, y: newY };
  };

  const handleDragEnd = (e) => {
    const node = e.target;
    const annId = String(node.id());
    const annotation = annotations.find(ann => String(ann.id) === annId);
    if (!annotation || !imageFit || imageFit.scale === 0) return;

    let newAttrs = {};
    if (annotation.tool === 'point' || annotation.tool === 'box') {
      const newPos = node.position();
      newAttrs = {
        x: Math.max(0, Math.min((newPos.x - imageFit.x) / imageFit.scale, imageObject.width)),
        y: Math.max(0, Math.min((newPos.y - imageFit.y) / imageFit.scale, imageObject.height))
      };
      node.position({
        x: (newAttrs.x * imageFit.scale) + imageFit.x,
        y: (newAttrs.y * imageFit.scale) + imageFit.y
      });
    } else if (annotation.tool === 'arrow' || annotation.tool === 'polygon') {
      const dx = node.x() / imageFit.scale;
      const dy = node.y() / imageFit.scale;
      newAttrs = {
        points: annotation.points.map((p, i) => {
          if (i % 2 === 0) return Math.max(0, Math.min(p + dx, imageObject.width));
          return Math.max(0, Math.min(p + dy, imageObject.height));
        })
      };
      node.position({ x: 0, y: 0 });
    }
    updateAnnotation({ id: annotation.id, ...newAttrs });
    print_log("Surish yakunlandi:", { id: annId, newAttrs });
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const annId = String(node.id());
    const annotation = annotations.find(ann => String(ann.id) === annId);
    if (!annotation || annotation.tool !== 'box') return;

    let x = (node.x() - imageFit.x) / imageFit.scale;
    let y = (node.y() - imageFit.y) / imageFit.scale;
    let width = (node.width() * node.scaleX()) / imageFit.scale;
    let height = (node.height() * node.scaleY()) / imageFit.scale;

    const originalWidth = imageObject.width;
    const originalHeight = imageObject.height;

    if (x < 0) { width += x; x = 0; }
    if (y < 0) { height += y; y = 0; }
    if (x + width > originalWidth) width = originalWidth - x;
    if (y + height > originalHeight) height = originalHeight - y;

    width = Math.max(5 / imageFit.scale, width);
    height = Math.max(5 / imageFit.scale, height);

    updateAnnotation({ id: annotation.id, x, y, width, height });
    node.position({
      x: (x * imageFit.scale) + imageFit.x,
      y: (y * imageFit.scale) + imageFit.y
    });
    node.scaleX(1);
    node.scaleY(1);
    print_log("Box o‘lchami o‘zgartirildi:", { id: annId, x, y, width, height });
  };

  const handleVertexDragEnd = (e, annId, vertexIndex) => {
    const newPos = e.target.position();
    const annotation = annotations.find(ann => ann.id === annId);
    if (!annotation) return;
    const newPoints = [...annotation.points];
    newPoints[vertexIndex * 2] = Math.max(0, Math.min((newPos.x - imageFit.x) / imageFit.scale, imageObject.width));
    newPoints[vertexIndex * 2 + 1] = Math.max(0, Math.min((newPos.y - imageFit.y) / imageFit.scale, imageObject.height));
    updateAnnotation({ id: annId, points: newPoints });
    print_log("Vertex surish yakunlandi:", { id: annId, vertexIndex, newPoints });
  };

  const onDrawComplete = useCallback(() => {
    setMouseEvent(null);
    print_log("Chizish yakunlandi");
  }, []);

  const renderActiveDrawer = () => {
    if (activeTool === 'select') {
      print_log("renderActiveDrawer: select rejimi faol");
      return null;
    }
    if (!selectedClass) {
      print_log("renderActiveDrawer: selectedClass mavjud emas");
      return null;
    }
    const props = { mouseEvent, imageFit, selectedClass, onDrawComplete };
    print_log("renderActiveDrawer: props", props);
    switch (activeTool) {
      case 'point': return <PointDrawer {...props} />;
      case 'arrow': return <ArrowDrawer {...props} />;
      case 'box': return <BoxDrawer {...props} />;
      case 'polygon': return <PolygonDrawer {...props} />;
      default:
        print_log("renderActiveDrawer: noma’lum vosita", { activeTool });
        return null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {(imageObject && imageObject.width > 0 && size.width > 0) ? (
        <Stage
          width={size.width}
          height={size.height}
          ref={stageRef}
          onMouseDown={handleEvent}
          onMouseMove={handleEvent}
          onMouseUp={handleEvent}
          onClick={handleEvent}
          onContextMenu={handleEvent}
        >
          <Layer name="image-layer" listening={!isDrawing}>
            <Image
              image={imageObject}
              name="image-layer"
              width={imageFit.width}
              height={imageFit.height}
              x={imageFit.x}
              y={imageFit.y}
            />
          </Layer>
          <Layer name="points-layer" listening={true}>
            {annotations.filter(a => a.tool === 'point').map(ann => (
              <Circle
                data-tool="point"
                key={ann.id}
                id={String(ann.id)}
                x={(ann.x * imageFit.scale) + imageFit.x}
                y={(ann.y * imageFit.scale) + imageFit.y}
                radius={5}
                fill={ann.fill}
                stroke="white"
                strokeWidth={ann.id === selectedAnnotationId ? 2 : 1}
                draggable={true}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedAnnotationId(ann.id)}
                onTap={() => setSelectedAnnotationId(ann.id)}
                dragBoundFunc={pos => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}
              />
            ))}
          </Layer>
          <Layer name="boxes-layer" listening={true}>
            {annotations.filter(a => a.tool === 'box').map(ann => (
              <Rect
                data-tool="box"
                key={ann.id}
                id={String(ann.id)}
                x={(ann.x * imageFit.scale) + imageFit.x}
                y={(ann.y * imageFit.scale) + imageFit.y}
                width={ann.width * imageFit.scale}
                height={ann.height * imageFit.scale}
                fill={ann.fill}
                stroke={ann.stroke}
                strokeWidth={ann.id === selectedAnnotationId ? 4 : 2}
                draggable={true}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                onClick={() => setSelectedAnnotationId(ann.id)}
                onTap={() => setSelectedAnnotationId(ann.id)}
                dragBoundFunc={pos => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}
              />
            ))}
          </Layer>
          <Layer name="arrows-layer" listening={true}>
            {annotations.filter(a => a.tool === 'arrow').map(ann => (
              <Arrow
                data-tool="arrow"
                key={ann.id}
                id={String(ann.id)}
                points={[
                  (ann.points[0] * imageFit.scale) + imageFit.x,
                  (ann.points[1] * imageFit.scale) + imageFit.y,
                  (ann.points[2] * imageFit.scale) + imageFit.x,
                  (ann.points[3] * imageFit.scale) + imageFit.y
                ]}
                fill={ann.fill}
                stroke={ann.stroke}
                strokeWidth={ann.id === selectedAnnotationId ? 4 : 2}
                draggable={true}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedAnnotationId(ann.id)}
                onTap={() => setSelectedAnnotationId(ann.id)}
                dragBoundFunc={pos => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}
              />
            ))}
          </Layer>
          <Layer name="polygons-layer" listening={true}>
            {annotations.filter(a => a.tool === 'polygon').map(ann => {
              const isSelected = String(ann.id) === String(selectedAnnotationId);
              const screenPoints = ann.points.map((p, i) => (i % 2 === 0 ? p * imageFit.scale + imageFit.x : p * imageFit.scale + imageFit.y));
              return (
                <React.Fragment key={ann.id}>
                  <Line
                    data-tool="polygon"
                    id={String(ann.id)}
                    points={screenPoints}
                    fill={ann.fill}
                    stroke={ann.stroke}
                    strokeWidth={isSelected ? 4 : 2}
                    closed={ann.closed}
                    draggable={true}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedAnnotationId(ann.id)}
                    onTap={() => setSelectedAnnotationId(ann.id)}
                    dragBoundFunc={pos => keepInBounds(pos, stageRef.current?.findOne('#' + ann.id))}
                  />
                  {isSelected && screenPoints.map((_, i) => (
                    i % 2 === 0 && (
                      <Circle
                        key={`${ann.id}-vertex-${i / 2}`}
                        x={screenPoints[i]}
                        y={screenPoints[i + 1]}
                        radius={6}
                        fill="#fff"
                        stroke="#007bff"
                        strokeWidth={2}
                        draggable={true}
                        onDragEnd={(e) => handleVertexDragEnd(e, ann.id, i / 2)}
                        onDragMove={(e) => e.target.getStage().batchDraw()}
                        dragBoundFunc={pos => ({
                          x: Math.max(imageFit.x, Math.min(pos.x, imageFit.x + imageFit.width)),
                          y: Math.max(imageFit.y, Math.min(pos.y, imageFit.y + imageFit.height))
                        })}
                      />
                    )
                  ))}
                </React.Fragment>
              );
            })}
          </Layer>
          <Layer name="drawer-layer">{renderActiveDrawer()}</Layer>
          <Layer name="transformer-layer">
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              keepRatio={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                const minX = imageFit.x;
                const minY = imageFit.y;
                const maxX = imageFit.x + imageFit.width;
                const maxY = imageFit.y + imageFit.height;
                const newX = Math.max(minX, Math.min(newBox.x, maxX - newBox.width));
                const newY = Math.max(minY, Math.min(newBox.y, maxY - newBox.height));
                return { x: newX, y: newY, width: newBox.width, height: newBox.height };
              }}
            />
          </Layer>
        </Stage>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-lg">
          <p className="text-gray-500">{imageStatus === 'loading' ? 'Yuklanmoqda...' : 'Iltimos, rasmni yuklang'}</p>
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;