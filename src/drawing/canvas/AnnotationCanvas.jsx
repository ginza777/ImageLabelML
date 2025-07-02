// src/drawing/canvas/AnnotationCanvas.jsx
import { useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva'; // Layer ham import qilinganligiga ishonch hosil qiling
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
    handleSelectAnnotation,
    activeTool,
    transform,
    setTransform,
  } = useAnnotation();

  // useImage hookidan rasm yuklash uchun foydalanamiz
  const [image] = useImage(imageUrl, 'anonymous');

// AnnotationCanvas.jsx ichidagi useEffect() funksiyasi
useEffect(() => {
  if (image && stageRef.current) {
    // ... (boshqa kodlar)

    const stage = stageRef.current;
    const container = stage.container().parentElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const scale = Math.min(containerWidth / image.width, containerHeight / image.height);

    stage.width(containerWidth);
    stage.height(containerHeight);

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const xOffset = (containerWidth - scaledWidth) / 2;
    const yOffset = (containerHeight - scaledHeight) / 2;

    const newTransform = {
      x: xOffset,
      y: yOffset,
      scale: scale,
      originalWidth: image.width,
      originalHeight: image.height,
    };

    // Quyidagi console.log buyruqlari
    console.log("1. Konteyner o'lchamlari (ota elementdan):", containerWidth, containerHeight);
    console.log("2. Rasmning asl o'lchamlari:", image.width, image.height);
    console.log("3. Hisoblangan Masshtab (Scale):", scale);
    console.log("4. Stage belgilangan o'lchamlar:", stage.width(), stage.height());
    console.log("5. Masshtablangan rasm o'lchamlari:", scaledWidth, scaledHeight);
    console.log("6. Hisoblangan siljishlar (xOffset, yOffset):", xOffset, yOffset);
    console.log("7. Yakuniy newTransform obyekti:", newTransform);

    setTransform(newTransform);
    stage.batchDraw();
  }
}, [image, setImageObject, setTransform]);

  const handleStageClick = (e) => {
    // Agar stage ning o'ziga bosilsa, tanlangan annotatsiyani bekor qilish
    if (e.target === e.currentTarget) {
      handleSelectAnnotation(null);
    }
  };

  return (
      // "flex items-center justify-center" klasslari olib tashlandi
      <div className="w-full h-full bg-gray-900"
           style={{overflow: 'auto', position: 'relative'}}>
          <Stage
              ref={stageRef}
    style={{
        border: '5px solid yellow', // Bu Stage ning o'ziga chegara beradi
        cursor: activeTool === 'select' ? 'default' : 'crosshair',
    }}
              onClick={handleStageClick}
              onTap={handleStageClick}
          >
              <Layer
                  name="image-layer"
                  x={transform.x} // Rasm joylashuvini transformatsiya orqali boshqarish
                  y={transform.y}
                  scaleX={transform.scale}
                  scaleY={transform.scale}
              >
                  {image && (
                      <KonvaImage
                          image={image}
                          name="image"
                          listening={false}
                          width={image.width} // Asl kenglik (Layer allaqachon scaled)
                          height={image.height} // Asl balandlik (Layer allaqachon scaled)
                          stroke="red" // Rasmning o'ziga chegara (oldin aytganimizdek)
                          strokeWidth={10}
                      />
                  )}
              </Layer>

              <Layer
                  ref={annotationsLayerRef}
                  name="annotations-layer"
                  x={transform.x} // Annotatsiya layerini ham rasm bilan birga siljitish
                  y={transform.y}
                  scaleX={transform.scale}
                  scaleY={transform.scale}
              >
                  <AnnotationRenderer onSelect={handleSelectAnnotation}/>
                  <SelectTool stageRef={stageRef}/>
                  <PolygonDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef}/>
                  <BoxDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef}/>
                  <PointDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef}/>
                  <ArrowDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef}/>
              </Layer>
          </Stage>
      </div>
  );
}

export default AnnotationCanvas;