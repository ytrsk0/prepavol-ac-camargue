import { predictDistance } from './src/lib/calculations.js';
import { FLEET } from './src/data/fleet.js';

console.log("--- Takeoff Predictions at 0ft, 15C (Asphalt) ---");
for (const [id, plane] of Object.entries(FLEET)) {
  const testW = plane.planetype === 'S200' ? 750 : 771.9;
  const res = predictDistance(plane.takeoff50ftGrid, plane.mtow, 0, 15, testW, 'takeoff');
  console.log(`${id} (${plane.planetype}) at ${testW}kg: base distance = ${res.rawAsphalt.toFixed(2)}m`);
}
