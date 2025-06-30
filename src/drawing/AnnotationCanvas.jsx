// src/drawing/AnnotationCanvas.jsx

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { useAnnotation } from '../core/AnnotationContext.jsx';
import { print_log } from '../data.js';

const AnnotationCanvas = () => {
  const { imageObject, stageRef } = useAnnotation();
  const containerRef = useRef(null); // Canvas turadigan div uchun ref
  const [size, setSize] = useState({ width: 0, height: 0 });

  // --- O'ZGARTIRILGAN QISM: O'lchamni ResizeObserver bilan aniqlash ---
  useEffect(() => {
    if (!containerRef.current) return;

    // ResizeObserver yaratamiz, u div o'lchami o'zgarganda ishga tushadi
    const observer = new ResizeObserver(entries => {
      // entries[0] - bu biz kuzatayotgan div (containerRef)
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
      print_log("Canvas o'lchami o'zgardi (ResizeObserver):", { width, height });
    });

    // Kuzatishni boshlaymiz
    observer.observe(containerRef.current);

    // Komponent o'chirilganda (unmount) kuzatishni to'xtatamiz
    return () => observer.disconnect();
  }, []); // Bu useEffect faqat bir marta, komponent ilk chizilganda ishlaydi

  const getImageFitSize = () => {
    if (!imageObject || size.width === 0 || size.height === 0) {
      return { width: 0, height: 0, x: 0, y: 0 };
    }
    const containerW = size.width;
    const containerH = size.height;
    const imgW = imageObject.width;
    const imgH = imageObject.height;

    const scale = Math.min(containerW / imgW, containerH / imgH);
    const scaledW = imgW * scale;
    const scaledH = imgH * scale;

    const x = (containerW - scaledW) / 2;
    const y = (containerH - scaledH) / 2;

    return { width: scaledW, height: scaledH, x, y };
  };

  const imageFitSize = getImageFitSize();

  // Komponent ichida bir marta rasm chizilganini log qilish uchun
  useEffect(() => {
    if (imageObject && imageFitSize.width > 0) {
        print_log("Rasm Konva maydonida chizildi, o'lchamlari:", imageFitSize);
    }
  }, [imageObject, imageFitSize]);


  return (
    // Konteyner div har doim to'liq maydonni egallashga harakat qiladi
    <div ref={containerRef} className="w-full h-full">

      {/* Agar rasm hali yuklanmagan bo'lsa, "upload" matnini ko'rsatamiz */}
      {!imageObject && (
        <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-lg">
          <p className="text-gray-500">Please upload an image to begin</p>
        </div>
      )}

      {/* Rasm yuklangan bo'lsa, Konva Stageni chizamiz */}
      {imageObject && (
        <Stage
          width={size.width}
          height={size.height}
          ref={stageRef}
        >
          <Layer>
            <Image
              image={imageObject}
              width={imageFitSize.width}
              height={imageFitSize.height}
              x={imageFitSize.x}
              y={imageFitSize.y}
            />
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default AnnotationCanvas;