// src/utils/helpers.js

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const print_log = (...args) => {
  if (import.meta.env.MODE === 'development') {
    console.log('[LOG]', ...args);
  }
};

// Pozitsiyani rasm chegarasidan chiqmasligi uchun cheklov
export const getBoundedPosition = (pos, imageFit) => {
  return {
    x: Math.max(imageFit.x, Math.min(pos.x, imageFit.x + imageFit.width)),
    y: Math.max(imageFit.y, Math.min(pos.y, imageFit.y + imageFit.height))
  };
};

// Rasmga moslashtirilgan o‘lcham
export const getImageFitSize = (imageObject, containerSize) => {
  if (!imageObject || !imageObject.width || containerSize.width === 0) return { width: 0, height: 0, x: 0, y: 0, scale: 1 };
  const scale = Math.min(containerSize.width / imageObject.width, containerSize.height / imageObject.height);
  const scaledW = imageObject.width * scale;
  const scaledH = imageObject.height * scale;
  const x = (containerSize.width - scaledW) / 2;
  const y = (containerSize.height - scaledH) / 2;
  return { width: scaledW, height: scaledH, x, y, scale };
};
