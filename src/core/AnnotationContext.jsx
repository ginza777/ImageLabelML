import React, { createContext, useContext, useState } from 'react';
import { generateId } from '../utils/helpers.js';
import {
  faMousePointer, faSquare, faDrawPolygon, faCircleDot, faArrowRight,
  faCar, faTrafficLight, faPersonWalking, faSignsPost, faRoad,
} from '@fortawesome/free-solid-svg-icons';

export const AnnotationContext = createContext();

const initialObjectClasses = [
  { name: 'Car', color: '#ef4444', tool: 'box', icon: faCar },
  { name: 'Traffic Light', color: '#10b981', tool: 'box', icon: faTrafficLight },
  { name: 'Pedestrian', color: '#3b82f6', tool: 'point', icon: faPersonWalking },
  { name: 'Road Sign', color: '#f59e0b', tool: 'box', icon: faSignsPost },
  { name: 'Crosswalk', color: '#9333ea', tool: 'polygon', icon: faRoad },
];

const availableToolIcons = [
  { type: 'select', name: 'Select', icon: faMousePointer },
  { type: 'box', name: 'Box', icon: faSquare },
  { type: 'polygon', name: 'Polygon', icon: faDrawPolygon },
  { type: 'point', name: 'Point', icon: faCircleDot },
  { type: 'arrow', name: 'Arrow', icon: faArrowRight },
];

export const AnnotationProvider = ({ children }) => {
  const [annotations, setAnnotations] = useState([]);
  const [objectClasses, setObjectClasses] = useState(initialObjectClasses);
  const [selectedClass, setSelectedClass] = useState(initialObjectClasses[0] || null);
  const [activeTool, setActiveTool] = useState(initialObjectClasses[0]?.tool || 'select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFilename, setImageFilename] = useState(null);
  const [imageObject, setImageObject] = useState(null);
  const [imageStatus, setImageStatus] = useState(null);
  const [imageError, setImageError] = useState('');
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    originalWidth: 0,
    originalHeight: 0,
  });

  const handleSelectClass = (classObj) => {
    if (classObj) {
      setSelectedClass(classObj);
      setActiveTool(classObj.tool);
      setSelectedAnnotationId(null);
    } else {
      setSelectedClass(null);
      setActiveTool('select');
    }
  };

  const handleSelectAnnotation = (annotationId) => {
    if (!annotationId) {
      setSelectedAnnotationId(null);
      return;
    }

    const annotation = annotations.find((ann) => ann.id === annotationId);
    if (annotation) {
      const classObj = objectClasses.find((cls) => cls.name === annotation.class);
      if (classObj) {
        setSelectedClass(classObj);
      }
      setActiveTool('select');
      setSelectedAnnotationId(annotationId);
    }
  };

  const deleteObjectClass = (classNameToDelete) => {
    const newClasses = objectClasses.filter((cls) => cls.name !== classNameToDelete);
    setObjectClasses(newClasses);
    if (selectedClass?.name === classNameToDelete) {
      handleSelectClass(newClasses.length > 0 ? newClasses[0] : null);
    }
  };

  const addObjectClass = (newClass) => {
    setObjectClasses((prev) => [...prev, newClass]);
  };

  const addAnnotation = (data) => {
    setAnnotations((prev) => [...prev, { ...data, id: data.id || generateId() }]);
  };

  const deleteAnnotation = (id) => {
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  const updateAnnotation = (updatedAnnotation) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === updatedAnnotation.id ? { ...ann, ...updatedAnnotation } : ann))
    );
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    setSelectedAnnotationId(null);
  };

  const loadImage = (source) => {
    setImageStatus('loading');
    setImageError('');
    setAnnotations([]);
    setSelectedAnnotationId(null);
    try {
      if (typeof source === 'string') {
        if (!source.startsWith('http')) throw new Error("URL manzili noto'g'ri.");
        setImageUrl(source);
        setImageFilename(source.split('/').pop().split('?')[0] || 'image.jpg');
        setImageStatus('success');
      } else if (source instanceof File) {
        setImageUrl(URL.createObjectURL(source));
        setImageFilename(source.name);
        setImageStatus('success');
      }
    } catch (error) {
      setImageStatus('error');
      setImageError(error.message || 'Rasm yuklashda xatolik.');
    }
  };

  const value = {
    annotations,
    addAnnotation,
    deleteAnnotation,
    clearAnnotations,
    updateAnnotation,
    objectClasses,
    addObjectClass,
    deleteObjectClass,
    selectedClass,
    handleSelectClass,
    activeTool,
    setActiveTool,
    availableToolIcons,
    isDrawing,
    setIsDrawing,
    selectedAnnotationId,
    handleSelectAnnotation,
    imageUrl,
    loadImage,
    imageStatus,
    imageError,
    imageFilename,
    imageObject,
    setImageObject,
    transform,
    setTransform,
  };

  return <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>;
};

export const useAnnotation = () => useContext(AnnotationContext);