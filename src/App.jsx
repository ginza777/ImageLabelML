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
                <div className="container mx-auto p-4">
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-blue-400">Road Object Annotation Tool</h1>
                        <p className="text-gray-400">For autonomous vehicle detection systems</p>
                    </header>

                    <div className="main-container grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Chap Panel */}
                        <div className="lg:col-span-3 bg-gray-800 p-4 rounded-lg shadow-lg">
                            <LeftPanel />
                        </div>

                        {/* Markaziy qism: Yuqori va Pastki (Vertikal bo'linish) */}
                        <div className="lg:col-span-9 flex flex-col gap-4">
                            {/* Yuqori qism: Rasm va Annotatsiya Vositalari */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
                                {/* Rasm (Annotatsiya Kanvasi) */}
                                <div className="lg:col-span-10 bg-gray-800 p-4 rounded-lg shadow-lg relative overflow-hidden flex flex-col items-center justify-center">
                                    {/* ControlsBar (Zoom va Clear All) tugmalari */}
                                    <AnnotationCanvas />
                                </div>
                                {/* Annotatsiya Vositalari (Vertical List) */}
                                <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                                    <h2 className="text-xl font-semibold mb-3 text-gray-100">Tools</h2>
                                    <AnnotationTools />
                                </div>
                            </div>

                            {/* Pastki qism: Object Properties va History */}
                            {/*<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">*/}
                            {/*    /!* Object Properties *!/*/}
                            {/*    <div className="lg:col-span-6 bg-gray-800 p-4 rounded-lg shadow-lg">*/}
                            {/*        <RightPanel showPropertiesAndExportOnly={true} />*/}
                            {/*    </div>*/}
                            {/*    /!* Annotation History *!/*/}
                            {/*    <div className="lg:col-span-6 bg-gray-800 p-4 rounded-lg shadow-lg">*/}
                            {/*        <HistoryPanel />*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            </div>
        </AnnotationProvider>
    );
}

export default App;