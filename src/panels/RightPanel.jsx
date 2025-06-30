// frontend/src/panels/RightPanel.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAnnotation } from '../core/AnnotationContext.jsx';

function RightPanel() {
    const {
        selectedAnnotation,
        objectClasses, setAnnotations // setAnnotations ni ham olamiz
    } = useAnnotation();

    // `updateAnnotation` funksiyasini RightPanel ichida qayta e'lon qilamiz
    // Bu Rect va Transformer dan kelgan yangilanishlarni to'g'ri boshqarishga yordam beradi
    const updateAnnotation = (updatedAnn) => {
        setAnnotations(prev => prev.map(ann => ann.id === updatedAnn.id ? updatedAnn : ann));
    };

    const handleUpdateProperties = () => {
        if (selectedAnnotation) {
            alert('Properties updated for ' + selectedAnnotation.id);
        } else {
            alert('Iltimos, xususiyatlarni yangilash uchun annotatsiyani tanlang.');
        }
    };

    const handleDownloadAnnotations = () => {
        alert('Download Annotations (Funksionallik keyinchalik qo\'shiladi)');
    };

    const handleSaveAnnotations = () => {
        alert('Annotations saved! (Funksionallik keyinchalik qo\'shiladi)');
    };

    return (
        <div>
            {/* Object Properties */}
            <div className="mb-6 border border-gray-700 rounded-md p-4">
                <h2 className="text-xl font-semibold mb-3 text-gray-100">Object Properties</h2>
                <div id="propertiesForm" className="space-y-3">
                    {selectedAnnotation ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Class</label>
                                <select
                                    className="w-full border border-gray-600 rounded-md px-2 py-1 text-sm bg-gray-700 text-gray-300"
                                    value={selectedAnnotation.class}
                                    onChange={(e) => updateAnnotation({ ...selectedAnnotation, class: e.target.value })}
                                >
                                    {objectClasses.map(cls => (
                                        <option key={cls.name} value={cls.name}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Hozircha Attributes, Direction, Relations, Notes ni to'liq qo'shmaymiz,
                                lekin ularning formasi shu yerda bo'ladi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Attributes</label>
                                <div className="space-y-1">
                                    <label className="flex items-center text-sm text-gray-400">
                                        <input type="checkbox" className="mr-2" />
                                        <span>Obstructed</span>
                                    </label>
                                    <label className="flex items-center text-sm text-gray-400">
                                        <input type="checkbox" className="mr-2" />
                                        <span>Occluded</span>
                                    </label>
                                    <label className="flex items-center text-sm text-gray-400">
                                        <input type="checkbox" className="mr-2" />
                                        <span>Truncated</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Direction</label>
                                <select className="w-full border border-gray-600 rounded-md px-2 py-1 text-sm bg-gray-700 text-gray-300">
                                    <option value="">None</option>
                                    <option>Left</option>
                                    <option>Right</option>
                                    <option>Up</option>
                                    <option>Down</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Relations</label>
                                <select className="w-full border border-gray-600 rounded-md px-2 py-1 text-sm bg-gray-700 text-gray-300">
                                    <option value="">None</option>
                                    <option>On road</option>
                                    <option>Crossing</option>
                                    <option>Stopped at</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                                <textarea
                                    className="w-full border border-gray-600 rounded-md px-2 py-1 text-sm h-20 bg-gray-700 text-gray-300"
                                    placeholder="Additional information..."
                                    value={selectedAnnotation.notes || ''}
                                    onChange={(e) => updateAnnotation({ ...selectedAnnotation, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                onClick={handleUpdateProperties}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md transition"
                            >
                                Update Properties
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-400 text-sm">Select an annotation to view/edit properties.</p>
                    )}
                </div>
            </div>

            {/* Export Options */}
            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-100">Export Options</h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Format</label>
                        <select className="w-full border border-gray-600 rounded-md px-2 py-1 text-sm bg-gray-700 text-gray-300">
                            <option>JSON</option>
                            <option>YOLO</option>
                            <option>ZIP</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Include</label>
                        <div className="space-y-1">
                            <label className="flex items-center text-sm text-gray-400">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                <span>Image Data</span>
                            </label>
                            <label className="flex items-center text-sm text-gray-400">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                <span>Metadata</span>
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadAnnotations}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition flex items-center justify-center mb-2"
                    >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Download Annotations
                    </button>
                    <button
                        onClick={handleSaveAnnotations}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Save Annotations
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RightPanel;