import React, { createContext, useContext, useState, useRef } from 'react';
import { initialObjectClasses, availableToolIcons, print_log } from '../data.js';

const AnnotationContext = createContext(null);

export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (!context) throw new Error("useAnnotation must be used within an AnnotationProvider");
  return context;
};

export function AnnotationProvider({ children }) {
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [imageObject, setImageObject] = useState(null);
  const [imageStatus, setImageStatus] = useState('idle');
  const [imageError, setImageError] = useState('');
  const [objectClasses, setObjectClasses] = useState(initialObjectClasses);
  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedClass, setSelectedClass] = useState(() => initialObjectClasses.find(cls => cls.isActive) || null);
  const [activeTool, setActiveTool] = useState(() => (initialObjectClasses.find(cls => cls.isActive)?.tool) || 'select');

  const addAnnotation = (newAnnotation) => {
    print_log("Adding annotation:", newAnnotation);
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const updateAnnotation = (updatedAttrs) => {
    print_log("Updating annotation:", updatedAttrs);
    setAnnotations(prev => prev.map(ann => (ann.id === updatedAttrs.id ? { ...ann, ...updatedAttrs } : ann)));
  };

  const deleteAnnotation = (annotationId) => {
    if (!annotationId) return;
    print_log("Deleting annotation with ID:", annotationId);
    setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
    setSelectedAnnotationId(null);
  };

  const addObjectClass = (newClass) => {
    print_log("Adding object class:", newClass);
    setObjectClasses(prev => [...prev, newClass]);
  };

  const deleteObjectClass = (className) => {
    print_log("Deleting object class:", className);
    setObjectClasses(prev => prev.filter(cls => cls.name !== className));
    if (selectedClass?.name === className) setSelectedClass(null);
  };

  const handleSelectClass = (classObj) => {
    print_log("Selecting class:", classObj);
    if (classObj) {
      setSelectedClass(classObj);
      setActiveTool(classObj.tool);
    } else {
      setSelectedClass(null);
      setActiveTool('select');
    }
  };

  const clearAllAnnotations = () => {
    print_log("Clearing all annotations");
    setAnnotations([]);
    setSelectedAnnotationId(null);
  };

  const loadImage = async (source) => {
    print_log("Starting image load...");
    setImageStatus('loading');
    setImageError('');
    setImageObject(null);
    clearAllAnnotations();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const imageUrl = source instanceof File ? URL.createObjectURL(source) : source;
      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = objectUrl;
      await img.decode();
      setImageObject(img);
      setImageStatus('success');
      print_log("Image loaded successfully:", img.src);
    } catch (err) {
      clearTimeout(timeoutId);
      let errorMessage = 'Error: Failed to load image. Check URL or file.';
      if (err.name === 'AbortError') errorMessage = 'Network error (timeout).';
      setImageError(errorMessage);
      setImageStatus('error');
      print_log(`Image load error: ${errorMessage}`, err);
    }
  };

  const contextValue = {
    annotations, addAnnotation, updateAnnotation, deleteAnnotation,
    selectedAnnotationId, setSelectedAnnotationId,
    imageObject, imageStatus, imageError, loadImage,
    objectClasses, addObjectClass, deleteObjectClass,
    selectedClass, handleSelectClass,
    activeTool, setActiveTool,
    availableToolIcons, stageRef,
    isDrawing, setIsDrawing, clearAllAnnotations, setAnnotations
  };

  return (
    <AnnotationContext.Provider value={contextValue}>
      {children}
    </AnnotationContext.Provider>
  );
}