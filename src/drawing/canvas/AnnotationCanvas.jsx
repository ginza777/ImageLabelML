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
        setSelectedAnnotationId,
        activeTool,
        transform,
        setTransform
    } = useAnnotation();

    const [image] = useImage(imageUrl, 'anonymous');

    useEffect(() => {
        if (image && stageRef.current) {
            setImageObject(image);
            const stage = stageRef.current;
            const stageWidth = stage.width();
            const stageHeight = stage.height();
            const scale = Math.min(stageWidth / image.width, stageHeight / image.height, 1);
            setTransform({
                x: (stageWidth - image.width * scale) / 2,
                y: (stageHeight - image.height * scale) / 2,
                scale: scale
            });
        }
    }, [image, setImageObject, setTransform]);

const handleStageClick = (e) => {
  const clickedId = e.target.id();
  if (!clickedId || clickedId === 'background') {
    setSelectedAnnotationId(null);
  } else {
    setSelectedAnnotationId(clickedId);
  }
};


    const handleSelectAnnotation = (id) => {
        if (activeTool === 'select') {
            setSelectedAnnotationId(id);
        }
    };

return (
  <Stage
    width={1000}
    height={700}
    ref={stageRef}
    style={{
      border: '1px solid #4A5568',
      background: '#2D3748',
      cursor: activeTool === 'select' ? 'default' : 'crosshair'
    }}
    onClick={handleStageClick}
    onTap={handleStageClick}
  >
    {/* Rasm qatlam */}
    <Layer
      name="image-layer"
      x={transform.x}
      y={transform.y}
      scaleX={transform.scale}
      scaleY={transform.scale}
    >
      {image && (
        <KonvaImage
          image={image}
          name="image"
          listening={false}
        />
      )}
    </Layer>

    {/* Annoatsiyalar qatlam */}
    <Layer
      ref={annotationsLayerRef}
      name="annotations-layer"
      x={transform.x}
      y={transform.y}
      scaleX={transform.scale}
      scaleY={transform.scale}
    >
      <AnnotationRenderer onSelect={handleSelectAnnotation} />
      <SelectTool stageRef={stageRef} />
      <PolygonDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
      <BoxDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
      <PointDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
      <ArrowDrawer stageRef={stageRef} annotationsLayerRef={annotationsLayerRef} />
    </Layer>
  </Stage>
);

}

export default AnnotationCanvas;