// src/data.js
import {
    faCar, faTrafficLight, faPersonWalking, faSignsPost, faWalkieTalkie,
    faMousePointer, faSquare, faSlash, faDrawPolygon, faCircleDot, faFont, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export const LOG_ENABLED = true;
export const print_log = (message, ...args) => {
    if (LOG_ENABLED) console.log(`[LOG] ${message}`, ...args);
};
export const initialObjectClasses = [
    {name: 'Car', color: '#ef4444', tool: 'box', icon: faCar, isActive: true},
    {name: 'Traffic Light', color: '#10b981', tool: 'box', icon: faTrafficLight},
    {name: 'Pedestrian', color: '#3b82f6', tool: 'point', icon: faPersonWalking},
    {name: 'Road Sign', color: '#f59e0b', tool: 'box', icon: faSignsPost},
    {name: 'Crosswalk', color: '#9333ea', tool: 'polygon', icon: faWalkieTalkie},
];
export const availableToolIcons = [
    {name: 'Select', type: 'select', icon: faMousePointer},
    {name: 'Box', type: 'box', icon: faSquare},
    {name: 'Arrow', type: 'arrow', icon: faArrowRight},
    {name: 'Point', type: 'point', icon: faCircleDot},
    {name: 'Polygon', type: 'polygon', icon: faDrawPolygon},
];