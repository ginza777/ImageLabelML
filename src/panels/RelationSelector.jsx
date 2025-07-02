import React from "react";
import {useAnnotation} from "../core/AnnotationContext.jsx";

const relationTypes = [
    {value: "on", label: "on (ustida)"},
    {value: "near", label: "near (yonida)"},
    {value: "at", label: "at (oldida)"},
    {value: "crossing", label: "crossing (kesib o‘tmoqda)"}
];

const RelationSelector = () => {
    const {annotations, selectedAnnotationId, updateAnnotation} = useAnnotation();
    const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId);

    if (!selectedAnnotation) {
        // Agar hech qanday annotatsiya tanlanmagan bo'lsa, ikkala maydon ham o'chiq bo'ladi
        return (
            <>
                <select disabled className="bg-gray-700 border border-gray-700 text-gray-400 rounded px-2 py-1 text-sm"><option>Relation type</option></select>
                <select disabled className="bg-gray-700 border border-gray-700 text-gray-400 rounded px-2 py-1 text-sm"><option>With annotation...</option></select>
            </>
        );
    }

    const otherAnnotations = annotations.filter(a => a.id !== selectedAnnotationId);
    const shortId = id => String(id).slice(-4);

    return (
        <>
            <select
                className="bg-gray-800 border border-green-500 text-green-300 rounded px-2 py-1 text-sm font-bold min-w-[100px]"
                value={selectedAnnotation.relationType || ""}
                onChange={e => updateAnnotation({...selectedAnnotation, relationType: e.target.value})}
            >
                <option value="">Relation type</option>
                {relationTypes.map(rel => <option key={rel.value} value={rel.value}>{rel.label}</option>)}
            </select>

            <select
                className={`bg-gray-800 border ${otherAnnotations.length > 0 ? "border-gray-500" : "border-gray-700"} text-gray-300 rounded px-2 py-1 text-sm font-bold min-w-[120px]`}
                value={selectedAnnotation.relation || ""}
                onChange={e => updateAnnotation({...selectedAnnotation, relation: e.target.value})}
                // --- TUZATISH: Agar boshqa annotatsiya bo'lmasa, maydonni o'chirish ---
                disabled={otherAnnotations.length === 0}
            >
                <option value="">With annotation...</option>
                {otherAnnotations.map(ann => (
                    <option key={ann.id} value={ann.id}>
                        [{ann.class}] {shortId(ann.id)}
                    </option>
                ))}
            </select>
        </>
    );
};

export default RelationSelector;