// src/core/AnnotationContext.jsx
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

    // Annotation qo‘shish
    const addAnnotation = (newAnnotation) => setAnnotations(prev => [...prev, newAnnotation]);
    // Annotation yangilash (shu jumladan direction, class, etc)
    const updateAnnotation = (updatedAttrs) => {
        setAnnotations(prev =>
            prev.map(ann => (ann.id === updatedAttrs.id ? { ...ann, ...updatedAttrs } : ann))
        );
    };
    // Annotation o‘chirish
    const deleteAnnotation = (annotationId) => {
        if (!annotationId) return;
        setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
        setSelectedAnnotationId(null);
    };
    // Object Classlar
    const addObjectClass = (newClass) => setObjectClasses(prev => [...prev, newClass]);
    const deleteObjectClass = (className) => {
        setObjectClasses(prev => prev.filter(cls => cls.name !== className));
        if (selectedClass?.name === className) setSelectedClass(null);
    };
    const handleSelectClass = (classObj) => {
        if (classObj) {
            setSelectedClass(classObj);
            setActiveTool(classObj.tool);
        } else {
            setSelectedClass(null);
            setActiveTool('select');
        }
    };
    // Barchasini tozalash
    const clearAllAnnotations = () => {
        setAnnotations([]);
        setSelectedAnnotationId(null);
    };

    // Rasm yuklash - avtomatik annotatsiyalarni o‘chiradi
    const loadImage = async (source) => {
        print_log("Rasm yuklash boshlandi...");
        setImageStatus('loading');
        setImageError('');
        setImageObject(null);
        clearAllAnnotations(); // <-- har doim rasm yuklaganda annotatsiyalar tozalansin!
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
            const imageUrl = source instanceof File ? URL.createObjectURL(source) : source;
            const response = await fetch(imageUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Server xatoligi: ${response.status}`);
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
            if (err.name === 'AbortError') errorMessage = 'Tarmoq bilan bog‘liq xatolik (yuklash vaqti tugadi).';
            setImageError(errorMessage);
            setImageStatus('error');
            print_log(`XATOLIK: ${errorMessage}`, err);
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
