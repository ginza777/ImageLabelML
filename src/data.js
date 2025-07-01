import {
  faCar, faTrafficLight, faPersonWalking, faSignsPost, faRoad,
  faMousePointer, faSquare, faArrowRight, faDrawPolygon, faCircleDot
} from '@fortawesome/free-solid-svg-icons';

export const LOG_ENABLED = true;

export const print_log = (message, ...args) => {
  if (LOG_ENABLED) console.log(`[LOG] ${message}`, ...args);
};

export const generateId = () => {
  if (window.crypto && window.crypto.randomUUID) {
    const uuid = window.crypto.randomUUID();
    print_log("New ID generated with crypto.randomUUID:", uuid);
    return uuid;
  }
  const id = Date.now() + Math.random();
  print_log("WARNING: crypto.randomUUID unavailable, using Date.now + Math.random:", id);
  return id;
};

export const initialObjectClasses = [
  { name: 'Car', color: '#ef4444', tool: 'box', icon: faCar, isActive: true },
  { name: 'Traffic Light', color: '#10b981', tool: 'box', icon: faTrafficLight },
  { name: 'Pedestrian', color: '#3b82f6', tool: 'point', icon: faPersonWalking },
  { name: 'Road Sign', color: '#f59e0b', tool: 'box', icon: faSignsPost },
  { name: 'Crosswalk', color: '#9333ea', tool: 'polygon', icon: faRoad }
];

export const availableToolIcons = [
  { name: 'Select', type: 'select', icon: faMousePointer },
  { name: 'Box', type: 'box', icon: faSquare },
  { name: 'Arrow', type: 'arrow', icon: faArrowRight },
  { name: 'Point', type: 'point', icon: faCircleDot },
  { name: 'Polygon', type: 'polygon', icon: faDrawPolygon }
];