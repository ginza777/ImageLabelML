import React, { useContext, useRef, useEffect } from 'react';
import { Group, Rect, Circle, Arrow, Line, Transformer } from 'react-konva';
import { AnnotationContext } from '../core/AnnotationContext.jsx';

const AnnotationRenderer = ({ onSelect }) => {
  const { annotations, selectedAnnotationId, imageUrl, updateAnnotation, activeTool, transform } = useContext(
    AnnotationContext
  );
  const transformerRef = useRef(null);
  const shapesRef = useRef(new Map());

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;

    const selectedAnnotation = annotations.find((ann) => ann.id === selectedAnnotationId);

    if (activeTool === 'select' && selectedAnnotation) {
      const node = shapesRef.current.get(selectedAnnotationId);
      if (selectedAnnotation.type === 'polygon' || selectedAnnotation.type === 'point') {
        tr.nodes([]);
      } else if (node) {
        tr.nodes([node]);
        tr.resizeEnabled(true);
        tr.rotateEnabled(true);
        // Ensure transformer stays within bounds
        tr.setAttr('boundBoxFunc', (oldBox, newBox) => {
          if (newBox.x < 0) newBox.x = 0;
          if (newBox.y < 0) newBox.y = 0;
          if (newBox.x + newBox.width > transform.originalWidth * transform.scale) {
            newBox.width = transform.originalWidth * transform.scale - newBox.x;
          }
          if (newBox.y + newBox.height > transform.originalHeight * transform.scale) {
            newBox.height = transform.originalHeight * transform.scale - newBox.y;
          }
          return newBox;
        });
      } else {
        tr.nodes([]);
      }
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedAnnotationId, activeTool, annotations, transform]);

  const handleTransformEnd = (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const id = node.id();

    node.scaleX(1);
    node.scaleY(1);

    const annotation = annotations.find((ann) => ann.id === id);
    if (!annotation || transform.scale === 0) return;

    let updatedAttrs = {};
    switch (annotation.type) {
      case 'box':
        updatedAttrs = {
          x: Math.min(Math.max(node.x() / transform.scale, 0), transform.originalWidth),
          y: Math.min(Math.max(node.y() / transform.scale, 0), transform.originalHeight),
          width: Math.max(5 / transform.scale, Math.min(node.width() * scaleX / transform.scale, transform.originalWidth - node.x() / transform.scale)),
          height: Math.max(5 / transform.scale, Math.min(node.height() * scaleY / transform.scale, transform.originalHeight - node.y() / transform.scale)),
        };
        break;
      case 'arrow':
        const transformMatrix = node.getTransform();
        const newPoints = node.points().map((_, i) =>
          i % 2 === 0
            ? Math.min(Math.max(transformMatrix.point({ x: node.points()[i], y: node.points()[i + 1] }).x / transform.scale, 0), transform.originalWidth)
            : Math.min(Math.max(transformMatrix.point({ x: node.points()[i - 1], y: node.points()[i] }).y / transform.scale, 0), transform.originalHeight)
        );
        node.position({ x: 0, y: 0 });
        updatedAttrs = { points: newPoints };
        break;
      default:
        break;
    }
    updateAnnotation({ id, ...updatedAttrs });
  };

  const handleVertexDrag = (e, ann, vertexIndex) => {
    const newPoints = [...ann.points];
    newPoints[vertexIndex] = Math.min(Math.max(e.target.x() / transform.scale, 0), transform.originalWidth);
    newPoints[vertexIndex + 1] = Math.min(Math.max(e.target.y() / transform.scale, 0), transform.originalHeight);
    updateAnnotation({ id: ann.id, points: newPoints });
  };

  const handleDragEnd = (e, ann) => {
    const node = e.target;
    const id = node.id();
    let updatedAttrs = {};

    switch (ann.type) {
      case 'point':
        updatedAttrs = {
          x: Math.min(Math.max(node.x() / transform.scale, 0), transform.originalWidth),
          y: Math.min(Math.max(node.y() / transform.scale, 0), transform.originalHeight),
        };
        break;
      case 'box':
        updatedAttrs = {
          x: Math.min(Math.max(node.x() / transform.scale, 0), transform.originalWidth),
          y: Math.min(Math.max(node.y() / transform.scale, 0), transform.originalHeight),
        };
        break;
      case 'polygon':
        const { x, y } = node.position();
        const newPoints = ann.points.map((p, i) =>
          Math.min(
            Math.max(p + (i % 2 === 0 ? x / transform.scale : y / transform.scale), 0),
            i % 2 === 0 ? transform.originalWidth : transform.originalHeight
          )
        );
        node.position({ x: 0, y: 0 });
        updatedAttrs = { points: newPoints };
        break;
      case 'arrow':
        const { x: dx, y: dy } = node.position();
        const newArrowPoints = ann.points.map((p, i) =>
          Math.min(
            Math.max(p + (i % 2 === 0 ? dx / transform.scale : dy / transform.scale), 0),
            i % 2 === 0 ? transform.originalWidth : transform.originalHeight
          )
        );
        node.position({ x: 0, y: 0 });
        updatedAttrs = { points: newArrowPoints };
        break;
      default:
        break;
    }
    updateAnnotation({ id, ...updatedAttrs });
  };

  return (
    <Group>
      {annotations.map((ann) => {
        if (ann.imageId !== imageUrl) return null;
        const isSelected = selectedAnnotationId === ann.id && activeTool === 'select';

        const commonProps = {
          id: ann.id,
          draggable: isSelected,
          ref: (node) => shapesRef.current.set(ann.id, node),
          onClick: () => onSelect(ann.id),
          onTap: () => onSelect(ann.id),
          onTransformEnd: handleTransformEnd,
          onDragEnd: (e) => handleDragEnd(e, ann),
        };

        switch (ann.type) {
          case 'box':
            return (
              <Rect
                key={ann.id}
                {...commonProps}
                x={ann.x * transform.scale}
                y={ann.y * transform.scale}
                width={ann.width * transform.scale}
                height={ann.height * transform.scale}
                stroke={isSelected ? '#0ea5e9' : ann.color}
                strokeWidth={isSelected ? 3 : 2}
                fill={ann.color + '55'}
              />
            );
          case 'point':
            return (
              <Circle
                key={ann.id}
                {...commonProps}
                x={ann.x * transform.scale}
                y={ann.y * transform.scale}
                radius={6}
                fill={ann.color}
                stroke={isSelected ? '#0ea5e9' : ann.color}
                strokeWidth={2}
              />
            );
          case 'arrow':
            return (
              <Arrow
                key={ann.id}
                {...commonProps}
                points={ann.points.map((p) => p * transform.scale)}
                stroke={isSelected ? '#0ea5e9' : ann.color}
                fill={ann.color}
                strokeWidth={isSelected ? 3 : 2}
                pointerLength={10}
                pointerWidth={10}
              />
            );
          case 'polygon':
            return (
              <React.Fragment key={ann.id}>
                <Line
                  {...commonProps}
                  points={ann.points.map((p) => p * transform.scale)}
                  closed
                  stroke={isSelected ? '#0ea5e9' : ann.color}
                  strokeWidth={isSelected ? 3 : 2}
                  fill={ann.color + '55'}
                />
                {isSelected &&
                  ann.points.map((_, index) => {
                    if (index % 2 !== 0) return null;
                    return (
                      <Circle
                        key={`vertex-${ann.id}-${index}`}
                        x={ann.points[index] * transform.scale}
                        y={ann.points[index + 1] * transform.scale}
                        radius={6}
                        fill='#0ea5e9'
                        stroke='white'
                        strokeWidth={2}
                        draggable
                        onDragMove={(e) => handleVertexDrag(e, ann, index)}
                      />
                    );
                  })}
              </React.Fragment>
            );
          default:
            return null;
        }
      })}
      <Transformer
        ref={transformerRef}
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.x < 0) newBox.x = 0;
          if (newBox.y < 0) newBox.y = 0;
          if (newBox.x + newBox.width > transform.originalWidth * transform.scale) {
            newBox.width = transform.originalWidth * transform.scale - newBox.x;
          }
          if (newBox.y + newBox.height > transform.originalHeight * transform.scale) {
            newBox.height = transform.originalHeight * transform.scale - newBox.y;
          }
          return newBox;
        }}
      />
    </Group>
  );
};

export default AnnotationRenderer;