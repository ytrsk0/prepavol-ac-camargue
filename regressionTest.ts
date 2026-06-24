import { FLEET } from './src/data/fleet';
import { predictDistance, calculateAltitudes } from './src/lib/calculations';

const plane = FLEET['FHFNG']; // S200

// FHFNG MTOW = 750
// 15C, 0ft
const zp = calculateAltitudes(0, 1013, 15).zp;

const tk = predictDistance(plane.takeoff50ftGrid, plane.mtow, zp, 15, 750, 'takeoff', plane.planetype);
console.log("Takeoff:", tk);

const ld = predictDistance(plane.landing50ftGrid, plane.mtow, zp, 15, 750, 'landing', plane.planetype);
console.log("Landing:", ld);

