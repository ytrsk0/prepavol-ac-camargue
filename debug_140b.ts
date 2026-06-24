
import { FLEET } from './src/data/fleet';
import { predictDistance } from './src/lib/calculations';

const plane = FLEET['FBUPS'];
const zp = 0;
const temp = 15;
const auw = 709.5;

console.log(`Testing FBUPS at Zp=${zp}, Temp=${temp}, AUW=${auw}`);
const res = predictDistance(plane.takeoff50ftGrid, plane.mtow, zp, temp, auw, 'takeoff');
console.log("Result:", JSON.stringify(res, null, 2));

// Debug coefficients
const grid = plane.takeoff50ftGrid!;
const trainingData: any[] = [];
grid.forEach(point => {
    Object.entries(point.distances).forEach(([wStr, dist]) => {
        trainingData.push({
            x: [point.alt, point.temp + 273, Number(wStr)],
            y: dist
        });
    });
});

import { solveLinearRegression } from './src/lib/calculations';
const coeffs = solveLinearRegression(trainingData);
console.log("Coeffs:", coeffs);
if (coeffs) {
    const tempK = temp + 273;
    const pred = coeffs[0] + coeffs[1] * zp + coeffs[2] * tempK + coeffs[3] * auw;
    console.log("Manual Pred:", pred);
}
