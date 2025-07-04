// src/App.jsx
import React from 'react';
import {AnnotationProvider} from './core/AnnotationContext.jsx';
import LeftPanel from './panels/LeftPanel.jsx';
import DirectionSelector from './panels/DirectionSelector.jsx';
import RelationSelector from './panels/RelationSelector.jsx';
import AnnotationCanvas from './drawing/canvas/AnnotationCanvas.jsx';
import HistoryPanel from './panels/HistoryPanel.jsx';
import AnnotationTools from './panels/AnnotationTools.jsx';
import SelectTool from './drawing/tools/SelectTool.jsx';
import HotkeyHandler from './components/HotkeyHandler.jsx';
import ExportManager from './components/ExportManager.jsx';

import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCloudUploadAlt, faMousePointer, faSquare, faSlash, faDrawPolygon,
    faCircleDot, faFont, faArrowRight, faPlus, faTrash, faRobot,
    faSave, faFileExport, faTrashAlt, faDownload, faCar,
    faTrafficLight, faPersonWalking, faSignsPost, faWalkieTalkie, faPencilAlt, faTimes,
    faSearchPlus, faSearchMinus, faCompressArrowsAlt
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faCloudUploadAlt, faMousePointer, faSquare, faSlash, faDrawPolygon,
    faCircleDot, faFont, faArrowRight, faPlus, faTrash, faRobot,
    faSave, faFileExport, faTrashAlt, faDownload, faCar,
    faTrafficLight, faPersonWalking, faSignsPost, faWalkieTalkie, faPencilAlt, faTimes,
    faSearchPlus, faSearchMinus, faCompressArrowsAlt
);

function App() {
    return (
        <AnnotationProvider>
            <div className="bg-gray-900 min-h-screen text-gray-300 font-sans">
                <div className="w-full max-w-[1800px] mx-auto p-8">
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-blue-400">Road Object Annotation Tool</h1>
                        <p className="text-gray-400">For autonomous vehicle detection systems</p>
                    </header>

                    <div className="main-container flex flex-col lg:flex-row gap-4 w-full">
                        <div className="w-full lg:w-1/5 bg-gray-800 p-4 rounded-lg shadow-lg flex-shrink-0">
                            <LeftPanel/>
                        </div>

                        <div
                            // h-[calc(100vh-50px)] va border-4 border-green-500 qo'shildi
                            className="flex-1 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center justify-start pt-16 h-[calc(100vh-50px)] border-4 border-green-500">

                            <AnnotationCanvas/>
                            <div className="flex flex-row gap-2 w-full justify-center mt-3 mb-1">
                                <DirectionSelector/>
                                <RelationSelector/>
                            </div>
                        </div>

                        <div
                            className="w-full lg:w-1/5 bg-gray-800 p-4 rounded-lg shadow-lg flex-shrink-0 flex flex-col items-center gap-6">
                            <div className="w-full">
                                <h2 className="text-xl font-semibold mb-3 text-gray-100">Tools</h2>
                                <AnnotationTools/>
                            </div>
                            <div className="w-full mt-4">
                                <HistoryPanel/>
                                <HotkeyHandler/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnnotationProvider>
    );
}

export default App;