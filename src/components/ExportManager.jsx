// src/components/ExportManager.jsx
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useAnnotation } from '../core/AnnotationContext.jsx';

const ExportManager = () => {
  const { annotations, imageObject } = useAnnotation();

  const createMetadata = () => {
    if (!imageObject) {
      alert("Iltimos, avval rasm yuklang!");
      return null;
    }
    return {
      image: {
        width: imageObject.naturalWidth,
        height: imageObject.naturalHeight,
        filename: imageObject.src.split('/').pop()
      },
      annotations: annotations.map((ann) => ({
        id: ann.id,
        tool: ann.tool,
        class: ann.class,
        points: ann.points || (ann.x !== undefined ? [ann.x, ann.y, ann.width, ann.height] : undefined),
        fill: ann.fill,
        stroke: ann.stroke,
        direction: ann.direction || null,
        relation: ann.relation || null
      }))
    };
  };

  const handleExportJson = () => {
    if (!annotations.length) return alert("Annotatsiyalar yo‘q!");

    const meta = createMetadata();
    if (!meta) return;

    const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
    saveAs(blob, 'annotations.json');
  };

  const handleExportZip = async () => {
    if (!annotations.length) return alert("Annotatsiyalar yo‘q!");

    const meta = createMetadata();
    if (!meta) return;

    const zip = new JSZip();
    zip.file("annotations.json", JSON.stringify(meta, null, 2));

    // Image qo‘shish
    const canvas = document.createElement('canvas');
    canvas.width = imageObject.naturalWidth;
    canvas.height = imageObject.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageObject, 0, 0);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'));
    zip.file(meta.image.filename || 'image.jpg', blob);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'annotations_export.zip');
  };

  return (
    <div className="p-2 border border-gray-700 rounded-md">
      <h3 className="text-lg font-semibold text-gray-100 mb-3">Export</h3>
      <div className="flex flex-col gap-3">
        <button
          onClick={handleExportJson}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
        >
          Download JSON
        </button>
        <button
          onClick={handleExportZip}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          Export ZIP
        </button>
      </div>
    </div>
  );
};

export default ExportManager;