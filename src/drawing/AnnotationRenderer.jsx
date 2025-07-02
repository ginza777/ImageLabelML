// src/drawing/AnnotationRenderer.jsx
import React, { useContext } from "react";
import { Group, Rect, Circle, Arrow, Line } from "react-konva";
import { AnnotationContext } from "../core/AnnotationContext.jsx";

const AnnotationRenderer = ({ onSelect }) => {
    const {
        annotations,
        selectedAnnotationId,
        imageUrl,
        updateAnnotation
    } = useContext(AnnotationContext);

    // Detal - tanlangan annotatsiyani boshqalaridan ajratib turish uchun
    const renderSelection = (ann) => {
        // Bu yerda tanlangan shakl atrofida alohida effekt (masalan, Transformer) chizishingiz mumkin
        // Hozircha bu qismni sodda qoldiramiz
        return null;
    };

    return (
        <Group>
            {annotations.map((ann) => {
                // Annotatsiyani faqat o'zining rasmida ko'rsatish
                if (ann.imageId !== imageUrl) return null;

                const isSelected = selectedAnnotationId === ann.id;

                switch (ann.type) {
                    case "box":
                        return (
                            <Rect
                                key={ann.id}
                                id={ann.id}
                                x={ann.x}
                                y={ann.y}
                                width={ann.width}
                                height={ann.height}
                                stroke={isSelected ? 'white' : ann.color}
                                strokeWidth={isSelected ? 6 : 5}
                                draggable
                                onClick={() => onSelect(ann.id)}
                                onTap={() => onSelect(ann.id)}
                                onDragEnd={(e) => updateAnnotation({ ...ann, x: e.target.x(), y: e.target.y() })}
                            />
                        );

                    case "point":
                        return (
                            <Circle
                                key={ann.id}
                                id={ann.id}
                                x={ann.x}
                                y={ann.y}
                                radius={6}
                                fill={ann.color}
                                stroke={isSelected ? 'white' : ann.color}
                                strokeWidth={6}
                                draggable
                                onClick={() => onSelect(ann.id)}
                                onTap={() => onSelect(ann.id)}
                                onDragEnd={(e) => updateAnnotation({ ...ann, x: e.target.x(), y: e.target.y() })}
                            />
                        );

                    case "arrow":
                        return (
                            <Arrow
                                key={ann.id}
                                id={ann.id}
                                points={ann.points}
                                stroke={isSelected ? 'white' : ann.color}
                                fill={ann.color}
                                pointerLength={10}
                                pointerWidth={10}
                                strokeWidth={isSelected ? 6 : 5}
                                draggable
                                onClick={() => onSelect(ann.id)}
                                onTap={() => onSelect(ann.id)}
                                onDragEnd={(e) => {
                                    const { x, y } = e.target.position();
                                    const newPoints = [
                                        ann.points[0] + x, ann.points[1] + y,
                                        ann.points[2] + x, ann.points[3] + y
                                    ];
                                    e.target.position({ x: 0, y: 0 }); // reset drag distance
                                    updateAnnotation({ ...ann, points: newPoints });
                                }}
                            />
                        );

                    case "polygon": {
                        return (
                            <Line
                                key={ann.id}
                                id={ann.id}
                                points={ann.points}
                                closed
                                stroke={isSelected ? 'white' : ann.color}
                                strokeWidth={isSelected ? 6 : 5}
                                fill={ann.color + "55"} // 33% transparent
                                draggable
                                onClick={() => onSelect(ann.id)}
                                onTap={() => onSelect(ann.id)}
                                onDragEnd={(e) => {
                                    const { x, y } = e.target.position();
                                    const newPoints = ann.points.map((p, i) => p + (i % 2 === 0 ? x : y));
                                    e.target.position({ x: 0, y: 0 }); // reset drag distance
                                    updateAnnotation({ ...ann, points: newPoints });
                                }}
                            />
                        );
                    }
                    default:
                        return null;
                }
            })}
        </Group>
    );
};

export default AnnotationRenderer;