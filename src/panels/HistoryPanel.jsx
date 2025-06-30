// frontend/src/panels/HistoryPanel.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquare } from '@fortawesome/free-solid-svg-icons'; // faSquare ni ham import qilamiz
import { useAnnotation } from '../core/AnnotationContext.jsx';

function HistoryPanel() {
    const { annotations, selectedAnnotation, setSelectedAnnotationId, objectClasses, deleteAnnotation, clearAllAnnotations } = useAnnotation();

    const handleClearAllHistory = () => {
        if (window.confirm("Siz barcha annotatsiyalarni o'chirmoqchimisiz? Rasm ham tozalanadi.")) {
            clearAllAnnotations();
        }
    };

    const renderHistoryItem = (annotation) => {
        const cls = objectClasses.find(c => c.name === annotation.class);
        const bgColor = cls ? `${cls.color}20` : '#333';
        const textColor = cls ? cls.color : '#cbd5e0';
        const isSelected = selectedAnnotation?.id === annotation.id;

        const toolIcon = cls ? cls.icon : faSquare;
        const toolName = cls ? cls.tool : 'unknown';

        return (
            <div
                key={annotation.id}
                className={`p-2 border-b border-gray-700 hover:bg-gray-700 cursor-pointer flex justify-between items-center ${isSelected ? 'bg-gray-600' : ''}`}
                style={{ backgroundColor: isSelected ? '' : bgColor }}
                onClick={() => setSelectedAnnotationId(annotation.id)}
            >
                <div>
                    <span className="font-medium" style={{ color: textColor }}>{annotation.class}</span> -
                    <FontAwesomeIcon icon={toolIcon} className="mx-1 text-gray-400" /> {toolName.charAt(0).toUpperCase() + toolName.slice(1)}
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">just now</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); deleteAnnotation(annotation.id); }}
                        className="text-red-500 hover:text-red-400"
                        title="Annotatsiyani o'chirish"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-100">Annotation History</h2>
                <button
                    onClick={handleClearAllHistory}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition flex items-center"
                >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" /> Clear All
                </button>
            </div>
            <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-800">
                <div className="max-h-[30vh] overflow-y-auto"> {/* Balandlikni kamaytirdik */}
                    {annotations.length === 0 ? (
                        <p className="p-3 text-gray-400 text-sm">No annotations yet.</p>
                    ) : (
                        [...annotations].reverse().map(renderHistoryItem)
                    )}
                </div>
            </div>
        </div>
    );
}

export default HistoryPanel;