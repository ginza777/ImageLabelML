// src/data.js

import {
  faCar, faTrafficLight, faPersonWalking, faSignsPost, faWalkieTalkie,
  faMousePointer, faSquare, faSlash, faDrawPolygon, faCircleDot, faFont, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

// --- YANGI QISM: LOGLASH TIZIMI ---

// Loglarni yoqish yoki o'chirish uchun markaziy o'zgaruvchi
export const LOG_ENABLED = true;

/**
 * Konsolga xabar chiqaruvchi markaziy funksiya.
 * Faqat LOG_ENABLED = true bo'lganda ishlaydi.
 * @param {string} message - Asosiy xabar
 * @param  {...any} args - Qo'shimcha ma'lumotlar (obyekt, o'zgaruvchi va h.k.)
 */
export const print_log = (message, ...args) => {
  if (LOG_ENABLED) {
    console.log(`[LOG] ${message}`, ...args);
  }
};


// --- MAVJUD QISMLAR ---

// Ilovada ishlatiladigan boshlang'ich sinflar (classes) ro'yxati
export const initialObjectClasses = [
  { name: 'Car', color: '#ef4444', tool: 'box', icon: faCar, isActive: true },
  { name: 'Traffic Light', color: '#10b981', tool: 'box', icon: faTrafficLight },
  { name: 'Pedestrian', color: '#3b82f6', tool: 'point', icon: faPersonWalking },
  { name: 'Road Sign', color: '#f59e0b', tool: 'box', icon: faSignsPost },
  { name: 'Crosswalk', color: '#9333ea', tool: 'polygon', icon: faWalkieTalkie },
];

// Mavjud uskunalar ro'yxati
export const availableToolIcons = [
  { name: 'Select', type: 'select', icon: faMousePointer },
  { name: 'Box', type: 'box', icon: faSquare },
  { name: 'Line', type: 'line', icon: faSlash },
  { name: 'Polygon', type: 'polygon', icon: faDrawPolygon },
  { name: 'Point', type: 'point', icon: faCircleDot },
  { name: 'Text', type: 'text', icon: faFont },
  { name: 'Arrow', type: 'arrow', icon: faArrowRight },
];