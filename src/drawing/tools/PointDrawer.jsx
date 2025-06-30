// src/drawing/tools/PointDrawer.jsx

import { useEffect } from 'react';
import { useAnnotation } from '../../core/AnnotationContext.jsx';

const PointDrawer = ({ mouseEvent, imageFit }) => {
  const { activeTool, selectedClass, addAnnotation } = useAnnotation();

  useEffect(() => {
    // Agar sichqoncha hodisasi "click" bo'lsa va uskuna to'g'ri bo'lsa, nuqta qo'shamiz
    if (mouseEvent?.type !== 'click' || !mouseEvent.payload.empty || activeTool !== 'point') {
      return;
    }
    if (!selectedClass) return; // Sinf tanlanganini tekshiramiz

    const pos = mouseEvent.payload.pos;
    const realX = (pos.x - imageFit.x) / imageFit.scale;
    const realY = (pos.y - imageFit.y) / imageFit.scale;

    addAnnotation({
      id: Date.now(), tool: 'point', class: selectedClass.name,
      x: realX, y: realY, radius: 5, fill: selectedClass.color,
    });

  }, [mouseEvent]); // Effekt faqat 'mouseEvent' o'zgarganda ishga tushadi

  return null; // Bu komponent ekranga hech narsa chizmaydi
};

export default PointDrawer;