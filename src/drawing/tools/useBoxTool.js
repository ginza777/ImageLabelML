// frontend/src/drawing/tools/useBoxTool.js
import { v4 } from 'uuid';

let isDrawing = false;
let currentTempAnnotation = null;

const useBoxTool = {
  getCurrentTempAnnotationId: () => {
    return currentTempAnnotation ? currentTempAnnotation.id : null;
  },

  handleMouseDown: (e, stage, selectedClass, updateAnnotationState, dimensions) => {
    if (!selectedClass || e.target.getStage() !== stage) {
      console.log("LOG: useBoxTool: Mouse Down - Sinf tanlanmagan yoki obyekt bosildi (chizilmaydi).");
      return;
    }

    isDrawing = true;
    const pointer = stage.getPointerPosition();

    const initialPoint = {
      x: Math.max(0, Math.min(dimensions.width, pointer.x)),
      y: Math.max(0, Math.min(dimensions.height, pointer.y))
    };

    currentTempAnnotation = {
      id: v4(),
      type: 'box',
      class: selectedClass.name,
      color: selectedClass.color,
      points: [initialPoint, initialPoint],
      attributes: {},
      rotation: 0, // <-- Rotation 0 ga o'rnatildi
      timestamp: Date.now(),
    };

    updateAnnotationState(currentTempAnnotation);
    console.log('LOG: useBoxTool: Chizish boshlandi, ID:', currentTempAnnotation.id);
  },

  handleMouseMove: (e, stage, dimensions) => {
    if (!isDrawing || !currentTempAnnotation) return null;

    const pointer = stage.getPointerPosition();
    const currentPoint = {
      x: Math.max(0, Math.min(dimensions.width, pointer.x)),
      y: Math.max(0, Math.min(dimensions.height, pointer.y))
    };
    const currentPoints = [currentTempAnnotation.points[0], currentPoint];

    currentTempAnnotation.points = currentPoints;

    return { ...currentTempAnnotation };
  },

  handleMouseUp: (e, stage, onFinishDrawing, dimensions) => {
    if (!isDrawing || !currentTempAnnotation) return;

    isDrawing = false;
    const pointer = stage.getPointerPosition();

    currentTempAnnotation.points[1] = {
      x: Math.max(0, Math.min(dimensions.width, pointer.x)),
      y: Math.max(0, Math.min(dimensions.height, pointer.y))
    };

    const p1 = currentTempAnnotation.points[0];
    const p2 = currentTempAnnotation.points[1];
    if (Math.abs(p1.x - p2.x) > 5 && Math.abs(p1.y - p2.y) > 5) {
        console.log('LOG: useBoxTool: Chizish yakunlandi, yakuniy box:', currentTempAnnotation);
        onFinishDrawing(currentTempAnnotation);
    } else {
        console.log('LOG: useBoxTool: Kichik o\'lchamli box bekor qilindi.');
        onFinishDrawing(null);
    }

    currentTempAnnotation = null; 
  },
};

export default useBoxTool;