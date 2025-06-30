// src/panels/LeftPanel.jsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faPencilAlt, faPlus, faSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAnnotation } from '../core/AnnotationContext.jsx';

const styles = `
    .selected-class { background-color: #3b82f650; border-color: #3b82f6 !important; }
`;

function LeftPanel() {
    const {
        loadImage, imageStatus, imageError,
        selectedClass, handleSelectClass,
        objectClasses, addObjectClass, deleteObjectClass,
        availableToolIcons,
    } = useAnnotation();

    const [isEditingClasses, setIsEditingClasses] = useState(false);
    const [showNewClassForm, setShowNewClassForm] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newClassColor, setNewClassColor] = useState('#ffffff');
    const [newClassToolType, setNewClassToolType] = useState('box');
    const [urlInput, setUrlInput] = useState('');

    const [newClassIcon, setNewClassIcon] = useState(
        availableToolIcons?.find(t => t.type === 'box')?.icon || faSquare
    );

    useEffect(() => {
        if (availableToolIcons) {
            const selectedTool = availableToolIcons.find(t => t.type === newClassToolType);
            if (selectedTool) setNewClassIcon(selectedTool.icon);
        }
    }, [newClassToolType, availableToolIcons]);

    const handleClassClick = (classObj) => handleSelectClass(classObj);
    const handleFileUpload = (e) => { const file = e.target.files[0]; if (file) loadImage(file); };
    const handleUrlLoad = () => { if (urlInput.trim()) loadImage(urlInput.trim()); };
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleUrlLoad(); };

    const handleAddClass = () => {
        if (!newClassName.trim() || !newClassToolType) {
            alert('Iltimos, yangi sinfning barcha maydonlarini to\'ldiring.');
            return;
        }
        if (objectClasses?.some(cls => cls.name.toLowerCase() === newClassName.trim().toLowerCase())) {
            alert('Bu nomdagi sinf allaqachon mavjud.');
            return;
        }
        addObjectClass({
            name: newClassName.trim(), color: newClassColor, tool: newClassToolType, icon: newClassIcon,
        });
        setNewClassName(''); setNewClassColor('#ffffff'); setNewClassToolType('box'); setShowNewClassForm(false);
    };

    const handleDeleteClass = (className) => {
        if (window.confirm(`Siz "${className}" sinfini o'chirmoqchimisiz?`)) {
            deleteObjectClass(className);
        }
    };

    return (
        <div>
            <style>{styles}</style>
            <div className="mb-6 border border-gray-700 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold text-gray-100">Object Classes</h2>
                    <div className="flex space-x-3">
                        <button onClick={() => setShowNewClassForm(!showNewClassForm)} title="Add new class"><FontAwesomeIcon icon={faPlus} className="text-blue-400 hover:text-blue-300"/></button>
                        <button onClick={() => setIsEditingClasses(!isEditingClasses)} title={isEditingClasses ? "Finish Editing" : "Edit Classes"}><FontAwesomeIcon icon={faPencilAlt} className={isEditingClasses ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}/></button>
                    </div>
                </div>
                <div className="space-y-2">
                    {/* --- XATOLIK TUZATILGAN QATOR --- */}
                    {objectClasses?.map((cls) => (
                        <div key={cls.name} className={`flex items-center p-2 border rounded-md cursor-pointer transition ${selectedClass?.name === cls.name ? 'selected-class' : 'border-transparent'}`} style={{ backgroundColor: selectedClass?.name === cls.name ? '' : `${cls.color}33`, borderColor: selectedClass?.name === cls.name ? '' : cls.color, }} onClick={() => handleClassClick(cls)}>
                            <div className="w-4 h-4 rounded-full mr-3" style={{backgroundColor: cls.color}}></div>
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-gray-200 font-medium">{cls.name}</span>
                                <span className="text-xs text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded-md">{cls.tool}</span>
                            </div>
                            <FontAwesomeIcon icon={cls.icon} className="ml-3 mr-3 text-gray-400"/>
                            {isEditingClasses && (<button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.name); }} className="text-red-500 hover:text-red-400" title={`Delete ${cls.name}`}><FontAwesomeIcon icon={faTrash}/></button>)}
                        </div>
                    ))}
                </div>

                {showNewClassForm && (
                   <div className="mt-4 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                       <h3 className="text-lg font-semibold mb-2 text-gray-300">Add New Class</h3>
                       <input type="text" placeholder="New class name" className="w-full border border-gray-600 rounded-md px-2 py-1.5 text-sm bg-gray-700 text-gray-300 mb-2" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                       <div className="flex items-center mb-2">
                           <label className="text-sm font-medium text-gray-400 mr-2">Color:</label>
                           <input type="color" value={newClassColor} onChange={(e) => setNewClassColor(e.target.value)} className="w-8 h-8 rounded border-none bg-gray-700 cursor-pointer" />
                       </div>
                       <div className="mb-3">
                           <label className="block text-sm font-medium text-gray-400 mb-1">Default Tool:</label>
                           <select className="w-full border border-gray-600 rounded-md px-2 py-1.5 text-sm bg-gray-700 text-gray-300" value={newClassToolType} onChange={(e) => setNewClassToolType(e.target.value)}>
                               {availableToolIcons?.map(tool => (<option key={tool.type} value={tool.type}>{tool.name}</option>))}
                           </select>
                       </div>
                       <button onClick={handleAddClass} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-md transition">Add Class</button>
                   </div>
                )}
            </div>
            <div className="border border-gray-700 rounded-md p-4">
                <h2 className="text-xl font-semibold mb-3 text-gray-100">Image Source</h2>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 mb-3 text-center transition hover:bg-gray-700/50">
                    <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-blue-500 mb-2 hover:text-blue-400"/>
                        <p className="text-gray-400 text-sm">Drag & Drop or <span className="underline">Upload Image</span></p>
                        <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileUpload}/>
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">URL:</span>
                    <input type="text" placeholder="https://..." className="flex-1 border border-gray-600 rounded-md px-2 py-1.5 text-sm bg-gray-700 text-gray-300" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={handleKeyDown} />
                    <button onClick={handleUrlLoad} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition">Load</button>
                </div>
                <div className="mt-2 text-sm h-5">
                    {imageStatus === 'loading' && <p className="text-blue-400">Yuklanmoqda...</p>}
                    {imageStatus === 'success' && <p className="text-green-500">Muvaffaqiyatli yuklandi.</p>}
                    {imageStatus === 'error' && <p className="text-red-500">{imageError}</p>}
                </div>
            </div>
        </div>
    );
}

export default LeftPanel;