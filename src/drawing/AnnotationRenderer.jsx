// src/drawing/AnnotationRenderer.jsx
import React, {useContext, useRef, useEffect} from "react";
import {Group, Rect, Circle, Arrow, Line, Transformer} from "react-konva";
import {AnnotationContext} from "../core/AnnotationContext.jsx";

const AnnotationRenderer = ({onSelect}) => {
    const {
        annotations,
        selectedAnnotationId,
        imageUrl,
        updateAnnotation,
        activeTool,
    } = useContext(AnnotationContext);

    const transformerRef = useRef(null);
    const shapesRef = useRef(new Map());

    useEffect(() => {
        const tr = transformerRef.current;
        if (!tr) return;

        const selectedAnnotation = annotations.find(ann => ann.id === selectedAnnotationId);

        if (activeTool === 'select' && selectedAnnotation) {
            const node = shapesRef.current.get(selectedAnnotationId);

            // --- TUZATISH: Poligon uchun Transformer'ni o'chirish, boshqalar uchun yoqish ---
            if (selectedAnnotation.type === 'polygon' || selectedAnnotation.type === 'point') {
                tr.nodes([]); // Poligon va Nuqta uchun standart Transformer kerak emas
            } else if (node) {
                tr.nodes([node]);
                tr.resizeEnabled(true);
                tr.rotateEnabled(true);
            } else {
                tr.nodes([]);
            }
        } else {
            tr.nodes([]);
        }
        tr.getLayer()?.batchDraw();
    }, [selectedAnnotationId, activeTool, annotations]);

    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const id = node.id();

        node.scaleX(1);
        node.scaleY(1);

        const annotation = annotations.find(ann => ann.id === id);
        if (!annotation) return;

        let updatedAttrs = {};
        switch (annotation.type) {
            case 'box':
                updatedAttrs = {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY)
                };
                break;
            case 'arrow':
                const transform = node.getTransform();
                const newPoints = node.points().map((_, i) => (
                    i % 2 === 0
                        ? transform.point({x: node.points()[i], y: node.points()[i + 1]}).x
                        : transform.point({x: node.points()[i - 1], y: node.points()[i]}).y
                ));
                node.position({x: 0, y: 0});
                updatedAttrs = {points: newPoints};
                break;
        }
        updateAnnotation({id, ...updatedAttrs});
    };

    // --- YANGI FUNKSIYA: Poligon nuqtasini (vertex) surish uchun ---
    const handleVertexDrag = (e, ann, vertexIndex) => {
        const newPoints = [...ann.points];
        newPoints[vertexIndex] = e.target.x();
        newPoints[vertexIndex + 1] = e.target.y();
        updateAnnotation({id: ann.id, points: newPoints});
    };

    return (
        <Group>
            {annotations.map((ann) => {
                if (ann.imageId !== imageUrl) return null;
                const isSelected = selectedAnnotationId === ann.id && activeTool === 'select';

                const commonProps = {
                    key: ann.id, id: ann.id,
                    draggable: isSelected,
                    ref: (node) => shapesRef.current.set(ann.id, node),
                    onClick: () => onSelect(ann.id), onTap: () => onSelect(ann.id),
                    onTransformEnd: handleTransformEnd,
                };

                switch (ann.type) {
                    case "box":
                        return (
                            <Rect {...commonProps}
                                  onDragEnd={(e) => updateAnnotation({id: ann.id, x: e.target.x(), y: e.target.y()})}
                                  x={ann.x} y={ann.y} width={ann.width} height={ann.height}
                                  stroke={isSelected ? '#0ea5e9' : ann.color} strokeWidth={isSelected ? 3 : 2}
                                  fill={ann.color + "55"}
                            />
                        );
                    case "point":
                        return (<Circle {...commonProps}
                                        onDragEnd={(e) => updateAnnotation({
                                            id: ann.id,
                                            x: e.target.x(),
                                            y: e.target.y()
                                        })}
                                        x={ann.x} y={ann.y} radius={6} fill={ann.color}
                                        stroke={isSelected ? '#0ea5e9' : ann.color} strokeWidth={2}/>);
                    case "arrow":
                        return (<Arrow {...commonProps}
                                       onDragEnd={(e) => {
                                           const {x, y} = e.target.position();
                                           const newPoints = [ann.points[0] + x, ann.points[1] + y, ann.points[2] + x, ann.points[3] + y];
                                           e.target.position({x: 0, y: 0});
                                           updateAnnotation({id: ann.id, points: newPoints});
                                       }}
                                       points={ann.points} stroke={isSelected ? '#0ea5e9' : ann.color}
                                       fill={ann.color} strokeWidth={isSelected ? 3 : 2}
                                       pointerLength={10} pointerWidth={10}/>);
                    case "polygon": {
                        return (
                            // --- TUZATISH: Poligon va uning nuqtalarini bitta guruhda chizish ---
                            <React.Fragment key={ann.id}>
                                <Line {...commonProps}
                                      onDragEnd={(e) => {
                                          const {x, y} = e.target.position();
                                          const newPoints = ann.points.map((p, i) => p + (i % 2 === 0 ? x : y));
                                          e.target.position({x: 0, y: 0});
                                          updateAnnotation({id: ann.id, points: newPoints});
                                      }}
                                      points={ann.points} closed
                                      stroke={isSelected ? '#0ea5e9' : ann.color} strokeWidth={isSelected ? 3 : 2}
                                      fill={ann.color + "55"}/>

                                {/* --- YANGI QISM: Poligon tanlanganda uning nuqtalarini chizish --- */}
                                {isSelected && ann.points.map((_, index) => {
                                    if (index % 2 !== 0) return null; // Faqat x,y juftliklari uchun bitta doira chizish
                                    return (
                                        <Circle
                                            key={`vertex-${ann.id}-${index}`}
                                            x={ann.points[index]}
                                            y={ann.points[index + 1]}
                                            radius={6}
                                            fill="#0ea5e9"
                                            stroke="white"
                                            strokeWidth={2}
                                            draggable
                                            onDragMove={(e) => handleVertexDrag(e, ann, index)}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );
                    }
                    default:
                        return null;
                }
            })}

            <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
            />
        </Group>
    );
};

export default AnnotationRenderer;