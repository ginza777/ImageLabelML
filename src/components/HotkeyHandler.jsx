// src/components/HotkeyHandler.jsx
import { useEffect } from 'react';
import { useAnnotation } from '../core/AnnotationContext.jsx';
import { print_log } from '../utils/helpers.js';

const HotkeyHandler = () => {
  const { activeTool, setActiveTool, isDrawing } = useAnnotation();

  useEffect(() => {
    const handleKeys = (e) => {
      // Chizish paytida harf bosish ishlamasligi uchun
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // --- TUZATISH: Maxsus "finish-polygon" hodisasini yuborish ---
      if (activeTool === 'polygon' && isDrawing && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault(); // Brauzerning standart harakatini to'xtatish
        const finishEvent = new CustomEvent('finish-polygon');
        document.dispatchEvent(finishEvent);
        print_log("N tugmasi bilan polygonni yakunlash buyrug'i yuborildi");
      }

      if (e.key === 'Escape') {
        if (isDrawing) {
          print_log("Escape tugmasi: chizish bekor qilindi");
        }
        // Escape har doim tanlash asbobiga o'tkazishi kerak
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [activeTool, setActiveTool, isDrawing]);

  return null;
};

export default HotkeyHandler;