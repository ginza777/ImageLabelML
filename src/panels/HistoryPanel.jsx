// src/panels/HistoryPanel.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAnnotation } from '../core/AnnotationContext.jsx';

function HistoryPanel() {
    const {
        annotations,
        deleteAnnotation,
        clearAnnotations,
    } = useAnnotation();

    const shortId = id => String(id).slice(-4);

    const handleClearAllHistory = () => {
        if (window.confirm("Siz barcha annotatsiyalarni o'chirmoqchimisiz?")) clearAnnotations();
    };

    const renderHistoryItem = (annotation) => {
        const borderColor = annotation.stroke || "#6366f1";
        const toolName = annotation.tool || 'unknown';

        return (
            <div
                key={annotation.id}
                className="object-class flex items-center justify-between px-2 py-1 mb-1 cursor-pointer transition text-xs"
                style={{ borderLeft: `4px solid ${borderColor}`, background: "#222a" }}
                title={annotation.class}
            >
                <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: borderColor }}></span>
                    <span className="font-semibold truncate max-w-[50px]" style={{ color: borderColor }}>{annotation.class}</span>
                    <span className="ml-1 rounded bg-gray-900 px-1">{toolName}</span>
                </div>
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
