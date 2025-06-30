// src/core/AnnotationContext.jsx

import React, { createContext, useContext, useState, useRef } from 'react';
// print_log funksiyasini import qilamiz
import { initialObjectClasses, availableToolIcons, print_log } from '../data.js';

const AnnotationContext = createContext();

export function AnnotationProvider({ children }) {

  const [imageObject, setImageObject] = useState(null);
  const [imageStatus, setImageStatus] = useState('idle');
  const [imageError, setImageError] = useState('');
  const [objectClasses, setObjectClasses] = useState(initialObjectClasses);
  const stageRef = useRef(null);

  const [selectedClass, setSelectedClass] = useState(() => {
    const defaultClass = initialObjectClasses.find(cls => cls.isActive) || null;
    if (defaultClass) {
      print_log("Dastur ishga tushdi. Boshlang'ich faol sinf:", defaultClass.name);
    }
    return defaultClass;
  });

  const [activeTool, setActiveTool] = useState(() => {
    const defaultClass = initialObjectClasses.find(cls => cls.isActive);
    const defaultTool = defaultClass ? defaultClass.tool : 'select';
    print_log("Boshlang'ich faol uskuna:", defaultTool);
    return defaultTool;
  });

  const addObjectClass = (newClass) => {
    setObjectClasses(prev => [...prev, newClass]);
    print_log("Yangi sinf qo'shildi:", newClass);
  };

  const deleteObjectClass = (className) => {
    setObjectClasses(prev => prev.filter(cls => cls.name !== className));
    print_log("Sinf o'chirildi:", className);
    if (selectedClass?.name === className) {
      setSelectedClass(null);
    }
  };

  const handleSelectClass = (classObj) => {
    if (classObj) {
      setSelectedClass(classObj);
      setActiveTool(classObj.tool);
      print_log("Joriy sinf o'zgardi:", classObj.name);
      print_log("Joriy uskuna avtomatik o'zgardi:", classObj.tool);
    } else {
      setSelectedClass(null);
      setActiveTool('select');
    }
  };

  const loadImage = async (source) => {
    print_log("Rasm yuklash boshlandi...");
    setImageStatus('loading');
    setImageError('');
    setImageObject(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const imageUrl = source instanceof File ? URL.createObjectURL(source) : source;
      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Server xatoligi: ${response.statusText}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = objectUrl;
      await img.decode();

      setImageObject(img);
      setImageStatus('success');
      print_log("Rasm muvaffaqiyatli yuklandi.");

    } catch (err) {
      clearTimeout(timeoutId);
      let errorMessage = 'Xatolik: Rasmni yuklab bo‘lmadi. URL yoki faylni tekshiring.';
      if (err.name === 'AbortError') {
        errorMessage = 'Tarmoq bilan bog‘liq xatolik (yuklash vaqti tugadi).';
      }
      setImageError(errorMessage);
      setImageStatus('error');
      print_log(`XATOLIK: ${errorMessage}`, err);
    }
  };

  const contextValue = {
    imageObject, imageStatus, imageError, loadImage,
    objectClasses, addObjectClass, deleteObjectClass,
    selectedClass, handleSelectClass,
    activeTool, setActiveTool,
    availableToolIcons, stageRef,
  };

  return (
    <AnnotationContext.Provider value={contextValue}>
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotation = () => useContext(AnnotationContext);