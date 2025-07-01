import React from "react";
import { useAnnotation } from "../core/AnnotationContext.jsx";

const directions = [
    { value: "up", label: "⬆️ Up" },
    { value: "down", label: "⬇️ Down" },
    { value: "left", label: "⬅️ Left" },
    { value: "right", label: "➡️ Right" }
];

const DirectionSelector = () => {
    const { annotations, selectedAnnotationId, updateAnnotation } = useAnnotation();
    const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId);

    // Faqat arrow annotation tanlansa, select aktiv bo‘ladi
    const canEdit = selectedAnnotation && selectedAnnotation.tool === "arrow";

    return (
        <div className="w-full flex justify-center mt-3 mb-1">
            <select
                className={`bg-gray-800 border ${canEdit ? "border-blue-500 text-blue-300" : "border-gray-700 text-gray-400"} rounded px-2 py-1 text-sm font-bold min-w-[110px]`}
                value={selectedAnnotation?.direction || ""}
                disabled={!canEdit}
                onChange={e => {
                    if (canEdit) updateAnnotation({ ...selectedAnnotation, direction: e.target.value });
                }}
            >
                <option value="" disabled>Direction</option>
                {directions.map(dir => (
                    <option key={dir.value} value={dir.value}>{dir.label}</option>
                ))}
            </select>
        </div>
    );
};

export default DirectionSelector;
