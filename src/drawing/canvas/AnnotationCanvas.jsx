// src/drawing/canvas/AnnotationCanvas.jsx
import { useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useAnnotation } from '../../core/AnnotationContext.jsx';
import AnnotationRenderer from '../AnnotationRenderer.jsx';
import SelectTool from '../tools/SelectTool.jsx';
import PolygonDrawer from '../tools/PolygonDrawer.jsx';
import BoxDrawer from '../tools/BoxDrawer.jsx';
import PointDrawer from '../tools/PointDrawer.jsx';
import ArrowDrawer from '../tools/ArrowDrawer.jsx';

function AnnotationCanvas() {
    const stageRef = useRef(null);
    const annotationsLayerRef = useRef(null);

    const {
        imageUrl,
        setImageObject,
        handleSelectAnnotation, // <-- YANGI MARKAZIY FUNKSIYANI OLAMIZ
        activeTool,
        transform,
        setTransform
    } = useAnnotation();

    const [image] = useImage(imageUrl, 'anonymous');

    useEffect(() => {
        if (image && stageRef.current) {
            setImageObject(image);
            const stage = stageRef.current;
            const container = stage.container().parentElement;
            const stageWidth = container.offsetWidth;
            const stageHeight = container.offsetHeight;

            const scale = Math.min(stageWidth / image.width, stageHeight / image.height, 1);

            setTransform({
                x: (stageWidth - image.width * scale) / 2,
                y: (stageHeight - image.height * scale) / 2,
                scale: scale
            });
        }
    }, [image, setImageObject, setTransform]);

    // --- TUZATISH: Stage bosilganda tanlovni bekor qilish uchun yangilangan mantiq ---
    const handleStageClick = (e) => {
        // Agar bosilgan joy Stage'ning o'zi bo'lsa (biror shakl emas), tanlovni bekor qilish
        if (e.target === e.currentTarget) {
            handleSelectAnnotation(null);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Stage
                width={window.innerWidth * 0.55} // Kenglikni moslashuvchan qilish
                height={window.innerHeight * 0.8} // Balandlikni moslashuvchan qilish
                ref={stageRef}
                style={{
                    border: '1px solid #4A5568',
                    cursor: activeTool === 'select' ? 'default' : 'crosshair'
                }}
                onClick={handleStageClick}
                onTap={handleStageClick} // Sensorli ekranlar uchun
            >
                {/* Rasm qatlami */}
                <Layer
                    name="image-layer"
                    x={transform.x}
                    y={transform.y}
                    scaleX={transform.scale}
                    scaleY={transform.scale}
                >
                    {image && (
                        <KonvaImage image={image} name="image" listening={false} />
                    )}
                </Layer>

                {/* Annotatsiyalar qatlami */}
                <Layer
                    ref={annotationsLayerRef}
                    name="annotations-layer"
                    x={transform.x}
                    y={transform.y}
                    scaleX={transform.scale}
                    scaleY={transform.scale}
                >
                    {/* --- TUZATISH: `onSelect` prop'iga yangi funksiyani uzatish --- */}
                    <AnnotationRenderer onSelect={handleSelectAnnotation} />

                    {/* Chizish asboblari */}
                    <SelectTool stageRef={stageRef} />
                    <PolygonDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
                    <BoxDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
                    <PointDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
                    <ArrowDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
                </Layer>
            </Stage>
        </div>
    );
}

export default AnnotationCanvas;