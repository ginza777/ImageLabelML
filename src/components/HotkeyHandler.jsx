// src/components/HotkeyHandler.jsx
import { useEffect } from 'react';
import { useAnnotation } from '../core/AnnotationContext.jsx';
import { print_log } from '../utils/helpers.js';

const HotkeyHandler = () => {
  const {
    activeTool,
    setActiveTool,
    isDrawing,
    selectedAnnotationId,
    deleteAnnotation,
    clearAnnotations
  } = useAnnotation();

  useEffect(() => {
    const handleKeys = (e) => {
      // Input maydonlariga yozayotganda hotkey'lar ishlamasligi uchun
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // --- TUZATISH: "Delete" va "Backspace" tugmalarini tekshirish ---
      const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace';

      // Barcha annotatsiyalarni o'chirish (Shift + Delete/Backspace)
      if (isDeleteKey && e.shiftKey) {
        e.preventDefault();
        if (window.confirm("Haqiqatan ham BARCHA annotatsiyalarni o'chirmoqchimisiz?")) {
          clearAnnotations();
          print_log("Barcha annotatsiyalar o'chirildi.");
        }
      }
      // Tanlangan annotatsiyani o'chirish (Delete/Backspace)
      else if (isDeleteKey && selectedAnnotationId) {
        e.preventDefault();
        deleteAnnotation(selectedAnnotationId);
        print_log(`Annotatsiya o'chirildi: ${selectedAnnotationId}`);
      }
      // Poligonni yakunlash
      else if (activeTool === 'polygon' && isDrawing && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        const finishEvent = new CustomEvent('finish-polygon');
        document.dispatchEvent(finishEvent);
        print_log("N tugmasi bilan polygonni yakunlash buyrug'i yuborildi");
      }
      // Chizishni bekor qilish
      else if (e.key === 'Escape') {
        if (isDrawing) {
          print_log("Escape tugmasi: chizish bekor qilindi");
        }
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);

  }, [activeTool, setActiveTool, isDrawing, selectedAnnotationId, deleteAnnotation, clearAnnotations]);

  return null;
};

export default HotkeyHandler;