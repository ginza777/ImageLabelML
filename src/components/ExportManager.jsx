// src/components/ExportManager.jsx
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useAnnotation } from '../core/AnnotationContext.jsx';

const ExportManager = () => {
  // --- TUZATISH: Kontekstdan "imageFilename"ni olamiz ---
  const { annotations, imageObject, imageFilename } = useAnnotation();

  const createMetadata = () => {
    if (!imageObject) {
      alert("Iltimos, avval rasm yuklang!");
      return null;
    }
    return {
      image: {
        width: imageObject.naturalWidth,
        height: imageObject.naturalHeight,
        // --- TUZATISH: To'g'ri fayl nomidan foydalanish ---
        filename: imageFilename || "image.jpg"
      },
      annotations: annotations.map((ann) => {
        const baseAnnotation = {
          id: ann.id, type: ann.type, class: ann.class,
          direction: ann.direction || null, relation: ann.relation || null
        };
        switch (ann.type) {
          case 'box':
            return { ...baseAnnotation, x: ann.x, y: ann.y, width: ann.width, height: ann.height };
          case 'point':
            return { ...baseAnnotation, x: ann.x, y: ann.y };
          case 'polygon': case 'arrow':
            return { ...baseAnnotation, points: ann.points };
          default:
            return baseAnnotation;
        }
      })
    };
  };

  const handleExportJson = () => {
    if (!imageObject) return alert("Iltimos, avval rasm yuklang!");
    const meta = createMetadata();
    if (!meta) return;
    const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
    saveAs(blob, 'annotations.json');
  };

  const handleExportZip = async () => {
    if (!imageObject) return alert("Iltimos, avval rasm yuklang!");
    const meta = createMetadata();
    if (!meta) return;
    try {
      const zip = new JSZip();
      zip.file("annotations.json", JSON.stringify(meta, null, 2));
      const canvas = document.createElement('canvas');
      canvas.width = imageObject.naturalWidth;
      canvas.height = imageObject.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageObject, 0, 0);
      const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (imageBlob) {
        // --- TUZATISH: Bu yerda ham to'g'ri nom ishlatiladi ---
        zip.file(meta.image.filename, imageBlob);
      } else {
        throw new Error("Canvas'dan rasm ma'lumotini olishda xatolik.");
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'annotations_export.zip');
    } catch (error) {
        console.error("Zip fayl yaratishda xatolik:", error);
        alert("Zip fayl yaratishda kutilmagan xatolik yuz berdi.");
    }
  };

  return (
    <div className="p-2 border border-gray-700 rounded-md">
      <h3 className="text-lg font-semibold text-gray-100 mb-3">Export</h3>
      <div className="flex flex-col gap-3">
        <button onClick={handleExportJson} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-md transition-transform transform hover:scale-105">
          Download JSON
        </button>
        <button onClick={handleExportZip} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md transition-transform transform hover:scale-105">
          Export as ZIP
        </button>
      </div>
    </div>
  );
};

export default ExportManager;