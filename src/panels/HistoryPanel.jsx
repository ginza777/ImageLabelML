// src/panels/HistoryPanel.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faArrowUp,
    faArrowDown,
    faArrowLeft,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useAnnotation } from '../core/AnnotationContext.jsx';

// Yo'nalish nomlariga mos piktogrammalarni belgilab olamiz
const directionIcons = {
    up: faArrowUp,
    down: faArrowDown,
    left: faArrowLeft,
    right: faArrowRight,
};

function HistoryPanel() {
    const {
        annotations,
        deleteAnnotation,
        clearAnnotations,
        handleSelectAnnotation,
    } = useAnnotation();

    const handleClearAllHistory = () => {
        if (window.confirm("Siz barcha annotatsiyalarni o'chirmoqchimisiz?")) {
            clearAnnotations();
        }
    };

    const renderHistoryItem = (annotation) => {
        const borderColor = annotation.color || "#6366f1";
        const toolName = annotation.type || 'unknown';
        const shortId = String(annotation.id).slice(-4);

        return (
            <div
                key={annotation.id}
                className="object-class flex items-center justify-between px-2 py-1 mb-1 cursor-pointer transition text-xs rounded-sm hover:bg-gray-700"
                style={{ borderLeft: `4px solid ${borderColor}`, background: "#2D3748" }}
                title={`Class: ${annotation.class}, ID: ${annotation.id}`}
                onClick={() => handleSelectAnnotation(annotation.id)}
            >
                {/* Chap taraf: Annotatsiya haqida asosiy ma'lumot */}
                <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: borderColor }}></span>
                    <span className="font-semibold truncate max-w-[50px]" style={{ color: borderColor }}>{annotation.class}</span>
                    <span className="text-gray-500 ml-1">({shortId})</span>
                    <span className="ml-auto rounded bg-gray-900 px-1 text-gray-300">{toolName}</span>
                </div>

                {/* O'ng taraf: Qo'shimcha belgilar va tugmalar */}
                <div className="flex items-center gap-3 ml-2">
                    {/* YANGI QISM: Relation belgisi ("R") */}
                    {annotation.relation && (
                        <span
                            title={`Related to Ann. ID: ${annotation.relation}`}
                            className="font-mono font-bold text-green-400 border border-green-700 rounded-sm px-1"
                        >
                            R
                        </span>
                    )}

                    {/* YANGI QISM: Direction piktogrammasi */}
                    {annotation.direction && directionIcons[annotation.direction] && (
                        <FontAwesomeIcon
                            icon={directionIcons[annotation.direction]}
                            className="text-blue-400"
                            title={`Direction: ${annotation.direction}`}
                        />
                    )}

                    {/* O'chirish tugmasi */}
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
                {annotations.length > 0 && (
                    <button
                        onClick={handleClearAllHistory}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs flex items-center"
                    >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Clear
                    </button>
                )}
            </div>
            <div className="max-h-[25vh] overflow-y-auto pr-1">
                {annotations.length === 0 ? (
                    <p className="p-2 text-gray-400 text-xs text-center">No annotations yet.</p>
                ) : (
                    [...annotations].reverse().map(renderHistoryItem)
                )}
            </div>
        </div>
    );
}

export default HistoryPanel;