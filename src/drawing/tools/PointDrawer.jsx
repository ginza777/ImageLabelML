import React, { useEffect, useContext } from "react";
import { AnnotationContext } from "../../core/AnnotationContext";
import { generateId } from "../../utils/helpers";

const PointDrawer = ({ stageRef, annotationsLayerRef }) => {
  const {
    activeTool,
    selectedClass,
    imageUrl,
    addAnnotation,
  } = useContext(AnnotationContext);

  useEffect(() => {
    // "Point" asbobi tanlanmagan bo'lsa, funksiyadan chiqib ketish
    if (activeTool !== "point") return;

    const stage = stageRef.current;
    const layer = annotationsLayerRef.current; // To'g'ri qatlamni olamiz

    // Kerakli ma'lumotlar mavjudligini tekshirish
    if (!stage || !layer || !selectedClass) return;

    const handleClick = (e) => {
      // Faqat rasm ustidagi bo'sh joyga bosilganda ishlasin
      if (e.target !== stage) return;

      // Koordinatalarni chizish qatlamiga nisbatan olamiz
      const pos = layer.getRelativePointerPosition();
      if(!pos) return;

      // Annotatsiyani to'g'ri formatda yaratish
      const annotation = {
        id: generateId(),
        type: "point",
        x: pos.x, // "x" xususiyati
        y: pos.y, // "y" xususiyati
        class: selectedClass.name,
        color: selectedClass.color,
        imageId: imageUrl,
      };
      addAnnotation(annotation);
    };

    // "mousedown" hodisasini eshitish
    stage.on("mousedown", handleClick);

    // Komponent o'chirilganda hodisani olib tashlash
    return () => {
      stage.off("mousedown", handleClick);
    };
  }, [activeTool, selectedClass, imageUrl, addAnnotation, stageRef, annotationsLayerRef]);

  // Bu komponent hech narsa render qilmaydi
  return null;
};

export default PointDrawer;