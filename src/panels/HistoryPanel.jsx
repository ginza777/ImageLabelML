// src/panels/HistoryPanel.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAnnotation } from '../core/AnnotationContext.jsx';

function HistoryPanel() {
    const {
        annotations,
        selectedAnnotationId,
        setSelectedAnnotationId,
        objectClasses,
        deleteAnnotation,
        clearAllAnnotations
    } = useAnnotation();

    // Helper: qisqa id (so‘nggi 5 ta belgisi)
    const shortId = id => String(id).slice(-4);

    const handleClearAllHistory = () => {
        if (window.confirm("Siz barcha annotatsiyalarni o'chirmoqchimisiz?")) clearAllAnnotations();
    };

    const renderHistoryItem = (annotation) => {
        const cls = objectClasses.find(c => c.name === annotation.class);
        const borderColor = cls ? cls.color : "#6366f1";
        const isSelected = selectedAnnotationId === annotation.id;
        const toolIcon = cls?.icon || "question";
        const toolName = annotation.tool || 'unknown';

        // Relation badge uchun class va qisqa id
        let relationBadge = null;
        if (annotation.relation) {
            const targetAnn = annotations.find(a => a.id === annotation.relation);
            relationBadge = (
                <span
                    className="ml-1 px-1 rounded bg-green-900 text-green-300 font-bold"
                    title={`Relation: ${annotation.relationType || ""} → ${annotation.relation}`}
                >
  R:{shortId(annotation.relation)}
</span>

            );
        }

        return (
            <div
                key={annotation.id}
                className={`object-class flex items-center justify-between px-2 py-1 mb-1 cursor-pointer transition text-xs ${isSelected ? "selected-class" : ""}`}
                style={{ borderLeft: `4px solid ${borderColor}`, background: isSelected ? `${borderColor}22` : "#222a" }}
                onClick={() => setSelectedAnnotationId(annotation.id)}
                title={annotation.class}
            >
                {/* Chap qism: class, icon, tool, direction, relation */}
                <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: borderColor }}></span>
                    <span className="font-semibold truncate max-w-[50px]" style={{ color: borderColor }}>{annotation.class}</span>
                    <FontAwesomeIcon icon={toolIcon} className="ml-1 text-gray-300" />
                    <span className="ml-1 rounded bg-gray-900 px-1">{toolName}</span>
                    {/* Direction badge */}
                    {annotation.tool === "arrow" && annotation.direction &&
                        <span className="ml-1 px-1 rounded bg-blue-900 text-blue-300 uppercase">{annotation.direction}</span>
                    }
                    {/* Relation badge */}
                    {relationBadge}
                </div>
                {/* O'ng qism: vaqt va delete */}
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">now</span>
                    <button
                        onClick={e => { e.stopPropagation(); deleteAnnotation(annotation.id); }}
                        className="hover:text-red-400 text-red-500"
                        title="O'chirish"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="object-class bg-gray-800 rounded-lg p-2 border border-gray-700 shadow-sm w-full">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-base font-bold text-gray-100">History</h2>
                <button
                    onClick={handleClearAllHistory}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs flex items-center"
                >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" /> Clear
                </button>
            </div>
            <div className="max-h-[25vh] overflow-y-auto">
                {annotations.length === 0 ? (
                    <p className="p-2 text-gray-400 text-xs">No annotations yet.</p>
                ) : (
                    [...annotations].reverse().map(renderHistoryItem)
                )}
            </div>
        </div>
    );
}

export default HistoryPanel;
