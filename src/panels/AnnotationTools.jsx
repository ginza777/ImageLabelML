// src/panels/AnnotationTools.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAnnotation } from '../core/AnnotationContext.jsx';
import { print_log } from '../data.js'; // print_log ni import qilamiz

function AnnotationTools() {
  const { availableToolIcons, activeTool, setActiveTool } = useAnnotation();

  const handleToolClick = (toolType) => {
    setActiveTool(toolType);
    print_log("Joriy uskuna o'zgardi (foydalanuvchi tanladi):", toolType);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {availableToolIcons.map((tool) => (
        <button
          key={tool.type}
          className={`p-2 border rounded-md transition text-center flex items-center justify-center ${
            activeTool === tool.type 
              ? 'bg-blue-600 text-white border-blue-500' 
              : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
          }`}
          onClick={() => handleToolClick(tool.type)}
          title={tool.name}
        >
          <FontAwesomeIcon icon={tool.icon} className="text-lg mr-2" />
          <p className="text-sm">{tool.name}</p>
        </button>
      ))}
    </div>
  );
}

export default AnnotationTools;