// src/drawing/tools/PolygonDrawer.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Line, Circle } from 'react-konva';
import { AnnotationContext } from '../../core/AnnotationContext';
import { generateId } from '../../utils/helpers';

const PolygonDrawer = ({ stageRef, annotationsLayerRef }) => {
    const {
        activeTool,
        selectedClass,
        imageUrl,
        addAnnotation,
        isDrawing,
        setIsDrawing
    } = useContext(AnnotationContext);

    const [points, setPoints] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Asbob o'zgarganda chizishni tozalash
    useEffect(() => {
        if (activeTool !== 'polygon') {
            setPoints([]);
            if (isDrawing) setIsDrawing(false);
        }
    }, [activeTool]);

    useEffect(() => {
        const stage = stageRef.current;
        const layer = annotationsLayerRef.current;
        if (!stage || !layer || activeTool !== 'polygon') return;

        const getRelativePos = () => layer.getRelativePointerPosition() || { x: 0, y: 0 };

        const finishDrawing = () => {
            if (points.length <= 4) {
                setIsDrawing(false);
                setPoints([]);
                return;
            };
            const finalPoints = points.flat();
            const annotation = {
                id: generateId(),
                type: 'polygon',
                points: finalPoints,
                class: selectedClass.name,
                color: selectedClass.color,
                imageId: imageUrl,
            };
            addAnnotation(annotation);
            setIsDrawing(false);
            setPoints([]);
        }

        const handleClick = (e) => {
            if (e.target !== stage) return;
            const pos = getRelativePos();
            if (isDrawing && points.length > 4 && Math.hypot(points[0] - pos.x, points[1] - pos.y) < 10) {
                finishDrawing();
            } else {
                if (!isDrawing) setIsDrawing(true);
                setPoints(prev => [...prev, pos.x, pos.y]);
            }
        };

        const handleMouseMove = () => {
            if (isDrawing) {
                setMousePos(getRelativePos());
            }
        };

        // --- TUZATISH: Hotkey'dan kelgan maxsus hodisani eshitish ---
        const handleFinishEvent = () => {
            if (isDrawing && activeTool === 'polygon') {
                finishDrawing();
            }
        };

        stage.on('click', handleClick);
        stage.on('mousemove', handleMouseMove);
        document.addEventListener('finish-polygon', handleFinishEvent);

        return () => {
            stage.off('click', handleClick);
            stage.off('mousemove', handleMouseMove);
            document.removeEventListener('finish-polygon', handleFinishEvent);
        };
    }, [activeTool, points, isDrawing, selectedClass, imageUrl, addAnnotation, setIsDrawing, stageRef, annotationsLayerRef]);

    if (activeTool !== 'polygon' || points.length === 0) return null;

    const flattenedPoints = isDrawing ? [...points, mousePos.x, mousePos.y] : points;

    return (
        <React.Fragment>
            <Line
                points={flattenedPoints}
                stroke={selectedClass?.color || 'white'}
                strokeWidth={2}
                closed={!isDrawing}
                fill={!isDrawing ? (selectedClass?.color + '55') : undefined}
                listening={false}
            />
            {isDrawing && points.map((_, i) => i % 2 === 0 && (
                <Circle
                    key={i}
                    x={points[i]}
                    y={points[i+1]}
                    radius={i === 0 ? 6 : 4}
                    fill={selectedClass?.color || 'white'}
                    listening={false}
                />
            ))}
        </React.Fragment>
    );
};

export default PolygonDrawer;