// frontend/src/App.jsx
import React from 'react';

// Context va komponentlar importi
import { AnnotationProvider } from './core/AnnotationContext.jsx';
import LeftPanel from './panels/LeftPanel.jsx';
import RightPanel from './panels/RightPanel.jsx'; // Object Properties va Export Options uchun
import AnnotationCanvas from './drawing/AnnotationCanvas.jsx';
import HistoryPanel from './panels/HistoryPanel.jsx'; // Annotation History va Clear All uchun
import AnnotationTools from './panels/AnnotationTools.jsx'; // Annotation Tools uchun

// Font Awesome ikonkalari importi
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudUploadAlt, faMousePointer, faSquare, faSlash, faDrawPolygon,
  faCircleDot, faFont, faArrowRight, faPlus, faTrash, faRobot,
  faSave, faFileExport, faTrashAlt, faDownload, faCar,
  faTrafficLight, faPersonWalking, faSignsPost, faWalkieTalkie, faPencilAlt, faTimes,
  faSearchPlus, faSearchMinus, faCompressArrowsAlt
} from '@fortawesome/free-solid-svg-icons';

// Barcha kerakli ikonkalarni library ga qo'shamiz
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
                <div className="w-full max-w-[1800px] mx-auto p-8"> {/* p-8 = 32px */}
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-blue-400">Road Object Annotation Tool</h1>
                        <p className="text-gray-400">For autonomous vehicle detection systems</p>
                    </header>
                    <div className="main-container flex flex-col lg:flex-row gap-4 w-full">
                        {/* Chap panel */}
                        <div className="w-full lg:w-1/5 bg-gray-800 p-4 rounded-lg shadow-lg flex-shrink-0">
                            <LeftPanel/>
                        </div>
                        {/* Canvas */}
                        <div
                            className="flex-1 bg-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-center min-h-[600px]">
                            <AnnotationCanvas/>
                        </div>
                        {/* Tools */}
                        <div
                            className="w-full lg:w-1/5 bg-gray-800 p-4 rounded-lg shadow-lg flex-shrink-0 flex flex-col items-center gap-6">
                            <div className="w-full">
                                <h2 className="text-xl font-semibold mb-3 text-gray-100">Tools</h2>
                                <AnnotationTools/>
                            </div>
                            <div className="w-full mt-4">
                                <HistoryPanel/>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </AnnotationProvider>
    );
}


export default App;